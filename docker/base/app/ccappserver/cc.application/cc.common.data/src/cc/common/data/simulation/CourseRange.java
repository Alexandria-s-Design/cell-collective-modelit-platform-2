/**
 * 
 */
package cc.common.data.simulation;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "course_range")
@SequenceGenerator(name = CourseRange.GENERATOR_NAME,
		sequenceName = CourseRange.SEQUENCE_NAME,
		allocationSize = 1)
public class CourseRange {

	protected static final String GENERATOR_NAME = "course_range" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "course_range" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long courseId;

	@ClientEditableField
	@Column(length = 100,
			nullable = true)
	private String name;

	@ClientEditableField
	@Column(nullable = true,
			name = "[from]")
	private Integer from;

	@ClientEditableField
	@Column(nullable = true,
			name = "[to]")
	private Integer to;

	@OneToMany(fetch = FetchType.EAGER,
			targetEntity = CourseMutation.class)
	@JoinColumn(name = "courseRangeId",
			insertable = false,
			updatable = false)
	private Set<CourseMutation> mutations;

	@OneToMany(fetch = FetchType.EAGER,
			targetEntity = CourseActivity.class)
	@JoinColumn(name = "courseRangeId",
			insertable = false,
			updatable = false)
	private Set<CourseActivity> activities;

	public CourseRange() {
	}

	protected CourseRange(CourseRange courseRange) {
		this.courseId = courseRange.courseId;
		this.name = courseRange.name;
		this.from = courseRange.from;
		this.to = courseRange.to;
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
	 * @return the courseId
	 */
	public long getCourseId() {
		return courseId;
	}

	/**
	 * @param courseId
	 *            the courseId to set
	 */
	public void setCourseId(long courseId) {
		this.courseId = courseId;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the from
	 */
	public Integer getFrom() {
		return from;
	}

	/**
	 * @param from
	 *            the from to set
	 */
	public void setFrom(Integer from) {
		this.from = from;
	}

	/**
	 * @return the to
	 */
	public Integer getTo() {
		return to;
	}

	/**
	 * @param to
	 *            the to to set
	 */
	public void setTo(Integer to) {
		this.to = to;
	}

	/**
	 * @return the mutations
	 */
	public Set<CourseMutation> getMutations() {
		return mutations;
	}

	/**
	 * @return the activities
	 */
	public Set<CourseActivity> getActivities() {
		return activities;
	}

	/**
	 * @param activities
	 *            the activities to set
	 */
	public void setActivities(Set<CourseActivity> activities) {
		this.activities = activities;
	}

	/**
	 * @param mutations
	 *            the mutations to set
	 */
	public void setMutations(Set<CourseMutation> mutations) {
		this.mutations = mutations;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("CourseRange [");
		sb.append("id=").append(id);
		sb.append(", courseId=").append(courseId);
		sb.append(", name=").append(name);
		if (from != null) {
			sb.append(", from=").append(from);
		}
		if (to != null) {
			sb.append(", to=").append(to);
		}
		sb.append("]");
		return sb.toString();
	}
}