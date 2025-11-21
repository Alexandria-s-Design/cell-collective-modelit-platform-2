import { Seq, Map } from "immutable";

export default (model) => (model.modelType == 'metabolic')
	&& Seq({
		settings: {
			speciesTaxonId: null,
			checkboxesData: {'data_merging': {value: false, checkable: false}},
			activityThreshold: { lower: -3, upper: 0 },
			objectiveFunction: null,
			collapse: null
		},
		typeBulkTotalRNA: {
			upload: null,
			layout: null,
			method: 'zfpkm',
			methodActivity: -3,
			methodActivityRange: {min:-3, max: 3},
			geneGroup: 0.9,//9
			geneReplicate: 0.9,//9
			highConfidenceGeneGroup: 0.9,
			highConfidenceGeneReplicate: 0.9,
		},
		typeBulkPolyaRNA: {
			upload: null,
			layout: null,
			method: 'zfpkm',
			methodActivity: -3,
			methodActivityRange: {min:-5, max: 5},
			geneGroup: 0.9,
			geneReplicate: 0.9,
			highConfidenceGeneGroup: 0.9,
			highConfidenceGeneReplicate: 0.9,
		},
		typeSingleCellRNA: {
			upload: null,
			geneGroup: 0.9,
			geneReplicate: 0.9,
			highConfidenceGeneGroup: 0.9,
			highConfidenceGeneReplicate: 0.9,
		},
		typeProteomics: {
			upload: null,
			geneGroup: 0.9,
			geneReplicate: 0.9,
			highConfidenceGeneGroup: 0.9,
			highConfidenceGeneReplicate: 0.9,
		},
		typeDataMerging: {
			method: 'regressive',
			bulkTotalRnaSeq: 6,
			bulkPolyARnaSeq: 6,
			singleCellRnaSeq: 6,
			proteomics: 10
		},
		coreForceReactions: {
			upload: null,
			data: null
		},
		excludeReactions: {
			upload: null,
			data: null
		},
		boundaryReactions: {
			upload: null,
			data: null
		}
	}).map(val => new Map(val)).toMap();