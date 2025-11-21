/**
 * 
 */
package cc.application.main.json.knowledge;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;

/**
 * @author Bryan Kowal
 */
public class PubMedResult {

	private String[] uids;
	
	private Map<String, UidResult> uidResult = new HashMap<>();
	
	public PubMedResult() {
	}
	
	/**
	 * @return the uids
	 */
	public String[] getUids() {
		return uids;
	}

	/**
	 * @param uids the uids to set
	 */
	public void setUids(String[] uids) {
		this.uids = uids;
	}

	/**
	 * @return the uidResult
	 */
	public Map<String, UidResult> getUidResult() {
		return uidResult;
	}

	/**
	 * @param uidResult the uidResult to set
	 */
	public void setUidResult(Map<String, UidResult> uidResult) {
		this.uidResult = uidResult;
	}

	@JsonAnyGetter
	public Map<String, UidResult> any() {
		return uidResult;
	}
	
	@JsonAnySetter
	public void set(String uid, UidResult uidResult) {
		this.uidResult.put(uid, uidResult);
	}
}