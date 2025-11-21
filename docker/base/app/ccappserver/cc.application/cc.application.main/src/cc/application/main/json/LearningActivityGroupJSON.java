/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.model.LearningActivityGroup;

/**
 * @author Ales Saska
 */
@JsonInclude(Include.NON_NULL)
public class LearningActivityGroupJSON {

	public String name;

	public int position;

	public LearningActivityGroupJSON() {
	}

	public LearningActivityGroupJSON(LearningActivityGroup learningActivityGroup) {
		this.name = learningActivityGroup.getName();
		this.position = learningActivityGroup.getPosition();
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

}