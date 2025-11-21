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
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

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
@Table(name = "sub_condition")
@SequenceGenerator(name = SubCondition.GENERATOR_NAME,
		sequenceName = SubCondition.SEQUENCE_NAME,
		allocationSize = 1)
@BatchSize(size = 100)
public class SubCondition {

	protected static final String GENERATOR_NAME = "sub_condition" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "sub_condition" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(generator = SubCondition.GENERATOR_NAME)
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
			targetEntity = ConditionIdentifier.class)
	@Cascade({ CascadeType.SAVE_UPDATE })
	@JoinColumn(name = "condition_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_sub_condition_to_condition") )
	private ConditionIdentifier condition;

	@ClientEditableField
	@Column(length = ConditionalConstants.RELATION_LENGTH,
			nullable = true)
	@Enumerated(EnumType.STRING)
	private Relation speciesRelation;

	@JoinTable(name = "sub_condition_species",
			joinColumns = @JoinColumn(name = "sub_condition_id",
					referencedColumnName = "id") ,
			inverseJoinColumns = @JoinColumn(name = "species_id",
					referencedColumnName = "id") )
	@ManyToMany(fetch = FetchType.EAGER)
	@Fetch(FetchMode.SUBSELECT)
	@BatchSize(size = 50)
	private Set<SpeciesIdentifier> species;

	public SubCondition() {
	}

	protected SubCondition(SubCondition subCondition) {
		this.id = subCondition.id;
		this.name = subCondition.name;
		this.type = subCondition.type;
		this.state = subCondition.state;
		this.condition = subCondition.condition;
		this.speciesRelation = subCondition.speciesRelation;
		this.species = subCondition.species;
	}

	public void addSpecies(SpeciesIdentifier speciesIdentifier) {
		if (this.species == null) {
			this.species = new HashSet<>();
		}
		this.species.add(speciesIdentifier);
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
	 * @return the condition
	 */
	public ConditionIdentifier getCondition() {
		return condition;
	}

	/**
	 * @param condition
	 *            the condition to set
	 */
	public void setCondition(ConditionIdentifier condition) {
		this.condition = condition;
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
}