/**
 * 
 */
package cc.application.main.controller;

import cc.common.data.biologic.Species;

/**
 * @author Bryan Kowal
 *
 */
public class SpeciesMatrixHeader implements Comparable<SpeciesMatrixHeader> {

	private final Long id;

	private final String name;

	public SpeciesMatrixHeader(final Species species) {
		this.id = species.getId();
		this.name = species.getName();
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	@Override
	public int compareTo(SpeciesMatrixHeader other) {
		return name.compareToIgnoreCase(other.name);
	}

	@Override
	public String toString() {
		return name;
	}
}