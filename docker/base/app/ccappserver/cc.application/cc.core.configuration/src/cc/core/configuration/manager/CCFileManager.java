/**
 * 
 */
package cc.core.configuration.manager;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * @author bkowal
 *
 */
public class CCFileManager {

	private static final String CC_ROOT_ENV_VAR = "CC_ROOT_DIR";

	private static final String CC_CONF_DIR = "conf";

	private static final String CC_DATA_DIR = "data";

	private static final String CC_EXPORT_DIR = "export";

	private static final String CC_UPLOAD_DIR = "upload";

	private static final String CC_IMPORT_DIR = "import";

	private final String ccRootDirectory;

	private Path ccRootPath;

	private Path ccConfigurationPath;

	private Path ccDataPath;

	private Path ccExportPath;

	private Path ccUploadPath;

	private Path ccImportPath;

	/**
	 * 
	 */
	public CCFileManager() {
		ccRootDirectory = System.getenv(CC_ROOT_ENV_VAR);
		if (ccRootDirectory == null) {
			throw new RuntimeException(
					"Unable to determine the location of the CC Root Directory! Please specify the location of the CC Root Directory using the "
							+ CC_ROOT_ENV_VAR + " environment variable.");
		}
	}

	public void initialize() {
		this.ccRootPath = Paths.get(ccRootDirectory);

		this.ccConfigurationPath = this.ccRootPath.resolve(CC_CONF_DIR);
		this.ccDataPath = this.ccRootPath.resolve(CC_DATA_DIR);
		this.ccExportPath = this.ccRootPath.resolve(CC_EXPORT_DIR);
		this.ccUploadPath = this.ccDataPath.resolve(CC_UPLOAD_DIR);
		this.ccImportPath = this.ccRootPath.resolve(CC_IMPORT_DIR);
	}

	/**
	 * @return the ccConfigurationPath
	 */
	public Path getCcConfigurationPath() {
		return ccConfigurationPath;
	}

	/**
	 * @return the ccDataPath
	 */
	public Path getCcDataPath() {
		return ccDataPath;
	}

	public Path getCcExportPath() {
		return ccExportPath;
	}

	public Path getCCUploadPath() {
		return ccUploadPath;
	}

	public Path getCcImportPath() {
		return ccImportPath;
	}
}