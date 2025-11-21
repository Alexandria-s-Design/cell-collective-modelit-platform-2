/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;
import cc.common.data.knowledge.Reference;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_reference")
@GenericGenerator(name = ModelReference.GENERATOR_NAME,
		strategy = IdManagementConstants.GENERATOR_STRATEGY,
		parameters = { @Parameter(value = ModelReference.SEQUENCE_NAME,
				name = SequenceStyleGenerator.SEQUENCE_PARAM) })
@BatchSize(size = 100)
public class ModelReference {

	protected static final String GENERATOR_NAME = "model-reference" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model_reference" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(generator = ModelReference.GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(nullable = false)
	private int position;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = Reference.class)
	@PrimaryKeyJoinColumn
	@JsonIgnore
	private Reference reference;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@PrimaryKeyJoinColumn
	@JsonIgnore
	private ModelIdentifier model;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	private Long creationUser;

	public ModelReference() {
	}

	protected ModelReference(ModelReference modelReference) {
		this.id = modelReference.id;
		this.position = modelReference.position;
		this.reference = modelReference.reference;
		this.model = modelReference.model;
		this.creationDate = modelReference.creationDate;
		this.creationUser = modelReference.creationUser;
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
	 * @return the position
	 */
	public int getPosition() {
		return position;
	}

	/**
	 * @param position
	 *            the position to set
	 */
	public void setPosition(int position) {
		this.position = position;
	}

	/**
	 * @return the reference
	 */
	public Reference getReference() {
		return reference;
	}

	/**
	 * @param reference
	 *            the reference to set
	 */
	public void setReference(Reference reference) {
		this.reference = reference;
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
	 * @return the creationUser
	 */
	public Long getCreationUser() {
		return creationUser;
	}

	/**
	 * @param creationUser
	 *            the creationUser to set
	 */
	public void setCreationUser(Long creationUser) {
		this.creationUser = creationUser;
	}
}