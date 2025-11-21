/**
 * 
 */
package cc.application.main.controller;

import java.util.Calendar;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class SubscribeResponse {

	private String chargeId;

	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar expireDate;

	public SubscribeResponse() {
	}

	public SubscribeResponse(String chargeId, Calendar expireDate) {
		this.chargeId = chargeId;
		this.expireDate = expireDate;
	}

	public String getChargeId() {
		return chargeId;
	}

	public void setChargeId(String chargeId) {
		this.chargeId = chargeId;
	}

	public Calendar getExpireDate() {
		return expireDate;
	}

	public void setExpireDate(Calendar expireDate) {
		this.expireDate = expireDate;
	}
}