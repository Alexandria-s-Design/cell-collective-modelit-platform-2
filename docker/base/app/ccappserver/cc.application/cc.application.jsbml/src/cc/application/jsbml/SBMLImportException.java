/**
 * 
 */
package cc.application.jsbml;

/**
 * @author Bryan Kowal
 */
public class SBMLImportException extends Exception {

	private static final long serialVersionUID = 2952750346852588263L;

	private static final String MESSAGE_FMT = "Failed to import SBML file: %s.";

	public SBMLImportException(String sbmlFile) {
		this(sbmlFile, null);
	}

	public SBMLImportException(String sbmlFile, Throwable e) {
		super(String.format(MESSAGE_FMT, sbmlFile), e);
	}
}