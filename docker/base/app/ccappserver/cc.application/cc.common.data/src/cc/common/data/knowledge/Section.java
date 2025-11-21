/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Set;
import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OrderBy;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 *
 */
@Entity
@Table(name = "section")
@SequenceGenerator(name = Section.GENERATOR_NAME,
		sequenceName = Section.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class Section {

	protected static final String GENERATOR_NAME = "section" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "section" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = PageIdentifier.class)
	@JoinColumn(name = "page_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_section_to_page") )
	private PageIdentifier page;

	@ClientEditableField
	@Column(nullable = false,
			length = 80)
	/*
	 * Descriptive text describing the section type. The client can set and use
	 * this field to determine how a section should be rendered.
	 */
	private String type;

	@ClientEditableField
	@Column(nullable = false)
	private int position;

	@ClientEditableField
	@Column(nullable = true,
			length = 200)
	private String title;

	@ManyToMany(mappedBy = "section",
			targetEntity = Content.class,
			fetch = FetchType.EAGER)
	@OrderBy("position ASC")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<Content> contents;

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

	@Transient
	private final SectionIdentifier identifier = new SectionIdentifier(this);

	public Section() {
	}

	protected Section(Section section) {
		this.id = section.id;
		this.page = section.page;
		this.type = section.type;
		this.position = section.position;
		this.title = section.title;
		this.contents = section.contents;
		this.creationDate = section.creationDate;
		this.creationUser = section.creationUser;
		this.updateDate = section.updateDate;
		this.updateUser = section.updateUser;
	}

	@JsonIgnore
	public SectionIdentifier getIdentifier() {
		return this.identifier;
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
	 * @return the title
	 */
	public String getTitle() {
		return title;
	}

	/**
	 * @param title
	 *            the title to set
	 */
	public void setTitle(String title) {
		this.title = title;
	}

	/**
	 * @return the contents
	 */
	public Set<Content> getContents() {
		return contents;
	}

	/**
	 * @param contents
	 *            the contents to set
	 */
	public void setContents(Set<Content> contents) {
		this.contents = contents;
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