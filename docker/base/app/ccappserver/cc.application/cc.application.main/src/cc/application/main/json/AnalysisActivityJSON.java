/**
 * 
 */
package cc.application.main.json;

import cc.common.data.simulation.AnalysisActivity;

/**
 * @author Bryan Kowal
 */
public class AnalysisActivityJSON {

	private Long parentId;
	
	private Long componentId;
	
	private Double min;
	
	private Double max;
	
	public AnalysisActivityJSON() {
	}
	
	public AnalysisActivityJSON(final AnalysisActivity analysisActivity) {
		this.parentId = analysisActivity.getParentId();
		this.componentId = analysisActivity.getComponentId();
		this.min = analysisActivity.getMin();
		this.max = analysisActivity.getMax();
	}
	
	public AnalysisActivity toAnalysisActivity() {
		AnalysisActivity analysisActivity = new AnalysisActivity();
		analysisActivity.setParentId(getParentId());
		analysisActivity.setComponentId(getComponentId());
		analysisActivity.setMin(getMin());
		analysisActivity.setMax(getMax());
		return analysisActivity;
	}

	public Long getParentId() {
		return parentId;
	}

	public void setParentId(Long parentId) {
		this.parentId = parentId;
	}

	public Long getComponentId() {
		return componentId;
	}

	public void setComponentId(Long componentId) {
		this.componentId = componentId;
	}

	public Double getMin() {
		return min;
	}

	public void setMin(Double min) {
		this.min = min;
	}

	public Double getMax() {
		return max;
	}

	public void setMax(Double max) {
		this.max = max;
	}
}