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

import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "analysis_environment")
@SequenceGenerator(name = AnalysisEnvironment.GENERATOR_NAME, sequenceName = AnalysisEnvironment.SEQUENCE_NAME, allocationSize = 1)
public class AnalysisEnvironment {

	protected static final String GENERATOR_NAME = "analysis_environment" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "analysis_environment" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false)
	private long modelid;
	
	@Column(nullable = false)
	private long userId;	
	
	@Column(name = "\"isDefault\"", nullable = false)
	private Boolean isDefault;

	public AnalysisEnvironment() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getModelid() {
		return modelid;
	}

	public void setModelid(long modelid) {
		this.modelid = modelid;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public Boolean getIsDefault() {
		return isDefault;
	}

	public void setIsDefault(Boolean isDefault) {
		this.isDefault = isDefault;
	}
}