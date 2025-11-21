/**
 * 
 */
package cc.dataaccess.configuration;

import java.nio.file.Path;

import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.core.io.FileSystemResource;

import cc.core.configuration.manager.CCFileManager;

/**
 * @author bkowal
 *
 */
public class JdbcConfigurationManager extends PropertyPlaceholderConfigurer {

	private static final String JDBC_PROPERTIES_FILE = "jdbc.properties";

	private final CCFileManager ccFileManager;

	/**
	 * 
	 */
	public JdbcConfigurationManager(CCFileManager ccFileManager) {
		this.ccFileManager = ccFileManager;

		Path jdbcPropertiesPath = this.ccFileManager.getCcConfigurationPath().resolve(JDBC_PROPERTIES_FILE);
		super.setLocation(new FileSystemResource(jdbcPropertiesPath.toString()));
	}
}