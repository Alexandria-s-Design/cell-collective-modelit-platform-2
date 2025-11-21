package cc.application.jsbml;

import org.colomoto.biolqm.LogicalModel;
import org.colomoto.mddlib.MDDManager;
import org.colomoto.mddlib.MDDVariable;
import org.colomoto.mddlib.PathSearcher;

import cc.application.jsbml.response.bool.BooleanAnalysisOperators;

import java.util.Map;

/**
 * Export logical model into a raw list of functions.
 * 
 * @author Aurelien Naldi
 */
public class BooleanNetExport {

	private static final String LEFT_PAREN = "(";

	private static final String RIGHT_PAREN = ")";

	/**
	 * Export a logical model into logical functions.
	 *
	 * @param model
	 * @param out
	 * @throws java.io.IOException
	 */
	public static void export(LogicalModel model, Map<String, String> functionMap) {
		MDDManager ddmanager = model.getMDDManager();
		MDDVariable[] variables = ddmanager.getAllVariables();
		PathSearcher searcher = new PathSearcher(ddmanager);

		int[] functions = model.getLogicalFunctions();
		for (int idx = 0; idx < functions.length; idx++) {
			MDDVariable var = variables[idx];

			int function = functions[idx];

			// directly write fixed values
			if (ddmanager.isleaf(function)) {
				/*
				 * Variable has been set equal to itself.
				 */
				functionMap.put(var.toString(), Integer.toString(function));
				continue;
			}

			// write a normalised logical function if the value is not fixed
			int[] path = searcher.setNode(function);
			boolean first = true;
			boolean multiple = false;
			StringBuffer funcBuffer = new StringBuffer();
			for (int leaf : searcher) {
				if (leaf == 0) {
					continue;
				}

				if (!first) {
					funcBuffer.append(RIGHT_PAREN).append(BooleanAnalysisOperators.OR_OP).append(LEFT_PAREN);
					multiple = true;
				} else {
					first = false;
				}

				// write each constraint
				boolean andFirst = true;
				for (int i = 0; i < path.length; i++) {
					int cst = path[i];
					if (cst < 0) {
						continue;
					}

					if (!andFirst) {
						funcBuffer.append(BooleanAnalysisOperators.AND_OP);
					}

					if (cst == 0) {
						funcBuffer.append(BooleanAnalysisOperators.NOT_OP).append(variables[i].key);
					} else {
						// FIXME: adapt for multivalued
						funcBuffer.append(variables[i].key.toString());
					}
					andFirst = false;
				}
			}
			if (multiple) {
				functionMap.put(var.toString(), "(" + funcBuffer.toString() + ")");
			} else {
				functionMap.put(var.toString(), funcBuffer.toString());
			}
		}
	}
}