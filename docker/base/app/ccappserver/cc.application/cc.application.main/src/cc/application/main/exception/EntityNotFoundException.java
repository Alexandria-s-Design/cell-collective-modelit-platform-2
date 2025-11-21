/**
 * 
 */
package cc.application.main.exception;

/**
 * @author Bryan Kowal
 *
 */
public class EntityNotFoundException extends Exception {

	public static final String ENTITY_MODEL = "Model";

	public static final String ENTITY_SPECIES = "Species";

	public static final String ENTITY_REGULATOR = "Regulator";

	public static final String ENTITY_CONDITION = "Condition";

	public static final String ENTITY_SUB_CONDITION = "SubCondition";

	public static final String ENTITY_INITIAL_STATE = "Initial State";

	public static final String ENTITY_LAYOUT = "Layout";

	public static final String ENTITY_LAYOUT_NODE = "Layout Node";

	public static final String ENTITY_MODEL_COMMENT = "Comment (Model)";

	public static final String ENTITY_MODEL_SHARE = "Model Share";

	public static final String ENTITY_MODEL_LINK = "Model Link";

	public static final String ENTITY_REFERENCE = "Reference";

	public static final String ENTITY_MODEL_REFERENCE = "Model Reference";

	public static final String ENTITY_PAGE = "Page";

	public static final String ENTITY_PAGE_REFERENCE = "Page Reference";

	public static final String ENTITY_SECTION = "Section";

	public static final String ENTITY_CONTENT = "Content";

	public static final String ENTITY_CONTENT_REFERENCE = "Content Reference";

	public static final String ENTITY_EXPERIMENT = "Experiment";

	public static final String ENTITY_DEFINITION = "Definition";

	public static final String ENTITY_METADATA_VALUE = "Entity-Mapped Value";

	public static final String ENTITY_METADATA_RANGE = "Entity-Mapped Range Value";

	public static final String ENTITY_UPLOAD = "Upload";

	public static final String ENTITY_COURSE = "Course";

	public static final String ENTITY_COURSE_RANGE = "Course Range";

	public static final String ENTITY_COURSE_ACTIVITY = "Course Activity";

	public static final String ENTITY_COURSE_MUTATION = "Course Mutation";

	public static final String ENTITY_CALC_INTERVAL = "Calc Interval";

	public static final String ENTITY_COMPONENT_PAIR = "Component Pair";

	public static final String ENTITY_MODEL_REFERENCE_TYPES = "Model Reference Types";

	public static final String ENTITY_LEARNING_ACTIVITY = "Learning Activity";

	public static final String ENTITY_LEARNING_ACTIVITY_GROUP = "Learning Activity Group";

	public static final String ENTITY_REALTIME_ENVIRONMENT = "Realtime Environment";

	public static final String ENTITY_REALTIME_ACTIVITY = "Realtime Activity";
	
	public static final String ENTITY_ANALYSIS_ENVIRONMENT = "Analysis Environment";

	public static final String ENTITY_ANALYSIS_ACTIVITY = "Analysis Activity";

	/**
	 * 
	 */
	private static final long serialVersionUID = 8109408860776013927L;

	/**
	 * @param arg0
	 */
	public EntityNotFoundException(final String entityName, final Number id) {
		super(buildExceptionMessage(entityName, id));
	}

	protected static String buildExceptionMessage(final String entityName, final Number id) {
		return new StringBuilder("Failed to find ").append(entityName).append(" with id: ").append(id.longValue())
				.append("!").toString();
	}
}