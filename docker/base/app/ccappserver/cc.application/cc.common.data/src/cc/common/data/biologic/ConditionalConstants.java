/**
 * 
 */
package cc.common.data.biologic;

/**
 * @author bkowal
 *
 */
public class ConditionalConstants {

	protected ConditionalConstants() {
	}

	public static final int CONDITIONAL_TYPE_LENGTH = 7;

	public static final int CONDITIONAL_STATE_LENGTH = 3;

	public static final int RELATION_LENGTH = 3;

	public static enum ConditionalType {
		IF_WHEN, UNLESS
	}

	public static enum ConditionalState {
		OFF, ON
	}

	public static enum Relation {
		OR, AND
	}
}