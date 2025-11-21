/**
 * 
 */
package cc.common.data.biologic;

import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.EnumType;
import javax.persistence.Transient;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;
import cc.common.data.RuntimeAnnotation;
import cc.common.data.knowledge.Page;
import cc.common.data.model.ModelIdentifier;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "species")
@BatchSize(size = 100)
@SequenceGenerator(name = Species.GENERATOR_NAME, sequenceName = Species.SEQUENCE_NAME, allocationSize = 1)
public class Species {

	public enum AbsentState {
		OFF, ON
	}

	protected static final String GENERATOR_NAME = "species" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "species" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(length = 100, nullable = false)
	private String name;

	@ClientEditableField
	@Column(nullable = false)
	private Boolean external;

	@ClientEditableField
	@Column(length = 3, nullable = true)
	@Enumerated(EnumType.STRING)
	private AbsentState absentState;

	@OneToMany(mappedBy = "species", targetEntity = Regulator.class, fetch = FetchType.EAGER)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<Regulator> regulators;

	@ManyToOne(optional = false, fetch = FetchType.EAGER, targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id", nullable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_species_to_model"))
	@JsonIgnore
	private ModelIdentifier model;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	@Transient
	private Page page;

	@Transient
	private final SpeciesIdentifier identifier = new SpeciesIdentifier(this);

	public Species() {
	}

	protected Species(Species species) {
		this.id = species.id;
		this.name = species.name;
		this.external = species.external;
		this.absentState = species.absentState;
		this.regulators = species.regulators;
		this.model = species.model;
		this.creationDate = species.creationDate;
		this.updateDate = species.updateDate;
		this.page = species.page;
	}

	public void addRegulator(Regulator regulator) {
		if (this.regulators == null) {
			this.regulators = new HashSet<>();
		}
		regulator.setSpecies(this.identifier);
		this.regulators.add(regulator);
	}

	@JsonIgnore
	public SpeciesIdentifier getSpeciesIdentifier() {
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
	 * @return the external
	 */
	public Boolean isExternal() {
		return external;
	}

	/**
	 * @param external
	 *            the external to set
	 */
	public void setExternal(Boolean external) {
		this.external = external;
	}

	/**
	 * @return the absentState
	 */
	public AbsentState getAbsentState() {
		return absentState;
	}

	/**
	 * @param absentState
	 *            the absentState to set
	 */
	public void setAbsentState(AbsentState absentState) {
		this.absentState = absentState;
	}

	/**
	 * @return the regulators
	 */
	public Set<Regulator> getRegulators() {
		return regulators;
	}

	/**
	 * @param regulators
	 *            the regulators to set
	 */
	public void setRegulators(Set<Regulator> regulators) {
		this.regulators = regulators;
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
	 * @return the page
	 */
	public Page getPage() {
		return page;
	}

	/**
	 * @param page
	 *            the page to set
	 */
	public void setPage(Page page) {
		this.page = page;
	}

	public static int getNameMaxLength() {
		return RuntimeAnnotation.getRuntimeAnnotation(Species.class, "name", Column.class).length();
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Species [");
		sb.append("id=").append(this.id);
		sb.append(", name=").append(this.name);
		if (external != null) {
			sb.append(", external=").append(this.external);
		}
		if (absentState != null) {
			sb.append(", absentState=").append(this.absentState.name());
		}
		if (this.model != null) {
			sb.append(", model_id=").append(this.model.getId());
		}
		sb.append("]");
		return sb.toString();
	}
}