/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import org.hibernate.annotations.BatchSize;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "content_reference")
@SequenceGenerator(name = ContentReference.GENERATOR_NAME,
		sequenceName = ContentReference.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class ContentReference {

	protected static final String GENERATOR_NAME = "content_reference" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "content_reference" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
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
			targetEntity = Content.class)
	@PrimaryKeyJoinColumn
	@JsonIgnore
	private Content content;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	private Long creationUser;

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

	public ContentReference() {
	}

	protected ContentReference(ContentReference contentReference) {
		this.id = contentReference.id;
		this.position = contentReference.position;
		this.reference = contentReference.reference;
		this.content = contentReference.content;
		this.creationDate = contentReference.creationDate;
		this.creationUser = contentReference.creationUser;
		this.citationType = contentReference.citationType;
		this.dataType = contentReference.dataType;
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
	 * @return the content
	 */
	public Content getContent() {
		return content;
	}

	/**
	 * @param content
	 *            the content to set
	 */
	public void setContent(Content content) {
		this.content = content;
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