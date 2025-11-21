/**
 * 
 */
package cc.application.main.json;

import cc.common.data.simulation.AnalysisEnvironment;

/**
 * @author Bryan Kowal
 *
 */
public class AnalysisEnvironmentJSON {

	private String name;
	private Boolean isDefault;

	public AnalysisEnvironmentJSON() {
	}

	public AnalysisEnvironmentJSON(AnalysisEnvironment analysisEnvironment) {
		this.name = analysisEnvironment.getName();
		this.isDefault = analysisEnvironment.getIsDefault();
	}

	public AnalysisEnvironment toAnalysisEnvironment() {
		AnalysisEnvironment analysisEnvironment = new AnalysisEnvironment();
		analysisEnvironment.setName(getName());
		analysisEnvironment.setIsDefault(getIsDefault());
		return analysisEnvironment;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Boolean getIsDefault() {
		return isDefault;
	}

	public void setIsDefault(Boolean isDefault) {
		this.isDefault = isDefault;
	}	
}