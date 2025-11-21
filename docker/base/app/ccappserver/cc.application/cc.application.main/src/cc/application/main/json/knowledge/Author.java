/**
 * 
 */
package cc.application.main.json.knowledge;

// http://helikarlab.org/redmine/projects/thecellcollective/repository/revisions/3201

/**
 * @author Bryan Kowal
 */
public class Author {

	private String name;
	
	private String authtype;
	
	private String clusterid;
	
	public Author() {
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the authtype
	 */
	public String getAuthtype() {
		return authtype;
	}

	/**
	 * @param authtype the authtype to set
	 */
	public void setAuthtype(String authtype) {
		this.authtype = authtype;
	}

	/**
	 * @return the clusterid
	 */
	public String getClusterid() {
		return clusterid;
	}

	/**
	 * @param clusterid the clusterid to set
	 */
	public void setClusterid(String clusterid) {
		this.clusterid = clusterid;
	}
}