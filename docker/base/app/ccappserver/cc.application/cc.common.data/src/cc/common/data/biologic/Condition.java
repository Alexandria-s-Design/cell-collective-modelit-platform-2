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
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;
import cc.common.data.biologic.ConditionalConstants.ConditionalState;
import cc.common.data.biologic.ConditionalConstants.ConditionalType;
import cc.common.data.biologic.ConditionalConstants.Relation;

/**
 * @author bkowal
 *
 */
@Entity
@Table(name = "[condition]")
@SequenceGenerator(name = Condition.GENERATOR_NAME,
		sequenceName = Condition.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class Condition {

	protected static final String GENERATOR_NAME = "condition" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "condition" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@ClientEditableField
	@Column(length = 60,
			nullable = true)
	private String name;

	@ClientEditableField
	@Column(length = ConditionalConstants.CONDITIONAL_TYPE_LENGTH,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private ConditionalType type;

	@ClientEditableField
	@Column(length = ConditionalConstants.CONDITIONAL_STATE_LENGTH,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private ConditionalState state;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = RegulatorIdentifier.class)
	@Cascade({ CascadeType.SAVE_UPDATE })
	@JoinColumn(name = "regulator_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_condition_to_regulator") )
	private RegulatorIdentifier regulator;

	@ClientEditableField
	@Column(length = ConditionalConstants.RELATION_LENGTH,
			nullable = true)
	@Enumerated(EnumType.STRING)
	private Relation speciesRelation;

	@JoinTable(name = "condition_species",
			joinColumns = @JoinColumn(name = "condition_id",
					referencedColumnName = "id") ,
			inverseJoinColumns = @JoinColumn(name = "species_id",
					referencedColumnName = "id") )
	@ManyToMany(fetch = FetchType.EAGER)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<SpeciesIdentifier> species;

	@ClientEditableField
	@Column(length = ConditionalConstants.RELATION_LENGTH,
			nullable = true)
	@Enumerated(EnumType.STRING)
	private Relation subConditionRelation;

	@OneToMany(mappedBy = "condition",
			targetEntity = SubCondition.class,
			fetch = FetchType.EAGER)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<SubCondition> subConditions;

	@Transient
	private final ConditionIdentifier identifier = new ConditionIdentifier(this);

	public Condition() {
	}

	protected Condition(Condition condition) {
		this.id = condition.id;
		this.name = condition.name;
		this.type = condition.type;
		this.state = condition.state;
		this.regulator = condition.regulator;
		this.speciesRelation = condition.speciesRelation;
		this.species = condition.species;
		this.subConditionRelation = condition.subConditionRelation;
		this.subConditions = condition.subConditions;
	}

	@JsonIgnore
	public ConditionIdentifier getConditionIdentifier() {
		return this.identifier;
	}

	public void addSpecies(SpeciesIdentifier speciesIdentifier) {
		if (this.species == null) {
			this.species = new HashSet<>();
		}
		this.species.add(speciesIdentifier);
	}

	public void addSubCondition(SubCondition subCondition) {
		if (this.subConditions == null) {
			this.subConditions = new HashSet<>();
		}
		subCondition.setCondition(identifier);
		this.subConditions.add(subCondition);
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
	 * @return the type
	 */
	public ConditionalType getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(ConditionalType type) {
		this.type = type;
	}

	/**
	 * @return the state
	 */
	public ConditionalState getState() {
		return state;
	}

	/**
	 * @param state
	 *            the state to set
	 */
	public void setState(ConditionalState state) {
		this.state = state;
	}

	/**
	 * @return the regulator
	 */
	public RegulatorIdentifier getRegulator() {
		return regulator;
	}

	/**
	 * @param regulator
	 *            the regulator to set
	 */
	public void setRegulator(RegulatorIdentifier regulator) {
		this.regulator = regulator;
	}

	/**
	 * @return the speciesRelation
	 */
	public Relation getSpeciesRelation() {
		return speciesRelation;
	}

	/**
	 * @param speciesRelation
	 *            the speciesRelation to set
	 */
	public void setSpeciesRelation(Relation speciesRelation) {
		this.speciesRelation = speciesRelation;
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

	/**
	 * @return the subConditionRelation
	 */
	public Relation getSubConditionRelation() {
		return subConditionRelation;
	}

	/**
	 * @param subConditionRelation
	 *            the subConditionRelation to set
	 */
	public void setSubConditionRelation(Relation subConditionRelation) {
		this.subConditionRelation = subConditionRelation;
	}

	/**
	 * @return the subConditions
	 */
	public Set<SubCondition> getSubConditions() {
		return subConditions;
	}

	/**
	 * @param subConditions
	 *            the subConditions to set
	 */
	public void setSubConditions(Set<SubCondition> subConditions) {
		this.subConditions = subConditions;
	}
}