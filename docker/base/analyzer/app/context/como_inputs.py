import os
from ..schemas import ContextBody as ContextConf
from pathlib import Path
from .context_utils import (
	context_valid_checkbox,
  rename_matrix_csv_cols,
  rename_boundary_csv_cols,
  rename_reactions_csv_cols
)

# como packages
from como.project import Config 


class ComoInputs:
    
    def __init__(self, conf: ContextConf, config: Config):
        self.conf = conf
        self.config = config

    def initialize(self) -> dict:

        if self.conf['uploads'].get("typeBulkTotalRNA"):
            self.conf['uploads']['typeBulkTotalRNA']['path'] = rename_matrix_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['typeBulkTotalRNA']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' )
            ).replace( self.conf['uploadsRoot']+"/", "")
        
        if self.conf['uploads'].get("typeBulkPolyaRNA"):
            self.conf['uploads']['typeBulkPolyaRNA']['path'] = rename_matrix_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['typeBulkPolyaRNA']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' )
            ).replace( self.conf['uploadsRoot']+"/", "")
            
        if self.conf['uploads'].get("typeSingleCellRNA"):
            self.conf['uploads']['typeSingleCellRNA']['path'] = rename_matrix_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['typeSingleCellRNA']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' )
            ).replace( self.conf['uploadsRoot']+"/", "")
        
        if self.conf['uploads'].get("typeProteomics"):
            self.conf['uploads']['typeProteomics']['path'] = rename_matrix_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['typeProteomics']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' )
            ).replace( self.conf['uploadsRoot']+"/", "")

        if self.conf['uploads'].get("coreForceReactions"):
            self.conf['uploads']['coreForceReactions']['path'] = rename_reactions_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['coreForceReactions']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' ),
                "force"
            ).replace( self.conf['uploadsRoot']+"/", "")
        
        if self.conf['uploads'].get("excludeReactions"):
            self.conf['uploads']['excludeReactions']['path'] = rename_reactions_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['excludeReactions']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' ),
                "exclude"
            ).replace( self.conf['uploadsRoot']+"/", "")
        
        if self.conf['uploads'].get("boundaryReactions"):
            self.conf['uploads']['boundaryReactions']['path'] = rename_boundary_csv_cols(
                os.path.join( self.conf['uploadsRoot'], self.conf['uploads']['boundaryReactions']['path']),
                os.path.join( self.config.data_dir, 'COMO_input' )
            ).replace( self.conf['uploadsRoot']+"/", "")
        
        return self.conf
