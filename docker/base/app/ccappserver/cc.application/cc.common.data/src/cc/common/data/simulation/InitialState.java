/**
 * 
 */
package cc.common.data.simulation;

import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.model.ModelIdentifier;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "initial_state")
@GenericGenerator(name = InitialState.GENERATOR_NAME,
		strategy = IdManagementConstants.GENERATOR_STRATEGY,
		parameters = { @Parameter(value = InitialState.SEQUENCE_NAME,
				name = SequenceStyleGenerator.SEQUENCE_PARAM) })
@BatchSize(size = 100)
public class InitialState {

	protected static final String GENERATOR_NAME = "initial_state" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "initial_state" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(generator = InitialState.GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(length = 80,
			nullable = false)
	private String name;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_initial_state_to_model") )
	@JsonIgnore
	private ModelIdentifier model;

	@JoinTable(name = "initial_state_species",
			joinColumns = @JoinColumn(name = "initial_state_id",
					referencedColumnName = "id") ,
			inverseJoinColumns = @JoinColumn(name = "species_id",
					referencedColumnName = "id") )
	@ManyToMany(fetch = FetchType.EAGER,
			targetEntity = SpeciesIdentifier.class)
	private Set<SpeciesIdentifier> species;

	public InitialState() {
	}

	protected InitialState(InitialState initialState) {
		this.id = initialState.id;
		this.name = initialState.name;
		this.creationDate = initialState.creationDate;
		this.updateDate = initialState.updateDate;
		this.model = initialState.model;
		this.species = initialState.species;
	}

	public void addSpecies(SpeciesIdentifier species) {
		if (this.species == null) {
			this.species = new HashSet<>();
		}
		this.species.add(species);
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
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
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
	 * @return the model
	 */
	public ModelIdentifier getModel() {
		return model;
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
	public Set<SpeciesIdentifier> getSpecies() {
		return species;
	}

	/**
	 * @param species
	 *            the species to set
	 */
	public void setSpecies(Set<SpeciesIdentifier> species) {
		this.species = species;
	}
}