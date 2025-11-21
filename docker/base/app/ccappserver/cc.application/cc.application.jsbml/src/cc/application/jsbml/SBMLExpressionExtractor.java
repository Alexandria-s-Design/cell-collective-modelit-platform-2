/**
 * 
 */
package cc.application.jsbml;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

import cc.common.data.biologic.Species;

import org.colomoto.biolqm.io.sbml.SBMLqualImport;
import org.sbml.jsbml.Model;
import org.sbml.jsbml.SBMLDocument;
import org.sbml.jsbml.ext.qual.QualModelPlugin;
import org.sbml.jsbml.ext.qual.QualitativeSpecies;

/**
 * @author Bryan Kowal
 */
public class SBMLExpressionExtractor {

	private final byte[] content;

	private boolean biologicSpeciesExist = false;

	private final cc.common.data.model.Model model;

	public SBMLExpressionExtractor(final byte[] content, final cc.common.data.model.Model model) {
		this.content = content;
		this.model = model;

		int count = 0;
		for (Species species : model.getSpecies()) {
			if (species.isExternal() != null && species.isExternal()) {
				continue;
			}

			this.biologicSpeciesExist = true;
		}

	}

	public Map<String, String> extractSBMLExpressions() throws SBMLValidationException {
		if(!this.biologicSpeciesExist)
			return null;

		SBMLqualImport sbmlQualImport = null;

		try {
			sbmlQualImport = new SBMLqualImport(new ByteArrayInputStream(content));
		} catch (Exception e) {
			throw new SBMLValidationException("Failed to read SBML Qual for: " + model.toString() + ".", e);
		}

		final SBMLDocument sbmlDocument = sbmlQualImport.getQualBundle().document;
		final Model documentModel = sbmlDocument.getModel();
		final QualModelPlugin qualModel = (QualModelPlugin) documentModel.getExtension(SBMLProperties.SBML_QUAL_URI);
		for (QualitativeSpecies qualSpecies : qualModel.getListOfQualitativeSpecies()) {
			String id = qualSpecies.getId();
			qualSpecies.setName(id);
		}

		final Map<String, String> functionMap = new HashMap<>();
		try {
			BooleanNetExport.export(sbmlQualImport.getModel(), functionMap);
		} catch (Exception e) {
			throw new SBMLValidationException(
					"Failed to extract SBML Logical Expressions for: " + model.toString() + ".", e);
		}
		return functionMap;
	}
}