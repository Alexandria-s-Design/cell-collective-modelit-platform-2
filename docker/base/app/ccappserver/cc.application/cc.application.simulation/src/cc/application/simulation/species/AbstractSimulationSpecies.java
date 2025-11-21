/**
 * 
 */
package cc.application.simulation.species;

import java.util.Set;

import cc.common.data.simulation.SpeciesMutation;

/**
 * @author Bryan
 *
 */
public abstract class AbstractSimulationSpecies {

	private final String name;

	private Set<String> inputSpecies;

	private Set<Long> inputSpeciesIds;

	private String expression;

	protected boolean previousState;

	protected boolean currentState;

	private SpeciesMutation mutation;

	protected int timeStep;

	public AbstractSimulationSpecies(final String name, final Set<String> inputSpecies, Set<Long> inputSpeciesIds,
			String expression, SpeciesMutation mutation) {
		this.name = name;
		this.inputSpecies = inputSpecies;
		this.inputSpeciesIds = inputSpeciesIds;
		this.expression = expression;
		this.mutation = mutation;
		this.timeStep = 0;
	}

	public boolean isExternalSpecies() {
		return (this.expression == null);
	}

	public abstract boolean isCurrent(int timeStep);

	public void setInitialState(boolean state) {
		this.previousState = state;
		this.currentState = state;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @return the inputSpecies
	 */
	public Set<String> getInputSpecies() {
		return inputSpecies;
	}

	public Set<Long> getInputSpeciesIds() {
		return inputSpeciesIds;
	}

	/**
	 * @return the expression
	 */
	public String getExpression() {
		return expression;
	}

	/**
	 * @param expression
	 *            the expression to set
	 */
	public void setExpression(String expression) {
		this.expression = expression;
	}

	public void setCurrentState(boolean state, int timeStep) {
		this.currentState = state;
		this.timeStep = timeStep;
	}

	public boolean getCurrentState() {
		return this.currentState;
	}

	public boolean getPreviousState() {
		return this.previousState;
	}

	/**
	 * @param mutation
	 *            the mutation to set
	 */
	public void setMutation(SpeciesMutation mutation) {
		this.mutation = mutation;
	}

	/**
	 * @return the mutation
	 */
	public SpeciesMutation getMutation() {
		return mutation;
	}

	/**
	 * @return the timeStep
	 */
	public int getTimeStep() {
		return timeStep;
	}
}