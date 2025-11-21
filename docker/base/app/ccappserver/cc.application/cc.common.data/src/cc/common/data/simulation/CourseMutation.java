/**
 * 
 */
package cc.common.data.simulation;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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
@Table(name = "course_mutation")
@SequenceGenerator(name = CourseMutation.GENERATOR_NAME,
		sequenceName = CourseMutation.SEQUENCE_NAME,
		allocationSize = 1)
public class CourseMutation {

	protected static final String GENERATOR_NAME = "course_mutation" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "course_mutation" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long courseRangeId;

	@Column(nullable = false)
	private long speciesId;

	@ClientEditableField
	@Column(length = 5,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private SpeciesMutation state;

	public CourseMutation() {
	}

	protected CourseMutation(CourseMutation courseMutation) {
		this.courseRangeId = courseMutation.courseRangeId;
		this.speciesId = courseMutation.speciesId;
		this.state = courseMutation.state;
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
	 * @return the state
	 */
	public SpeciesMutation getState() {
		return state;
	}

	/**
	 * @param state
	 *            the state to set
	 */
	public void setState(SpeciesMutation state) {
		this.state = state;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("CourseMutation [");
		sb.append("id=").append(id);
		sb.append(", courseRangeId=").append(courseRangeId);
		sb.append(", speciesId=").append(speciesId);
		if (state != null) {
			sb.append(", state=").append(state.name());
		}
		sb.append("]");
		return sb.toString();
	}
}