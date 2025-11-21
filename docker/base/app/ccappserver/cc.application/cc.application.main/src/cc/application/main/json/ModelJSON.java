/**
 * 
 */
package cc.application.main.json;

import java.util.Map;
import java.util.Map.Entry;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.model.Model;
import cc.common.data.model.ModelInitialState;

/**
 * @author Bryan Kowal
 */
public class ModelJSON extends Model {

	private final long currentVersion;

	private final Map<Long, ModelVersionJSON> modelVersionMap;
	
	private Long selectedVersion;

	private String modelType = null;

	public ModelJSON(Model model, final long currentVersion, final Map<Long, ModelVersionJSON> modelVersionMap) {
		super(model);

		this.modelType = model.getModelType();

		this.currentVersion = currentVersion;
		this.modelVersionMap = modelVersionMap;
		/*
		 * Find the selected version if there is one.
		 */
		for (Entry<Long, ModelVersionJSON> entry : modelVersionMap.entrySet()) {
			if (Boolean.TRUE.equals(entry.getValue().isSelected())) {
				selectedVersion = entry.getKey();
				break;
			}
			selectedVersion = entry.getKey();
		}
	}

	public String getModelType() {
		return modelType;
	}

	public void setModelType(String m) {
		modelType = m;
	}

	public Long getSelectedVersion() {
		return selectedVersion;
	}

	public Map<Long, ModelVersionJSON> getModelVersionMap() {
		return modelVersionMap;
	}

	/**
	 * @return the initialStateId
	 */
	public Long getInitialStateId() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getInitialStateId();
	}

	/**
	 * @param initialStateId
	 *            the initialStateId to set
	 */
	public void setInitialStateId(Long initialStateId) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setInitialStateId(initialStateId);
	}

	public Long getLayoutId() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getLayoutId();
	}

	public void setLayoutId(Long layoutId) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setLayoutId(layoutId);
	}

	public Object getWorkspaceLayout() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getWorkspaceLayoutAsJSON();
	}

	public void setWorkspaceLayout(Object workspaceLayout) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setWorkspaceLayoutAsJSON(workspaceLayout);
	}

	public Object getContent() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getContentAsJSON();
	}

	public Object getSurvey() {
		return (getModelInitialState() == null) ? null : getModelInitialState().getSurveyAsJSON();
	}

	public void setSurvey(Object survey) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setSurveyAsJSON(survey);
	}

	public void setContent(Object content) {
		if (getModelInitialState() == null) {
			setModelInitialState(new ModelInitialState());
		}
		getModelInitialState().setContentAsJSON(content);
	}
	
	@JsonIgnore
	@Override
	public ModelInitialState getModelInitialState() {
		return super.getModelInitialState();
	}
}