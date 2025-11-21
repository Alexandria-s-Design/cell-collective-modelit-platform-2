from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Union


@dataclass
class KineticParams:
	num_timesteps: int


@dataclass
class KineticBody:
	model: dict 
	parameters: Optional[KineticParams] = None


@dataclass
class PbpkParams:
	num_timesteps: int
	step_size: float
	population_size: int


@dataclass
class PbpkBody:
	model: dict
	parameters: PbpkParams

@dataclass
class KineticExportBody:
	type: str
	model: dict
	resultPath: str
	

@dataclass
class ContextUpload:
	name: str
	path: str
	size: int = 0
	mimetype: str = ""
@dataclass
class ContextCheckboxesParams:
	value: str = ""
	checkable: str = ""

@dataclass
class ContextSettingCheckboxesParams:
	bulk_rna: Optional[ContextCheckboxesParams] = None
	proteomics: Optional[ContextCheckboxesParams] = None
	data_merging: Optional[ContextCheckboxesParams] = None
	bulk_cell_rna: Optional[ContextCheckboxesParams] = None
	bulk_polya_rna: Optional[ContextCheckboxesParams] = None

@dataclass
class ContextSettingActivityThreshold:
	lower: int
	upper: int

@dataclass
class ContextSettingDataParams:
	speciesTaxonId: Union[str, int]
	checkboxesData: Optional[ContextSettingCheckboxesParams] = None
	activity_threshold: Optional[ContextSettingActivityThreshold] = None


@dataclass
class ContextSettingParams:
	settings: Optional[ContextSettingDataParams] = None
	typeProteomics: Optional[dict] = None
	typeDataMerging: Optional[dict] = None
	typeBulkPolyaRNA: Optional[dict] = None
	typeBulkTotalRNA: Optional[dict] = None
	typeSingleCellRNA: Optional[dict] = None

@dataclass
class ContextUploadsParams:
	generalModel: Optional[ContextUpload]
	boundaryReactions: Optional[ContextUpload] = None
	coreForceReactions: Optional[ContextUpload] = None
	excludeReactions: Optional[ContextUpload] = None
	typeSingleCellRNA: Optional[ContextUpload] = None
	typeBulkTotalRNA: Optional[ContextUpload] = None
	typeBulkPolyaRNA: Optional[ContextUpload] = None
	typeProteomics: Optional[ContextUpload] = None


@dataclass
class ContextBody:
	id: Union[str, int]
	contextType: str
	contextDir: Optional[str]
	contextName: Optional[str]
	modelOriginId: Union[str, int]
	uploads: Optional[ContextUploadsParams] = None
	settings: Optional[ContextSettingParams] = None
	uploadsRoot: Optional[str] = None

@dataclass
class DrugAnalyzerBody:
	healthy: str
	diseased: str
	statistical: str
	method: str
	result_dir: str
	tmp_dir: str
	log_file: Optional[str] | None = None
	maxrows:  Optional[int] | None = None
	drug_csv_path: Optional[str] | None = None
	
@dataclass
class DrugSolverBody:
	dir_data: str #'/uploads/drug/16337/10248',
	test_result: bool #false,
	solver: str #'GLPK',
	context_name: str #'20240521180502471',
	up_regulated: str #'upregulated_20240621180502.txt',
	down_regulated: str #'downregulated_20240621180502.txt',
	model_exported: str
	drug_csv_path: Optional[str] = None
	taxonId: Optional[Union[str, int]] = None
	fluxRatioUp: Optional[Union[str, int]] = None
	fluxRatioDown: Optional[Union[str, int]] = None
	knockoutMethod: Optional[str] = None
