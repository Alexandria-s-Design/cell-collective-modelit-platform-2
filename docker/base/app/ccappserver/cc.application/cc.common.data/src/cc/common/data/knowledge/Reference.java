/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import org.hibernate.annotations.BatchSize;
import com.fasterxml.jackson.annotation.JsonFormat;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "reference")
@SequenceGenerator(name = Reference.GENERATOR_NAME,
		sequenceName = Reference.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class Reference {

	protected static final String GENERATOR_NAME = "reference" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "reference" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(nullable = true,
			length = 50)
	private String pmid;
	
	@Column(nullable = true,
			columnDefinition = "TEXT")
	private String doi;

	@ClientEditableField
	@Column(nullable = false,
			length = 4096)
	private String text;

	@ClientEditableField
	@Column(nullable = true,
			length = 200)
	private String shortCitation;

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

	public Reference() {
	}

	protected Reference(Reference reference) {
		this.id = reference.id;
		this.pmid = reference.pmid;
		this.doi = reference.doi;
		this.text = reference.text;
		this.shortCitation = reference.shortCitation;
		this.creationDate = reference.creationDate;
		this.creationUser = reference.creationUser;
		this.updateDate = reference.updateDate;
		this.updateUser = reference.updateUser;
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
	 * @return the pmid
	 */
	public String getPmid() {
		return pmid;
	}

	/**
	 * @param pmid
	 *            the pmid to set
	 */
	public void setPmid(String pmid) {
		this.pmid = pmid;
	}

	public String getDoi() {
		return doi;
	}

	public void setDoi(String doi) {
		this.doi = doi;
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
	 * @return the shortCitation
	 */
	public String getShortCitation() {
		return shortCitation;
	}

	/**
	 * @param shortCitation
	 *            the shortCitation to set
	 */
	public void setShortCitation(String shortCitation) {
		this.shortCitation = shortCitation;
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
}