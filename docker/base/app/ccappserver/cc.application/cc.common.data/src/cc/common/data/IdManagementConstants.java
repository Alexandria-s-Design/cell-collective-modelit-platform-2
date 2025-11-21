/**
 * 
 */
package cc.common.data;

/**
 * @author Bryan Kowal
 */
public final class IdManagementConstants {

	public static final String GENERATOR_STRATEGY = "org.hibernate.id.enhanced.SequenceStyleGenerator";

	public static final String GENERATOR_NAME_SUFFIX = "-sequence-generator";
	
	public static final String SEQUENCE_NAME_SUFFIX = "_id_seq";

	public IdManagementConstants() {
	}
}