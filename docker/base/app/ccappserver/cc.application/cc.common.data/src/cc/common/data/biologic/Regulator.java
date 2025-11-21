/**
 * 
 */
package cc.common.data.biologic;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;
import cc.common.data.biologic.ConditionalConstants.Relation;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "regulator")
@BatchSize(size = 100)
@SequenceGenerator(name = Regulator.GENERATOR_NAME,
		sequenceName = Regulator.SEQUENCE_NAME,
		allocationSize = 1)
public class Regulator {

	public static enum RegulationType {
		NEGATIVE, POSITIVE
	}

	protected static final String GENERATOR_NAME = "regulator" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "regulator" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = SpeciesIdentifier.class)
	@JoinColumn(name = "species_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_regulator_to_species") )
	private SpeciesIdentifier species;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = SpeciesIdentifier.class)
	@JoinColumn(name = "regulator_species_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_regulator_species_to_species") )
	private SpeciesIdentifier regulatorSpecies;

	@ClientEditableField
	@Column(length = 8,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private RegulationType regulationType;

	@ClientEditableField
	@Column(length = ConditionalConstants.RELATION_LENGTH,
			nullable = true)
	@Enumerated(EnumType.STRING)
	private Relation conditionRelation;

	@OneToMany(mappedBy = "regulator",
			targetEntity = Condition.class,
			fetch = FetchType.EAGER)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<Condition> conditions;

	@JoinTable(name = "dominance",
			joinColumns = @JoinColumn(name = "negative_regulator_id",
					referencedColumnName = "id") ,
			inverseJoinColumns = @JoinColumn(name = "positive_regulator_id",
					referencedColumnName = "id") )
	@ManyToMany(fetch = FetchType.EAGER,
			targetEntity = RegulatorIdentifier.class,
			cascade = javax.persistence.CascadeType.ALL)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<RegulatorIdentifier> dominance;

	@Transient
	private final RegulatorIdentifier identifier = new RegulatorIdentifier(this);

	public Regulator() {
	}

	protected Regulator(Regulator regulator) {
		this.id = regulator.id;
		this.species = regulator.species;
		this.regulatorSpecies = regulator.regulatorSpecies;
		this.regulationType = regulator.regulationType;
		this.conditionRelation = regulator.conditionRelation;
		this.conditions = regulator.conditions;
		this.dominance = regulator.dominance;
	}

	public void addCondition(Condition condition) {
		if (this.conditions == null) {
			this.conditions = new HashSet<>();
		}
		condition.setRegulator(this.identifier);
		this.conditions.add(condition);
	}

	public void addDominance(RegulatorIdentifier regulatorIdentifier) {
		if (this.dominance == null) {
			this.dominance = new HashSet<>();
		}
		this.dominance.add(regulatorIdentifier);
	}

	@JsonIgnore
	public RegulatorIdentifier getRegulatorIdentifier() {
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
	 * @return the regulatorSpecies
	 */
	public SpeciesIdentifier getRegulatorSpecies() {
		return regulatorSpecies;
	}

	/**
	 * @param regulatorSpecies
	 *            the regulatorSpecies to set
	 */
	public void setRegulatorSpecies(SpeciesIdentifier regulatorSpecies) {
		this.regulatorSpecies = regulatorSpecies;
	}

	/**
	 * @return the regulationType
	 */
	public RegulationType getRegulationType() {
		return regulationType;
	}

	/**
	 * @param regulationType
	 *            the regulationType to set
	 */
	public void setRegulationType(RegulationType regulationType) {
		this.regulationType = regulationType;
	}

	/**
	 * @return the conditionRelation
	 */
	public Relation getConditionRelation() {
		return conditionRelation;
	}

	/**
	 * @param conditionRelation
	 *            the conditionRelation to set
	 */
	public void setConditionRelation(Relation conditionRelation) {
		this.conditionRelation = conditionRelation;
	}

	/**
	 * @return the conditions
	 */
	public Set<Condition> getConditions() {
		return conditions;
	}

	/**
	 * @param conditions
	 *            the conditions to set
	 */
	public void setConditions(Set<Condition> conditions) {
		this.conditions = conditions;
	}

	/**
	 * @return the dominance
	 */
	public Set<RegulatorIdentifier> getDominance() {
		return dominance;
	}

	/**
	 * @param dominance
	 *            the dominance to set
	 */
	public void setDominance(Set<RegulatorIdentifier> dominance) {
		this.dominance = dominance;
	}
}