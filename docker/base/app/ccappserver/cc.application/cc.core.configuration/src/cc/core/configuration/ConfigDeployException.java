/**
 * 
 */
package cc.core.configuration;

/**
 * @author Bryan Kowal
 *
 */
public class ConfigDeployException extends Throwable {

	private static final long serialVersionUID = 8760506131685602305L;

	private static final String CAUSE_BEGIN = "Failed to deploy required configuration file: ";

	private static final String MESSAGE_FORMAT = CAUSE_BEGIN + "%s!";

	public ConfigDeployException(String configFileName, Throwable cause) {
		super(String.format(MESSAGE_FORMAT, configFileName), cause);
	}
}