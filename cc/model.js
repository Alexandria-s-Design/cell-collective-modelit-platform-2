const _requireEntityClass = type => () => require(`./client/app/entity/${type}`).default;

export const Socials = {
	"google": {
		"title": "Google",
		"color": "#dd4b39",
		"api": "/api/auth/google",
	},
	"facebook": {
		"title": "Facebook",
		"color": "#3B5998",
		"api": "/api/auth/facebook",
	},
	"linkedin": {
		"title": "LinkedIn",
		"color": "#007bb5",
		"api": "/api/auth/linkedin",
	}
}

export const Annotations = {
  "asap": {
    "url": "http://identifiers.org/asap/",
    "name": "ASAP",
    "alternateNames": [
      "ASAP"
    ]
  },
  "biocyc": {
    "url": "http://identifiers.org/biocyc/",
    "name": "BioCyc",
    "alternateNames": [
      "BioCyc"
    ]
  },
  "biopath.reaction": {
    "url": "https://www.molecular-networks.com/biopath3/biopath/rxn/",
    "name": "BioPath Reaction",
    "alternateNames": []
  },
  "biopath.molecule": {
    "url": "https://www.molecular-networks.com/biopath3/biopath/mols/",
    "name": "BioPath Molecule",
    "alternateNames": []
  },
  "cas": {
    "url": "http://identifiers.org/cas/",
    "name": "CAS Registry Number",
    "alternateNames": [
      "CAS"
    ]
  },
  "ccds": {
    "url": "http://identifiers.org/ccds/",
    "name": "CCDS",
    "alternateNames": [
      "CCDS"
    ]
  },
  "chebi": {
    "url": "http://identifiers.org/chebi/",
    "name": "CHEBI",
    "alternateNames": [
      "CHEBI"
    ]
  },
  "ecogene": {
    "url": "http://identifiers.org/ecogene/",
    "name": "EcoGene",
    "alternateNames": [
      "EcoGene"
    ]
  },
  "go": {
    "url": "http://identifiers.org/go/",
    "name": "Gene Ontology",
    "alternateNames": [
      "GO"
    ]
  },
  "goa": {
    "url": "http://identifiers.org/goa/",
    "name": "Gene Ontology Annotation",
    "alternateNames": [
      "GOA"
    ]
  },
  "hgnc": {
    "url": "http://identifiers.org/hgnc/",
    "name": "HGNC Symbol",
    "alternateNames": [
      "HGNC"
    ]
  },
  "hmdb": {
    "url": "http://identifiers.org/hmdb/",
    "name": "Human Metabolome Database",
    "alternateNames": [
      "HMDB"
    ]
  },
  "hprd": {
    "url": "http://identifiers.org/hprd/",
    "name": "Human Protein Reference Database",
    "alternateNames": [
      "HPRD"
    ]
  },
  "hssp": {
    "url": "http://identifiers.org/hssp/",
    "name": "HSSP",
    "alternateNames": [
      "HSSP"
    ]
  },
  "interpro": {
    "url": "http://identifiers.org/interpro/",
    "name": "InterPro",
    "alternateNames": [
      "InterPro"
    ]
  },
  "kegg.compound": {
    "url": "http://identifiers.org/kegg.compound/",
    "name": "KEGG Compound",
    "alternateNames": []
  },
  "kegg.glycan": {
    "url": "http://identifiers.org/kegg.glycan/",
    "name": "KEGG Glycan",
    "alternateNames": []
  },
  "kegg.drug": {
    "url": "http://identifiers.org/kegg.drug/",
    "name": "KEGG Drug",
    "alternateNames": []
  },
  "kegg.reaction": {
    "url": "http://identifiers.org/kegg.reaction/",
    "name": "KEGG Reaction",
    "alternateNames": []
  },
  "lipidmaps": {
    "url": "http://identifiers.org/lipidmaps/",
    "name": "LipidMaps",
    "alternateNames": [
      "LipidMaps"
    ]
  },
  "mgd": {
    "url": "http://identifiers.org/mgd/",
    "name": "Mouse Genome Database",
    "alternateNames": [
      "MGD"
    ]
  },
  "metanetx.chemical": {
    "url": "http://identifiers.org/metanetx.chemical/",
    "name": "MetaNetX (MNX) Chemical",
    "alternateNames": []
  },
  "metanetx.reaction": {
    "url": "http://identifiers.org/metanetx.reaction/",
    "name": "MetaNetX (MNX) Equation",
    "alternateNames": []
  },
  "myco.tuber": {
    "url": "http://identifiers.org/myco.tuber/",
    "name": "MycoBrowser tuberculosis",
    "alternateNames": []
  },
  "ncbigene": {
    "url": "http://identifiers.org/ncbigene/",
    "name": "NCBI Entrez Gene",
    "alternateNames": [
      "GeneID"
    ]
  },
  "ncbigi": {
    "url": null,
    "name": "NCBI GI",
    "alternateNames": [
      "GI"
    ]
  },
  "omim": {
    "url": "http://identifiers.org/omim/",
    "name": "Online Mendelian Inheritance in Man",
    "alternateNames": [
      "MIM"
    ]
  },
  "pdb": {
    "url": "http://identifiers.org/pdb/",
    "name": "Protein Data Bank",
    "alternateNames": [
      "PDB"
    ]
  },
  "pubchem.compound": {
    "url": "http://identifiers.org/pubchem.compound/",
    "name": "PubChem Compound",
    "alternateNames": [
      "PubChem"
    ]
  },
  "reactome.compound": {
    "url": "http://identifiers.org/reactome/R-ALL-",
    "name": "Reactome Compound",
    "alternateNames": [
      "Reactome"
    ]
  },
  "reactome.reaction": {
    "url": "http://identifiers.org/reactome/",
    "name": "Reactome Reaction",
    "alternateNames": [
      "Reactome"
    ]
  },
  "rhea": {
    "url": "http://identifiers.org/rhea/",
    "name": "RHEA",
    "alternateNames": [
      "RHEA"
    ]
  },
  "seed.compound": {
    "url": "http://identifiers.org/seed.compound/",
    "name": "SEED Compound",
    "alternateNames": []
  },
  "seed.reaction": {
    "url": "http://identifiers.org/seed.reaction/",
    "name": "SEED Reaction",
    "alternateNames": []
  },
  "sgd": {
    "url": "http://identifiers.org/sgd/",
    "name": "Saccharomyces Genome Database",
    "alternateNames": [
      "SGD"
    ]
  },
  "subtilist": {
    "url": "http://identifiers.org/subtilist/",
    "name": "SubtiList",
    "alternateNames": [
      "SubtiList"
    ]
  },
  "umbbd.compound": {
    "url": "http://identifiers.org/umbbd.compound/",
    "name": "UM-BBD",
    "alternateNames": []
  },
  "unipathway.compound": {
    "url": "http://identifiers.org/unipathway.compound/",
    "name": "UniPathway Compound",
    "alternateNames": []
  },
  "unipathway.reaction": {
    "url": "http://identifiers.org/unipathway.reaction/",
    "name": "UniPathway Reaction",
    "alternateNames": []
  },
  "uniprot": {
    "url": "http://identifiers.org/uniprot/",
    "name": "UniProt",
    "alternateNames": [
      "UniProt",
      "UniProtKB/TrEMBL",
      "UniProtKB/Swiss-Prot"
    ]
  },
  "ec-code": {
    "url": "http://identifiers.org/ec-code/",
    "name": "EC Number",
    "alternateNames": []
  },
  "inchi_key": {
    "url": "https://identifiers.org/inchikey/",
    "name": "InChI Key",
    "alternateNames": []
  },
  "old_bigg_id": {
    "url": null,
    "name": "Old BiGG ID",
    "alternateNames": []
  },
  "refseq_locus_tag": {
    "url": null,
    "name": "RefSeq Locus Tag",
    "alternateNames": []
  },
  "refseq_name": {
    "url": null,
    "name": "RefSeq Gene Name",
    "alternateNames": []
  },
  "refseq_old_locus_tag": {
    "url": null,
    "name": "RefSeq Old Locus Tag",
    "alternateNames": []
  },
  "refseq_orf_id": {
    "url": null,
    "name": "RefSeq ORF ID",
    "alternateNames": []
  },
  "refseq_synonym": {
    "url": null,
    "name": "RefSeq Gene Synonym",
    "alternateNames": []
  }
}

export const AdminAccounts = [
	"info@discoverycollective.com"
]

export default {
	"boolean": {
		name: "Logical Model",
		shortLabel: "Logical",
		beta: false,
		active: {
			"research": true,
			"learning": true,
			"teaching": true
		},
		features: {
			create: true,
			import: true,
		},
		entityClass: _requireEntityClass("boolean"),
		exportTypes: {
			"SBML": {
				name: "SBML",
				defaultExtension: ".sbml"
			},
			"EXPR": {
				name: "Boolean Expressions",
				defaultExtension: ".zip"
			},
			"TT": {
				name: "Truth Tables",
				defaultExtension: ".zip"
			},
			"MATRIX": {
				name: "Interaction Matrix",
				defaultExtension: ".csv"
			},
			"GML": {
				name: "GML",
				defaultExtension: ".gml"
			},
			"KB": {
				name: "Knowledge Base",
				defaultExtension: ".csv"
			}
		}
	},
	"metabolic": {
		name: "Constraint-Based Model",
		shortLabel: "Constraint-Based",
		entityClass: _requireEntityClass("metabolic"),
		dbModelClass: "ConstraintBasedModel",
		beta: false,
		active: {
			"research": true,
			"learning": false,
			"teaching": false
		},
		features: {
			create: true,
			import: true,
		},
		analyses: {
			"fba": {
				name: "Flux Balance Analysis"
			}
		},
		exportTypes: {
			"sbml": {
				name: "SBML",
				defaultExtension: ".sbml"
			},
			"json": {
				name: "JavaScript Object Notation",
				label: "JSON",
				defaultExtension: ".json"
			},
			"yaml": {
				name: "YAML Ain't Markup Language",
				label: "YAML",
				defaultExtension: ".yaml"
			},
			"matlab": {
				name: "MATLAB",
				defaultExtension: ".matlab"
			}
		},
		fbaTypes: {
			"fba": {
				name: "Flux Balance Analysis"
			},
			"pfba": {
				name: "Parsimonious FBA"
			},
			"gfba": {
				name: "Geometric FBA"
			}
		}
	},
	"kinetic": {
		name: "Kinetic Model",
		shortLabel: "Kinetic",
		entityClass: _requireEntityClass("kinetic"),
		dbModelClass: "KineticModel",
		beta: false,
		active: {
			"research": true,
			"learning": false,
			"teaching": false
		},
		features: {
			create: true,
			import: true,
		},
		exportTypes: {
			"sbml": {
				name: "SBML",
				defaultExtension: ".sbml"
			},
			"json": {
				name: "JavaScript Object Notation",
				label: "JSON",
				defaultExtension: ".json"
			},
			"yaml": {
				name: "YAML Ain't Markup Language",
				label: "YAML",
				defaultExtension: ".yaml"
			},
			"matlab": {
				name: "MATLAB",
				defaultExtension: ".matlab"
			}
		}
	},
	"pharmacokinetic": {
		name: "Pharmacokinetic Model",
		shortLabel: "Pharmacokinetic",
		entityClass: _requireEntityClass("pharmacokinetic"),
		dbModelClass: "PharmacokineticModel",
		beta: false,
		active: {
			"research": true,
			"learning": false,
			"teaching": false
		},
		features: {
			create: true,
			import: true,
		}
	}
}