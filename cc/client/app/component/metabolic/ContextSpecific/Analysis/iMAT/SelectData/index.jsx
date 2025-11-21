import React from "react";
import BulkPolyRNA from "./BulkPolyaRNA";
import BulkRNA from "./BulkRNA";
import DataMerging from "./DataMerging"
import SingleCellRNA from "./SingleCellRNA";
import Proteomics from "./Proteomics";


export function rSelectDataContent(type, props) {
	if (type === 'bulk_rna') return <BulkRNA {...props} />
	if (type === 'bulk_polya_rna') return <BulkPolyRNA {...props}/>
	if (type === 'data_merging') return <DataMerging {...props}/>
	if (type === 'bulk_cell_rna') return <SingleCellRNA {...props}/>
	if (type === 'proteomics') return <Proteomics {...props}/>
	return null;
}