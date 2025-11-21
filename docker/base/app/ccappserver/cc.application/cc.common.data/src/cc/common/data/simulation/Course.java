/**
 * 
 */
package cc.common.data.simulation;

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
import java.util.Set;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "course")
@SequenceGenerator(name = Course.GENERATOR_NAME,
		sequenceName = Course.SEQUENCE_NAME,
		allocationSize = 1)
public class Course {

	protected static final String GENERATOR_NAME = "course" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "course" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long modelId;

	@ClientEditableField
	@Column(length = 100,
			nullable = true)
	private String name;

	@OneToMany(fetch = FetchType.EAGER,
			targetEntity = CourseRange.class)
	@JoinColumn(name = "courseId",
			insertable = false,
			updatable = false)
	private Set<CourseRange> ranges;

	public Course() {
	}

	protected Course(Course course) {
		this.modelId = course.modelId;
		this.name = course.name;
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
	 * @return the ranges
	 */
	public Set<CourseRange> getRanges() {
		return ranges;
	}

	/**
	 * @param ranges
	 *            the ranges to set
	 */
	public void setRanges(Set<CourseRange> ranges) {
		this.ranges = ranges;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Course [");
		sb.append("id=").append(id);
		sb.append(", modelId=").append(modelId);
		sb.append(", name=").append(name);
		sb.append("]");
		return sb.toString();
	}
}