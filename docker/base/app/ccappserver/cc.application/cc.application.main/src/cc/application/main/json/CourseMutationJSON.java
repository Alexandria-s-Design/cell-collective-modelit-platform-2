/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.simulation.CourseMutation;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class CourseMutationJSON extends CourseMutation {
	
	public CourseMutationJSON() {
	}

	public CourseMutationJSON(CourseMutation courseMutation) {
		super(courseMutation);
	}

	public CourseMutation constructNew() {
		CourseMutation courseMutation = new CourseMutation();
		courseMutation.setCourseRangeId(getCourseRangeId());
		courseMutation.setSpeciesId(getSpeciesId());
		courseMutation.setState(getState());
		return courseMutation;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}
}