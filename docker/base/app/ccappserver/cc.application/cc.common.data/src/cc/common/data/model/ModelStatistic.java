/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_statistic")
@SequenceGenerator(name = ModelStatistic.GENERATOR_NAME,
		sequenceName = ModelStatistic.SEQUENCE_NAME,
		allocationSize = 1)
public class ModelStatistic {

	protected static final String GENERATOR_NAME = "model_statistic" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model_statistic" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_model_statistic_to_model") )
	@JsonIgnore
	private ModelIdentifier model;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	private Long userId;

	@Column(length = 175,
			nullable = false)
	private String type;

	@Column(nullable = true,
			columnDefinition = "MEDIUMTEXT")
	private String metadata;

	public ModelStatistic() {
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
	 * @return the model
	 */
	public ModelIdentifier getModel() {
		return model;
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(ModelIdentifier model) {
		this.model = model;
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
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the metadata
	 */
	public String getMetadata() {
		return metadata;
	}

	/**
	 * @param metadata
	 *            the metadata to set
	 */
	public void setMetadata(String metadata) {
		this.metadata = metadata;
	}

	public String toString() {
		StringBuilder sb = new StringBuilder("ModelStatistic [id=");
		sb.append(this.id).append(", model=");
		sb.append(this.model.getId()).append(", creationDate=");
		sb.append(this.creationDate).append(", userId=");
		sb.append(this.userId).append(", type=");
		sb.append(this.type).append(", metadata=");
		sb.append(this.metadata).append("]");

		return sb.toString();
	}
}