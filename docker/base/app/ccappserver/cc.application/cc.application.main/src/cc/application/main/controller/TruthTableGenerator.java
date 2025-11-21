/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.io.BufferedWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;
import org.apache.commons.io.IOUtils;

// import javax.script.ScriptEngine;
// import javax.script.ScriptEngineManager;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import org.apache.commons.lang3.StringUtils;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cc.common.data.biologic.Species;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.builder.IExpressionCustomizer;
import cc.common.data.model.Model;
import cc.application.simulation.JSExpression;
import cc.application.simulation.JSExpressionCustomizer;

import cc.application.main.WebServiceUtil;
import org.json.JSONObject;

/**
 * @author Bryan Kowal
 *
 */
public class TruthTableGenerator {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private static final int EXTERNAL_BASE = 1_000_000;

	private static final int INPUT_LIMIT = 17;

	private static final String X_VAR_PREFIX = "[varX_";

	private static final String X_VAR_SUFFIX = "]";

	private static final String END_JS_STATEMENT = "; ";

	private static final String JS_ROW_VAR_NAME = "row%s";

	private static final String JS_ROW_VAR = "var " + JS_ROW_VAR_NAME + " = ";

	private static final String COMMA = ", ";

	private static final String TAB = "\t";

	public static final String TT_DIRECTORY = "tt";

	private final String CSV_PREFIX = ".csv";

	private final Map<String, Long> speciesLabelMap = new LinkedHashMap<>();

	private final Map<String, Long> externalSpeciesLabelMap = new LinkedHashMap<>();

	private final Map<String, Long> allSpeciesLabelMap = new LinkedHashMap<>();

	private final Path exportDataPath;

	private final Model model;

	// private final ScriptEngine jsEngine;

	public TruthTableGenerator(final Path exportDataPath, final Model model) {
		this.exportDataPath = Paths.get(exportDataPath.toString(), TT_DIRECTORY, Long.toString(model.getId()));
		this.model = model;
		// ScriptEngineManager engineManager = new ScriptEngineManager();
		// jsEngine = engineManager.getEngineByName("nashorn");
	}

	// http://docs.oracle.com/javase/7/docs/api/java/lang/Integer.html#toBinaryString(int)

	public void generate() throws Exception {
		/*
		 * Create the export data directory if it does not exist.
		 */
		if (Files.exists(exportDataPath)) {
			FileUtils.deleteDirectory(exportDataPath.toFile());
		}
		Files.createDirectories(exportDataPath);

		/*
		 * Create variable mappings.
		 */
		final Map<Long, String> jsVariableMap = this.buildJSVariableMap(model); // [varX_0], [varX_1],
		final Map<Long, String> speciesIdToNameMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		final Map<String, Long> speciesNameToIdMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		model.getSpecies().forEach((s) -> speciesIdToNameMap.put(s.getId(), s.getName()));
		model.getSpecies().forEach((s) -> speciesNameToIdMap.put(s.getName(), s.getId()));
		long speciesCounter = 0;
		long externalSpeciesCounter = EXTERNAL_BASE;
		for (Species species : model.getSpecies()) {
			if (Boolean.TRUE.equals(species.isExternal())) {
				++externalSpeciesCounter;
				externalSpeciesLabelMap.put(species.getName(), externalSpeciesCounter);
			} else {
				++speciesCounter;
				speciesLabelMap.put(species.getName(), speciesCounter);
			}
		}
		allSpeciesLabelMap.putAll(speciesLabelMap);
		allSpeciesLabelMap.putAll(externalSpeciesLabelMap);
		final Map<Long, JSExpression> speciesExpressionMap = this.constructJSExpressionMap(jsVariableMap, model);
		final Set<String> uniqueFileNames = new HashSet<>(speciesExpressionMap.size(), 1.0f);
		Iterator<Long> speciesExpressionIterator = speciesExpressionMap.keySet().iterator();
		while (speciesExpressionIterator.hasNext()) {
			final Long speciesId = speciesExpressionIterator.next();
			JSExpression jsExpression = speciesExpressionMap.get(speciesId);
			if (jsExpression == null) {
				continue;
			}

			final String speciesName = speciesIdToNameMap.get(speciesId);
			String speciesFileName = speciesName.replaceAll("[^a-zA-Z0-9]", "_");
			if (uniqueFileNames.contains(speciesFileName)) {
				speciesFileName += "___UNIQUE" + UUID.randomUUID().toString();
			} else {
				uniqueFileNames.add(speciesFileName);
			}
			final Path csvFilePath = Paths.get(exportDataPath.toString(), speciesFileName + CSV_PREFIX);
			final Path matlabCSVFilePath = Paths.get(exportDataPath.toString(),
					Long.toString(allSpeciesLabelMap.get(speciesName)) + CSV_PREFIX);
			if (jsExpression.getBooleanInputs().size() > INPUT_LIMIT) {
				try (BufferedWriter bw = Files.newBufferedWriter(csvFilePath);
						BufferedWriter bw2 = Files.newBufferedWriter(matlabCSVFilePath);) {
					bw.write("Unable to generate the Truth Table. Too many inputs - Input limit = " + INPUT_LIMIT
							+ "; number of inputs = " + jsExpression.getBooleanInputs().size() + ".");
					bw2.write("Unable to generate the Truth Table. Too many inputs - Input limit = " + INPUT_LIMIT
							+ "; number of inputs = " + jsExpression.getBooleanInputs().size() + ".");
				}
				continue;
			}

			final int numberRows = (int) Math.pow(2, jsExpression.getBooleanInputs().size());
			List<String> jsVarInputs = new LinkedList<>();
			List<String> displayInputs = new LinkedList<>(jsExpression.getBooleanInputs());
			for (String input : jsExpression.getBooleanInputs()) {
				jsVarInputs.add(jsVariableMap.get(speciesNameToIdMap.get(input)));
			}
			Collections.sort(jsVarInputs, new InputSpeciesComparator());
			Collections.sort(displayInputs);
			final int numInputs = displayInputs.size();
			List<String> outputLines = new LinkedList<>();
			StringBuilder headerString = new StringBuilder("");
			StringBuilder header2String = new StringBuilder("");
			for (String columnHeader : displayInputs) {
				headerString.append(columnHeader).append(COMMA);
				header2String.append(Long.toString(allSpeciesLabelMap.get(columnHeader))).append(TAB);
			}
			outputLines.add(headerString.toString());

			StringBuilder executionJS = new StringBuilder();
			for (int i = 0; i < numberRows; i++) {
				StringBuilder ttRow = new StringBuilder();

				// executionJS.append(String.format(JS_ROW_VAR, Integer.toString(i)));

				String bits = Integer.toBinaryString(i);
				bits = StringUtils.leftPad(bits, numInputs, "0");

				/*
				 * Assign inputs to variables.
				 */
				final Map<String, String> inputBitsMap = new HashMap<>();
				for (int j = 0; j < numInputs; j++) {
					char bit = bits.charAt(j);
					ttRow.append(bit).append(COMMA);
					String inputName = displayInputs.get(j);
					String jsInputName = jsVariableMap.get(speciesNameToIdMap.get(inputName));
					if (bit == '0') {
						inputBitsMap.put(jsInputName, "false");
					} else if (bit == '1') {
						inputBitsMap.put(jsInputName, "true");
					}
				}
				outputLines.add(ttRow.toString());

				String substitutedExpression = jsExpression.getBooleanExpression();
				for (String substituteInput : jsVarInputs) {
					substitutedExpression = substitutedExpression.replace(substituteInput,
							inputBitsMap.get(substituteInput));
				}

				// executionJS.append(substitutedExpression.trim()).append(END_JS_STATEMENT);
				executionJS.append(substitutedExpression.trim() + ",");
			}

			String jsStatement = ""; // executionJS.toString().trim();

			// jsStatement += "(function ( ) { var rows = { }; for (var name in this) { if (name.startsWith('row')) { rows[name] = this[name] } }; return rows; })();";
			// jsStatement += String.format("var rows = [%s];", executionJS);
			jsStatement += String.format("(function ( ) { let rows = [%s]; let o = { }; for (let i = 0 ; i < rows.length ; ++i) { o['row' + i] = rows[i] }; return o; })();", executionJS);
			JSONObject jsonData = null;

			try {
				CloseableHttpClient httpClient = HttpClients.createDefault();

				StringEntity requestEntity = new StringEntity("{ \"code\": \"" + jsStatement + "\"}",
					ContentType.APPLICATION_JSON);

				String url = String.format("%s/web/api/_engine", WebServiceUtil.getWebServiceURL());
				HttpPost httpPost = new HttpPost(url);
				httpPost.setEntity(requestEntity);

				HttpResponse httpResponse;

				try {
					httpResponse = httpClient.execute(httpPost);
				} catch (IOException e) {
					e.printStackTrace();
					throw new Exception("Cannot perform eval from JS", e);
				}

				int statusCode = httpResponse.getStatusLine().getStatusCode();
				try {
					if (statusCode == 200) {
						final HttpEntity httpEntity = httpResponse.getEntity();
						try {
							final String json = IOUtils.toString(httpEntity.getContent());
							JSONObject res = new JSONObject(json);
							jsonData = res.getJSONObject("data");
						} catch (UnsupportedOperationException | IOException e) {
								throw new Error("Unable to parse engine response.");
						}
					}
				} finally {
					// if (httpResponse != null) {
					// 	try {
					// 		httpResponse.close();
					// 	} catch (IOException e) {
					// 		/*
					// 		* Skip for now.
					// 		*/
					// 	}
					// }
				}

			} catch (Throwable e) {
				logger.error("Failed to generate Truth Table for Species: " + speciesName + " in Model: "
						+ model.getId() + ".", e);
				try (BufferedWriter bw = Files.newBufferedWriter(csvFilePath)) {
					bw.write("Failed to generate Truth Table!\n\n\n" + e.getMessage());
				}
				continue;
			}

			int counter = 0;
			Files.write(csvFilePath, outputLines);
			try (BufferedWriter bw = Files.newBufferedWriter(csvFilePath);
					BufferedWriter bw2 = Files.newBufferedWriter(matlabCSVFilePath);) {
				bw.write(outputLines.get(counter) + speciesName + "\n");
				bw2.write(header2String + Long.toString(allSpeciesLabelMap.get(speciesName)) + "\n");

				for (int i = 0; i < numberRows; i++) {
					++counter;
					Boolean rowResult = jsonData.getBoolean(String.format(JS_ROW_VAR_NAME, Integer.toString(i)));

					String writeOutput = rowResult == true ? "1" : "0";
					bw.write(outputLines.get(counter) + writeOutput + "\n");

					String tabOutputLine = outputLines.get(counter);
					tabOutputLine = tabOutputLine.replace(COMMA, TAB);
					bw2.write(tabOutputLine + writeOutput + "\n");
				}
			}

			/*
			 * Write the key CSV file.
			 */
			final Path keyCSVFilePath = Paths.get(exportDataPath.toString(), "SPECIES_KEY" + CSV_PREFIX);
			try (BufferedWriter bw = Files.newBufferedWriter(keyCSVFilePath)) {
				for (Entry<String, Long> entry : allSpeciesLabelMap.entrySet()) {
					bw.write(entry.getValue() + TAB + entry.getKey() + "\n");
				}
			}
		}
	}

	private Map<Long, String> buildJSVariableMap(final Model model) {
		final Map<Long, String> jsVariableMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		int index = 0;
		for (Species species : model.getSpecies()) {
			++index;
			final String speciesAlias = X_VAR_PREFIX + Integer.toString(index) + X_VAR_SUFFIX;
			jsVariableMap.put(species.getId(), speciesAlias);
		}

		return jsVariableMap;
	}

	private Map<Long, JSExpression> constructJSExpressionMap(final Map<Long, String> jsVariableMap, final Model model) {
		IExpressionCustomizer expressionCustomizer = new JSExpressionCustomizer(jsVariableMap);
		final Map<Long, JSExpression> speciesExpressionMap = new HashMap<>(model.getSpecies().size(), 1.0f);
		for (Species species : model.getSpecies()) {
			if (species.isExternal() != null && species.isExternal()) {
				speciesExpressionMap.put(species.getId(), null);
				continue;
			}

			final Set<String> inputSpecies = new HashSet<>();
			final Set<Long> inputSpeciesIds = new HashSet<>();
			final String jsBooleanExpression = BooleanExpressionBuilder.buildBooleanExpression(species,
					expressionCustomizer, inputSpecies, inputSpeciesIds);
			if (jsBooleanExpression == null) {
				speciesExpressionMap.put(species.getId(), null);
			} else {
				speciesExpressionMap.put(species.getId(),
						new JSExpression(jsBooleanExpression, inputSpecies, inputSpeciesIds));
			}
		}

		return speciesExpressionMap;
	}

	/**
	 * @return the exportDataPath
	 */
	public Path getExportDataPath() {
		return exportDataPath;
	}
}
