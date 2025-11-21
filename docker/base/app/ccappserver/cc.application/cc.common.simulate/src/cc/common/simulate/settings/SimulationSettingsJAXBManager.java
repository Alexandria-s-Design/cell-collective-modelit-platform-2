/**
 * 
 */
package cc.common.simulate.settings;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;

/**
 * @author Bryan
 *
 */
public class SimulationSettingsJAXBManager {

	private static final SimulationSettingsJAXBManager INSTANCE = new SimulationSettingsJAXBManager();

	private final JAXBContext context;

	protected SimulationSettingsJAXBManager() {
		try {
			this.context = JAXBContext.newInstance(DynamicSimulationSettings.class);
		} catch (JAXBException e) {
			throw new RuntimeException("Failed to initialize the JAXB Context!", e);
		}
	}

	public static SimulationSettingsJAXBManager getInstance() {
		return INSTANCE;
	}

	// TODO: consider using Bytes instead of Strings.

	public String toXMLString(final ISimulationSettings settings) throws Exception {
		final Marshaller marshaller = this.context.createMarshaller();
		ByteArrayOutputStream baos = new ByteArrayOutputStream();

		marshaller.marshal(settings, baos);
		return baos.toString(Charset.defaultCharset().name());
	}

	public void toFile(final ISimulationSettings settings, final Path outputPath) throws Exception {
		final Marshaller marshaller = this.context.createMarshaller();
		marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);

		try (OutputStream os = Files.newOutputStream(outputPath)) {
			marshaller.marshal(settings, os);
		}
	}

	public ISimulationSettings fromXMLString(final String xml) throws Exception {
		final Unmarshaller unmarshaller = this.context.createUnmarshaller();
		final StringReader stringReader = new StringReader(xml);

		return (ISimulationSettings) unmarshaller.unmarshal(stringReader);
	}

	public ISimulationSettings fromFile(final Path outputPath) throws Exception {
		final Unmarshaller unmarshaller = this.context.createUnmarshaller();

		try (InputStream is = Files.newInputStream(outputPath)) {
			return (ISimulationSettings) unmarshaller.unmarshal(is);
		}
	}
}