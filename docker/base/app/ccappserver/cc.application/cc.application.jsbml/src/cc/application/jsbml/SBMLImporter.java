/**
 * 
 */
package cc.application.jsbml;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.sbml.jsbml.ASTNode;
import org.sbml.jsbml.Annotation;
import org.sbml.jsbml.CVTerm;
import org.sbml.jsbml.Model;
import org.sbml.jsbml.SBMLDocument;
import org.sbml.jsbml.CVTerm.Qualifier;
import org.sbml.jsbml.ListOf;
import org.sbml.jsbml.ext.layout.Layout;
import org.sbml.jsbml.ext.layout.LayoutModelPlugin;
import org.sbml.jsbml.ext.layout.Point;
import org.sbml.jsbml.ext.layout.GeneralGlyph;
import org.sbml.jsbml.ext.layout.GraphicalObject;
import org.sbml.jsbml.ext.qual.FunctionTerm;
import org.sbml.jsbml.ext.qual.Output;
import org.sbml.jsbml.ext.qual.Input;
import org.sbml.jsbml.ext.qual.QualModelPlugin;
import org.sbml.jsbml.ext.qual.QualitativeSpecies;
import org.sbml.jsbml.ext.qual.Transition;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;

import cc.application.jsbml.knowledge.Description;
import cc.application.jsbml.knowledge.RegulatorySummary;
import cc.application.jsbml.knowledge.UpstreamRegulator;
import cc.application.jsbml.knowledge.KnowledgeBaseAdapter;
import cc.application.jsbml.knowledge.KnowledgeBaseNode;
import cc.application.jsbml.knowledge.ReferenceNode;
import cc.application.jsbml.response.bool.BiologicResponse;
import cc.application.jsbml.response.bool.ConditionJSON;
import cc.application.jsbml.response.bool.RegulatorJSON;
import cc.application.jsbml.response.bool.SubConditionJSON;
import cc.common.data.biologic.Condition;
import cc.common.data.biologic.ConditionalConstants.ConditionalState;
import cc.common.data.biologic.ConditionalConstants.ConditionalType;
import cc.common.data.biologic.ConditionalConstants.Relation;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.Regulator.RegulationType;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.Species.AbsentState;
import cc.common.data.biologic.SubCondition;
import cc.common.data.knowledge.Page;
import cc.common.data.model.LayoutNode;
import org.json.JSONObject;

import javax.xml.stream.XMLStreamException;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import java.io.StringReader;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;
import java.io.IOException;

//import cc.application.main.json.ContentMap;

/**
 * @author Bryan Kowal
 */
public class SBMLImporter {

	private final String sbmlFile;

	private final ObjectMapper objectMapper = new ObjectMapper();

	private long entityId = -2L;

	private Map<String, String> sbmlIdToSpeciesNameMap;

	private Map<String, String> functionMap;

	private Map<String, String> getBiologicalConstructsResponseMap;

	private List<String> modelCitations = Collections.emptyList();
	
	private Map<Page, Set<List<KnowledgeBaseNode>>> knowledgeBaseNodesMap = new HashMap<>();

	private Map<Page, List<String>> pageCitationsMap = new HashMap<>();

	private cc.common.data.model.Layout modelLayout = null;

	private List<LayoutNode> modelLayoutNodes = new ArrayList<>();

	//private List<ContentMap> contentMap = new ArrayList<>();

	public SBMLImporter(final String sbmlFile) {
		this.sbmlFile = sbmlFile;
	}

	public cc.common.data.model.Model importSBML(InputStream is) throws SBMLImportException, UnsupportedSBMLException {
		TCCSbmlQualImport sbmlQualImport = null;


		try {
			sbmlQualImport = new TCCSbmlQualImport(is);
		} catch (Exception e) {
			throw new SBMLImportException(sbmlFile, e);
		}

		final SBMLDocument sbmlDocument = sbmlQualImport.getQualBundle().document;
		/*
		 * Ensure this is a supported SBML document.
		 */
		if (sbmlDocument.getLevel() == -1) {
			throw new UnsupportedSBMLException("The SBML Level has not been specified in the provided SBML document.");
		} else if (sbmlDocument.getLevel() != SBMLProperties.SBML_LEVEL) {
			throw new UnsupportedSBMLException("Unsupported SBML Level: " + sbmlDocument.getLevel() + ". SBML Level: "
					+ SBMLProperties.SBML_LEVEL + " is supported.");
		}
		if (sbmlDocument.getVersion() == -1) {
			throw new UnsupportedSBMLException(
					"The SBML Version has not been specified in the provided SBML document.");
		} else if (sbmlDocument.getVersion() != SBMLProperties.SBML_VERSION) {
			throw new UnsupportedSBMLException("Unsupported SBML Version: " + sbmlDocument.getLevel()
					+ ". SBML Version: " + SBMLProperties.SBML_VERSION + " is supported.");
		}
		if (!sbmlDocument.getSBMLDocumentAttributes().containsKey(SBMLProperties.QUAL_REQUIRED)) {
			throw new UnsupportedSBMLException(
					"The provided SBML Document is missing the " + SBMLProperties.QUAL_REQUIRED + " attribute.");
		} else if (!SBMLProperties.TRUE
				.equals(sbmlDocument.getSBMLDocumentAttributes().get(SBMLProperties.QUAL_REQUIRED))) {
			throw new UnsupportedSBMLException("The " + SBMLProperties.QUAL_REQUIRED + " attribute has not been set to "
					+ SBMLProperties.TRUE + " in the provided SBML document.");
		}
		final Model documentModel = sbmlDocument.getModel();

		final cc.common.data.model.Model model = new cc.common.data.model.Model();
		if (documentModel.getName() == null || documentModel.getName().trim().isEmpty()) {
			model.setName(sbmlFile);
		} else {
			model.setName(documentModel.getName().trim());
		}

		Annotation annotation = documentModel.getAnnotation();
		if (annotation != null) {
			final int cvTermCount = annotation.getCVTermCount();
			if (cvTermCount > 0) {
				modelCitations = new ArrayList<>(cvTermCount);
				for (int i = 0; i < cvTermCount; i++) {
					final CVTerm cvTerm = annotation.getCVTerm(i);
					if (cvTerm.getQualifier() == Qualifier.BQB_IS_DESCRIBED_BY) {
						for (String resource : cvTerm.getResources()) {
							modelCitations.add(resource);
						}
					}
				}
			}
		}

		/*
		 * Check for the layout extension.
		 */
		final Map<String, LayoutNode> sbmlIdLayoutPositionMap = new HashMap<>();
		final LayoutModelPlugin layoutModelPlugin = (LayoutModelPlugin) documentModel
				.getExtension(SBMLProperties.SBML_LAYOUT_URI);
		if (layoutModelPlugin != null && layoutModelPlugin.getLayoutCount() >= 1) {
			final Layout layout = layoutModelPlugin.getListOfLayouts().iterator().next();
			modelLayout = new cc.common.data.model.Layout();
			if (layout.getName() == null || layout.getName().trim().isEmpty()) {
				modelLayout.setName(sbmlFile);
			} else {
				modelLayout.setName(layout.getName().trim());
			}
			--entityId;
			modelLayout.setModelId(1);
			modelLayout.setId(entityId);
			ListOf<GraphicalObject> graphicalObjectsList = layout.getListOfAdditionalGraphicalObjects();
			if (graphicalObjectsList != null && graphicalObjectsList.getChildCount() >= 1)
			{
				for (int i = 0; i < graphicalObjectsList.getChildCount(); i++)
				{
					final GraphicalObject graphicalObject = graphicalObjectsList.get(i);
					if (graphicalObject instanceof GeneralGlyph)
					{
						GeneralGlyph generalGlyph = (GeneralGlyph) graphicalObject;
						final String reference = generalGlyph.getReference();
						final Point position = generalGlyph.getBoundingBox().getPosition();

						LayoutNode layoutNode = new LayoutNode();
						--entityId;
						layoutNode.setId(entityId);
						layoutNode.setLayoutId(modelLayout.getId());
						layoutNode.setX(position.getX());
						layoutNode.setY(position.getY() * -1);
						sbmlIdLayoutPositionMap.put(reference, layoutNode);
					}
				}
			}
		}


		if (sbmlIdLayoutPositionMap.isEmpty()) {
			modelLayout = null;
		}

		/*
		 * Retrieve the qual model.
		 */
		final QualModelPlugin qualModel = (QualModelPlugin) documentModel.getExtension(SBMLProperties.SBML_QUAL_URI);
		final int speciesCnt = qualModel != null && qualModel.getListOfQualitativeSpecies() != null ? qualModel.getListOfQualitativeSpecies().size() : 0;
		final Map<String, Species> sbmlIdToSpeciesMap = new HashMap<>(speciesCnt,
				1.0f);
		sbmlIdToSpeciesNameMap = new HashMap<>(speciesCnt, 1.0f);
		if(speciesCnt > 0){
			for (QualitativeSpecies qualSpecies : qualModel.getListOfQualitativeSpecies()) {
				String id = qualSpecies.getId();				
				Species species = new Species();
				species.setId(entityId);
				--entityId;
				species.setName(qualSpecies.getId());
				species.setExternal(Boolean.TRUE);
				sbmlIdToSpeciesMap.put(id, species);
				String name = qualSpecies.getName();
				if (name == null || name.isEmpty()) {
					name = id;
				}
				sbmlIdToSpeciesNameMap.put(id, name);
				qualSpecies.setName(id);

				Set<List<KnowledgeBaseNode>> sectionNotesText = null;
				try {
					sectionNotesText = getQualNoteContent(qualSpecies.getNotesString(), name);
				} catch(XMLStreamException e) {
					System.err.println("Error getting notes for species " + qualSpecies.getId() + ": " + e.getMessage());
				}
				if (sectionNotesText != null && CollectionUtils.isNotEmpty(sectionNotesText)) {
					final Page page = new Page();
					page.setId(entityId);
					--entityId;
					page.setSpecies(species.getSpeciesIdentifier());
					knowledgeBaseNodesMap.put(page, sectionNotesText);
				}

				/*
				 * Check for layout information.
				 */
				if (sbmlIdLayoutPositionMap.containsKey(id)) {
					LayoutNode layoutNode = sbmlIdLayoutPositionMap.get(id);
					layoutNode.setComponentId(species.getId());
					// Bottom
					if (modelLayout.getBottom() == null) {
						modelLayout.setBottom(layoutNode.getY().floatValue());
					} else {
						modelLayout.setBottom(Float.min(modelLayout.getBottom(), layoutNode.getY().floatValue()));
					}
					// Top
					if (modelLayout.getTop() == null) {
						modelLayout.setTop(layoutNode.getY().floatValue());
					} else {
						modelLayout.setTop(Float.max(modelLayout.getTop(), layoutNode.getY().floatValue()));
					}
					// Left
					if (modelLayout.getLeft() == null) {
						modelLayout.setLeft(layoutNode.getX().floatValue());
					} else {
						modelLayout.setLeft(Float.min(modelLayout.getLeft(), layoutNode.getX().floatValue()));
					}
					// Right
					if (modelLayout.getRight() == null) {
						modelLayout.setRight(layoutNode.getX().floatValue());
					} else {
						modelLayout.setRight(Float.max(modelLayout.getRight(), layoutNode.getX().floatValue()));
					}

					modelLayoutNodes.add(layoutNode);
				}


				annotation = qualSpecies.getAnnotation();
				if (annotation != null) {
					final int cvTermCount = annotation.getCVTermCount();
					if (cvTermCount > 0) {
						final Page page = new Page();
						page.setId(entityId);
						--entityId;
						page.setSpecies(species.getSpeciesIdentifier());

						final List<String> pageCitations = new ArrayList<>(cvTermCount);
						for (int i = 0; i < cvTermCount; i++) {
							final CVTerm cvTerm = annotation.getCVTerm(i);
							if (cvTerm.getQualifier() == Qualifier.BQB_IS_DESCRIBED_BY) {
								for (String resource : cvTerm.getResources()) {
									pageCitations.add(resource);
								}
							}
						}
						pageCitationsMap.put(page, pageCitations);
					}
				}
			}
		}

		functionMap = new HashMap<>();
		final Map<String, String> bioLQMOriginalMethodFunctionMap = new HashMap<>();
		final Map<String, String> bioLQMImprovedMethodFunctionMap = new HashMap<>();
		if(qualModel != null) {
			BooleanNetExport.export(sbmlQualImport.getModel(), bioLQMOriginalMethodFunctionMap);

			for (Transition transition : qualModel.getListOfTransitions()) {
				final Output output = transition.getListOfOutputs().iterator().next();
				String id = output.getQualitativeSpecies();
				if (sbmlIdToSpeciesMap.containsKey(id)) {
					sbmlIdToSpeciesMap.get(id).setExternal(Boolean.FALSE);
				}

				final ListOf<Input> listInputs = transition.getListOfInputs();

				if (listInputs.size() > 0) {
					final Species species = sbmlIdToSpeciesMap.get(id);
					for (Input inputText : listInputs) {					
						Set<List<KnowledgeBaseNode>> sectionNotesText = null;
						String specieAssoc = "";
						try {
							specieAssoc = sbmlIdToSpeciesNameMap.get(inputText.getQualitativeSpecies());
							sectionNotesText = getQualNoteContent(inputText.getNotesString(), specieAssoc);
						} catch(XMLStreamException e) {
							System.err.println("Error getting notes for Input Transitions " + specieAssoc + ": " + e.getMessage());
						}
						if (sectionNotesText != null && CollectionUtils.isNotEmpty(sectionNotesText)) {
							final Page pageInput = new Page();
							pageInput.setId(entityId);
							pageInput.setSpecies(species.getSpeciesIdentifier());
							knowledgeBaseNodesMap.put(pageInput, sectionNotesText);
						}
					}
					--entityId;
				}

				Iterator<FunctionTerm> iterator = transition.getListOfFunctionTerms().iterator();
				ASTNode astNode = null;
				while (iterator.hasNext()) {
					final FunctionTerm functionTerm = iterator.next();
					if (functionTerm.getResultLevel() == SBMLProperties.SBML_TERM_DEFAULT_RESULT_LEVEL) {
						astNode = functionTerm.getMath();
						break;
					}
				}

				if (astNode != null) {
					try {
						final String booleanExpression = sbmlQualImport.mathml2stringExec(astNode, 0);
						bioLQMImprovedMethodFunctionMap.put(id, booleanExpression);
					} catch (Exception e) {
						/*
						 * Ignore.
						 */
					}
				}
			}
		}
		//bioLQMImprovedMethodFunctionMap.clear();

		getBiologicalConstructsResponseMap = new HashMap<>(functionMap.size(), 1.0f);

		CloseableHttpClient httpClient = HttpClients.createDefault();
		for (String id : bioLQMOriginalMethodFunctionMap.keySet()) {
			Species species = sbmlIdToSpeciesMap.get(id);
			if (species == null || Boolean.TRUE.equals(species.isExternal())) {
				continue;
			}
			String function = bioLQMOriginalMethodFunctionMap.get(id);
			String improvedFunction = bioLQMImprovedMethodFunctionMap.get(id);
			if ("1".equals(function)) {
				Regulator selfRegulator = new Regulator();
				selfRegulator.setRegulationType(RegulationType.POSITIVE);
				selfRegulator.setId(entityId);
				--entityId;
				selfRegulator.setSpecies(species.getSpeciesIdentifier());
				selfRegulator.setRegulatorSpecies(species.getSpeciesIdentifier());
				species.setAbsentState(AbsentState.ON);
				species.addRegulator(selfRegulator);
				/*
				 * No significant improvements can be made to the method when a component is an
				 * input to itself.
				 */
				improvedFunction = null;
			}

			BiologicResponse biologicResponse = null;
			if (improvedFunction != null) {
				String json = attemptFunctionToBiologic(httpClient, improvedFunction, false);
				if (json != null) {
					try {
						biologicResponse = objectMapper.readValue(json, BiologicResponse.class);
					} catch (IOException e) {
						System.out.println("Error parsing Biologic response (not-valid returned structure from the ccbool getbiologic)");
						System.out.println(e.getMessage());
						e.printStackTrace();
						/*
						 * Ignore.
						 */
					}
					if (biologicResponse != null) {
						getBiologicalConstructsResponseMap.put(id, json);
						functionMap.put(id, improvedFunction);
						applyBiologicToSpecies(species, biologicResponse, sbmlIdToSpeciesMap);
					}
				}
			}
			if (biologicResponse == null && function != null && !"1".equals(function)) {
				String json = attemptFunctionToBiologic(httpClient, function, true);
				if (json != null) {
					try {
						biologicResponse = objectMapper.readValue(json, BiologicResponse.class);
					} catch (IOException e) {
						throw new SBMLImportException(sbmlFile, e);
					}
					if (biologicResponse != null) {
						getBiologicalConstructsResponseMap.put(id, json);
						functionMap.put(id, function);
						applyBiologicToSpecies(species, biologicResponse, sbmlIdToSpeciesMap);
					}
				}
			}
		}

		if (MapUtils.isNotEmpty(sbmlIdToSpeciesMap)) {
			sbmlIdToSpeciesMap.values().stream().forEach((s) -> model.addSpecies(s));
		}

		return model;
	}

	private String attemptFunctionToBiologic(final CloseableHttpClient httpClient, final String function,
			final boolean failNoSuccess) throws SBMLImportException {
		StringEntity requestEntity = new StringEntity("{ \"expr\": \"" + function + "\"}",
				ContentType.APPLICATION_JSON);

		// String serviceURL = "http://"+System.getenv("CC_WEB_HOST")+":"+System.getenv("CC_WEB_PORT")+"/web/api/boolean/regulator"; 
		String serviceURL = System.getenv("CC_BOOLEAN_URL")+"/regulator";

		HttpPost httpPost = new HttpPost(serviceURL);
		httpPost.setEntity(requestEntity);

		CloseableHttpResponse httpResponse = null;
		try {
			System.out.println("Connecting to "+ serviceURL);
			httpResponse = httpClient.execute(httpPost);
		} catch (IOException e) {
			if (failNoSuccess) {
				System.err.println("Error connecting to " + serviceURL + ": " + e.getMessage());
				throw new SBMLImportException(sbmlFile, e);
			} else {
				return null;
			}
		}

		int statusCode = httpResponse.getStatusLine().getStatusCode();
		try {
			if (statusCode == 200) {
				final HttpEntity entity = httpResponse.getEntity();
        if (entity != null) {
					try (InputStream content = entity.getContent()) {
						final String json = IOUtils.toString(content);
						JSONObject res = new JSONObject(json);
						String data = res.getJSONObject("data").toString();
						return data;
					} catch (UnsupportedOperationException | IOException e) {
						if (failNoSuccess) {
							throw new SBMLImportException(sbmlFile, e);
						}
					}
				}
			}
		} finally {
			if (httpResponse != null) {
				try {
					httpResponse.close();
				} catch (IOException e) {
					/*
					 * Skip for now.
					 */
				}
			}
		}

		System.out.println("ERROR in the SBML function: ");
		System.out.println(function);
		return null;
		// throw new SBMLImportException(sbmlFile);
	}

	private String getComponentName(final BiologicResponse biologicResponse, final String biologicId){
		return biologicResponse.components.get(biologicId).name;
	}

	private void applyBiologicToSpecies(final Species species, final BiologicResponse biologicResponse,
			final Map<String, Species> sbmlIdToSpeciesMap) {
		species.setAbsentState(biologicResponse.absentState ? AbsentState.ON : AbsentState.OFF);
		if (biologicResponse.regulators == null || biologicResponse.regulators.isEmpty()) {
			return;
		}

		final Map<String, Regulator> sbmlIdToRegulatorMap = new HashMap<>(biologicResponse.regulators.size(),
				1.0f);
		/*
		 * Initially, create all of the {@link Regulator}s.
		 */
		biologicResponse.regulators.forEach((regulatorId, regulatorJSON) -> {
			Regulator regulator = new Regulator();
			
			regulator.setRegulatorSpecies(species.getSpeciesIdentifier());
			Species regulatorSpecies = sbmlIdToSpeciesMap.get(
				getComponentName(biologicResponse, regulatorJSON.getComponent())
			);
			if (regulatorSpecies == null) {
        System.out.println("Species not found for regulator: " + regulatorId);
    	} else {
			regulator.setRegulatorSpecies(regulatorSpecies.getSpeciesIdentifier());
			regulator.setRegulationType(RegulationType.NEGATIVE);
			if (regulatorJSON.isType()) {
				regulator.setRegulationType(RegulationType.POSITIVE);
			}
			regulator.setConditionRelation(Relation.OR);
			if (regulatorJSON.isConditionRelation()) {
				regulator.setConditionRelation(Relation.AND);
			}
			regulator.setId(entityId);
			--entityId;
			sbmlIdToRegulatorMap.put(regulatorId, regulator);

			species.addRegulator(regulator);
			}
		});

		/*
		 * Now, iterate through all of the created {@link Regulator}s and add {@link
		 * Condition}s, {@link SubCondition}s, and dominance {@link Regulator}.
		 */
		biologicResponse.regulators.forEach((regulatorId, regulatorJSON) -> {
			Regulator regulator = sbmlIdToRegulatorMap.get(regulatorId);

			if (CollectionUtils.isNotEmpty(regulatorJSON.getDominants())) {
				for (RegulatorJSON dominantRegulatorJSON : regulatorJSON.getDominants()) {
					Regulator dominantRegulator = sbmlIdToRegulatorMap.get(dominantRegulatorJSON.getComponent());
					if (dominantRegulator != null) {
						regulator.addDominance(dominantRegulator.getRegulatorIdentifier());
					}
				}
			}
			if (CollectionUtils.isNotEmpty(regulatorJSON.getConditions())) {
				for (ConditionJSON conditionJSON : regulatorJSON.getConditions()) {
					Condition condition = new Condition();

					condition.setRegulator(regulator.getRegulatorIdentifier());
					condition.setType(ConditionalType.UNLESS);
					if (conditionJSON.isType()) {
						condition.setType(ConditionalType.IF_WHEN);
					}
					condition.setState(ConditionalState.OFF);
					if (conditionJSON.isState()) {
						condition.setState(ConditionalState.ON);
					}
					condition.setSpeciesRelation(Relation.OR);
					if (conditionJSON.isComponentRelation()) {
						condition.setSpeciesRelation(Relation.AND);
					}
					condition.setSubConditionRelation(Relation.OR);
					if (conditionJSON.isSubConditionRelation()) {
						condition.setSubConditionRelation(Relation.AND);
					}
					if (CollectionUtils.isNotEmpty(conditionJSON.getComponents())) {
						for (String componentId : conditionJSON.getComponents()) {
							String componentName = getComponentName(biologicResponse, componentId);
							Species componentSpecies = sbmlIdToSpeciesMap.get(componentName);
							if (componentSpecies == null) {
								continue;
							}
							condition.addSpecies(componentSpecies.getSpeciesIdentifier());
						}
					}
					condition.setId(entityId);
					--entityId;
					regulator.addCondition(condition);

					if (CollectionUtils.isEmpty(conditionJSON.getConditions())) {
						/*
						 * No {@link SubCondition}s.
						 */
						continue;
					}

					for (SubConditionJSON subConditionJSON : conditionJSON.getConditions()) {
						SubCondition subCondition = new SubCondition();
						subCondition.setCondition(condition.getConditionIdentifier());
						subCondition.setType(ConditionalType.UNLESS);
						if (subConditionJSON.isType()) {
							subCondition.setType(ConditionalType.IF_WHEN);
						}
						subCondition.setState(ConditionalState.OFF);
						if (subConditionJSON.isState()) {
							subCondition.setState(ConditionalState.ON);
						}
						subCondition.setSpeciesRelation(Relation.OR);
						if (subConditionJSON.isComponentRelation()) {
							subCondition.setSpeciesRelation(Relation.AND);
						}
						if (CollectionUtils.isNotEmpty(subConditionJSON.getComponents())) {
							for (String componentId : subConditionJSON.getComponents()) {
								String componentName = getComponentName(biologicResponse, componentId);
								Species componentSpecies = sbmlIdToSpeciesMap.get(componentName);
								if (componentSpecies == null) {
									continue;
								}
								subCondition.addSpecies(componentSpecies.getSpeciesIdentifier());
							}
						}
						subCondition.setId(entityId);
						--entityId;
						condition.addSubCondition(subCondition);
					}
				}
			}
		});	
	}

	public long getEntityId() {
		return entityId;
	}

	public Map<String, String> getSbmlIdToSpeciesNameMap() {
		if (sbmlIdToSpeciesNameMap == null) {
			return Collections.emptyMap();
		}
		return sbmlIdToSpeciesNameMap;
	}

	public Map<String, String> getFunctionMap() {
		return functionMap;
	}

	public Map<String, String> getGetBiologicalConstructsResponseMap() {
		return getBiologicalConstructsResponseMap;
	}

	public List<String> getModelCitations() {
		return modelCitations;
	}

	public Map<Page, Set<List<KnowledgeBaseNode>>> getKnowledgeBaseNodesMap() {
		return knowledgeBaseNodesMap;
	}

	public Map<Page, List<String>> getPageCitationsMap() {
		return pageCitationsMap;
	}

	public cc.common.data.model.Layout getModelLayout() {
		return modelLayout;
	}

	public List<LayoutNode> getModelLayoutNodes() {
		return modelLayoutNodes;
	}

	public Set<List<KnowledgeBaseNode>> getQualNoteContent(String notes, String name) {
		try {
			if (notes.isEmpty()) {
				return null;
			}
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document doc = builder.parse(new InputSource(new StringReader(notes)));
			Element root = doc.getDocumentElement();
			NodeList pList = root.getElementsByTagName("p");
			NodeList ulList = root.getElementsByTagName("ul");

			final Set<List<KnowledgeBaseNode>> sectionsList = new HashSet<>();
			final List<KnowledgeBaseNode> regulatoryList = new ArrayList<>();
			final List<KnowledgeBaseNode> descriptionList = new ArrayList<>();
			final List<KnowledgeBaseNode> regulatorList = new ArrayList<>();

			if (pList.getLength() > 0) {
				for (int i = 0; i < pList.getLength(); i++) {
					Element pElement = (Element) pList.item(i);
					String pText = pElement.getTextContent();
					String contentType = pElement.getAttribute("contentType");
					String contentPKey = pElement.getAttribute("key");

					List<ReferenceNode> referenceList = new ArrayList<>();

					if (ulList.getLength() > 0) {												
						int ulIndexByKey = findUlIndexByKey(contentPKey, ulList);
						if (ulIndexByKey > -1) {
							Element ulElement = (Element) ulList.item(ulIndexByKey);
							NodeList liList = ulElement.getElementsByTagName("li");
							for (int j = 0; j < liList.getLength(); j++) {
								final ReferenceNode referSpan = new ReferenceNode();
								Element liElement = (Element) liList.item(j);
								NodeList spanList = liElement.getElementsByTagName("span");
								for (int h = 0; h < spanList.getLength(); h++) {
									Element spanElement = (Element) spanList.item(h);
									String className = spanElement.getAttribute("class");
									String spanValue = spanElement.getTextContent();
									referSpan.setValue(className, spanValue);
								}
								referenceList.add(referSpan);
							}
						}
					}

					if (contentType == null || contentType.equals(KnowledgeBaseAdapter.KB_SECTION_DESCRIPTION)) {
						final KnowledgeBaseNode contentDescription = new Description();
						contentDescription.setText(pText);
						contentDescription.setTitle(name);
						contentDescription.setReferences(referenceList);
						descriptionList.add(contentDescription);
					} else if (contentType.equals(KnowledgeBaseAdapter.KB_SECTION_REGULATORY_SUMMARY)) {
						final KnowledgeBaseNode contentRegulatory = new RegulatorySummary();
						contentRegulatory.setText(pText);
						contentRegulatory.setTitle(name);
						contentRegulatory.setReferences(referenceList);
						regulatoryList.add(contentRegulatory);
					} else if (contentType.equals(KnowledgeBaseAdapter.KB_SECTION_UPSTREAM_REGULATOR)) {
						final KnowledgeBaseNode contentRegulators = new UpstreamRegulator();
						contentRegulators.setText(pText);
						contentRegulators.setTitle(name);
						contentRegulators.setReferences(referenceList);
						regulatorList.add(contentRegulators);
					}
				}
			}			

			if (descriptionList.size() > 0) {
				sectionsList.add(descriptionList);
			}
			if (regulatoryList.size() > 0) {
				sectionsList.add(regulatoryList);
			}
			if (regulatorList.size() > 0) {
				sectionsList.add(regulatorList);
			}
			
			return sectionsList;

		} catch (ParserConfigurationException | SAXException | IOException e) {
			System.err.println("Error getting notes for species " + name + ": " + e.getMessage());
		}
		return null;
	}

	private int findUlIndexByKey(String key, NodeList ulList) {
		int k = -1;
		for (int i = 0; i < ulList.getLength(); i++) {
			Element ulElement = (Element) ulList.item(i);
			String ulKey = ulElement.getAttribute("key");
			if (ulKey.trim().equals(key.trim())) {
				k = i;
				break;
			}
		}
		return k;
	}
}
