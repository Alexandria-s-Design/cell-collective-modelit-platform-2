/**
 * 
 */
package cc.application.main.json.knowledge;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Achilles Rasquinha
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DOICreated {

	private Long timestamp;
	
	public DOICreated() {
        
	}

	public Long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Long timestamp) {
		this.timestamp = timestamp;
	}
}