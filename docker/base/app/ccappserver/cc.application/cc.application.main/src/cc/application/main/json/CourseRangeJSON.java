/**
 * 
 */
package cc.application.main.json;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.simulation.CourseActivity;
import cc.common.data.simulation.CourseMutation;
import cc.common.data.simulation.CourseRange;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class CourseRangeJSON extends CourseRange implements INullableFields {

	private static class NullableFields {
		public static String NAME = "name";

		public static String FROM = "from";

		public static String TO = "to";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public CourseRangeJSON() {
	}

	public CourseRangeJSON(CourseRange courseRange) {
		super(courseRange);
	}

	public CourseRange constructNew() {
		CourseRange courseRange = new CourseRange();
		courseRange.setCourseId(getCourseId());
		courseRange.setName(getName());
		courseRange.setFrom(getFrom());
		courseRange.setTo(getTo());
		return courseRange;
	}

	@Override
	public boolean wasSetNull(String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@Override
	public void setFrom(Integer from) {
		super.setFrom(from);
		nullableFields.handleNullSet(from, NullableFields.FROM);
	}

	@Override
	public void setTo(Integer to) {
		super.setTo(to);
		nullableFields.handleNullSet(to, NullableFields.TO);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@Override
	public void setName(String name) {
		super.setName(name);
		nullableFields.handleNullSet(name, NullableFields.NAME);
	}

	@JsonIgnore
	@Override
	public Set<CourseActivity> getActivities() {
		return super.getActivities();
	}

	@JsonIgnore
	@Override
	public Set<CourseMutation> getMutations() {
		return super.getMutations();
	}
}