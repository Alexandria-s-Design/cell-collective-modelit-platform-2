/**
 * 
 */
package cc.dataaccess;

import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.RegulatorIdentifier;

/**
 * @author Bryan
 *
 */
public class Dominance extends DominanceId {

	private final Regulator negativeRegulator;

	private final RegulatorIdentifier positiveRegulator;

	public Dominance(Regulator negativeRegulator, RegulatorIdentifier positiveRegulator) {
		this.negativeRegulator = negativeRegulator;
		this.positiveRegulator = positiveRegulator;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.DominanceId#getNegativeRegulatorId()
	 */
	@Override
	public long getNegativeRegulatorId() {
		return this.negativeRegulator.getId();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see cc.dataaccess.DominanceId#getPositiveRegulatorId()
	 */
	@Override
	public long getPositiveRegulatorId() {
		return this.positiveRegulator.getId();
	}
}