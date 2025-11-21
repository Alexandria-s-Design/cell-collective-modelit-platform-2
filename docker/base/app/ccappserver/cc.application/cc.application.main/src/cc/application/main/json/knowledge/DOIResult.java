/**
 * 
 */
package cc.application.main.json.knowledge;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Bryan Kowal
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DOIResult {
	private DOICreated created;

	private DOIAuthor[] author;

	public DOIResult() {
	}

	public DOICreated getCreated() {
		return created;
	}

	public void setCreated(DOICreated created) {
		this.created = created;
	}

	public DOIAuthor[] getAuthor() {
		return author;
	}

	public void setAuthor(DOIAuthor[] author) {
		this.author = author;
	}
}