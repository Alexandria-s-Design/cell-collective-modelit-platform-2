/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
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
@Table(name = "page_reference")
@SequenceGenerator(name = PageReference.GENERATOR_NAME,
		sequenceName = PageReference.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class PageReference {

	protected static final String GENERATOR_NAME = "page_reference" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "page_reference" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(generator = PageReference.GENERATOR_NAME)
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
			targetEntity = PageIdentifier.class)
	@PrimaryKeyJoinColumn
	@JsonIgnore
	private PageIdentifier page;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	private Long creationUser;

	public PageReference() {
	}

	protected PageReference(PageReference pageReference) {
		this.id = pageReference.id;
		this.position = pageReference.position;
		this.reference = pageReference.reference;
		this.page = pageReference.page;
		this.creationDate = pageReference.creationDate;
		this.creationUser = pageReference.creationUser;
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
	 * @return the page
	 */
	public PageIdentifier getPage() {
		return page;
	}

	/**
	 * @param page
	 *            the page to set
	 */
	public void setPage(PageIdentifier page) {
		this.page = page;
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