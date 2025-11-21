/**
 * 
 */
package cc.common.data.builder;

import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;

import java.util.Set;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.Species.AbsentState;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;
import cc.common.data.biologic.ConditionalConstants.ConditionalState;
import cc.common.data.biologic.ConditionalConstants.ConditionalType;
import cc.common.data.biologic.ConditionalConstants.Relation;
import cc.common.data.biologic.Regulator.RegulationType;
import cc.common.data.biologic.RegulatorIdentifier;

/**
 * @author Bryan
 *
 */
public class BooleanExpressionBuilder {

	public static enum INPUT_SIGN {
		POSITIVE, NEGATIVE, BOTH
	}

	private static final DefaultExpressionCustomizer DEFAULT = new DefaultExpressionCustomizer();

	/**
	 * 
	 */
	protected BooleanExpressionBuilder() {

	}

	public static String buildBooleanExpression(final Species species, Set<String> inputSpecies,
			final Set<Long> inputSpeciesIds) {
		return buildBooleanExpression(species, DEFAULT, inputSpecies, inputSpeciesIds);
	}

	public static String buildBooleanExpression(final Species species, final IExpressionCustomizer expressionCustomizer,
			Set<String> inputSpecies, final Set<Long> inputSpeciesIds) {
		String completeExpression = "";

		/*
		 * Construct the {@link List} of negative {@link Regulator}s and the
		 * {@link List} of positive {@link Regulator}s.
		 */
		Map<Regulator, String> negLogicStatementsMap = buildBooleanExpression(
				buildRegulatorList(species, RegulationType.NEGATIVE), expressionCustomizer, inputSpecies,
				inputSpeciesIds);
		Map<Regulator, String> posLogicStatementsMap = buildBooleanExpression(
				buildRegulatorList(species, RegulationType.POSITIVE), expressionCustomizer, inputSpecies,
				inputSpeciesIds);
		Iterator<Regulator> dominanceIterator = buildDominanceRegulatorList(species).iterator();

		Map<Long, Regulator> regulatorByIdMap = new HashMap<>();
        posLogicStatementsMap.forEach((k,v) -> regulatorByIdMap.put(k.getRegulatorIdentifier().getId(), k)); 
        negLogicStatementsMap.forEach((k,v) -> regulatorByIdMap.put(k.getRegulatorIdentifier().getId(), k)); 
		
		String lastPosNode = "";
		while (dominanceIterator.hasNext()) {
			Regulator dominantRegulator = dominanceIterator.next();
			/*
			 * Examine the {@link Regulator}s the dominant {@link Regulator} is
			 * dominant over.
			 */
			Iterator<RegulatorIdentifier> regulatorIterator = dominantRegulator.getDominance().iterator();
			while (regulatorIterator.hasNext()) {
				Regulator regulator = regulatorByIdMap.get(regulatorIterator.next().getId());
				String posRegulatorExpr = posLogicStatementsMap.get(regulator);
				String negRegulatorExpr = negLogicStatementsMap.get(dominantRegulator);
				lastPosNode  = negRegulatorExpr;
				String updatedExpr = "( " + posRegulatorExpr + " ) " + expressionCustomizer.getAndOperator() + " "
						+ expressionCustomizer.getNotOperator() + " ( " + negRegulatorExpr + " ) ";
				posLogicStatementsMap.replace(regulator, updatedExpr);
			}
		}

		if (posLogicStatementsMap.isEmpty() == false) {
			Iterator<Entry<Regulator, String>> iterator = posLogicStatementsMap.entrySet().iterator();
			boolean first = true;
			while (iterator.hasNext()) {
				Map.Entry<Regulator, String> entry = iterator.next();
				if (first) {
					first = false;
				} else {
					completeExpression += " " + expressionCustomizer.getOrOperator() + " ";
				}
				completeExpression += "( " + entry.getValue() + ") ";
			}
		}

		if (negLogicStatementsMap.isEmpty() == false && posLogicStatementsMap.isEmpty()) {
			String negCompleteExpression = "";
			boolean negContinue = false;			
			negCompleteExpression += " " + expressionCustomizer.getNotOperator() + " ( ";
			Iterator<Entry<Regulator, String>> iterator = negLogicStatementsMap.entrySet().iterator();
			boolean first = true;
			while (iterator.hasNext()) {
				Map.Entry<Regulator, String> entry = iterator.next();
				if (entry.getValue() == lastPosNode) {
					negContinue = true; continue;
				}
				if (first) {
					first = false;
				} else {
					negCompleteExpression += " " + expressionCustomizer.getOrOperator() + " ";
				}
				negCompleteExpression += "( " + entry.getValue() + ") ";
			}
			negCompleteExpression += ")";
			if (negContinue == false && negCompleteExpression != "") {
				if (!posLogicStatementsMap.isEmpty()) {
					completeExpression += expressionCustomizer.getAndOperator();
				}
				completeExpression += negCompleteExpression;
			}
		}

		if (species.getAbsentState() != null && species.getAbsentState() == AbsentState.ON) {
			String activationExpression = " " + expressionCustomizer.getNotOperator() + " ( ";
			Iterator<SpeciesIdentifier> iterator = buildInputSpeciesList(species).iterator();
			boolean first = true;
			while (iterator.hasNext()) {
				if (first) {
					first = false;
				} else {
					activationExpression += " " + expressionCustomizer.getOrOperator() + " ";
				}
				SpeciesIdentifier speciesIdentifier = iterator.next();
				activationExpression += expressionCustomizer.getVariable(speciesIdentifier.getId(),
						speciesIdentifier.getName(), true);
				inputSpecies.add(speciesIdentifier.getName());
				inputSpeciesIds.add(speciesIdentifier.getId());
			}
			activationExpression += " ) ";

			if (completeExpression.isEmpty()) {
				completeExpression = activationExpression;
			} else {
				completeExpression = "( " + completeExpression + " ) " + expressionCustomizer.getOrOperator() + " "
						+ activationExpression;
			}
		}

		if (inputSpecies.isEmpty()) {
			return null;
		}

		return completeExpression;
	}

	public static String buildSBMLBooleanExpression(final Species species,
			final IExpressionCustomizer expressionCustomizer, Map<SpeciesIdentifier, INPUT_SIGN> inputSpeciesMap) {
		String completeExpression = "";

		/*
		 * Construct the {@link List} of negative {@link Regulator}s and the
		 * {@link List} of positive {@link Regulator}s.
		 */
		Map<Regulator, String> negLogicStatementsMap = buildSBMLBooleanExpression(
				buildRegulatorList(species, RegulationType.NEGATIVE), expressionCustomizer, inputSpeciesMap, true);
		Map<Regulator, String> posLogicStatementsMap = buildSBMLBooleanExpression(
				buildRegulatorList(species, RegulationType.POSITIVE), expressionCustomizer, inputSpeciesMap, false);

		Map<Long, Regulator> regulatorByIdMap = new HashMap<>();
        posLogicStatementsMap.forEach((k,v) -> regulatorByIdMap.put(k.getRegulatorIdentifier().getId(), k)); 
        negLogicStatementsMap.forEach((k,v) -> regulatorByIdMap.put(k.getRegulatorIdentifier().getId(), k)); 
		
		Iterator<Regulator> dominanceIterator = buildDominanceRegulatorList(species).iterator();
		Map<Regulator, String> positiveRegulatorToDominanceExprMap = new HashMap<>();
		final Map<Regulator, Integer> speciesToDominanceCount = new HashMap<>();

		String lastPosNode = "";
		while (dominanceIterator.hasNext()) {
			Regulator dominantRegulator = dominanceIterator.next();
			/*
			 * Examine the {@link Regulator}s the dominant {@link Regulator} is
			 * dominant over.
			 */
			Iterator<RegulatorIdentifier> regulatorIterator = dominantRegulator.getDominance().iterator();
			while (regulatorIterator.hasNext()) {
				Regulator regulator = regulatorByIdMap.get(regulatorIterator.next().getId());
				String posRegulatorDominanceExpr = positiveRegulatorToDominanceExprMap.get(regulator);
				if (posRegulatorDominanceExpr == null) {
					posRegulatorDominanceExpr = "";
					speciesToDominanceCount.put(regulator, 0);
				}
				String negRegulatorExpr = negLogicStatementsMap.get(dominantRegulator);
				lastPosNode = negRegulatorExpr;

				if (!posRegulatorDominanceExpr.isEmpty()) {
					posRegulatorDominanceExpr = posRegulatorDominanceExpr.trim();
					posRegulatorDominanceExpr += " " + expressionCustomizer.getOrOperator() + " ";
				}
				posRegulatorDominanceExpr += negRegulatorExpr.trim();
				positiveRegulatorToDominanceExprMap.put(regulator, posRegulatorDominanceExpr);
				int count = speciesToDominanceCount.get(regulator);
				++count;
				speciesToDominanceCount.put(regulator, count);
			}
		}
		if (MapUtils.isNotEmpty(speciesToDominanceCount)) {
			for (Entry<Regulator, Integer> entry : speciesToDominanceCount.entrySet()) {
				if (entry.getValue().intValue() <= 1) {
					continue;
				}
				final Regulator posRegulator = entry.getKey();
				String posRegulatorDominanceExpr = positiveRegulatorToDominanceExprMap.get(posRegulator);
				posRegulatorDominanceExpr = posRegulatorDominanceExpr.trim();
				posRegulatorDominanceExpr = "(" + posRegulatorDominanceExpr + ")";
				positiveRegulatorToDominanceExprMap.put(posRegulator, posRegulatorDominanceExpr);
			}
		}

		if (MapUtils.isNotEmpty(positiveRegulatorToDominanceExprMap)) {
			for (Entry<Regulator, String> entry : positiveRegulatorToDominanceExprMap.entrySet()) {
				final Regulator posRegulator = entry.getKey();
				String posRegulatorDominanceExpr = entry.getValue().trim();
				if (!posRegulatorDominanceExpr.startsWith("(") && !posRegulatorDominanceExpr.endsWith(")")) {
					posRegulatorDominanceExpr = "(" + posRegulatorDominanceExpr + ")";
				}
				posRegulatorDominanceExpr = posRegulatorDominanceExpr.trim();
				String posRegulatorExpr = "(" + posLogicStatementsMap.get(posRegulator).trim() + " "
						+ expressionCustomizer.getAndOperator() + " " + expressionCustomizer.getNotOperator() + " "
						+ posRegulatorDominanceExpr + ")";

				posLogicStatementsMap.put(posRegulator, posRegulatorExpr);
			}
		}

		if (posLogicStatementsMap.isEmpty() == false) {
			Iterator<Entry<Regulator, String>> iterator = posLogicStatementsMap.entrySet().iterator();
			boolean first = true;
			while (iterator.hasNext()) {
				Map.Entry<Regulator, String> entry = iterator.next();
				if (first) {
					first = false;
				} else {
					completeExpression = completeExpression.trim();
					completeExpression += " " + expressionCustomizer.getOrOperator() + " ";
				}
				completeExpression += "( " + entry.getValue() + ") ";
			}
		} 
		
		if (negLogicStatementsMap.isEmpty() == false && posLogicStatementsMap.isEmpty()){
			String negCompleteExpression = "";
			boolean negContinue = false;			
			negCompleteExpression += " " + expressionCustomizer.getNotOperator() + " (";
			Iterator<Entry<Regulator, String>> iterator = negLogicStatementsMap.entrySet().iterator();
			boolean first = true;
			while (iterator.hasNext()) {
				Map.Entry<Regulator, String> entry = iterator.next();
				if (entry.getValue() == lastPosNode) {
					negContinue = true;
					continue;
				}
				if (first) {
					first = false;
				} else {
					negCompleteExpression += " " + expressionCustomizer.getOrOperator() + " ";
				}
				negCompleteExpression += "( " + entry.getValue() + ") ";
			}
			negCompleteExpression += ")";
			if (negContinue == false && negCompleteExpression != "") {
				if (!posLogicStatementsMap.isEmpty()) {
					completeExpression += expressionCustomizer.getAndOperator();
				}
				completeExpression += negCompleteExpression;
			}
		}
		if (species.getAbsentState() != null && species.getAbsentState() == AbsentState.ON) {
			String activationExpression = " NOT (";
			Iterator<SpeciesIdentifier> iterator = buildInputSpeciesList(species).iterator();
			boolean first = true;
			while (iterator.hasNext()) {
				if (first) {
					first = false;
				} else {
					activationExpression += " " + expressionCustomizer.getOrOperator() + " ";
				}

				SpeciesIdentifier speciesIdentifier = iterator.next();
				activationExpression += expressionCustomizer.getVariable(speciesIdentifier.getId(),
						speciesIdentifier.getName(), true);
			}
			activationExpression += ")";

			if (completeExpression.isEmpty()) {
				completeExpression = activationExpression;
			} else {
				completeExpression = completeExpression.trim() + " " + expressionCustomizer.getOrOperator()
						+ activationExpression;
			}
		}
		
		buildSBMLInputSpeciesList(species, inputSpeciesMap);

		if (inputSpeciesMap.isEmpty()) {
			return null;
		}

		return completeExpression;
	}

	private static Map<Regulator, String> buildBooleanExpression(List<Regulator> regulators,
			final IExpressionCustomizer expressionCustomizer, Set<String> inputSpecies,
			final Set<Long> inputSpeciesIds) {
		if (regulators.isEmpty()) {
			return Collections.emptyMap();
		}

		Map<Regulator, String> logicStatementsMap = new HashMap<>(regulators.size(), 1.0f);
		String completeExpression = "";
		Iterator<Regulator> regulatorIterator = regulators.iterator();
		while (regulatorIterator.hasNext()) {
			completeExpression = "";
			Regulator regulator = regulatorIterator.next();
			completeExpression += expressionCustomizer.getVariable(
					regulator.getRegulatorSpecies().getId(),
					regulator.getRegulatorSpecies().getName(),
					(regulator.getRegulationType() == RegulationType.POSITIVE)) + " ";
			inputSpecies.add(regulator.getRegulatorSpecies().getName());
			inputSpeciesIds.add(regulator.getRegulatorSpecies().getId());
			if (regulator.getConditions() != null && regulator.getConditions().isEmpty() == false) {
				completeExpression += expressionCustomizer.getAndOperator() + " ( ";
				Iterator<Condition> conditionIterator = regulator.getConditions().iterator();
				boolean firstCondition = true;
				String conditionRelationOperator = expressionCustomizer.getOrOperator();
				if (regulator.getConditionRelation() != null) {
					conditionRelationOperator = (regulator.getConditionRelation() == Relation.AND)
							? expressionCustomizer.getAndOperator() : expressionCustomizer.getOrOperator();
				}
				while (conditionIterator.hasNext()) {
					if (firstCondition) {
						firstCondition = false;
					} else {
						completeExpression += " " + conditionRelationOperator + " ";
					}
					boolean addNotFlagCon = false;
					completeExpression += "( ";
					Condition condition = conditionIterator.next();
					if ((condition.getState() == ConditionalState.ON && condition.getType() == ConditionalType.UNLESS)
							|| (condition.getState() == ConditionalState.OFF
									&& condition.getType() == ConditionalType.IF_WHEN)) {
						addNotFlagCon = true;
					}
					if (condition.getSpecies() != null && condition.getSpecies().isEmpty() == false) {
						completeExpression += "( ";
						Iterator<SpeciesIdentifier> speciesIterator = condition.getSpecies().iterator();
						boolean first = true;
						String speciesRelationOperator = expressionCustomizer.getOrOperator();
						if (condition.getSpeciesRelation() != null) {
							speciesRelationOperator = (condition.getSpeciesRelation() == Relation.AND)
									? expressionCustomizer.getAndOperator() : expressionCustomizer.getOrOperator();
						}
						while (speciesIterator.hasNext()) {
							if (first) {
								first = false;
							} else {
								completeExpression += " " + speciesRelationOperator + " ";
							}
							if (addNotFlagCon) {
								completeExpression += expressionCustomizer.getNotOperator() + " ";
							}
							SpeciesIdentifier conditionSpeciesIdentifier = speciesIterator.next();
							completeExpression += expressionCustomizer.getVariable(conditionSpeciesIdentifier.getId(),
									conditionSpeciesIdentifier.getName(), (condition.getState() == ConditionalState.ON))
									+ " ";
							inputSpecies.add(conditionSpeciesIdentifier.getName());
							inputSpeciesIds.add(conditionSpeciesIdentifier.getId());
						}
						completeExpression += ") ";
					}
					if (condition.getSubConditions() != null && condition.getSubConditions().isEmpty() == false) {
						Iterator<SubCondition> subConditionIterator = condition.getSubConditions().iterator();
						completeExpression += " " + expressionCustomizer.getAndOperator() + " ( ";
						boolean firstSubCondition = true;
						String subConditionRelationOperator = expressionCustomizer.getOrOperator();
						if (condition.getSubConditionRelation() != null) {
							subConditionRelationOperator = (condition.getSubConditionRelation() == Relation.AND)
									? expressionCustomizer.getAndOperator() : expressionCustomizer.getOrOperator();
						}
						while (subConditionIterator.hasNext()) {
							if (firstSubCondition) {
								firstSubCondition = false;
							} else {
								completeExpression += " " + subConditionRelationOperator + " ";
							}
							boolean addNotFlagSubCon = false;
							completeExpression += " ( ";
							SubCondition subCondition = subConditionIterator.next();
							if ((subCondition.getState() == ConditionalState.ON
									&& subCondition.getType() == ConditionalType.UNLESS)
									|| (subCondition.getState() == ConditionalState.OFF
											&& subCondition.getType() == ConditionalType.IF_WHEN)) {
								addNotFlagSubCon = true;
							}
							if (subCondition.getSpecies() != null && subCondition.getSpecies().isEmpty() == false) {
								completeExpression += "( ";
								Iterator<SpeciesIdentifier> speciesIterator = subCondition.getSpecies().iterator();
								boolean first = true;
								String speciesRelationOperator = expressionCustomizer.getOrOperator();
								if (subCondition.getSpeciesRelation() != null) {
									speciesRelationOperator = (subCondition.getSpeciesRelation() == Relation.AND)
											? expressionCustomizer.getAndOperator()
											: expressionCustomizer.getOrOperator();
								}
								while (speciesIterator.hasNext()) {
									if (first) {
										first = false;
									} else {
										completeExpression += " " + speciesRelationOperator + " ";
									}
									if (addNotFlagSubCon) {
										completeExpression += expressionCustomizer.getNotOperator() + " ";
									}
									SpeciesIdentifier conditionSpeciesIdentifier = speciesIterator.next();
									completeExpression += expressionCustomizer.getVariable(
											conditionSpeciesIdentifier.getId(), conditionSpeciesIdentifier.getName(),
											(subCondition.getState() == ConditionalState.ON)) + " ";
									inputSpecies.add(conditionSpeciesIdentifier.getName());
									inputSpeciesIds.add(conditionSpeciesIdentifier.getId());
								} // sub-conditions species iteration
								completeExpression += ") ";
							} // sub-condition species if
							completeExpression += ") ";
						} // sub-conditions iteration
						completeExpression += ") ";
					} // sub-conditions if
					completeExpression += ") ";
				} // conditions iteration
				completeExpression += ")    ";
			} // conditions if
			logicStatementsMap.put(regulator, completeExpression);
		} // regulators iteration

		return logicStatementsMap;
	}

	private static Map<Regulator, String> buildSBMLBooleanExpression(List<Regulator> regulators,
			final IExpressionCustomizer expressionCustomizer, Map<SpeciesIdentifier, INPUT_SIGN> inputSpeciesMap,
			final boolean wrappedNot) {
		if (regulators.isEmpty()) {
			return Collections.emptyMap();
		}

		Map<Regulator, String> logicStatementsMap = new HashMap<>(regulators.size(), 1.0f);
		String completeExpression = "";
		Iterator<Regulator> regulatorIterator = regulators.iterator();
		while (regulatorIterator.hasNext()) {
			completeExpression = "";
			Regulator regulator = regulatorIterator.next();
			final boolean hasConditions = CollectionUtils.isNotEmpty(regulator.getConditions());
			final boolean hasMultipleConditions = hasConditions && (regulator.getConditions().size() > 1);
			boolean regulatorActive = (regulator.getRegulationType() == RegulationType.POSITIVE);
			if (wrappedNot) {
				regulatorActive = !regulatorActive;
			}
			if (hasConditions) {
				completeExpression = completeExpression.trim();
				completeExpression += " (";
			}
			completeExpression += expressionCustomizer.getVariable(regulator.getRegulatorSpecies().getId(),
					regulator.getRegulatorSpecies().getName(), regulatorActive) + " ";
			if (hasConditions) {
				completeExpression = completeExpression.trim();
				completeExpression += " " + expressionCustomizer.getAndOperator() + " ";
			}
			if (hasMultipleConditions) {
				completeExpression = completeExpression.trim();
				completeExpression += " ((";
			}
			if (regulator.getConditions() != null && regulator.getConditions().isEmpty() == false) {
				Iterator<Condition> conditionIterator = regulator.getConditions().iterator();
				boolean firstCondition = true;
				String conditionRelationOperator = expressionCustomizer.getOrOperator();
				if (regulator.getConditionRelation() != null) {
					conditionRelationOperator = (regulator.getConditionRelation() == Relation.AND)
							? expressionCustomizer.getAndOperator() : expressionCustomizer.getOrOperator();
				}
				while (conditionIterator.hasNext()) {
					if (firstCondition) {
						firstCondition = false;
					} else {
						completeExpression = completeExpression.trim();
						completeExpression += ") " + conditionRelationOperator + " (";
					}
					boolean addNotFlagCon = false;
					Condition condition = conditionIterator.next();
					if ((condition.getState() == ConditionalState.ON && condition.getType() == ConditionalType.UNLESS)
							|| (condition.getState() == ConditionalState.OFF
									&& condition.getType() == ConditionalType.IF_WHEN)) {
						addNotFlagCon = true;
					}
					if (condition.getSpecies() != null && condition.getSpecies().isEmpty() == false) {
						Iterator<SpeciesIdentifier> speciesIterator = condition.getSpecies().iterator();
						boolean first = true;
						String speciesRelationOperator = expressionCustomizer.getOrOperator();
						if (condition.getSpeciesRelation() != null) {
							speciesRelationOperator = (condition.getSpeciesRelation() == Relation.AND)
									? expressionCustomizer.getAndOperator() : expressionCustomizer.getOrOperator();
						}
						final boolean multipleSpecies = (condition.getSpecies().size() > 1);
						if (multipleSpecies) {
							completeExpression = completeExpression.trim();
							if (!completeExpression.endsWith("(")) {
								completeExpression += " ";
							}
							completeExpression += "(";
						}
						while (speciesIterator.hasNext()) {
							if (first) {
								first = false;
							} else {
								completeExpression = completeExpression.trim();
								completeExpression += " " + speciesRelationOperator + " ";
							}
							if (addNotFlagCon) {
								completeExpression = completeExpression.trim();
								completeExpression += " " + expressionCustomizer.getNotOperator() + " (";
							}
							boolean conditionActive = !addNotFlagCon;
							if (addNotFlagCon) {
								conditionActive = !conditionActive;
							}
							final SpeciesIdentifier conditionSpeciesIdentifier = speciesIterator.next();
							completeExpression += expressionCustomizer.getVariable(conditionSpeciesIdentifier.getId(),
									conditionSpeciesIdentifier.getName(), conditionActive) + " ";
							if (addNotFlagCon) {
								completeExpression = completeExpression.trim();
								completeExpression += ")";
							}
						}
						if (multipleSpecies) {
							completeExpression = completeExpression.trim();
							completeExpression += ")";
						}
					}

					final boolean hasSubConditions = CollectionUtils.isNotEmpty(condition.getSubConditions());
					final boolean hasMultipleSubConditions = hasSubConditions
							&& (condition.getSubConditions().size() > 1);
					if (hasSubConditions) {
						completeExpression = completeExpression.trim();
						completeExpression += " " + expressionCustomizer.getAndOperator() + " ";
					}
					if (hasMultipleSubConditions) {
						completeExpression = completeExpression.trim();
						completeExpression += " ((";
					}
					if (condition.getSubConditions() != null && condition.getSubConditions().isEmpty() == false) {
						Iterator<SubCondition> subConditionIterator = condition.getSubConditions().iterator();
						boolean firstSubCondition = true;
						String subConditionRelationOperator = expressionCustomizer.getOrOperator();
						if (condition.getSubConditionRelation() != null) {
							subConditionRelationOperator = (condition.getSubConditionRelation() == Relation.AND)
									? expressionCustomizer.getAndOperator() : expressionCustomizer.getOrOperator();
						}
						while (subConditionIterator.hasNext()) {
							if (firstSubCondition) {
								firstSubCondition = false;
							} else {
								completeExpression = completeExpression.trim();
								completeExpression += ") " + subConditionRelationOperator + "( ";
							}
							boolean addNotFlagSubCon = false;
							SubCondition subCondition = subConditionIterator.next();
							if ((subCondition.getState() == ConditionalState.ON
									&& subCondition.getType() == ConditionalType.UNLESS)
									|| (subCondition.getState() == ConditionalState.OFF
											&& subCondition.getType() == ConditionalType.IF_WHEN)) {
								addNotFlagSubCon = true;
							}
							if (subCondition.getSpecies() != null && subCondition.getSpecies().isEmpty() == false) {
								Iterator<SpeciesIdentifier> speciesIterator = subCondition.getSpecies().iterator();
								boolean first = true;
								String speciesRelationOperator = expressionCustomizer.getOrOperator();
								if (subCondition.getSpeciesRelation() != null) {
									speciesRelationOperator = (subCondition.getSpeciesRelation() == Relation.AND)
											? expressionCustomizer.getAndOperator()
											: expressionCustomizer.getOrOperator();
								}
								final boolean multipleSpecies = (subCondition.getSpecies().size() > 1);
								if (multipleSpecies) {
									completeExpression = completeExpression.trim();
									if (!completeExpression.endsWith("(")) {
										completeExpression += " ";
									}
									completeExpression += "(";
								}
								while (speciesIterator.hasNext()) {
									if (first) {
										first = false;
									} else {
										completeExpression = completeExpression.trim();
										completeExpression += " " + speciesRelationOperator + " ";
									}
									if (addNotFlagSubCon) {
										completeExpression = completeExpression.trim();
										completeExpression += " " + expressionCustomizer.getNotOperator() + " (";
									}
									boolean subConditionActive = !addNotFlagSubCon;
									if (addNotFlagSubCon) {
										subConditionActive = !subConditionActive;
									}
									final SpeciesIdentifier subConditionSpeciesIdentifier = speciesIterator.next();
									completeExpression += expressionCustomizer.getVariable(
											subConditionSpeciesIdentifier.getId(),
											subConditionSpeciesIdentifier.getName(), subConditionActive) + " ";
									if (addNotFlagSubCon) {
										completeExpression = completeExpression.trim();
										completeExpression += ")";
									}
								} // sub-conditions species iteration
								if (multipleSpecies) {
									completeExpression = completeExpression.trim();
									completeExpression += ")";
								}
							} // sub-condition species if
						} // sub-conditions iteration
					} // sub-conditions if
					if (hasMultipleSubConditions) {
						completeExpression = completeExpression.trim();
						completeExpression += "))";
					}
				} // conditions iteration
			} // conditions if
			if (hasMultipleConditions) {
				completeExpression = completeExpression.trim();
				completeExpression += "))";
			}
			if (hasConditions) {
				completeExpression = completeExpression.trim();
				completeExpression += ")";
			}
			//ensure not any exceeded operators
			completeExpression = completeExpression.replaceAll("\\s*\\b(AND|NOT|OR)\\)", ")");
			logicStatementsMap.put(regulator, completeExpression);
		} // regulators iteration

		return logicStatementsMap;
	}

	// http://helikarlab.org/redmine/projects/thecellcollective/repository/entry/trunk2/cc.service.business.model.biologic/src/cc/service/business/model/biologic/BusinessBiologicBuilderService.java

	private static List<Regulator> buildRegulatorList(final Species species, final RegulationType regulationType) {
		if (species.getRegulators() == null || species.getRegulators().isEmpty()) {
			return Collections.emptyList();
		}

		List<Regulator> regulators = new ArrayList<>(species.getRegulators().size());
		for (Regulator regulator : species.getRegulators()) {
			if (regulator.getRegulationType() == regulationType) {
				regulators.add(regulator);
			}
		}

		return regulators;
	}

	private static List<Regulator> buildDominanceRegulatorList(final Species species) {
		if (species.getRegulators() == null || species.getRegulators().isEmpty()) {
			return Collections.emptyList();
		}

		List<Regulator> regulators = new ArrayList<>(species.getRegulators().size());
		for (Regulator regulator : species.getRegulators()) {
			if (regulator.getDominance() != null && !regulator.getDominance().isEmpty()) {
				regulators.add(regulator);
			}
		}
		return regulators;
	}

	public static Set<SpeciesIdentifier> buildInputSpeciesList(final Species species) {
		if (species.getRegulators() == null || species.getRegulators().isEmpty()) {
			return Collections.emptySet();
		}

		Set<SpeciesIdentifier> inputSpecies = new HashSet<>();
		for (Regulator regulator : species.getRegulators()) {
			inputSpecies.add(regulator.getRegulatorSpecies());
			if (regulator.getConditions() != null && regulator.getConditions().isEmpty() == false) {
				for (Condition condition : regulator.getConditions()) {
					inputSpecies.addAll(condition.getSpecies());
					if (condition.getSubConditions() != null && condition.getSubConditions().isEmpty() == false) {
						for (SubCondition subCondition : condition.getSubConditions()) {
							inputSpecies.addAll(subCondition.getSpecies());
						}
					}
				}
			}
		}
		return inputSpecies;
	}

	public static void buildSBMLInputSpeciesList(final Species species,
			Map<SpeciesIdentifier, INPUT_SIGN> inputSpeciesMap) {
		if (species.getRegulators() == null || species.getRegulators().isEmpty()) {
			return;
		}

		for (Regulator regulator : species.getRegulators()) {
			INPUT_SIGN regulatorSign = (regulator.getRegulationType() == RegulationType.POSITIVE) ? INPUT_SIGN.POSITIVE
					: INPUT_SIGN.NEGATIVE;
			updateInputMap(inputSpeciesMap, regulator.getRegulatorSpecies(), regulatorSign);
			if (regulator.getConditions() != null && regulator.getConditions().isEmpty() == false) {
				for (Condition condition : regulator.getConditions()) {
					INPUT_SIGN conditionSign = (condition.getState() == ConditionalState.ON) ? INPUT_SIGN.POSITIVE
							: INPUT_SIGN.NEGATIVE;
					for (SpeciesIdentifier conditionSpecies : condition.getSpecies()) {
						updateInputMap(inputSpeciesMap, conditionSpecies, conditionSign);
					}
					if (condition.getSubConditions() != null && condition.getSubConditions().isEmpty() == false) {
						for (SubCondition subCondition : condition.getSubConditions()) {
							INPUT_SIGN subConditionSign = (subCondition.getState() == ConditionalState.ON)
									? INPUT_SIGN.POSITIVE : INPUT_SIGN.NEGATIVE;
							for (SpeciesIdentifier subConditionSpecies : subCondition.getSpecies()) {
								updateInputMap(inputSpeciesMap, subConditionSpecies, subConditionSign);
							}
						}
					}
				}
			}
		}
	}

	private static void updateInputMap(Map<SpeciesIdentifier, INPUT_SIGN> inputSpeciesMap, SpeciesIdentifier input,
			INPUT_SIGN inputSign) {
		INPUT_SIGN currentInputSign = inputSpeciesMap.get(input);
		if (currentInputSign == null) {
			inputSpeciesMap.put(input, inputSign);
			return;
		} else if (currentInputSign != INPUT_SIGN.BOTH && currentInputSign != inputSign) {
			/*
			 * The Species has both a positive influence and a negative
			 * influence.
			 */
			inputSpeciesMap.put(input, INPUT_SIGN.BOTH);
		}
	}
}