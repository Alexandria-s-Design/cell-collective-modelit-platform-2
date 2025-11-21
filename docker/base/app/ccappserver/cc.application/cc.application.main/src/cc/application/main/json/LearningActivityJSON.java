/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.model.LearningActivity;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class LearningActivityJSON {

	@JsonIgnore
	private boolean viewSetNull = false;

	private String name;

	private int position;

	private Long groupId;

	private Object workspaceLayout;

	private Object views;

	private int version;

	public LearningActivityJSON() {
	}

	public LearningActivityJSON(LearningActivity learningActivity, final Object workspaceLayout, final Object views) {
		this.name = learningActivity.getName();
		this.position = learningActivity.getPosition();
		this.groupId = learningActivity.getGroup() == null ? null : learningActivity.getGroup().getId();
		this.workspaceLayout = workspaceLayout;
		this.views = views;
		this.version = learningActivity.getVersion();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getPosition() {
		return position;
	}

	public void setPosition(int position) {
		this.position = position;
	}

	public Object getWorkspaceLayout() {
		return workspaceLayout;
	}

	public void setWorkspaceLayout(Object workspaceLayout) {
		this.workspaceLayout = workspaceLayout;
	}

	public Object getViews() {
		return views;
	}

	public void setViews(Object view) {
		if (view == null) {
			viewSetNull = true;
		}
		this.views = view;
	}

	public Long getGroupId() {
		return groupId;
	}

	public void setGroupId(Long groupId) {
		this.groupId = groupId;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public boolean isViewSetNull() {
		return viewSetNull;
	}

	public void setViewSetNull(boolean viewSetNull) {
		this.viewSetNull = viewSetNull;
	}
}