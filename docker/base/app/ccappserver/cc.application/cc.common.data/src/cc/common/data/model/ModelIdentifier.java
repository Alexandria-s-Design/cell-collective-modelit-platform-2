/**
 * 
 */
package cc.common.data.model;

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
@Table(name = "model")
public class ModelIdentifier {

	private long id;

	private String name;

	@JsonIgnore
	private Model model;

	public ModelIdentifier() {
	}

	protected ModelIdentifier(Model model) {
		this.model = model;
	}

	/**
	 * @return the id
	 */
	@Id
	@GeneratedValue
	public long getId() {
		return (this.model == null) ? this.id : this.model.getId();
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		if (this.model == null) {
			this.id = id;
		} else {
			this.model.setId(id);
		}
	}

	/**
	 * @return the name
	 */
	@Column(length = 100,
			nullable = false)
	public String getName() {
		return (this.model == null) ? this.name : this.model.getName();
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		if (this.model == null) {
			this.name = name;
		} else {
			this.model.setName(name);
		}
	}

	/**
	 * @return the model
	 */
	@Transient
	public Model getModel() {
		return model;
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(Model model) {
		this.model = model;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (id ^ (id >>> 32));
		result = prime * result + ((model == null) ? 0 : model.hashCode());
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		return result;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		ModelIdentifier other = (ModelIdentifier) obj;
		if (id != other.id) {
			return false;
		}
		if (model == null) {
			if (other.model != null) {
				return false;
			}
		} else if (!model.equals(other.model)) {
			return false;
		}
		if (name == null) {
			if (other.name != null) {
				return false;
			}
		} else if (!name.equals(other.name)) {
			return false;
		}
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Model [");
		sb.append("id=").append(getId());
		sb.append(", name=").append(getName());
		sb.append("]");

		return sb.toString();
	}
}