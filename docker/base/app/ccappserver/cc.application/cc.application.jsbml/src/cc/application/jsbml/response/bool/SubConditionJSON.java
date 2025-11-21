/**
 * 
 */
package cc.application.jsbml.response.bool;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Bryan Kowal
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubConditionJSON {

	private boolean componentRelation;
	
	private boolean state;
	
	private boolean type;
	
	private List<String> components;
	
	public SubConditionJSON() {
	}

	public boolean isComponentRelation() {
		return componentRelation;
	}

	public void setComponentRelation(boolean componentRelation) {
		this.componentRelation = componentRelation;
	}

	public boolean isState() {
		return state;
	}

	public void setState(boolean state) {
		this.state = state;
	}

	public boolean isType() {
		return type;
	}

	public void setType(boolean type) {
		this.type = type;
	}

	public List<String> getComponents() {
		return components;
	}

	public void setComponents(List<String> components) {
		this.components = components;
	}
}