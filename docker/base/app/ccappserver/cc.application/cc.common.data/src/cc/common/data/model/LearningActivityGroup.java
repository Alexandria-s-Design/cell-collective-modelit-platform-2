/**
 * 
 */
package cc.common.data.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.IdManagementConstants;

/**
 * @author Ales Saska
 */
@Entity
@Table(name = "learning_activity_groups")
@SequenceGenerator(name = LearningActivityGroup.GENERATOR_NAME, sequenceName = LearningActivityGroup.SEQUENCE_NAME, allocationSize = 1)
public class LearningActivityGroup {

	protected static final String GENERATOR_NAME = "learning_activity_groups" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "learning_activity_groups" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long masterId;

	@Column(length = 100, nullable = false)
	private String name;

	@Column(nullable = false)
	private int position;

	public LearningActivityGroup() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getMasterId() {
		return masterId;
	}

	public void setMasterId(long masterId) {
		this.masterId = masterId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getPosition() {
		return position;
	}

	public void setPosition(int position) {
		this.position = position;
	}


}