/**
 * 
 */
package cc.application.main.json.knowledge;

/**
 * @author Bryan Kowal
 */
public class PubMedHeader {

	private String type;
	
	private String version;
	
	public PubMedHeader() {
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the version
	 */
	public String getVersion() {
		return version;
	}

	/**
	 * @param version the version to set
	 */
	public void setVersion(String version) {
		this.version = version;
	}
}