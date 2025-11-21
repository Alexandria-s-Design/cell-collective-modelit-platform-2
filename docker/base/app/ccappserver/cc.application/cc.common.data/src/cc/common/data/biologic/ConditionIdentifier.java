/**
 * 
 */
package cc.common.data.biologic;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "[condition]")
public class ConditionIdentifier {

	private long id;

	@JsonIgnore
	private String name;

	@JsonIgnore
	private Condition condition;

	public ConditionIdentifier() {
	}

	protected ConditionIdentifier(Condition condition) {
		this.condition = condition;
	}

	/**
	 * @return the id
	 */
	@Id
	@GeneratedValue
	public long getId() {
		return (this.condition == null) ? id : this.condition.getId();
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
	@Column(length = 60,
			nullable = false)
	public String getName() {
		return (this.condition == null) ? name : this.condition.getName();
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the condition
	 */
	@Transient
	public Condition getCondition() {
		return condition;
	}

	/**
	 * @param condition
	 *            the condition to set
	 */
	public void setCondition(Condition condition) {
		this.condition = condition;
	}
}