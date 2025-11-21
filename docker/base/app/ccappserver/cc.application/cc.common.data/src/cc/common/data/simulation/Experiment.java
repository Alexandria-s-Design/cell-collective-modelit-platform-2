/**
 * 
 */
package cc.common.data.simulation;

import java.util.Calendar;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import org.hibernate.annotations.BatchSize;
import com.fasterxml.jackson.annotation.JsonFormat;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "experiment", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "model_id",
		"userId" }, name = "uk_name"))
@SequenceGenerator(name = Experiment.GENERATOR_NAME, sequenceName = Experiment.SEQUENCE_NAME, allocationSize = 1)
@BatchSize(size = 100)
public class Experiment {

	public static enum UpdateType {
		SYNCHRONOUS, ASYNCHRONOUS
	}

	protected static final String GENERATOR_NAME = "experiment" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "experiment" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(length = 100, nullable = false)
	public String name;

	@Column(nullable = false)
	private long model_id;

	@Column(nullable = true)
	@Enumerated(EnumType.STRING)
	private SimulationState state;

	@Column(nullable = true)
	private Long userId;

	@ClientEditableField
	@Column(nullable = true)
	private Long courseId;

	@ClientEditableField
	@Column(nullable = false)
	private Boolean shared;

	@ClientEditableField
	@Column(nullable = false)
	private Boolean published;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar lastRunDate;

	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar lastAccessDate;

	@Column(nullable = false, columnDefinition = "MEDIUMTEXT")
	private String settings;

	@ClientEditableField
	@Enumerated(EnumType.STRING)
	@Column(nullable = true, length = 13)
	private UpdateType updateType;

	@OneToMany(fetch = FetchType.EAGER, targetEntity = CalcInterval.class)
	@JoinColumn(name = "experimentId", insertable = false, updatable = false)
	private Set<CalcInterval> calcIntervals;

	@ClientEditableField
	@Column(nullable = true)
	private Long environmentId;

	@ClientEditableField
	@Column(nullable = true)
	private Long lastRunEnvironmentId;

	public Experiment() {
	}

	protected Experiment(Experiment experiment) {
		this.id = experiment.id;
		this.name = experiment.name;
		this.model_id = experiment.model_id;
		this.state = experiment.state;
		this.userId = experiment.userId;
		this.courseId = experiment.courseId;
		this.shared = experiment.shared;
		this.published = experiment.published;
		this.creationDate = experiment.creationDate;
		this.updateDate = experiment.updateDate;
		this.lastRunDate = experiment.lastRunDate;
		this.lastAccessDate = experiment.lastAccessDate;
		this.settings = experiment.settings;
		this.updateType = experiment.updateType;
		this.environmentId = experiment.environmentId;
		this.lastRunEnvironmentId = experiment.lastRunEnvironmentId;
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

	public long getModel_id() {
		return model_id;
	}

	public void setModel_id(long model_id) {
		this.model_id = model_id;
	}

	/**
	 * @return the state
	 */
	public SimulationState getState() {
		return state;
	}

	/**
	 * @param state
	 *            the state to set
	 */
	public void setState(SimulationState state) {
		this.state = state;
	}

	/**
	 * @return the userId
	 */
	public Long getUserId() {
		return userId;
	}

	/**
	 * @param userId
	 *            the userId to set
	 */
	public void setUserId(Long userId) {
		this.userId = userId;
	}

	/**
	 * @return the courseId
	 */
	public Long getCourseId() {
		return courseId;
	}

	/**
	 * @param courseId
	 *            the courseId to set
	 */
	public void setCourseId(Long courseId) {
		this.courseId = courseId;
	}

	/**
	 * @return the shared
	 */
	public Boolean isShared() {
		return shared;
	}

	/**
	 * @param shared
	 *            the shared to set
	 */
	public void setShared(Boolean shared) {
		this.shared = shared;
	}

	/**
	 * @return the published
	 */
	public Boolean isPublished() {
		return published;
	}

	/**
	 * @param published
	 *            the published to set
	 */
	public void setPublished(Boolean published) {
		this.published = published;
	}

	/**
	 * @return the creationDate
	 */
	public Calendar getCreationDate() {
		return creationDate;
	}

	/**
	 * @param creationDate
	 *            the creationDate to set
	 */
	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	/**
	 * @return the updateDate
	 */
	public Calendar getUpdateDate() {
		return updateDate;
	}

	/**
	 * @param updateDate
	 *            the updateDate to set
	 */
	public void setUpdateDate(Calendar updateDate) {
		this.updateDate = updateDate;
	}

	/**
	 * @return the lastRunDate
	 */
	public Calendar getLastRunDate() {
		return lastRunDate;
	}

	/**
	 * @param lastRunDate
	 *            the lastRunDate to set
	 */
	public void setLastRunDate(Calendar lastRunDate) {
		this.lastRunDate = lastRunDate;
	}

	/**
	 * @return the lastAccessDate
	 */
	public Calendar getLastAccessDate() {
		return lastAccessDate;
	}

	/**
	 * @param lastAccessDate
	 *            the lastAccessDate to set
	 */
	public void setLastAccessDate(Calendar lastAccessDate) {
		this.lastAccessDate = lastAccessDate;
	}

	/**
	 * @return the settings
	 */
	public String getSettings() {
		return settings;
	}

	/**
	 * @param settings
	 *            the settings to set
	 */
	public void setSettings(String settings) {
		this.settings = settings;
	}

	public UpdateType getUpdateType() {
		return updateType;
	}

	public void setUpdateType(UpdateType updateType) {
		this.updateType = updateType;
	}

	/**
	 * @return the calcIntervals
	 */
	public Set<CalcInterval> getCalcIntervals() {
		return calcIntervals;
	}

	/**
	 * @param calcIntervals
	 *            the calcIntervals to set
	 */
	public void setCalcIntervals(Set<CalcInterval> calcIntervals) {
		this.calcIntervals = calcIntervals;
	}

	public Long getEnvironmentId() {
		return environmentId;
	}

	public void setEnvironmentId(Long environmentId) {
		this.environmentId = environmentId;
	}

	public Long getLastRunEnvironmentId() {
		return lastRunEnvironmentId;
	}

	public void setLastRunEnvironmentId(Long lastRunEnvironmentId) {
		this.lastRunEnvironmentId = lastRunEnvironmentId;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Experiment [");
		sb.append("id=").append(id);
		sb.append(", name=").append(name);
		sb.append(", model_id=").append(model_id);
		if (state != null) {
			sb.append(", state=").append(state.name());
		}
		if (userId != null) {
			sb.append(", userId=").append(userId);
		}
		if (courseId != null) {
			sb.append(", courseId=").append(courseId);
		}
		sb.append(", shared=").append(shared);
		sb.append(", published=").append(published);
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		sb.append(", updateDate=").append(updateDate.getTime().toString());
		if (lastRunDate != null) {
			sb.append(", lastRunDate=").append(lastRunDate.getTime().toString());
		}
		if (lastAccessDate != null) {
			sb.append(", lastAccessDate=").append(lastAccessDate.getTime().toString());
		}
		sb.append(", settings=").append(settings);
		if (updateType != null) {
			sb.append(", updateType=").append(updateType.name());
		}
		if (environmentId != null) {
			sb.append(", environmentId=").append(environmentId);
		}
		if (lastRunEnvironmentId != null) {
			sb.append(", lastRunEnvironmentId=").append(lastRunEnvironmentId);
		}
		sb.append("]");
		return sb.toString();
	}
}