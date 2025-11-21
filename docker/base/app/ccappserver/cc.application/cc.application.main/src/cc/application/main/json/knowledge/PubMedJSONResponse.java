/**
 * 
 */
package cc.application.main.json.knowledge;

/**
 * @author Bryan Kowal
 */
public class PubMedJSONResponse {

	private PubMedHeader header;
	
	private PubMedResult result;
	
	public PubMedJSONResponse() {
	}

	/**
	 * @return the header
	 */
	public PubMedHeader getHeader() {
		return header;
	}

	/**
	 * @param header the header to set
	 */
	public void setHeader(PubMedHeader header) {
		this.header = header;
	}

	/**
	 * @return the result
	 */
	public PubMedResult getResult() {
		return result;
	}

	/**
	 * @param result the result to set
	 */
	public void setResult(PubMedResult result) {
		this.result = result;
	}
}