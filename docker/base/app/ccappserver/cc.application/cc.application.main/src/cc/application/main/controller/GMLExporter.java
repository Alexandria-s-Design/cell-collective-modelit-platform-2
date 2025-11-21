/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections4.CollectionUtils;

import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.model.Model;

/**
 * @author Bryan Kowal
 */
public class GMLExporter {

	public static final String GML_EXTENSION = ".gml";

	public static final String GML_DIRECTORY = "gml";

	private static final String GML_OPEN_BRACE = "[";

	private static final String GML_CLOSE_BRACE = "]";

	private static final String GML_GRAPH = "graph " + GML_OPEN_BRACE;

	private static final String GML_NODE = "node " + GML_OPEN_BRACE;

	private static final String GML_EDGE = "edge " + GML_OPEN_BRACE;

	private static final String ID = "id %d";

	private static final String LABEL = "label \"%s\"";

	private static final String EDGE_SOURCE = "source %d";

	private static final String EDGE_TARGET = "target %d";

	private final Path exportDataPath;

	private final Model model;

	public GMLExporter(final Path exportDataPath, final Model model) {
		this.exportDataPath = Paths.get(exportDataPath.toString(), GML_DIRECTORY,
				Long.toString(model.getId()) + GML_EXTENSION);
		this.model = model;
	}

	public byte[] exportGML() throws GMLExportException {
		/*
		 * Ensure the matrix destination directory exists.
		 */
		final Path exportDirectory = exportDataPath.getParent();
		if (!Files.exists(exportDirectory)) {
			try {
				Files.createDirectories(exportDirectory);
			} catch (IOException e) {
				throw new GMLExportException("Failed to create gml export directory: " + exportDirectory.toString(), e);
			}
		}

		final List<String> gmlContents = new LinkedList<>();
		gmlContents.add(GML_GRAPH);
		gmlContents.add("\t" + String.format(ID, model.getId()));
		gmlContents.add("\t" + String.format(LABEL, model.getName()));
		final Map<Long, Integer> speciesIdToNodeIdMap = new LinkedHashMap<>();
		int gmlId = 1;

		/*
		 * First, create the nodes and assign id values to them.
		 */

		for (Species species : model.getSpecies()) {
			speciesIdToNodeIdMap.put(species.getId(), gmlId);
			gmlContents.add("\t" + GML_NODE);
			gmlContents.add("\t\t" + String.format(ID, gmlId));
			gmlContents.add("\t\t" + String.format(LABEL, species.getName()));
			gmlContents.add("\t" + GML_CLOSE_BRACE);
			++gmlId;
		}

		/*
		 * Finally, the edges.
		 */
		for (Species species : model.getSpecies()) {
			if (Boolean.TRUE.equals(species.isExternal())) {
				continue;
			}
			/*
			 * Get the list of inputs for the species.
			 */
			final Set<SpeciesIdentifier> inputSpeciesList = BooleanExpressionBuilder.buildInputSpeciesList(species);
			if (CollectionUtils.isEmpty(inputSpeciesList)) {
				continue;
			}
			for (SpeciesIdentifier inputSpecies : inputSpeciesList) {
				gmlContents.add("\t" + GML_EDGE);
				gmlContents.add("\t\t" + String.format(EDGE_SOURCE, speciesIdToNodeIdMap.get(inputSpecies.getId())));
				gmlContents.add("\t\t" + String.format(EDGE_TARGET, speciesIdToNodeIdMap.get(species.getId())));
				gmlContents.add("\t" + GML_CLOSE_BRACE);
			}
		}

		gmlContents.add(GML_CLOSE_BRACE);

		try {
			Files.write(exportDataPath, gmlContents, StandardOpenOption.CREATE);
		} catch (IOException e) {
			throw new GMLExportException("Failed to write export gml file: " + exportDataPath.toString(), e);
		}

		try {
			return Files.readAllBytes(exportDataPath);
		} catch (IOException e) {
			throw new GMLExportException("Failed to read export gml file: " + exportDataPath.toString() + " as bytes.",
					e);
		}
	}
}