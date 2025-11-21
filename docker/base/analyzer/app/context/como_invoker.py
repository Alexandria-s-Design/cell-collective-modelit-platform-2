from ..schemas import ContextBody as ContextConf
import os
from pathlib import Path
from fast_bioservices import Input, Taxon

# como packages
from como.project import Config 
from como.custom_types import RNASeqPreparationMethod
from como.rnaseq_preprocess import rnaseq_preprocess
from como.proteomics_gen import proteomics_gen
from como.rnaseq_gen import FilteringTechnique, rnaseq_gen
from como.merge_xomics import AdjustmentMethod, merge_xomics
from como.create_context_specific_model import Algorithm, Solver, create_context_specific_model

from .context_utils import (
    context_get_valid_upload,
    ensure_objective_in_json,
    generate_trnaseq_data,
    copy_gene_counts_matrix_total
)

# Main class
class ComoInvoker:
    def __init__(self, conf: ContextConf, config: Config):
        self.commands = []
        self.conf = conf
        self.config = config

    def add(self, command):
        self.commands.append(command)

    async def run(self):
        for command in self.commands:
            await command.execute(self.conf, self.config)

    def getConf(self, name=None):
        if name is not None:
            return self.conf[name]

        return self.conf

    def getAlgorithm(self) -> str:
        p_algorithm = Algorithm.IMAT
        if self.conf['contextType'] == 'FASTCORE':
                p_algorithm = Algorithm.FASTCORE
        if self.conf['contextType'] == 'GIMME':
                p_algorithm = Algorithm.GIMME
        return p_algorithm.value

# Base Class
class Command():
    def execute(self, conf: ContextConf, config: Config):
        pass


class Proteomics(Command):
    async def execute(self, conf: ContextConf, config: Config):
        
        params = conf['settings']['typeProteomics']
        proteomics_config_file = f"{conf['uploadsRoot']}/{conf['uploads']['typeProteomics']['path']}"
        rep_ratio = params['geneReplicate'] # 0.75
        batch_ratio = params['geneGroup'] #0.75
        high_rep_ratio = params['highConfidenceGeneReplicate'] #1.0
        high_batch_ratio = params['highConfidenceGeneGroup'] #1.0
        quantile = 25 # TODO: this parameter is not in CC-512 but might be needed later 
        proteomics_config_file = context_get_valid_upload('typeProteomics', proteomics_config_file)
        
        print(f"Creating Proteomics into {config.data_dir}...")
        
        await proteomics_gen(proteomics_config_file, rep_ratio, batch_ratio, high_rep_ratio, high_batch_ratio, quantile)


# This class is responsible for generating:
#  ActiveGenes_CONTEXT_Merged.csv
class DataMerging(Command):
    async def execute(self, conf: ContextConf, config: Config):

        params = conf['settings']['typeDataMerging']
        args = dict()

        if params['method'] == None:
            raise ValueError("Please definea adjustment method value")
        
        p_adjust_method = params['method']
        
        if isinstance(p_adjust_method, dict):
            p_adjust_method = p_adjust_method['id']

        args['trnaseq_filepath'] = f"{config.config_dir}/trnaseq_data_inputs_auto.xlsx"
        args['mrnaseq_filepath'] = None #optional
        args['scrnaseq_filepath'] = None #optional
        args['proteomics_filepath'] = None
        
        expression_requirement = 3 # TODO: is this parameter missing?
        adjust_method = AdjustmentMethod(p_adjust_method) 
        total_rna_weight =  params['bulkTotalRnaSeq'] #6
        mrna_weight = params['bulkPolyARnaSeq']  #6
        single_cell_weight = params['singleCellRnaSeq'] #6
        proteomics_weight = params['proteomics'] #10

        print(f"Creating DataMerging into {config.data_dir}...")
        print(args)

        await merge_xomics(**args,
                expression_requirement=expression_requirement,
                adjust_method=adjust_method,
                trna_weight=total_rna_weight,
                mrna_weight=mrna_weight,
                scrna_weight=single_cell_weight,
                proteomics_weight=proteomics_weight,
                no_high_confidence=True
        )

class RNASeqGen(Command):
    def __init__(self, analysis_type) -> None:
        self.type = analysis_type 
    
    async def execute(self, conf: ContextConf, config: Config):
        
        name = "typeBulkPolyaRNA" if self.type == "bulk_polya_rna" else "typeBulkTotalRNA"
        params = conf['settings'][name]
        p_taxon_id = conf['settings']['settings']['speciesTaxonId']
                
        gene_counts_matrix = None
        
        if self.type == "bulk_rna":
            gene_counts_matrix = f"{conf['uploadsRoot']}/{conf['uploads'][name]['path']}"
        if self.type == "bulk_polya_rna":
            gene_counts_matrix = f"{conf['uploadsRoot']}/{conf['uploads'][name]['path']}"        
        if self.type == "bulk_cell_rna":
            gene_counts_matrix = f"{conf['uploadsRoot']}/{conf['uploads'][name]['path']}"

        trnaseq_config_file = os.path.join(config.config_dir, "trnaseq_data_inputs_auto.xlsx")        
        rep_ratio = params['geneReplicate'] #0.75
        group_ratio =  params['geneGroup'] #0.75
        rep_ratio_h = params['highConfidenceGeneReplicate'] #1.0
        group_ratio_h = params['highConfidenceGeneGroup'] #1.0
        technique = FilteringTechnique(params['method']) 
        # quantile = 50
        min_zfpkm = -3
        prep_method = RNASeqPreparationMethod("total")
        
        if params['method'] == 'zfpkm':
           min_zfpkm = params['methodActivity']
        elif params['method'] == 'quantitle':
           min_zfpkm = -1

        prep_method = RNASeqPreparationMethod("total")

        copy_gene_counts_matrix_total(
            matrix_filepath = gene_counts_matrix,
                context_name = conf['contextName'],
                config = config
        )

        print(f"Creating RNASeqGen ({name}) into {config.data_dir}...") 

        await rnaseq_gen(
            config_filename = trnaseq_config_file,
            prep = prep_method,
            replicate_ratio = rep_ratio,
            batch_ratio = group_ratio,
            high_replicate_ratio = rep_ratio_h,
            high_batch_ratio = group_ratio_h,
            technique = technique,
            cut_off = min_zfpkm,
            taxon_id = Taxon.from_string(str(p_taxon_id)),
            write_zfpkm_png_filepath = Path(str(config.data_dir)+"/zfpkm_plot.png")
        )


# This class is responsible for generating:
# trnaseq_data_inputs_auto.xlsx and mrnaseq_data_inputs_auto.xlsx
class RNASeqPreprocess(Command):
    def __init__(self, analysis_type) -> None:
        self.type = analysis_type 

    async def execute(self, conf: ContextConf, config: Config):
        
        name = "typeBulkTotalRNA"
				
        if self.type == "bulk_polya_rna":
            name = "typeBulkPolyaRNA"

        p_matrix_file = f"{conf['uploadsRoot']}/{conf['uploads'][name]['path']}"
        p_matrix_file = context_get_valid_upload(name, p_matrix_file)        
        print(f"Retrieving Matrix file from the {p_matrix_file}...")

        p_context_names = [conf['contextName']]
        p_mode = 'provide' # or 'make'
        p_input_format = Input.ENSEMBL_GENE_ID
        p_taxon_id = conf['settings']['settings']['speciesTaxonId'] # 9606: Human

        print(f"Creating RNASeqPreprocess ({name}) into {config.data_dir}...")
        
        await rnaseq_preprocess(
            context_names = p_context_names,
            mode = p_mode,
            input_format = p_input_format,
            taxon_id = p_taxon_id,
            matrix_file = p_matrix_file
        )

        # Creates trnaseq_data_inputs_auto
        trnaseq_data = generate_trnaseq_data(
            matrix_filepath = p_matrix_file,
            context_name = conf['contextName'],
            config = config
        )
        print(f"Generated Excel file at {trnaseq_data}")

class CreateContextSpecific(Command):
    async def execute(self, conf: ContextConf, config: Config):
        
        low_threshold = conf['settings']['settings']['activityThreshold']['lower'] #-5
        high_threshold = conf['settings']['settings']['activityThreshold']['upper'] #-3
        output_filetypes = ["json"]
        
        force_reactions_filepath = None
        exclude_reactions_filepath = None
        boundary_reactions_filepath = None
        
        if conf['uploads'].get("excludeReactions"):
            exclude_reactions_filepath = os.path.join(conf['uploadsRoot'], conf['uploads']['excludeReactions']['path'])
            
        if conf['uploads'].get("boundaryReactions"):
            boundary_reactions_filepath = os.path.join(conf['uploadsRoot'], conf['uploads']['boundaryReactions']['path'])
            boundary_reactions_filepath = Path(boundary_reactions_filepath)

        if conf['uploads'].get("coreForceReactions"):
            force_reactions_filepath = os.path.join(conf['uploadsRoot'], conf['uploads']['coreForceReactions']['path'])       

        p_algorithm = Algorithm.IMAT
        p_general_model_filepath = None
                # from merge_xomics
        p_active_genes_filepath = None
        
        if conf['contextType'] == 'FASTCORE':
            p_algorithm = Algorithm.FASTCORE
            
        if conf['contextType'] == 'GIMME':
            p_algorithm = Algorithm.GIMME

        p_active_genes_filepath = os.path.join(config.data_dir, "results", conf['contextName'], f"ActiveGenes_{conf['contextName']}_Merged.csv")
        context_get_valid_upload("Active Genes", p_active_genes_filepath)

        p_general_model_filepath = os.path.join(conf['uploadsRoot'], conf['uploads']['generalModel']['path'])        
        context_get_valid_upload("Model Origin Exported", p_general_model_filepath)

        general_model_filepath, objective_id = ensure_objective_in_json(p_general_model_filepath, config.data_dir)
        print(f"New General Model into {general_model_filepath}")

        print(boundary_reactions_filepath)

        create_context_specific_model(
            context_name = conf['contextName'], 
            reference_model = Path(general_model_filepath), 
            genes_file = Path(p_active_genes_filepath), 
            objective = objective_id, 
            boundary_rxns_filepath = boundary_reactions_filepath, 
            exclude_rxns_filepath = exclude_reactions_filepath,
            force_rxns_filepath = force_reactions_filepath, 
            algorithm = p_algorithm, 
            low_threshold = low_threshold, 
            high_threshold = high_threshold, 
            solver = Solver.GLPK, 
            output_filetypes = output_filetypes
        )