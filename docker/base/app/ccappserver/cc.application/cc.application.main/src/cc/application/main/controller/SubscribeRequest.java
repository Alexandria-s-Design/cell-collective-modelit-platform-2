/**
 * 
 */
package cc.application.main.controller;

/**
 * @author Bryan Kowal
 */
public class SubscribeRequest {

	private String token;

	private int amount;

	public SubscribeRequest() {
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public int getAmount() {
		return amount;
	}

	public void setAmount(int amount) {
		this.amount = amount;
	}
}