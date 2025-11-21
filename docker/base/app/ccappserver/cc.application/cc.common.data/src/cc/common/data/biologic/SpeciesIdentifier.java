/**
 * 
 */
package cc.common.data.biologic;

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

import cc.common.data.model.ModelIdentifier;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "species")
public class SpeciesIdentifier {

	private long id;

	@JsonIgnore
	private String name;

	@JsonIgnore
	private ModelIdentifier model;

	@JsonIgnore
	private Species species;

	public SpeciesIdentifier() {
	}

	protected SpeciesIdentifier(Species species) {
		this.species = species;
	}

	/**
	 * @return the id
	 */
	@Id
	@GeneratedValue
	public long getId() {
		return (this.species == null) ? id : this.species.getId();
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
	@Column(length = 100,
			nullable = false)
	public String getName() {
		return (this.species == null) ? name : this.species.getName();
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the model
	 */
	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_species_to_model") )
	public ModelIdentifier getModel() {
		return (this.species == null) ? model : this.species.getModel();
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(ModelIdentifier model) {
		this.model = model;
	}

	/**
	 * @return the species
	 */
	@Transient
	public Species getSpecies() {
		return species;
	}

	/**
	 * @param species
	 *            the species to set
	 */
	public void setSpecies(Species species) {
		this.species = species;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Species [");
		sb.append("id=").append(getId());
		sb.append(", name=").append(getName());		
		sb.append("]");
		
		return sb.toString();
	}
}