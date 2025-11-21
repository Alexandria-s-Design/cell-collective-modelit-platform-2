/**
 * 
 */
package cc.common.data.simulation;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "course_activity")
@SequenceGenerator(name = CourseActivity.GENERATOR_NAME,
		sequenceName = CourseActivity.SEQUENCE_NAME,
		allocationSize = 1)
public class CourseActivity {

	protected static final String GENERATOR_NAME = "course_activity" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "course_activity" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long courseRangeId;

	@Column(nullable = false)
	private long speciesId;

	@ClientEditableField
	@Column(nullable = true)
	private Double value;

	@ClientEditableField
	@Column(nullable = true)
	private Double min;

	@ClientEditableField
	@Column(nullable = true)
	private Double max;

	public CourseActivity() {
	}

	protected CourseActivity(CourseActivity courseActivity) {
		this.courseRangeId = courseActivity.courseRangeId;
		this.speciesId = courseActivity.speciesId;
		this.value = courseActivity.value;
		this.min = courseActivity.min;
		this.max = courseActivity.max;
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the courseRangeId
	 */
	public long getCourseRangeId() {
		return courseRangeId;
	}

	/**
	 * @param courseRangeId
	 *            the courseRangeId to set
	 */
	public void setCourseRangeId(long courseRangeId) {
		this.courseRangeId = courseRangeId;
	}

	/**
	 * @return the speciesId
	 */
	public long getSpeciesId() {
		return speciesId;
	}

	/**
	 * @param speciesId
	 *            the speciesId to set
	 */
	public void setSpeciesId(long speciesId) {
		this.speciesId = speciesId;
	}

	/**
	 * @return the value
	 */
	public Double getValue() {
		return value;
	}

	/**
	 * @param value
	 *            the value to set
	 */
	public void setValue(Double value) {
		this.value = value;
	}

	/**
	 * @return the min
	 */
	public Double getMin() {
		return min;
	}

	/**
	 * @param min
	 *            the min to set
	 */
	public void setMin(Double min) {
		this.min = min;
	}

	/**
	 * @return the max
	 */
	public Double getMax() {
		return max;
	}

	/**
	 * @param max
	 *            the max to set
	 */
	public void setMax(Double max) {
		this.max = max;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("CourseActivity [");
		sb.append("id=").append(id);
		sb.append(", courseRangeId=").append(courseRangeId);
		sb.append(", speciesId=").append(speciesId);
		if (value != null) {
			sb.append(", value=").append(value);
		}
		if (min != null) {
			sb.append(", min=").append(min);
		}
		if (max != null) {
			sb.append(", max=").append(max);
		}
		sb.append("]");
		return sb.toString();
	}
}