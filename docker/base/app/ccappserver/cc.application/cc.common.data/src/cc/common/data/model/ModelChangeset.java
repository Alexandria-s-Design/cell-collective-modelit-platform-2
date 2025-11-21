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
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_changeset")
@GenericGenerator(name = ModelChangeset.GENERATOR_NAME,
		strategy = IdManagementConstants.GENERATOR_STRATEGY,
		parameters = { @Parameter(value = ModelChangeset.SEQUENCE_NAME,
				name = SequenceStyleGenerator.SEQUENCE_PARAM) })
public class ModelChangeset {

	protected static final String GENERATOR_NAME = "model_changeset" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model_changeset" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	public static final String DESCRIPTION_INITIAL_CREATION = "Initial Creation.";

	@Id
	@GeneratedValue(generator = ModelChangeset.GENERATOR_NAME)
	private long id;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_model_changeset_to_model") )
	@JsonIgnore
	private ModelIdentifier model;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	private Long userId;

	@Column(length = 200,
			nullable = true)
	private String description;

	@Column(nullable = false,
			columnDefinition = "MEDIUMTEXT")
	private String changeset;

	public ModelChangeset() {
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param id the id to set
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
	 * @param model the model to set
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
	 * @param creationDate the creationDate to set
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
	 * @param userId the userId to set
	 */
	public void setUserId(Long userId) {
		this.userId = userId;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the changeset
	 */
	public String getChangeset() {
		return changeset;
	}

	/**
	 * @param changeset the changeset to set
	 */
	public void setChangeset(String changeset) {
		this.changeset = changeset;
	}
}