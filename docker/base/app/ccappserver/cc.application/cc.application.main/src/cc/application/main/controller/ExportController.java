/**
 * 
 */
package cc.application.main.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;

import javax.servlet.ServletRequest;

import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.StopWatch;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.config.RequestConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.apache.commons.collections4.CollectionUtils;

import cc.application.jsbml.SBMLExpressionExtractor;
import cc.application.jsbml.SBMLValidationException;
import cc.application.jsbml.SBMLValidationExpressionCustomizer;
import cc.application.jsbml.SBMLExporter;
import cc.application.main.input.ExportType;
import cc.application.main.json.ModelPermissions;
import cc.common.data.ModelStatisticTypesConstants;
import cc.common.data.model.ModelVersionId;
import cc.common.data.biologic.Species;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.knowledge.Page;
import cc.common.data.model.Layout;
import cc.common.data.model.LayoutNode;
import cc.common.data.model.Model;
import cc.common.data.model.ModelInitialState;
import cc.common.data.model.ModelStatistic;
import cc.common.data.model.ModelVersion;
import cc.common.data.user.Profile;
import cc.dataaccess.main.dao.LayoutDao;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/model")
public class ExportController extends AbstractModelController {

	@Autowired
	private LayoutDao layoutDao;

	@RequestMapping(value = "/export/{id}", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> exportModel(
			@PathVariable Long id,
			@RequestParam(value = "type", required = false) ExportType[] types, 
			@RequestParam(value = "version", required = false) Long version, 
			ServletRequest request
		) {
		final StopWatch stopWatch = new StopWatch();
		stopWatch.start();
		final Long userId = this.getAuthenticatedUserId();
		final Long tempModelId = this.checkForTempAccess(request);
		logger.info("Exporting Model: {} for user: {}. Requested format(s) = {}.", id, userId,
				StringUtils.join(types, ", "));


		/*
		 * Determine which version of the {@link Model} has been requested.
		 */
		ModelVersion modelVersion = null;
		if (version == null) {
			/*
			 * A specific version has not been specified. Retrieve the latest {@link
			 * ModelVersion}.
			 */
			modelVersion = modelVersionDao.getLatestVersionForVersionId(id);
		} else {
			/*
			 * A specific version has been specified. Verify that a {@link ModelVersion}
			 * actually exists.
			 */
			modelVersion = modelVersionDao.getById(new ModelVersionId(id, version));
		}
//		ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
		if (modelVersion == null) {
			return new ResponseEntity<Object>("Failed to find version information for Model: " + id + ".",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		final Long modelId = modelVersion.getModelId();

		Model model = this.modelBiologicDao.getModel(modelId);
		/*
		 * Verify that the requested {@link Model} exists.
		 */
		if (model == null) {
			logger.warn("Unable to find Model with id: " + modelId + ".");
			return new ResponseEntity<Object>("Unable to find Model with id: " + modelId + ".", HttpStatus.NOT_FOUND);
		}


		/*
		 * Verify that the user has access to the {@link Model}.
		 */
		ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, tempModelId);
		if (permissions.isView() == false) {
			return new ResponseEntity<Object>("Access to Model: " + id + " is forbidden.", HttpStatus.FORBIDDEN);
		}

		if (types == null) {
			types = new ExportType[] { ExportType.SBML };
		}

		byte[] contents = null;
		String attachmentFilename = Long.toString(id) + ".zip";
		try {
			if (types.length == 1 && types[0] == ExportType.SBML) {
				contents = sbmlExport(model);
				attachmentFilename = Long.toString(id) + ".sbml";
			} else if (types.length == 1 && types[0] == ExportType.MATRIX) {
				contents = matrixExport(model);
				attachmentFilename = Long.toString(id) + ".csv";
			} else if (types.length == 1 && types[0] == ExportType.GML) {
				contents = gmlExport(model);
				attachmentFilename = Long.toString(id) + ".gml";
			} else {
				contents = generateExportZip(types, model);
			}
		} catch (Exception e) {
			logger.error("Failed to export Model: " + id + " for user: " + userId + "! Requested format(s) = "
					+ StringUtils.join(types, ", ") + ".", e);
			return new ResponseEntity<Object>("Failed to export Model: " + id + " - " + e.getMessage(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		HttpHeaders headers = new HttpHeaders();
		headers.set("Content-Disposition", "attachment; filename=" + attachmentFilename);
		headers.setContentLength(contents.length);

		ModelStatistic statistic = new ModelStatistic();
		statistic.setModel(model.getModelIdentifier());
		statistic.setCreationDate(Calendar.getInstance());
		statistic.setUserId(this.getAuthenticatedUserId());
		statistic.setType(ModelStatisticTypesConstants.MODEL_DOWNLOAD_STAT);
		this.modelStatisticDao.saveStatistic(statistic);

		stopWatch.stop();
		logger.info("Successfully exported Model: {} for user: {} in {} ms. Requested format(s) = {}.",
				model.getModelIdentifier().toString(), userId, stopWatch.getTime(), StringUtils.join(types, ", "));
		return new ResponseEntity<Object>(contents, headers, HttpStatus.CREATED);
	}

	private String makeZipValidFileName(final String name){
		return  name.replaceAll("[^\\p{IsAlphabetic}^\\p{IsDigit}]", "_");
	}

	private void writeExternalComponentsTxtToZip(final ZipArchiveOutputStream zaos, final Set<Species> species,
			final String containingDirName) throws IOException {
		final StringBuilder allExternalComponentsSB = new StringBuilder();
		species.stream().filter((s) -> Boolean.TRUE.equals(s.isExternal()))
				.forEach((s) -> allExternalComponentsSB.append(s.getName()).append("\n"));

		writeTxtContentToZipEntry(zaos, Paths.get(containingDirName, "external_components.ALL.txt"),
				allExternalComponentsSB.toString());
	}

	private void writeTxtContentToZipEntry(final ZipArchiveOutputStream zaos, final Path zipPath, final String content)
			throws IOException {
		ZipArchiveEntry entry = new ZipArchiveEntry(zipPath.toString());
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		final PrintStream printStream = new PrintStream(baos);
		printStream.print(content);
		printStream.close();
		baos.close();

		byte[] data = baos.toByteArray();
		entry.setSize(data.length);
		zaos.putArchiveEntry(entry);
		zaos.write(data);
		zaos.closeArchiveEntry();
	}

	private byte[] sbmlExport(final Model model) throws Exception {
		final String exportUUID = UUID.randomUUID().toString();
		logger.info("Starting SBML Export of: {} ({}) ...", model.toString(), exportUUID);

		Map<Long, Page> pageMap = null;
		if (CollectionUtils.isNotEmpty(model.getSpecies())) {
			pageMap = new HashMap<>(model.getSpecies().size(), 1.0f);
			final Set<Long> speciesIds = new HashSet<>(model.getSpecies().size(), 1.0f);
			model.getSpecies().forEach(s -> speciesIds.add(s.getId()));
			final List<Page> pages = pageDao.getPagesForIds(speciesIds);
			if (CollectionUtils.isNotEmpty(pages)) {
				for (Page page : pages) {
					pageMap.put(page.getId(), page);
				}
			}
		}
		final Profile profile = userDao.getProfileByUserId(model.getUserId());

		final ModelInitialState modelInitialState = modelDao.getModelInitialState(model.getId());
		Layout layout = null;
		List<LayoutNode> layoutNodes = Collections.emptyList();
		if (modelInitialState != null && modelInitialState.getLayoutId() != null) {
			final List<Long> layoutIds = new ArrayList<>(1);
			layoutIds.add(modelInitialState.getLayoutId());

			final List<Layout> layouts = layoutDao.getLayoutsForIds(layoutIds);
			if (CollectionUtils.isNotEmpty(layouts)) {
				layout = layouts.iterator().next();
			}
			if (layout != null) {
				layoutNodes = layoutDao.getLayoutNodesForLayout(layout);
			}
		}

		SBMLExporter sbmlExporter = new SBMLExporter(model, pageMap, profile, layout, layoutNodes);
		byte[] content = sbmlExporter.exportSBML();
		Map<String, String> functionMap = null;
		try {
			functionMap = new SBMLExpressionExtractor(content, model).extractSBMLExpressions();
		} catch (Exception e) {
			logger.error("Failed to validate the SBML Export (" + exportUUID + ").", e);
			throw new SBMLValidationException("Failed to validate the SBML Export. Error: " + exportUUID + ".");
		}
		final Map<Long, String> sbmlVariableMap = sbmlExporter.getSbmlVariableMap();
		final SBMLValidationExpressionCustomizer expressionCustomizer = new SBMLValidationExpressionCustomizer(
				sbmlVariableMap);

		// final CloseableHttpClient httpClient = HttpClients.createDefault();
		RequestConfig requestConfig = RequestConfig.custom()
				.setConnectTimeout(10 * 1000)
				.setConnectionRequestTimeout(10 * 1000)
				.setSocketTimeout(10 * 1000)
				.build();

		final CloseableHttpClient httpClient = HttpClients.custom()
				.setDefaultRequestConfig(requestConfig)
				.build();

		for (Species species : model.getSpecies()) {
			if (Boolean.TRUE.equals(species.isExternal())) {
				continue;
			}

			final String sbmlId = sbmlVariableMap.get(species.getId());
			final Set<String> inputSpecies = new HashSet<>();
			final Set<Long> inputSpeciesIds = new HashSet<>();
			final String biologicExpression = BooleanExpressionBuilder.buildBooleanExpression(species,
					expressionCustomizer, inputSpecies, inputSpeciesIds);
			final String sbmlExpression = functionMap.get(sbmlId);
			if(functionMap == null) {
				continue;
			}
			if (biologicExpression == null || sbmlExpression == null || "1".equals(sbmlExpression)) {
				continue;
			}
			// DISABLED: Boolean expression validation for now, as it is not working properly
			Boolean matches = null;
			try {
				matches = BooleanExpressionComparisonUtil.compareBooleanExpressions(httpClient, sbmlExpression,
						biologicExpression);
			} catch (Exception e) {
				// logger.error("Boolean Expression Error: " + e);
				// TODO: log
				matches = null;
			}

			if (Boolean.TRUE.equals(matches)) {
				/*
				 * No issues with the Biologic conversion.
				 */
				continue;
			}
			final StringBuilder sb = new StringBuilder(" Biologic expression = ");
			sb.append(biologicExpression.trim()).append("; sbml expression = ").append(sbmlExpression.trim());
			logger.error("The SBML Export Validation has Failed for: " + species.toString() + "." + sb.toString() + " ("
					+ exportUUID + ").");
			//throw new SBMLValidationException("SBML Export Validation has Failed. Error: " + exportUUID + ".");
		}
		logger.info("Successfully finished SBML Export of: {} ({}).", model.toString(), exportUUID);
		return content;
	}

	private byte[] matrixExport(final Model model) throws Exception {
		final Map<Long, Page> speciesIdToPageMap = loadKBInformation(model.getId(), model.getSpecies());
		MatrixExporter matrixExporter = new MatrixExporter(this.ccFileManager.getCcExportPath(), model,
				speciesIdToPageMap);
		return matrixExporter.exportMatrix();
	}

	private byte[] gmlExport(final Model model) throws Exception {
		GMLExporter gmlExporter = new GMLExporter(this.ccFileManager.getCcExportPath(), model);
		return gmlExporter.exportGML();
	}

	private byte[] generateExportZip(final ExportType[] types, final Model model) throws Exception {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		try (ZipArchiveOutputStream zaos = new ZipArchiveOutputStream(baos)) {
			for (ExportType type : types) {
				if (type == ExportType.SBML) {
					ZipArchiveEntry entry = new ZipArchiveEntry(Paths.get("sbml", model.getId() + ".sbml").toString());
					byte[] export = sbmlExport(model);
					entry.setSize(export.length);
					zaos.putArchiveEntry(entry);
					zaos.write(export);
					zaos.closeArchiveEntry();
				} else if (type == ExportType.MATRIX) {
					ZipArchiveEntry entry = new ZipArchiveEntry(
							Paths.get(MatrixExporter.MATRIX_DIRECTORY, model.getId() + MatrixExporter.CSV_EXTENSION)
									.toString());
					byte[] export = matrixExport(model);
					entry.setSize(export.length);
					zaos.putArchiveEntry(entry);
					zaos.write(export);
					zaos.closeArchiveEntry();
				} else if (type == ExportType.GML) {
					ZipArchiveEntry entry = new ZipArchiveEntry(
							Paths.get(GMLExporter.GML_DIRECTORY, model.getId() + GMLExporter.GML_EXTENSION).toString());
					byte[] export = gmlExport(model);
					entry.setSize(export.length);
					zaos.putArchiveEntry(entry);
					zaos.write(export);
					zaos.closeArchiveEntry();
				} else if (type == ExportType.TT) {
					TruthTableGenerator ttGenerator = new TruthTableGenerator(this.ccFileManager.getCcExportPath(),
							model);
					ttGenerator.generate();
					Path ttPath = ttGenerator.getExportDataPath();
					Files.list(ttPath).forEach(new Consumer<Path>() {
						@Override
						public void accept(Path path) {
							ZipArchiveEntry entry = new ZipArchiveEntry(Paths
									.get(TruthTableGenerator.TT_DIRECTORY, path.getFileName().toString()).toString());
							byte[] ttBytes = null;
							try {
								ttBytes = Files.readAllBytes(path);
								entry.setSize(ttBytes.length);
								zaos.putArchiveEntry(entry);
								zaos.write(ttBytes);
								zaos.closeArchiveEntry();
							} catch (IOException e) {
								throw new RuntimeException(e);
							}
						}
					});
					writeExternalComponentsTxtToZip(zaos, model.getSpecies(), "tt");
				} else if (type == ExportType.EXPR) {
					StringBuilder allExpressionsSB = new StringBuilder();
					for (Species species : model.getSpecies()) {
						if (species.isExternal() != null && species.isExternal()) {
							continue;
						}

						final Set<String> inputSpecies = new HashSet<>();
						final Set<Long> inputSpeciesIds = new HashSet<>();
						final String booleanExpression = BooleanExpressionBuilder.buildBooleanExpression(species,
								inputSpecies, inputSpeciesIds);
						if (inputSpecies.isEmpty()) {
							continue;
						}
						allExpressionsSB.append(species.getName()).append(" = ").append(booleanExpression).append("\n");

						ZipArchiveEntry entry = new ZipArchiveEntry(
								Paths.get("expr", makeZipValidFileName(species.getName()) + ".txt").toString());
						ByteArrayOutputStream exprBaos = new ByteArrayOutputStream();
						final PrintStream printStream = new PrintStream(exprBaos);
						printStream.print(booleanExpression);
						printStream.close();
						exprBaos.close();

						final byte[] data = exprBaos.toByteArray();
						entry.setSize(data.length);
						zaos.putArchiveEntry(entry);
						zaos.write(data);
						zaos.closeArchiveEntry();
					}

					writeTxtContentToZipEntry(zaos, Paths.get("expr", "expressions.ALL.txt"),
							allExpressionsSB.toString());
					writeExternalComponentsTxtToZip(zaos, model.getSpecies(), "expr");
				}
			}
			zaos.finish();
		} finally {
			baos.close();
		}

		return baos.toByteArray();
	}
}