/**
 * 
 */
package cc.application.main.json.knowledge;

/**
 * @author Bryan Kowal
 *
 */
public class PubmedReference {

	private String refsource;
	
	private String reftype;
	
	private String pmid;
	
	private String note;
	
	public PubmedReference() {
	}

	/**
	 * @return the refsource
	 */
	public String getRefsource() {
		return refsource;
	}

	/**
	 * @param refsource the refsource to set
	 */
	public void setRefsource(String refsource) {
		this.refsource = refsource;
	}

	/**
	 * @return the reftype
	 */
	public String getReftype() {
		return reftype;
	}

	/**
	 * @param reftype the reftype to set
	 */
	public void setReftype(String reftype) {
		this.reftype = reftype;
	}

	/**
	 * @return the pmid
	 */
	public String getPmid() {
		return pmid;
	}

	/**
	 * @param pmid the pmid to set
	 */
	public void setPmid(String pmid) {
		this.pmid = pmid;
	}

	/**
	 * @return the note
	 */
	public String getNote() {
		return note;
	}

	/**
	 * @param note the note to set
	 */
	public void setNote(String note) {
		this.note = note;
	}
}