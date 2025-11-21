/**
 * 
 */
package cc.common.data.biologic;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import cc.common.data.biologic.Regulator.RegulationType;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author bkowal
 */
@Entity
@Table(name = "regulator")
public class RegulatorIdentifier {

	private long id;

	private SpeciesIdentifier regulatorSpecies;

	private RegulationType regulationType;

	@JsonIgnore
	private Regulator regulator;

	public RegulatorIdentifier() {
	}

	protected RegulatorIdentifier(Regulator regulator) {
		this.regulator = regulator;
	}

	/**
	 * @return the id
	 */
	@Id
	@GeneratedValue
	public long getId() {
		return (this.regulator == null) ? id : this.regulator.getId();
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the regulatorSpecies
	 */
	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = SpeciesIdentifier.class)
	@JoinColumn(name = "regulator_species_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_regulator_species_to_species") )
	public SpeciesIdentifier getRegulatorSpecies() {
		return (this.regulator == null) ? regulatorSpecies : this.regulator.getRegulatorSpecies();
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
	@Column(length = 8,
			nullable = false)
	@Enumerated(EnumType.STRING)
	public RegulationType getRegulationType() {
		return (this.regulator == null) ? this.regulationType : this.regulator.getRegulationType();
	}

	/**
	 * @param regulationType
	 *            the regulationType to set
	 */
	public void setRegulationType(RegulationType regulationType) {
		this.regulationType = regulationType;
	}

	/**
	 * @return the regulator
	 */
	@Transient
	public Regulator getRegulator() {
		return regulator;
	}

	/**
	 * @param regulator
	 *            the regulator to set
	 */
	public void setRegulator(Regulator regulator) {
		this.regulator = regulator;
	}
}