import logging
import pandas as pd
from fast_bioservices import BioDBNet, Input, Output, Taxon

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Check out bioDBNet API result
def como_test_biodbnet():
    try:

      input_format = Input.ENSEMBL_GENE_ID
      output_db = Output.GENE_SYMBOL
      genes = ['ENSG00000121410', 'ENSG00000171428']
      taxon_id = 9606

      biodbnet = BioDBNet()
      gene_info = biodbnet.db2db(
        values=genes,
        input_db=input_format,
        output_db=output_db,
        taxon=taxon_id,
      )
      logger.debug(f"Gene Info: {gene_info}")
      return 'Okay'

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return None