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
@Table(name = "calc_interval")
@SequenceGenerator(name = CalcInterval.GENERATOR_NAME,
		sequenceName = CalcInterval.SEQUENCE_NAME,
		allocationSize = 1)
public class CalcInterval {

	protected static final String GENERATOR_NAME = "calc_interval" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "calc_interval" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long experimentId;

	@ClientEditableField
	@Column(nullable = true,
			name = "[from]")
	private Integer from;

	@ClientEditableField
	@Column(nullable = true,
			name = "[to]")
	private Integer to;

	public CalcInterval() {
	}

	protected CalcInterval(CalcInterval calcInterval) {
		this.experimentId = calcInterval.experimentId;
		this.from = calcInterval.from;
		this.to = calcInterval.to;
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
	 * @return the experimentId
	 */
	public long getExperimentId() {
		return experimentId;
	}

	/**
	 * @param experimentId
	 *            the experimentId to set
	 */
	public void setExperimentId(long experimentId) {
		this.experimentId = experimentId;
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

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("CalcInterval [");
		sb.append("id=").append(id);
		sb.append(", experimentId=").append(experimentId);
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