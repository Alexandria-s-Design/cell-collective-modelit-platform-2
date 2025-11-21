/**
 * 
 */
package cc.application.main.json;

import cc.common.data.simulation.RealtimeActivity;

/**
 * @author Bryan Kowal
 */
public class RealtimeActivityJSON {

	private Long parentId;

	private Long componentId;

	private Double value;

	public RealtimeActivityJSON() {
	}

	public RealtimeActivityJSON(final RealtimeActivity realtimeActivity) {
		this.parentId = realtimeActivity.getParentId();
		this.componentId = realtimeActivity.getComponentId();
		this.value = realtimeActivity.getValue();
	}

	public RealtimeActivity toRealtimeActivity() {
		RealtimeActivity realtimeActivity = new RealtimeActivity();
		realtimeActivity.setParentId(getParentId());
		realtimeActivity.setComponentId(getComponentId());
		realtimeActivity.setValue(getValue());
		return realtimeActivity;
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

	public Double getValue() {
		return value;
	}

	public void setValue(Double value) {
		this.value = value;
	}
}