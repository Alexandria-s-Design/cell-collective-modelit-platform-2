/**
 * 
 */
package cc.application.main.json;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.simulation.Course;
import cc.common.data.simulation.CourseRange;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class CourseJSON extends Course implements INullableFields {

	private static class NullableFields {
		public static String NAME = "name";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public CourseJSON() {
	}

	public CourseJSON(Course course) {
		super(course);
	}

	public Course constructNewCourse() {
		Course course = new Course();
		course.setName(getName());
		return course;
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
	public Set<CourseRange> getRanges() {
		return super.getRanges();
	}

	@Override
	public boolean wasSetNull(String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}
}