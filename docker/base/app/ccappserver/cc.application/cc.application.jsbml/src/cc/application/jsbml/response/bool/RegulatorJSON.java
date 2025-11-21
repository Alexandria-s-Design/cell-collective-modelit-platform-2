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
public class RegulatorJSON {

	private String component;
	
	private boolean type;
	
	private boolean conditionRelation;
	
	private List<ConditionJSON> conditions;
	
	private List<RegulatorJSON> dominants;
	
	private List<RegulatorJSON> recessives;
	
	public RegulatorJSON() {
	}

	public String getComponent() {
		return component;
	}

	public void setComponent(String component) {
		this.component = component;
	}

	public boolean isType() {
		return type;
	}

	public void setType(boolean type) {
		this.type = type;
	}

	public boolean isConditionRelation() {
		return conditionRelation;
	}

	public void setConditionRelation(boolean conditionRelation) {
		this.conditionRelation = conditionRelation;
	}

	public List<ConditionJSON> getConditions() {
		return conditions;
	}

	public void setConditions(List<ConditionJSON> conditions) {
		this.conditions = conditions;
	}

	public List<RegulatorJSON> getDominants() {
		return dominants;
	}

	public void setDominants(List<RegulatorJSON> dominants) {
		this.dominants = dominants;
	}

	public List<RegulatorJSON> getRecessives() {
		return recessives;
	}

	public void setRecessives(List<RegulatorJSON> recessives) {
		this.recessives = recessives;
	}
}