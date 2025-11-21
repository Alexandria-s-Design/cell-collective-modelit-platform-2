/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;

import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.builder.BooleanExpressionBuilder.INPUT_SIGN;
import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.Section;
import cc.common.data.model.Model;

/**
 * @author Bryan Kowal
 */
public class MatrixExporter {

	public static final String CSV_EXTENSION = ".csv";

	public static final String MATRIX_DIRECTORY = "matrix";

	private static final String CELL_HEADER_FMT = "\"%s\"";

	private static final String CELL_CONTENT_NO_REGULATION_FMT = "\"[0] %s\"";

	private static final String CELL_CONTENT_NEGATIVE_REGULATION_FMT = "\"[-1] %s\"";

	private static final String CELL_CONTENT_POSITIVE_REGULATION_FMT = "\"[1] %s\"";

	private static final String CELL_CONTENT_BOTH_REGULATION_FMT = "\"[2] %s\"";

	private static final String UPSTREAM_REGULATOR_SECTION_TYPE = "UpstreamRegulator";

	private static final String SPACE = " ";

	private static final String TAB = "\t";

	private final Path exportDataPath;

	private final Model model;

	private final Map<Long, Page> speciesIdToPageMap;

	public MatrixExporter(final Path exportDataPath, final Model model, final Map<Long, Page> speciesIdToPageMap) {
		this.exportDataPath = Paths.get(exportDataPath.toString(), MATRIX_DIRECTORY,
				Long.toString(model.getId()) + CSV_EXTENSION);
		this.model = model;
		this.speciesIdToPageMap = speciesIdToPageMap;
	}

	public byte[] exportMatrix() throws MatrixExportException {
		/*
		 * Ensure the matrix destination directory exists.
		 */
		final Path exportDirectory = exportDataPath.getParent();
		if (!Files.exists(exportDirectory)) {
			try {
				Files.createDirectories(exportDirectory);
			} catch (IOException e) {
				throw new MatrixExportException(
						"Failed to create matrix export directory: " + exportDirectory.toString(), e);
			}
		}

		final Map<Long, Species> speciesIdToSpeciesMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		final List<SpeciesMatrixHeader> matrixColumnHeadersList = new LinkedList<>();
		for (Species species : model.getSpecies()) {
			speciesIdToSpeciesMap.put(species.getId(), species);
			matrixColumnHeadersList.add(new SpeciesMatrixHeader(species));
		}
		Collections.sort(matrixColumnHeadersList);
		final List<SpeciesMatrixHeader> matrixRowsHeadersList = new LinkedList<>(matrixColumnHeadersList);

		/*
		 * Matrix Contents.
		 */
		final List<String> matrixContents = new LinkedList<>();
		/*
		 * Build the Colum header line.
		 */
		StringBuilder sb = new StringBuilder(String.format(CELL_HEADER_FMT, SPACE));
		for (SpeciesMatrixHeader speciesMatrixColumnHeader : matrixColumnHeadersList) {
			sb.append(TAB).append(String.format(CELL_HEADER_FMT, speciesMatrixColumnHeader.getName()));
		}
		matrixContents.add(sb.toString());

		for (SpeciesMatrixHeader speciesMatrixRowHeader : matrixRowsHeadersList) {
			/*
			 * Build the row line.
			 */
			sb = new StringBuilder();
			/*
			 * Retrieve the associated {@link Species}.
			 */
			final Species species = speciesIdToSpeciesMap.get(speciesMatrixRowHeader.getId());
			/*
			 * Retrieve any associated Knowledge content.
			 */
			final Map<String, String> upstreamRegulatorContentMap = getUpstreamRegulatorContents(
					speciesIdToPageMap.get(species.getId()));
			sb.append(String.format(CELL_HEADER_FMT, species.getName()));
			final Map<SpeciesIdentifier, INPUT_SIGN> inputSpeciesMap = new HashMap<>();
			BooleanExpressionBuilder.buildSBMLInputSpeciesList(species, inputSpeciesMap);
			final Map<Long, INPUT_SIGN> inputSpeciesIdMap = new HashMap<>(inputSpeciesMap.size());
			for (SpeciesIdentifier speciesIdentifier : inputSpeciesMap.keySet()) {
				inputSpeciesIdMap.put(speciesIdentifier.getId(), inputSpeciesMap.get(speciesIdentifier));
			}

			/*
			 * Iterate over the column headers and determine the input type.
			 */
			for (SpeciesMatrixHeader speciesMatrixColumnHeader : matrixColumnHeadersList) {
				sb.append(TAB);
				final INPUT_SIGN inputSign = inputSpeciesIdMap.get(speciesMatrixColumnHeader.getId());
				String kbText = upstreamRegulatorContentMap.get(speciesMatrixColumnHeader.getName());
				if (kbText == null) {
					kbText = StringUtils.EMPTY;
				}
				if (inputSign == null) {
					sb.append(String.format(CELL_CONTENT_NO_REGULATION_FMT, kbText).trim());
				} else if (inputSign == INPUT_SIGN.NEGATIVE) {
					sb.append(String.format(CELL_CONTENT_NEGATIVE_REGULATION_FMT, kbText).trim());
				} else if (inputSign == INPUT_SIGN.POSITIVE) {
					sb.append(String.format(CELL_CONTENT_POSITIVE_REGULATION_FMT, kbText).trim());
				} else if (inputSign == INPUT_SIGN.BOTH) {
					sb.append(String.format(CELL_CONTENT_BOTH_REGULATION_FMT, kbText).trim());
				}
			}
			matrixContents.add(sb.toString());
		}

		try {
			Files.write(exportDataPath, matrixContents, StandardOpenOption.CREATE);
		} catch (IOException e) {
			throw new MatrixExportException("Failed to write export matrix file: " + exportDataPath.toString(), e);
		}

		try {
			return Files.readAllBytes(exportDataPath);
		} catch (IOException e) {
			throw new MatrixExportException(
					"Failed to read export matrix file: " + exportDataPath.toString() + " as bytes.", e);
		}
	}

	private Map<String, String> getUpstreamRegulatorContents(final Page page) {
		if (page == null || CollectionUtils.isEmpty(page.getSections())) {
			return Collections.emptyMap();
		}
		final Set<Section> upstreamRegulatorsSections = page.getSections().stream()
				.filter((s) -> UPSTREAM_REGULATOR_SECTION_TYPE.equals(s.getType())).collect(Collectors.toSet());
		if (CollectionUtils.isEmpty(upstreamRegulatorsSections)) {
			return Collections.emptyMap();
		}
		final Map<String, String> upstreamRegulatorContentMap = new HashMap<>(upstreamRegulatorsSections.size(), 1.0f);
		for (Section section : upstreamRegulatorsSections) {
			if (CollectionUtils.isEmpty(section.getContents())) {
				upstreamRegulatorContentMap.put(section.getTitle(), StringUtils.EMPTY);
			}
			StringBuilder sb = new StringBuilder();
			boolean first = true;
			for (Content content : section.getContents()) {
				if (first) {
					first = false;
				} else {
					sb.append(SPACE);
				}
				sb.append(content.getText());
			}
			upstreamRegulatorContentMap.put(section.getTitle(), sb.toString());
		}

		return upstreamRegulatorContentMap;
	}
}