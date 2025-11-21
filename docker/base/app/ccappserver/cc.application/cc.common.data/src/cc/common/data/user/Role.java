/**
 * 
 */
package cc.common.data.user;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/**
 * @author Bryan Kowal
 *
 */
@Entity
@Table(name = "role",
		uniqueConstraints = @UniqueConstraint(columnNames = { "name" },
				name = "uk_name") )
public class Role {

	public static enum USER_ROLE {
		INSTRUCTOR, STUDENT, SCIENTIST, ADMINISTRATOR
	}

	@Id
	private long id;

	@Column(nullable = false,
			length = 30)
	@Enumerated(EnumType.STRING)
	private USER_ROLE name;

	public Role() {
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
	 * @return the name
	 */
	public USER_ROLE getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(USER_ROLE name) {
		this.name = name;
	}

	@Override
	public int hashCode() {
		return (int) id;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null) return false;
		if (!(obj instanceof Role))
			return false;
		if (obj == this)
			return true;
		return this.getId() == ((Role) obj).getId();
	}
}