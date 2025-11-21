/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.simulation.CourseActivity;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class CourseActivityJSON extends CourseActivity {

	private static class NullableFields {
		public static String VALUE = "value";

		public static String MIN = "min";

		public static String MAX = "max";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public CourseActivityJSON() {
	}

	public CourseActivityJSON(CourseActivity courseActivity) {
		super(courseActivity);
	}

	public CourseActivity constructNew() {
		CourseActivity courseActivity = new CourseActivity();
		courseActivity.setCourseRangeId(getCourseRangeId());
		courseActivity.setSpeciesId(getSpeciesId());
		courseActivity.setValue(getValue());
		courseActivity.setMin(getMin());
		courseActivity.setMax(getMax());
		return courseActivity;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@Override
	public void setValue(Double value) {
		super.setValue(value);
		this.nullableFields.handleNullSet(value, NullableFields.VALUE);
	}

	@Override
	public void setMin(Double min) {
		super.setMin(min);
		this.nullableFields.handleNullSet(min, NullableFields.MIN);
	}

	@Override
	public void setMax(Double max) {
		super.setMax(max);
		this.nullableFields.handleNullSet(max, NullableFields.MAX);
	}
}