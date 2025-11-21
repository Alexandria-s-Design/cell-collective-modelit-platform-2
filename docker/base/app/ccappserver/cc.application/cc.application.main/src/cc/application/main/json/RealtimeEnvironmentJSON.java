/**
 * 
 */
package cc.application.main.json;

import cc.common.data.simulation.RealtimeEnvironment;

/**
 * @author Bryan Kowal
 */
public class RealtimeEnvironmentJSON {

	private String name;

	public RealtimeEnvironmentJSON() {
	}

	public RealtimeEnvironmentJSON(RealtimeEnvironment realtimeEnvironment) {
		this.name = realtimeEnvironment.getName();
	}

	public RealtimeEnvironment toRealtimeEnvironment() {
		RealtimeEnvironment realtimeEnvironment = new RealtimeEnvironment();
		realtimeEnvironment.setName(getName());
		return realtimeEnvironment;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}