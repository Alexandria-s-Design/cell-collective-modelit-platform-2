/**
 * 
 */
package cc.common.data.knowledge;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "page")
public class PageIdentifier {

	private long id;

	private Calendar creationDate;

	private Long creationUser;

	private Calendar updateDate;

	private Long updateUser;

	@Transient
	@JsonIgnore
	private Page page;

	public PageIdentifier() {
	}

	public PageIdentifier(Page page) {
		this.page = page;
	}

	/**
	 * @return the id
	 */
	@Id
	@GeneratedValue
	public long getId() {
		return (this.page == null) ? this.id : this.page.getId();
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the creationDate
	 */
	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	public Calendar getCreationDate() {
		return (this.page == null) ? this.creationDate : this.page.getCreationDate();
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
	@Column(nullable = true)
	public Long getCreationUser() {
		return (this.page == null) ? this.creationUser : this.page.getCreationUser();
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
	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	public Calendar getUpdateDate() {
		return (this.page == null) ? this.updateDate : this.page.getUpdateDate();
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
	@Column(nullable = true)
	public Long getUpdateUser() {
		return (this.page == null) ? this.updateUser : this.page.getUpdateUser();
	}

	/**
	 * @param updateUser
	 *            the updateUser to set
	 */
	public void setUpdateUser(Long updateUser) {
		this.updateUser = updateUser;
	}
}