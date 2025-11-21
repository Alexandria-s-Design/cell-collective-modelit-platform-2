/**
 * 
 */
package cc.common.data.builder;

/**
 * @author Bryan
 *
 */
public interface IExpressionCustomizer {

	public String getAndOperator();

	public String getOrOperator();

	public String getNotOperator();

	public String getVariable(Long speciesId, String species, final boolean active);

}