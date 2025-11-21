/**
 * 
 */
package cc.common.data.knowledge;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "section")
public class SectionIdentifier {

	private long id;

	@JsonIgnore
	private PageIdentifier page;

	@JsonIgnore
	private String type;

	@Transient
	@JsonIgnore
	private Section section;

	public SectionIdentifier() {
	}

	public SectionIdentifier(Section section) {
		this.section = section;
	}

	/**
	 * @return the id
	 */
	@Id
	@GeneratedValue
	public long getId() {
		return (this.section == null) ? this.id : this.section.getId();
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
	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = PageIdentifier.class)
	@JoinColumn(name = "page_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_section_to_page") )
	public PageIdentifier getPage() {
		return (this.section == null) ? this.page : this.section.getPage();
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
	@Column(nullable = false,
			length = 80)
	public String getType() {
		return (this.section == null) ? this.type : this.section.getType();
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}
}