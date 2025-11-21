import os
import json
import pandas as pd
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats
from pydeseq2.utils import load_example_data
from statsmodels.stats.multitest import multipletests
import uuid
from sklearn.preprocessing import normalize
# from ccpy.util.knockout.knock_out_simulation import main

class PerformOptions:
		def __init__(self):
				pass

		def __str__(self):
				return f"Options(max_rows={self.max_rows},result_dir={self.result_dir})"

# The param str_jsondata expects a data like from --input argument:
# 	str({	
# 			"healthy": "tmp_ad414ec6d33e59a0b52a8730a00f14d38be777c5.csv",
# 			"diseased": "tmp_af23129eeba1ce6c3cfcb5fd9fbbc0c905c6676c.csv",
# 			"statistical": "DESEQ2",
# 			"method": "BENHBERG", //"Benjamini-Hochberg",
# 			"maxrows": 2000,
#				"output_dir": "/storage/20230701"
# 	})

def perform_diff_gene(str_jsondata):

		data = json.loads(str_jsondata)

		print (data)

		# Get the parameters
		csv_healthy_counts = data.get('healthy')
		csv_diseased_counts = data.get('diseased')
		max_rows = data.get('maxrows')
		method_perform = data.get('method')
		statis_perform = data.get('statistical')
		tmp_dir = data.get('tmp_dir')
		result_dir = data.get('result_dir')

		if not csv_healthy_counts:
			raise ValueError("Please inform [healthy] key on your JSON input")

		if not csv_diseased_counts:
			raise ValueError("Please inform [diseased] key on your JSON input")

		if not os.path.exists(result_dir):
				raise ValueError("Please inform [result_dir] key on your JSON input")
		
		if not os.path.exists(tmp_dir):
				raise ValueError("Please inform [tmp_dir] key on your JSON input")

		# Read the count matrices
		healthy_counts = pd.read_csv(os.path.join(tmp_dir, csv_healthy_counts), index_col=0)
		diseased_counts = pd.read_csv(os.path.join(tmp_dir, csv_diseased_counts), index_col=0)

		if not statis_perform or statis_perform != 'DESEQ2':
				raise ValueError("Please inform the STATISTICAL Method on your JSON input")

		if (method_perform != 'BENHBERG'):
				raise ValueError("Please inform the CORRECTION Method on your JSON input")

		options = PerformOptions()
		options.max_rows = max_rows
		options.result_dir = result_dir

		# call method DESeq2
		csv_up_regulated, csv_down_regulated  = methodDESeq2(healthy_counts, diseased_counts, options)

		return  {
      "up_regulated": csv_up_regulated,
      "down_regulated": csv_down_regulated
    }


def methodDESeq2(healthy_df, diseased_df, options: PerformOptions):

		# Create a table of condition and replicate
		clinical_df = pd.DataFrame({
				"condition": ["healthy"] * healthy_df.shape[1] + ["diseased"] * diseased_df.shape[1],
				"group": list(range(1, healthy_df.shape[1] + 1)) + list(range(1, diseased_df.shape[1] + 1))
		})

		counts_df = pd.concat([healthy_df, diseased_df], axis=1, join='outer').fillna(0)

		# @Test: reduces number of rows
		if options.max_rows:
			counts_df = counts_df[:options.max_rows]
		
		# transpose/flipping DataFrame
		counts_df = counts_df.T
		clinical_df.index = counts_df.index
		
		# removing samples for which condition is NaN
		keep_clinical_val = ~clinical_df.condition.isna()		
		counts_df = counts_df.loc[keep_clinical_val]
		clinical_df = clinical_df.loc[keep_clinical_val]

		# Create a DESeqDataSet object
		dds = DeseqDataSet(
			counts=counts_df,
			clinical=clinical_df,
			design_factors='condition',
			refit_cooks=True,
		)

		# Perform differential gene expression (DGE)
		dds.deseq2()

		# Filter significant results
		normalized_index = dds.varm["LFC"].index
		normalized_counts = normalize(dds.varm["LFC"].fillna(0).values, axis=0)
		normalized_counts_df = pd.DataFrame(normalized_counts, columns=dds.varm["LFC"].columns)
		normalized_counts_df.index = normalized_index

		# Perform statistical method
		stat_res = DeseqStats(dds)
		stat_res.summary()

		# CSV results
		results = stat_res.results_df

		# Filtering
		results['padj'] = results['padj'].fillna(0)

		# Adjust p-values using Benjamini-Hochberg method
		pvalues_size = 0.05 if not options.max_rows else 2
		adjusted_pvalues = multipletests(results['pvalue'].fillna(0), method='fdr_bh')
		results = results[(adjusted_pvalues[0] == True) & (adjusted_pvalues[1] < pvalues_size)]

		# Calculate and create a fold change column
		normalized_counts_df['condition_healthy_vs_diseased'] = normalized_counts_df['condition_healthy_vs_diseased'].fillna(1).replace(0, 1)
		fold_change = normalized_counts_df['intercept'].fillna(0) / normalized_counts_df['condition_healthy_vs_diseased']
		results.insert(len(results.columns), "fold_change", fold_change)

		# CSV files
		csv_up_regulated = os.path.join(options.result_dir, "up_reg.csv")
		csv_down_regulated = os.path.join(options.result_dir, "down_reg.csv")

		# Separate down-regulated and up-regulated genes
		up_regulated = results[results['fold_change'] > 1]
		down_regulated = results[results['fold_change'] < 1]

		# Write down-regulated and up-regulated genes to a file
		up_regulated.to_csv(csv_up_regulated, index=True)		
		down_regulated.to_csv(csv_down_regulated, index=True)

		return (
			csv_up_regulated,
			csv_down_regulated
		)

def testCorrectionMethod():
		pfval = pd.DataFrame({
			"pvalue": [0.02, 0.1, 0.05, 0.3, 0.01]
		})

		adjusted_pvalues = multipletests(pfval['pvalue'], method='fdr_bh')
		results = pfval[(adjusted_pvalues[0] == True) & (adjusted_pvalues[1] < 0.05)]
		
		# True
		return results.reset_index(drop=True).equals(pd.DataFrame({"pvalue":  [0.02, 0.01]}))