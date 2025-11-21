/**
 * 
 */
package cc.application.jsbml;

import cc.common.data.model.Model;

/**
 * @author Bryan Kowal
 */
public class SBMLExportException extends Exception {

	private static final long serialVersionUID = 2956597518964034255L;

	private static final String MESSAGE_FMT = "Failed to complete SBML Generation for Model: %s.";

	public SBMLExportException(final Model model, Throwable e) {
		super(String.format(MESSAGE_FMT, model.getModelIdentifier().toString()), e);
	}
}