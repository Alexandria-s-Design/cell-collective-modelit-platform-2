/**
 * 
 */
package cc.application.main.json.knowledge;

/**
 * @author Bryan Kowal
 */
public class ArticleId {

	private String idtype;
	
	private String idtypen;
	
	private String value;
	
	public ArticleId() {
	}

	/**
	 * @return the idtype
	 */
	public String getIdtype() {
		return idtype;
	}

	/**
	 * @param idtype the idtype to set
	 */
	public void setIdtype(String idtype) {
		this.idtype = idtype;
	}

	/**
	 * @return the idtypen
	 */
	public String getIdtypen() {
		return idtypen;
	}

	/**
	 * @param idtypen the idtypen to set
	 */
	public void setIdtypen(String idtypen) {
		this.idtypen = idtypen;
	}

	/**
	 * @return the value
	 */
	public String getValue() {
		return value;
	}

	/**
	 * @param value the value to set
	 */
	public void setValue(String value) {
		this.value = value;
	}
}