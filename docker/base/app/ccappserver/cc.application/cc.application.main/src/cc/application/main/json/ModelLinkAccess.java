/**
 * 
 */
package cc.application.main.json;

import java.util.Calendar;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class ModelLinkAccess {

	private long modelId;

	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar startDate;

	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar endDate;

	private String token;

	public ModelLinkAccess() {
	}

	public ModelLinkAccess(long modelId) {
		this(modelId, null, null, null);
	}

	public ModelLinkAccess(long modelId, Calendar startDate, Calendar endDate, String token) {
		this.modelId = modelId;
		this.startDate = startDate;
		this.endDate = endDate;
		this.token = token;
	}

	/**
	 * @return the modelId
	 */
	public long getModelId() {
		return modelId;
	}

	/**
	 * @param modelId
	 *            the modelId to set
	 */
	public void setModelId(long modelId) {
		this.modelId = modelId;
	}

	/**
	 * @return the startDate
	 */
	public Calendar getStartDate() {
		return startDate;
	}

	/**
	 * @param startDate
	 *            the startDate to set
	 */
	public void setStartDate(Calendar startDate) {
		this.startDate = startDate;
	}

	/**
	 * @return the endDate
	 */
	public Calendar getEndDate() {
		return endDate;
	}

	/**
	 * @param endDate
	 *            the endDate to set
	 */
	public void setEndDate(Calendar endDate) {
		this.endDate = endDate;
	}

	/**
	 * @return the token
	 */
	public String getToken() {
		return token;
	}

	/**
	 * @param token
	 *            the token to set
	 */
	public void setToken(String token) {
		this.token = token;
	}
}