/**
 * 
 */
package cc.common.data.knowledge;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import org.hibernate.annotations.BatchSize;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_reference_types")
@SequenceGenerator(name = ModelReferenceTypes.GENERATOR_NAME,
		sequenceName = ModelReferenceTypes.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class ModelReferenceTypes {

	protected static final String GENERATOR_NAME = "model_reference_types"
			+ IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model_reference_types" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long modelId;

	@Column(nullable = false)
	private long referenceId;

	@ClientEditableField
	@Enumerated(EnumType.STRING)
	@Column(nullable = true,
			length = 11)
	private CitationType citationType;

	@ClientEditableField
	@Enumerated(EnumType.STRING)
	@Column(nullable = true,
			length = 7)
	private DataType dataType;

	public ModelReferenceTypes() {
	}

	protected ModelReferenceTypes(ModelReferenceTypes modelReferenceTypes) {
		this.id = modelReferenceTypes.id;
		this.modelId = modelReferenceTypes.modelId;
		this.referenceId = modelReferenceTypes.referenceId;
		this.citationType = modelReferenceTypes.citationType;
		this.dataType = modelReferenceTypes.dataType;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getModelId() {
		return modelId;
	}

	public void setModelId(long modelId) {
		this.modelId = modelId;
	}

	public long getReferenceId() {
		return referenceId;
	}

	public void setReferenceId(long referenceId) {
		this.referenceId = referenceId;
	}

	public CitationType getCitationType() {
		return citationType;
	}

	public void setCitationType(CitationType citationType) {
		this.citationType = citationType;
	}

	public DataType getDataType() {
		return dataType;
	}

	public void setDataType(DataType dataType) {
		this.dataType = dataType;
	}
}