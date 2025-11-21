/**
 * 
 */
package cc.common.data.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_initial_state")
public class ModelInitialState {

	@Id
	private long modelId;

	@Column(nullable = true)
	private Long initialStateId;

	@Column(nullable = true)
	private Long layoutId;

	@Column(nullable = true)
	private String workspaceLayout;

	@Column(nullable = true)
	private String survey;	

	@Column(nullable = true)
	private String content;	
	
	@Transient
	private Object workspaceLayoutAsJSON;
	
	@Transient
	private Object surveyAsJSON;

	@Transient
	private Object contentAsJSON;

	public ModelInitialState() {
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
	 * @return the initialStateId
	 */
	public Long getInitialStateId() {
		return initialStateId;
	}

	/**
	 * @param initialStateId
	 *            the initialStateId to set
	 */
	public void setInitialStateId(Long initialStateId) {
		this.initialStateId = initialStateId;
	}

	public Long getLayoutId() {
		return layoutId;
	}

	public void setLayoutId(Long layoutId) {
		this.layoutId = layoutId;
	}

	public String getWorkspaceLayout() {
		return workspaceLayout;
	}

	public void setWorkspaceLayout(String workspaceLayout) {
		this.workspaceLayout = workspaceLayout;
	}

	public Object getWorkspaceLayoutAsJSON() {
		return workspaceLayoutAsJSON;
	}
	
	public void setWorkspaceLayoutAsJSON(Object workspaceLayoutAsJSON) {
		this.workspaceLayoutAsJSON = workspaceLayoutAsJSON;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}	

	public Object getContentAsJSON() {
		return contentAsJSON;
	}

	public void setContentAsJSON(Object contentAsJSON) {
		this.contentAsJSON = contentAsJSON;
	}	
	

	
	public String getSurvey() {
		return survey;
	}

	public void setSurvey(String survey) {
		this.survey = survey;
	}	

	public Object getSurveyAsJSON() {
		return surveyAsJSON;
	}

	public void setSurveyAsJSON(Object surveyAsJSON) {
		this.surveyAsJSON = surveyAsJSON;
	}	
	

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelInitialState [");
		sb.append("modelId=").append(modelId);
		sb.append(", initialStateId=").append(initialStateId);
		sb.append(", layoutId=").append(layoutId);
		sb.append(", workspaceLayout=").append(workspaceLayout);
		sb.append(", survey=").append(survey);
		sb.append(", content=").append(content);
		sb.append("]");
		return sb.toString();
	}
}