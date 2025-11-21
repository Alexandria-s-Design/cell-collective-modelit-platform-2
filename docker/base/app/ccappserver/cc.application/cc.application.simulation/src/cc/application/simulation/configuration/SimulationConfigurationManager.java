/**
 * 
 */
package cc.application.simulation.configuration;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import cc.core.configuration.manager.CCFileManager;

/**
 * @author Bryan
 *
 */
public class SimulationConfigurationManager {

	private final CCFileManager fileManager;
	
	private SimulationConfiguration configuration;

	public SimulationConfigurationManager(final CCFileManager fileManager) {

		/*
		 * Prepare the {@link JAXBContext}.
		 */
		JAXBContext context = null;
		Unmarshaller unmarshaller = null;
		try {
			context = JAXBContext.newInstance(SimulationConfiguration.class);
			unmarshaller = context.createUnmarshaller();
		} catch (JAXBException e) {
			throw new RuntimeException("Failed to initialize the JAXB Context!", e);
		}

		/*
		 * Determine the {@link Path} to the {@link SimulationConfiguration}.
		 */
		final Path simulationConfigPath = fileManager.getCcConfigurationPath()
				.resolve(SimulationConfiguration.DEFAULT_FILE_NAME);
		try (InputStream is = Files.newInputStream(simulationConfigPath)) {
			this.configuration = (SimulationConfiguration) unmarshaller.unmarshal(is);
		} catch (Exception e) {
			throw new RuntimeException(
					"Failed to read the simulation configuration: " + simulationConfigPath.toString() + "!", e);
		}
		
		this.fileManager = fileManager;
	}

	/**
	 * @return the fileManager
	 */
	public CCFileManager getFileManager() {
		return fileManager;
	}

	/**
	 * @return the configuration
	 */
	public SimulationConfiguration getConfiguration() {
		return configuration;
	}
}