import os
import re
import sys
import time
import cobra
import json
import argparse
import numpy as np
import pandas as pd
from pathlib import Path
import multiprocessing as mp
from multiprocessing.sharedctypes import Synchronized

from ccpy.util.knockout.async_bioservices import async_bioservices
from ccpy.util.knockout.async_bioservices.input_database import InputDatabase
from ccpy.util.knockout.async_bioservices.output_database import OutputDatabase

from typing import List
from pathlib import Path

results_file = {
    'LOGS': 'logs.txt',
    'OK': 'ok.txt',
    'INHIBITORS': 'inhibitors.tsv',
    'REPURPOSING_FILE': 'repurposing_reproc.tsv',
    'FLUX_DIFFS_KO': 'flux_diffs_ko.csv',
    'FLUX_RATIOS_KO': 'flux_ratios_ko.csv',
    'D_SCORE_DOWN': 'd_score_down.csv',
    'D_SCORE_UP': 'd_score_up.csv',
    'DRUG_SCORE': 'drug_score.csv'
}

score_columns = {
    'D_SCORE': 'd_score',
    'MOA': 'moa',
    'TARGET': 'Target',
    'ENTREZ_GN_ID': 'ENTREZ_GENE_ID',
    'PHASE': 'Phase',
    'NAME': 'Name'
}

def response_data(status: str, msg: str, file_result: str):
    return {
        'status': status,
        'msg': msg,
        'file_result': file_result
		}

def write_logs(logs: List[str], log_dir: str):
    log_path = os.path.join(log_dir, f"{results_file['LOGS']}")
    file = open(log_path, "a+")
    file.write("--------------------\n")
    for log_line in logs:
      file.write(log_line + "\n")
    file.close()

def write_done(message: str, log_dir: str):
    log_path = os.path.join(log_dir, f"{results_file['OK']}")
    file = open(log_path, "w")
    file.write(message)
    file.close()

# https://cobrapy.readthedocs.io/en/latest/simulating.html
def _perform_knockout(
    spacer: str,
    total_knockouts: int,
    model: cobra.Model,
    gene_id: str,
    reference_solution,
    output_dir: str
) -> tuple[str, pd.DataFrame]:
    """
    This function will perform a single gene knockout. It will be used in multiprocessing
    """
    model_copy = model.copy()
    gene: cobra.Gene = model_copy.genes.get_by_id(gene_id)
    gene.knock_out()
    
    optimized_model: pd.DataFrame = cobra.flux_analysis.moma(
        model_copy,
        solution=reference_solution,
        linear=False
    ).to_frame()
    
    count_progress.acquire()
    count_progress.value += 1
    write_logs([f"{count_progress.value:{spacer}d} of {total_knockouts}) Finished knock-out simulation for gene ID: {int(gene_id):6d}"], output_dir)
    count_progress.release()
    
    return gene_id, optimized_model["fluxes"]

def initialize_pool(synchronizer):
    global count_progress
    count_progress = synchronizer

def knock_out_simulation(
        model: cobra.Model,
        inhibitors_filepath: str | Path,
        drug_db: pd.DataFrame,
        test_all: bool,
        test_result: bool,
        output_dir: str
):
    reference_solution: cobra.Solution = model.optimize()

    if os.path.isfile(inhibitors_filepath):
        write_logs([f"[OK] - Inhibitors file found at:\t{inhibitors_filepath}"], output_dir)
        DT_genes = pd.read_csv(os.path.join(inhibitors_filepath), header=None, sep="\t")
        DT_genes.rename(columns={0: "Gene ID"}, inplace=True)
        DT_genes["Gene ID"] = DT_genes["Gene ID"].astype(str)
    else:
        # if inhibitors file does not exist, create a new one
        drug_db = drug_db[drug_db["MOA"].str.lower().str.contains("inhibitor") == True]
        DT_genes = pd.DataFrame(columns=["Gene ID"])
        DT_genes["Gene ID"] = drug_db["ENTREZ_GENE_ID"].astype(str)
        DT_genes.replace("-", np.nan, inplace=True)
        DT_genes.dropna(axis=0, inplace=True)
        DT_genes.to_csv(inhibitors_filepath, header=False, sep="\t")
        write_logs([f"[OK] - Inhibitors file written to:\t{inhibitors_filepath}"], output_dir)
    
    gene_ind2genes = [g.id for g in model.genes]
    if (test_result == True):
        gene_ind2genes = set(gene_ind2genes[:100])
    else:
        gene_ind2genes = set(gene_ind2genes)
    
		# Find common genes between
    common_genes = list(set(DT_genes["Gene ID"].tolist()).intersection(gene_ind2genes))
    
    write_logs([
        f"[OK] - {len(gene_ind2genes)} genes in model",
        f"[OK] - {len(common_genes)} genes can be targeted by drugs"
		], output_dir)
    
		# Minimization of metabolic adjustment
    model_opt = cobra.flux_analysis.moma(model, solution=reference_solution, linear=True).to_frame()
    model_opt[abs(model_opt) < 1e-8] = 0.0
    
    genes_with_metabolic_effects = []
    for id_ in common_genes:
        gene = model.genes.get_by_id(id_)
        for rxn in gene.reactions:
            gene_reaction_rule = rxn.gene_reaction_rule
            gene_ids = re.findall(r"\d+", gene_reaction_rule)
            for gene_id in gene_ids:
                if gene_id == id_:
                    boolval = "False"
                else:
                    boolval = "{}".format(model.genes.get_by_id(gene_id).functional)
                gene_reaction_rule = gene_reaction_rule.replace(
                    "{}".format(gene_id), boolval, 1
                )
            try:
              if not eval(gene_reaction_rule) or test_all:
                 genes_with_metabolic_effects.append(id_)
                 break
            except Exception as e: 
              pass 
    """
    Get the number of characters in the length of the number of genes
    For example:
        "1" for len(has_effects_gene) = 1 to 9
        "2" for len(has_effects_gene) = 10 to 99
        "3" for len(has_effects_gene) = 100 to 999
    """
    # Initialize the processing pool with a counter
    # From: https://stackoverflow.com/questions/69907453Up
    # synchronizer = mp.Value("i", 0)
    
    # Require at least one core
    # num_cores: int = max(1, mp.cpu_count() - 2)
    # pool: mp.Pool = mp.Pool(num_cores, initializer=initialize_pool, initargs=(synchronizer,))    
    # spacer: int = len(str(len(genes_with_metabolic_effects)))
    
    flux_solution: pd.DataFrame = pd.DataFrame()
    
    write_logs([
        f"[OK] - Found {len(genes_with_metabolic_effects)} genes with potentially-significant metabolic impacts"
		], output_dir)
    
    # start = time.time()

    for id_ in genes_with_metabolic_effects:
        flux_solution[id_] = model_opt["fluxes"]

    # output: list[mp.pool.ApplyResult] = []
    # for id_ in genes_with_metabolic_effects:
    #     output.append(
    #         pool.apply_async(
    #             _perform_knockout,
    #             kwds={
    #                 "spacer": spacer,
    #                 "total_knockouts": len(genes_with_metabolic_effects),
    #                 "model": model,
    #                 "gene_id": id_,
    #                 "reference_solution": reference_solution,
    #             }
    #         )
    #     )
    # pool.close()
    # pool.join()    
    # gene_id: str
    # knock_out_flux: pd.Series
    # for result in output:
    #     gene_id, knock_out_flux = result.get()
    #     flux_solution[gene_id] = knock_out_flux
    
    # end = time.time()
    # print(f"Time elapsed: {end - start} seconds (multi core)")
    
    # flux_solution
    flux_solution[abs(flux_solution) < 1e-8] = 0.0
    flux_solution_ratios = flux_solution.div(model_opt["fluxes"], axis=0)  # ko / original : inf means
    flux_solution_diffs = flux_solution.sub(model_opt["fluxes"], axis=0)  # ko - original
    
    return (
        model,
        gene_ind2genes,
        genes_with_metabolic_effects,
        flux_solution,
        flux_solution_ratios,
        flux_solution_diffs,
    )


def create_gene_pairs(
        datadir,
        model,
        gene_ind2genes,
        flux_solution,
        flux_solution_ratios,
        flux_solution_diffs,
        has_effects_gene,
        disease_genes,
):
    disease_genes = pd.read_csv(os.path.join(datadir, disease_genes))
    DAG_dis_genes = pd.DataFrame()  # data analysis genes
    DAG_dis_genes["Gene ID"] = disease_genes.iloc[:, 0].astype(str)
    # DAG_dis_genes
    DAG_dis_met_genes = set(DAG_dis_genes["Gene ID"].tolist()).intersection(
        gene_ind2genes
    )
    # DAG_dis_met_genes
    
    DAG_dis_met_rxn_ind = []
    gene_i = []
    for id_ in DAG_dis_met_genes:
        gene = model.genes.get_by_id(id_)
        for rxn in gene.reactions:
            DAG_dis_met_rxn_ind.append(rxn.id)
            gene_i.append(id_)
    
    # DAG_dis_met_rxn_ind
    gene_df = pd.DataFrame(gene_i, columns=["Gene IDs"], index=DAG_dis_met_rxn_ind)
    # gene_df
    
    dag_rxn_flux_ratio: pd.DataFrame = flux_solution_ratios.loc[DAG_dis_met_rxn_ind]
    dag_rxn_flux_diffs: pd.DataFrame = flux_solution_diffs.loc[DAG_dis_met_rxn_ind]
    dag_rxn_flux_value: pd.DataFrame = flux_solution.loc[DAG_dis_met_rxn_ind]
    # dag_rxn_flux_ratio
    
    gene_mat_out = []
    # gene_i = DAG_dis_met_genes
    # Rind_i = DAG_dis_met_rxn_ind
    
    for id_ in has_effects_gene:
        pegene = pd.DataFrame()
        pegene["Gene IDs"] = gene_df["Gene IDs"].copy()
        pegene["rxn_fluxRatio"] = dag_rxn_flux_ratio[id_].copy()
        rxn_fluxDiffs = dag_rxn_flux_diffs[id_].copy()
        rxn_fluxValue = dag_rxn_flux_value[id_].copy()
        pegene["Gene"] = id_
        pegene = pegene.loc[
            (~pegene["rxn_fluxRatio"].isna())
            & (abs(rxn_fluxDiffs) + abs(rxn_fluxValue) > 1e-8)
            ]
        # pegene.dropna(axis=0,subset=['rxn_fluxRatio'],inplace=True)
        pegene.index.name = "reaction"
        pegene.reset_index(drop=False, inplace=True)
        gene_mat_out.append(pegene)
    
    gene_pairs = pd.concat(gene_mat_out, ignore_index=True)
    return gene_pairs


def score_gene_pairs(gene_pairs, filename, input_reg, datadir: str):
    p_model_genes = gene_pairs.Gene.unique()
    d_score = pd.DataFrame([], columns=["score"])
    for p_gene in p_model_genes:
        data_p = gene_pairs.loc[gene_pairs["Gene"] == p_gene].copy()
        total_aff = data_p["Gene IDs"].unique().size
        n_aff_down = data_p.loc[abs(data_p["rxn_fluxRatio"]) < 0.9, "Gene IDs"].unique().size
        n_aff_up = data_p.loc[abs(data_p["rxn_fluxRatio"]) > 1.1, "Gene IDs"].unique().size
        if input_reg == "up":
            d_s = (n_aff_down - n_aff_up) / total_aff
        else:
            d_s = (n_aff_up - n_aff_down) / total_aff
        
        d_score.at[p_gene, "score"] = d_s
    
    d_score.index.name = "Gene"
    d_score.to_csv(os.path.join(datadir, filename))
    return d_score


def score_gene_pairs_diff(gene_pairs, file_full_path):
    p_model_genes = gene_pairs.Gene.unique()
    d_score = pd.DataFrame([], columns=["score"])
    for p_gene in p_model_genes:
        data_p = gene_pairs.loc[gene_pairs["Gene"] == p_gene].copy()
        total_aff = data_p["Gene IDs"].unique().size
        n_aff_down = (
            data_p.loc[data_p["rxn_fluxRatio"] < -1e-8, "Gene IDs"].unique().size
        )
        n_aff_up = data_p.loc[data_p["rxn_fluxRatio"] > 1e-8, "Gene IDs"].unique().size
        d_s = (n_aff_down - n_aff_up) / total_aff
        d_score.at[p_gene, "score"] = d_s
    
    d_score.index.name = "Gene"
    d_score.to_csv(file_full_path)
    return d_score


def load_Inhi_Fratio(filepath):
    temp2 = pd.read_csv(filepath)
    temp2.rename(
        columns={
            "gene_mat_out1": "Gene",
            "gene_mat_out2": "Gene IDs",
            "gene_mat_out3": "rxn_fluxRatio",
        },
        inplace=True,
    )
    temp2.Gene = temp2.Gene.astype(str)
    temp2["Gene IDs"] = temp2["Gene IDs"].astype(str)
    return temp2


def repurposing_hub_preproc(drug_file):
    drug_db = pd.read_csv(drug_file, sep="\t")
    drug_db_new = pd.DataFrame()
    for index, row in drug_db.iterrows():
        if pd.isnull(row["target"]):
            continue
        for target in row["target"].split("|"):
            drug_db_new = pd.concat(
                [drug_db_new,
                 pd.DataFrame([
                     {
                         "Name": row["pert_iname"],
                         "MOA": row["moa"],
                         "Target": target.strip(),
                         "Phase": row["clinical_phase"]
                     }])
                 ],
                ignore_index=True
            )
    drug_db_new.reset_index(inplace=True)
    
    entrez_ids = async_bioservices.fetch_gene_info(
        input_values=drug_db_new["Target"].tolist(),
        input_db=InputDatabase.GENE_SYMBOL,
        output_db=OutputDatabase.GENE_ID
    )
    
    # entrez_ids = fetch_entrez_gene_id(drug_db_new["Target"].tolist(), input_db="Gene Symbol")
    entrez_ids.reset_index(drop=False, inplace=True)
    drug_db_new["ENTREZ_GENE_ID"] = entrez_ids["Gene ID"]
    drug_db_new = drug_db_new[["Name", "MOA", "Target", "ENTREZ_GENE_ID", "Phase"]]
    return drug_db_new


def drug_repurposing(drug_db, d_score):

    if d_score.empty:
        empty_score = pd.DataFrame(columns=np.array(list(score_columns.values())))
        return empty_score

    d_score["Gene"] = d_score["Gene"].astype(str)
    
    d_score_gene_sym = async_bioservices.fetch_gene_info(
        input_values=d_score["Gene"].tolist(),
        input_db=InputDatabase.GENE_ID,
        output_db=[OutputDatabase.GENE_SYMBOL]
    )
    
    d_score.set_index("Gene", inplace=True)
    d_score["Gene Symbol"] = d_score_gene_sym["Gene Symbol"]
    d_score.reset_index(drop=False, inplace=True)
    d_score_new = pd.DataFrame()
    for index, row in d_score.iterrows():
        target = row["Gene Symbol"]
        drugs = drug_db.loc[drug_db["Target"] == target, :].copy()
        drugs[["d_score"]] = row[["score"]].copy()
        
        d_score_new = pd.concat([d_score_new, drugs], ignore_index=True)
    
    d_score_new.drop_duplicates(inplace=True)
    d_score_trim = d_score_new[
        d_score_new["MOA"].str.lower().str.contains("inhibitor") == True
    ]
    
    return d_score_trim

# Initialization
def main(input_vals):
        
    data = json.loads(input_vals)
     
    # Parameters options
    datadir = data.get('dir_data')
    tissue_spec_model_file = data.get('model_exported')
    context = data.get('context_name')
    disease_up_file = data.get('up_regulated')
    disease_down_file = data.get('down_regulated')
    raw_drug_filename = data.get('drug_csv_path')
    test_all = True
    solver = data.get('solver').lower()
    test_result = data.get('test_result')
   
    output_dir = os.path.join(datadir, context)
    inhibitors_file = os.path.join(datadir, f"{results_file['INHIBITORS']}")
    
    if not Path(output_dir).exists():
       Path(output_dir).mkdir(parents=True, exist_ok=True)

    write_logs(["[OK] - Starting Knock-out Simulation"], output_dir)

		# Checking files
    logs_checking_folder = []    
    if os.path.exists(os.path.join(datadir, disease_up_file)):
       logs_checking_folder.append("[OK] - Disease_Up file exists")
    
    if os.path.exists(os.path.join(datadir, disease_down_file)):
       logs_checking_folder.append("[OK] - Disease_Down file exists")

    if os.path.exists(os.path.join(datadir, raw_drug_filename)):
       logs_checking_folder.append("[OK] - Drug file exists")

    if len(logs_checking_folder) > 0:
        write_logs(logs_checking_folder, output_dir)

    cobra_model: cobra.Model = cobra.io.load_json_model(tissue_spec_model_file)
    cobra_model.solver = solver

    write_logs([
        f"[OK] - model {tissue_spec_model_file} was loaded",
        f"[OK] - Model genes have a number of {len(cobra_model.genes)} genes",
		], output_dir)

    # preprocess repurposing hub data
    logs_repurposing = []
    reformatted_drug_file = os.path.join(datadir, f"{results_file['REPURPOSING_FILE']}")
    if not os.path.isfile(reformatted_drug_file):
        logs_repurposing.append("[OK] - Preprocessing raw Repurposing Hub DB file...")
        drug_db = repurposing_hub_preproc(raw_drug_filename)
        drug_db.to_csv(reformatted_drug_file, index=False, sep="\t")
        logs_repurposing.append(f"[OK] - Preprocessed Repurposing Hub tsv file written to: {reformatted_drug_file}")
    else:
        logs_repurposing.append(f"[OK] - Found preprocessed Repurposing Hub tsv file at: {reformatted_drug_file}")
        drug_db = pd.read_csv(reformatted_drug_file, sep="\t")
    
    if len(logs_repurposing) > 0:
        write_logs(logs_repurposing, output_dir)

    # Start score file
    empty_score = pd.DataFrame( columns=np.array(list(score_columns.values())) )
    empty_score.to_csv(os.path.join(datadir, f"{results_file['DRUG_SCORE']}"), sep="\t", index=False)

    # Knock Out Simulation: This is directing to the most important data
    model, gene_ind2genes, has_effects_gene, fluxsolution, flux_solution_ratios, flux_solution_diffs = knock_out_simulation(
        model = cobra_model,
        inhibitors_filepath = inhibitors_file,
        drug_db = drug_db,
        test_all = test_all,
        test_result = test_result,
        output_dir = output_dir
    )
    
    if len(fluxsolution) == 0:
       write_done("No results", output_dir)
       return response_data(status='success', msg='Gene D score', file_result='')

    flux_solution_diffs.to_csv(os.path.join(datadir, results_file['FLUX_DIFFS_KO']))
    flux_solution_ratios.to_csv(os.path.join(datadir, results_file['FLUX_RATIOS_KO']))
        
    gene_pairs_down = create_gene_pairs(
        datadir,
        model,
        gene_ind2genes,
        fluxsolution,
        flux_solution_ratios,
        flux_solution_diffs,
        has_effects_gene,
        disease_genes=disease_down_file,
    )   
    # gene_pairs_down.to_csv(os.path.join(output_dir, f"{context}_Gene_Pairs_Inhi_Fratio_DOWN.txt"), index=False)
    
    gene_pairs_up = create_gene_pairs(
        datadir,
        model,
        gene_ind2genes,
        fluxsolution,
        flux_solution_ratios,
        flux_solution_diffs,
        has_effects_gene,
        disease_genes=disease_up_file,
    )    
    # gene_pairs_up.to_csv(os.path.join(output_dir, f"{context}_Gene_Pairs_Inhi_Fratio_UP.txt"), index=False)

    d_score_down = score_gene_pairs(gene_pairs_down, os.path.join(datadir, results_file['D_SCORE_DOWN']), input_reg="down", datadir=datadir)
    d_score_up = score_gene_pairs(gene_pairs_up, os.path.join(datadir, results_file['D_SCORE_UP']), input_reg="up", datadir=datadir)

    pertubation_effect_score = (d_score_up + d_score_down).sort_values(by="score", ascending=False)
    pertubation_effect_score.reset_index(drop=False, inplace=True)
    
    # last step: output drugs based on d score
    drug_score = drug_repurposing(drug_db, pertubation_effect_score)
    
    drug_score_file = os.path.join(datadir, f"{results_file['DRUG_SCORE']}")
    drug_score.to_csv(drug_score_file, sep="\t", index=False)
    
    write_logs([
       "[OK] - Gene D score mapped to repurposing drugs saved to: {}".format(drug_score_file)
		], output_dir)
    
    write_done('successfully', output_dir)

    return response_data(status='success', msg='Gene D score mapped to repurposing drugs', file_result=drug_score_file)


if __name__ == "__main__":
    main(sys.argv[1:])
