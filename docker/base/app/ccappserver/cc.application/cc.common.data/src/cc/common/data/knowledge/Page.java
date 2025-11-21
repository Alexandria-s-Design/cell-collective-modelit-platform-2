/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Calendar;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import cc.common.data.biologic.SpeciesIdentifier;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "page")
@BatchSize(size = 100)
public class Page {
	@Id
	private long id;

	@Transient
	private SpeciesIdentifier species;

	@ManyToMany(mappedBy = "page",
			targetEntity = Section.class,
			fetch = FetchType.EAGER)
	@OrderBy("position ASC")
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<Section> sections;

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

	@OneToMany(mappedBy = "page",
			targetEntity = PageReference.class,
			fetch = FetchType.EAGER)
	@JsonInclude(JsonInclude.Include.NON_NULL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<PageReference> references;

	@Transient
	private final PageIdentifier identifier = new PageIdentifier(this);

	public Page() {
	}

	protected Page(Page page) {
		this.id = page.id;
		this.species = page.species;
		this.sections = page.sections;
		this.creationDate = page.creationDate;
		this.creationUser = page.creationUser;
		this.updateDate = page.updateDate;
		this.updateUser = page.updateUser;
		this.references = page.references;
	}

	@JsonIgnore
	public PageIdentifier getIdentifier() {
		return this.identifier;
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return this.id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the species
	 */
	public SpeciesIdentifier getSpecies() {
		return species;
	}

	/**
	 * @param species
	 *            the species to set
	 */
	public void setSpecies(SpeciesIdentifier species) {
		this.species = species;
	}

	/**
	 * @return the sections
	 */
	public Set<Section> getSections() {
		return sections;
	}

	/**
	 * @param sections
	 *            the sections to set
	 */
	public void setSections(Set<Section> sections) {
		this.sections = sections;
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
	public Set<PageReference> getReferences() {
		return references;
	}

	/**
	 * @param references
	 *            the references to set
	 */
	public void setReferences(Set<PageReference> references) {
		this.references = references;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Page {");
		sb.append("id=").append(id);
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		sb.append(", creationUser=").append(creationUser);
		sb.append(", updateDate=").append(updateDate.getTime().toString());
		sb.append(", updateUser=").append(updateUser);
		sb.append("]");
		return sb.toString();
	}
}