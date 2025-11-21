/**
 * 
 */
package cc.application.jsbml;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.xml.stream.XMLStreamException;

import org.colomoto.biolqm.io.sbml.SBMLqualImport;
import org.colomoto.mddlib.MDDVariable;
import org.sbml.jsbml.ASTNode;
import org.sbml.jsbml.ASTNode.Type;
import org.sbml.jsbml.ext.qual.Input;

import cc.application.jsbml.response.bool.BooleanAnalysisOperators;

/**
 * @author Bryan Kowal
 *
 */
public class TCCSbmlQualImport extends SBMLqualImport {

	public TCCSbmlQualImport(InputStream in) throws XMLStreamException {
		super(in);
	}

	public TCCSbmlQualImport(File f) throws IOException, XMLStreamException {
		super(f);
	}

	public String mathml2stringExec(ASTNode math, int value) {
		return mathml2string(math, value);
	}

	@Override
	protected String mathml2string(ASTNode math, int value) {
		StringBuffer sb = new StringBuffer();
		mathml2string(math, sb, true);
		return sb.toString();
	}

	private void mathml2string(ASTNode math, StringBuffer sb, boolean start) {

		Type type = math.getType();
		switch (type) {

		case NAME:
			String name = math.getName().trim();
			int threshold = 1;

			Input input = m_curInputs.get(name);
			if (input != null) {
				name = input.getQualitativeSpecies().trim();
				threshold = input.getThresholdLevel();
			}

			if (threshold < 1) {
				// not really a constraint!
				throw new RuntimeException("Inconsistent formula");
			}

			int index = getIndexForName(name);
			MDDVariable var = ddvariables[index];
			if (threshold >= var.nbval) {
				throw new RuntimeException("Invalid threshold in " + input);
			}

			sb.append(var);
			if (threshold > 1) {
				sb.append(var + ":" + threshold);
			}
			return;

		case RELATIONAL_GEQ:
		case RELATIONAL_GT:
		case RELATIONAL_LEQ:
		case RELATIONAL_LT:
		case RELATIONAL_NEQ:
		case RELATIONAL_EQ:
			fillRelationString(math, sb);
			return;

		case CONSTANT_FALSE:
			sb.append("false");
			return;
		case CONSTANT_TRUE:
			sb.append("true");
			return;

		case LOGICAL_NOT:
			if (math.getChildCount() != 1) {
				throw new RuntimeException("Invalid number of children in relation: " + math);
			}

			ASTNode child = math.getChild(0);
			switch (child.getType()) {
			case CONSTANT_FALSE:
				sb.append("true");
				return;
			case CONSTANT_TRUE:
				sb.append("false");
				return;
			case LOGICAL_NOT:
				if (child.getChildCount() != 1) {
					throw new RuntimeException("Invalid number of children in relation: " + math);
				}
				mathml2string(child.getChild(0), sb, false);
				return;
			case NAME:
				sb.append(getLogicalNotOp());
				mathml2string(child, sb, false);
				return;
			default:
				sb.append(getLogicalNotOp() + "(");
				mathml2string(child, sb, false);
				sb.append(")");
			}
			return;
		}

		// now we should have a logical operation or some unrecognised MathML...
		String op = null;
		switch (type) {

		case LOGICAL_AND:
			op = getLogicalAndOp();
			break;

		case LOGICAL_OR:
			op = getLogicalOrOp();
			break;

		default:
			throw new RuntimeException("TODO: support MathML node for: " + math);
		}

		// if we get here, we have a recognised logical operation, hooray!
		// start by recursively identifying children!
		List<ASTNode> children = math.getChildren();
		boolean first = true;
		if (!start && children.size() > 1) {
			sb.append("(");
		}
		for (ASTNode child : children) {
			if (!first) {
				sb.append(op);
			} else {
				first = false;
			}
			mathml2string(child, sb, false);
		}
		if (!start && children.size() > 1) {
			sb.append(")");
		}
	}

	@Override
	protected String getLogicalAndOp() {
		return BooleanAnalysisOperators.AND_OP;
	}

	@Override
	protected String getLogicalOrOp() {
		return BooleanAnalysisOperators.OR_OP;
	}

	@Override
	protected String getLogicalNotOp() {
		return BooleanAnalysisOperators.NOT_OP;
	}
}