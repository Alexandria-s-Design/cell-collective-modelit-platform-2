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
@Table(name = "component_pair")
@SequenceGenerator(name = ComponentPair.GENERATOR_NAME,
		sequenceName = ComponentPair.SEQUENCE_NAME,
		allocationSize = 1)
public class ComponentPair {

	protected static final String GENERATOR_NAME = "component_pair" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "component_pair" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(nullable = false)
	private long firstComponentId;

	@ClientEditableField
	@Column(nullable = false)
	private long secondComponentId;

	@ClientEditableField
	@Column(nullable = true)
	private Integer delay;

	@ClientEditableField
	@Column(nullable = true)
	private Integer threshold;

	public ComponentPair() {
	}

	protected ComponentPair(ComponentPair componentPair) {
		this.id = componentPair.id;
		this.firstComponentId = componentPair.firstComponentId;
		this.secondComponentId = componentPair.secondComponentId;
		this.delay = componentPair.delay;
		this.threshold = componentPair.threshold;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getFirstComponentId() {
		return firstComponentId;
	}

	public void setFirstComponentId(long firstComponentId) {
		this.firstComponentId = firstComponentId;
	}

	public long getSecondComponentId() {
		return secondComponentId;
	}

	public void setSecondComponentId(long secondComponentId) {
		this.secondComponentId = secondComponentId;
	}

	public Integer getDelay() {
		return delay;
	}

	public void setDelay(Integer delay) {
		this.delay = delay;
	}

	public Integer getThreshold() {
		return threshold;
	}

	public void setThreshold(Integer threshold) {
		this.threshold = threshold;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ComponentPair [");
		sb.append("id=").append(id);
		sb.append(", firstComponentId=").append(firstComponentId);
		sb.append(", secondComponentId=").append(secondComponentId);
		sb.append(", delay=").append(delay);
		sb.append(", threshold=").append(threshold);
		sb.append("]");
		return sb.toString();
	}
}