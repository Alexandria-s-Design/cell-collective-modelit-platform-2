/**
 * 
 */
package cc.application.main.exception;

import cc.common.data.metadata.Definition;

/**
 * @author Bryan Kowal
 *
 */
public class InvalidMetadataValue extends Exception {

	private static final long serialVersionUID = 4965827790549254054L;

	public InvalidMetadataValue(final Definition definition) {
		super("Expected a value of type: " + definition.getType().name() + " for Metadata Definition: "
				+ definition.toString() + ".");
	}
}