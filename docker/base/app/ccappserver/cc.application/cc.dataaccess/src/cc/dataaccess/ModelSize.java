/**
 * 
 */
package cc.dataaccess;

/**
 * @author Bryan Kowal
 *
 */
public class ModelSize {

	private final int components;
	
	private final int interactions;
	
	public ModelSize(int components, int interactions) {
		this.components = components;
		this.interactions = interactions;
	}

	/**
	 * @return the components
	 */
	public int getComponents() {
		return components;
	}

	/**
	 * @return the interactions
	 */
	public int getInteractions() {
		return interactions;
	}
}