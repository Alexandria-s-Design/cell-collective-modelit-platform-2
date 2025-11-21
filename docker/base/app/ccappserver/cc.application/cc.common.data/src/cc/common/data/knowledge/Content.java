/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Calendar;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "content")
@SequenceGenerator(name = Content.GENERATOR_NAME,
		sequenceName = Content.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class Content {

	protected static final String GENERATOR_NAME = "content" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "content" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = SectionIdentifier.class)
	@JoinColumn(name = "section_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_content_to_section") )
	private SectionIdentifier section;

	@ClientEditableField
	@Column(nullable = false,
			columnDefinition = "TEXT")
	private String text;

	@ClientEditableField
	@Column(nullable = false)
	private int position;

	@ClientEditableField
	@Column(nullable = false)
	private boolean flagged = false;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	private Long creationUser;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	@Column(nullable = true)
	private Long updateUser;

	@OneToMany(mappedBy = "content",
			targetEntity = ContentReference.class,
			fetch = FetchType.EAGER)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<ContentReference> references;

	public Content() {
	}

	public Content(Content content) {
		this.id = content.id;
		this.section = content.section;
		this.text = content.text;
		this.position = content.position;
		this.flagged = content.flagged;
		this.creationDate = content.creationDate;
		this.creationUser = content.creationUser;
		this.updateDate = content.updateDate;
		this.updateUser = content.updateUser;
		this.references = content.references;
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
	 * @return the section
	 */
	public SectionIdentifier getSection() {
		return section;
	}

	/**
	 * @param section
	 *            the section to set
	 */
	public void setSection(SectionIdentifier section) {
		this.section = section;
	}

	/**
	 * @return the text
	 */
	public String getText() {
		return text;
	}

	/**
	 * @param text
	 *            the text to set
	 */
	public void setText(String text) {
		this.text = text;
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
	 * @return the flagged
	 */
	public boolean isFlagged() {
		return flagged;
	}

	/**
	 * @param flagged
	 *            the flagged to set
	 */
	public void setFlagged(boolean flagged) {
		this.flagged = flagged;
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
	 * @return the updateUser
	 */
	public Long getUpdateUser() {
		return updateUser;
	}

	/**
	 * @param updateUser
	 *            the updateUser to set
	 */
	public void setUpdateUser(Long updateUser) {
		this.updateUser = updateUser;
	}

	/**
	 * @return the references
	 */
	public Set<ContentReference> getReferences() {
		return references;
	}

	/**
	 * @param references
	 *            the references to set
	 */
	public void setReferences(Set<ContentReference> references) {
		this.references = references;
	}
}