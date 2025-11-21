/**
 * 
 */
package cc.application.jsbml;

/**
 * @author Bryan Kowal
 *
 */
public final class SBMLProperties {

	public static final int SBML_LEVEL = 3;

	public static final int SBML_VERSION = 1;

	public static final String SBML_NAMESPACE = "qual";

	public static final String SBML_QUAL_URI = "http://www.sbml.org/sbml/level3/version1/qual/version1";

	public static final String SBML_LAYOUT_URI = "http://www.sbml.org/sbml/level3/version1/layout/version1";

	public static final String QUAL_REQUIRED = "qual:required";

	public static final String TRUE = "true";

	public static final String COMPARTMENT_CYTOSOL = "cytosol";

	public static final String COMPARTMENT_EXTRACELLULAR = "extracellular";

	public static final String SPECIES_ID_PREFIX = "S_";

	public static final String TRANSITION_ID_PREFIX = "tr_";

	public static final int SBML_SPECIES_MAX_LEVEL = 1;

	public static final int SBML_SPECIES_INITIAL_LEVEL = 0;

	public static final int SBML_INPUT_THRESHOLD_LEVEL = 1;

	public static final String TRANSITION_EFFECT_NONE = "none";

	public static final int SBML_TERM_DEFAULT_RESULT_LEVEL = 1;

	protected SBMLProperties() {
	}
}