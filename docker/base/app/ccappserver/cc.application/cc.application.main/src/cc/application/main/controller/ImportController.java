/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import cc.application.jsbml.SBMLImportException;
import cc.application.jsbml.SBMLImporter;
import cc.application.jsbml.UnsupportedSBMLException;
import cc.application.jsbml.knowledge.KnowledgeBaseNode;
import cc.application.jsbml.knowledge.ReferenceNode;
import cc.application.main.json.ContentReferenceMap;
import cc.application.main.json.ModelReferenceMap;
import cc.application.main.json.ModelBiologicMap;
import cc.application.main.json.ReferenceMap;
import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.RegulatorIdentifier;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;
import cc.common.data.builder.BooleanExpressionBuilder;
import cc.common.data.builder.IExpressionCustomizer;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Reference;
import cc.common.data.knowledge.ContentReference;
import cc.common.data.model.Layout;
import cc.common.data.model.Model;
import cc.common.data.model.ModelReference;
import cc.core.configuration.manager.CCFileManager;
import cc.dataaccess.ConditionSpeciesId;
import cc.dataaccess.DominanceId;
import cc.dataaccess.SubConditionSpeciesId;
import cc.common.data.knowledge.Section;
import cc.common.data.knowledge.Content;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/model")
public class ImportController extends KnowledgeController {

	@Autowired
	private CCFileManager ccFileManager;

	private static final int IMPORT_MODEL_ID = 1;

	public static enum ImportType {
		SBML(".sbml"),
		XML(".xml");

		private final String extension;

		private ImportType(final String extension) {
			this.extension = extension;
		}

		public String getExtension() {
			return extension;
		}
	}

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private String allowedFileTypesReturnString;

	public ImportController() {
		StringBuilder sb = new StringBuilder();
		boolean first = true;
		for (ImportType importTypeIter : ImportType.values()) {
			if (first) {
				first = false;
			} else {
				sb.append(", ");
			}
			sb.append(importTypeIter.name());
		}
		this.allowedFileTypesReturnString = sb.toString();
	}

	/*
	 * curl -i -H "Content-Type: multipart/format-data" -F "upload=@5128.sbml"
	 * http://localhost:8080/model/import
	 */

	@RequestMapping(value = "/import", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> upload(@RequestParam("upload") MultipartFile uploadedFile) {
		final Long userId = getAuthenticatedUserId();
		final String uploadedFileName = Paths.get(uploadedFile.getOriginalFilename()).getFileName().toString();

		ImportType importType = null;
		for (ImportType importTypeIter : ImportType.values()) {
			if (uploadedFileName.toLowerCase().endsWith(importTypeIter.getExtension())) {
				importType = importTypeIter;
				break;
			}
		}
		if (importType == null) {
			return new ResponseEntity<Object>(
					"Unsupported file type. Was expecting one of: " + this.allowedFileTypesReturnString + ".",
					HttpStatus.BAD_REQUEST);
		}

		logger.info("Importing SBML File: {} ...", uploadedFileName);

		SBMLImporter sbmlImporter = new SBMLImporter(uploadedFileName);
		byte[] sbmlBytes = null;
		Model model = null;
		try {
			sbmlBytes = uploadedFile.getBytes();
			logger.info("Importing SBML File: importSBML");
			model = sbmlImporter.importSBML(uploadedFile.getInputStream());
			logger.info("Importing SBML File: importSBML SUCCESS");
		} catch (SBMLImportException | IOException e) {
			logger.error("SBML Import of SBML File: " + uploadedFileName + " has failed.", e);
			return new ResponseEntity<Object>("SBML Import of file: " + uploadedFileName + " has failed.",
					HttpStatus.BAD_REQUEST);
		} catch (UnsupportedSBMLException e) {
			logger.error("Failed to import unsupported SBML file: " + uploadedFileName + ".", e);
			return new ResponseEntity<Object>("Unsupported SBML provided: " + e.getLocalizedMessage(),
					HttpStatus.BAD_REQUEST);
		}

		/*
		 * Now, we can retrieve the boolean expressions constructed from the Biologic
		 * for each Species.
		 */
		if (CollectionUtils.isNotEmpty(model.getSpecies())) {
			final IExpressionCustomizer expressionCustomizer = new SBMLImportVerificationExpressionCustomizer();
			final Map<String, String> biologicSpeciesToBoolExpressionMap = new HashMap<>(model.getSpecies().size(),
					1.0f);
			for (Species species : model.getSpecies()) {
				if (Boolean.TRUE.equals(species.isExternal())) {
					continue;
				}
				Set<String> inputSpecies = new HashSet<>();
				final Set<Long> inputSpeciesIds = new HashSet<>();
				String expression = null;
				try {
					expression = BooleanExpressionBuilder.buildBooleanExpression(species, expressionCustomizer,
							inputSpecies, inputSpeciesIds);
				} catch (Exception e) {
					logger.error("Failed to build a Boolean Expression for: " + species.toString() + ".", e);
				}
				biologicSpeciesToBoolExpressionMap.put(species.getName(),
						(expression == null) ? StringUtils.EMPTY : expression);
			}

			final Map<String, String> functionMap = sbmlImporter.getFunctionMap();
			final Map<String, String> getBiologicalConstructsResponseMap = sbmlImporter
					.getGetBiologicalConstructsResponseMap();
			final CloseableHttpClient httpClient = HttpClients.createDefault();
			for (String sbmlId : biologicSpeciesToBoolExpressionMap.keySet()) {
				final String failureSpecies = sbmlId;
				final String sbmlExpr = functionMap.get(sbmlId);
				final String biologicExpr = biologicSpeciesToBoolExpressionMap.get(sbmlId);
				if (sbmlExpr == null || biologicExpr == null || "1".equals(sbmlExpr)) {
					continue;
				}
				Boolean matches = null;
				try {
					matches = BooleanExpressionComparisonUtil.compareBooleanExpressions(httpClient, sbmlExpr,
							biologicExpr);
				} catch (Exception e) {
					// TODO: log
					matches = null;
				}

				if (Boolean.TRUE.equals(matches)) {
					/*
					 * No issues with the Biologic conversion.
					 */
					continue;
				}
				final String failureUUID = logFailure(functionMap, biologicSpeciesToBoolExpressionMap,
						getBiologicalConstructsResponseMap, failureSpecies, sbmlBytes);
				logger.error("SBML Import of SBML File: " + uploadedFileName + " has failed. Reference Error: "
						+ failureUUID + ". Boolean functions do not match for component: " + sbmlId + " => sbml expr = "
						+ sbmlExpr + "; biologic expr = " + biologicExpr + ".");
				return new ResponseEntity<Object>("The SBML Import has failed. Error: " + failureUUID + ".",
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}

		/*
		 * Replace sbml ids in the species names (retained for verification purposes)
		 * with the actual species names as recorded in the SBML.
		 */
		final Map<String, String> sbmlIdToSpeciesNameMap = sbmlImporter.getSbmlIdToSpeciesNameMap();
		if (CollectionUtils.isNotEmpty(model.getSpecies())) {
			int speciesNameMaxLen = Species.getNameMaxLength();
			for (Species species : model.getSpecies()) {
				String sbmlId = species.getName();
				species.setName(shortenName(sbmlIdToSpeciesNameMap.get(sbmlId), speciesNameMaxLen));
				if (CollectionUtils.isNotEmpty(species.getRegulators())) {
					for (Regulator regulator : species.getRegulators()) {
						sbmlId = regulator.getRegulatorSpecies().getName();
						regulator.getRegulatorSpecies().setName(sbmlIdToSpeciesNameMap.get(sbmlId));
						sbmlId = regulator.getSpecies().getName();
						regulator.getSpecies().setName(sbmlIdToSpeciesNameMap.get(sbmlId));
						if (CollectionUtils.isNotEmpty(regulator.getConditions())) {
							for (Condition condition : regulator.getConditions()) {
								if (CollectionUtils.isNotEmpty(condition.getSpecies())) {
									for (SpeciesIdentifier conditionSpecies : condition.getSpecies()) {
										sbmlId = conditionSpecies.getName();
										conditionSpecies.setName(sbmlIdToSpeciesNameMap.get(sbmlId));
									}
								}
								if (CollectionUtils.isNotEmpty(condition.getSubConditions())) {
									for (SubCondition subCondition : condition.getSubConditions()) {
										if (CollectionUtils.isNotEmpty(subCondition.getSpecies())) {
											for (SpeciesIdentifier subConditionSpecies : subCondition.getSpecies()) {
												sbmlId = subConditionSpecies.getName();
												subConditionSpecies.setName(sbmlIdToSpeciesNameMap.get(sbmlId));
											}
										}
									}
								}
							}
						}
						if (CollectionUtils.isNotEmpty(regulator.getDominance())) {
							for (RegulatorIdentifier dominanceRegulator : regulator.getDominance()) {
								sbmlId = dominanceRegulator.getRegulator().getSpecies().getName();
								dominanceRegulator.getRegulator().getSpecies()
										.setName(sbmlIdToSpeciesNameMap.get(sbmlId));
								sbmlId = dominanceRegulator.getRegulator().getRegulatorSpecies().getName();
								dominanceRegulator.getRegulator().getRegulatorSpecies()
										.setName(sbmlIdToSpeciesNameMap.get(sbmlId));

								sbmlId = dominanceRegulator.getRegulatorSpecies().getName();
								dominanceRegulator.getRegulatorSpecies().setName(sbmlIdToSpeciesNameMap.get(sbmlId));
							}
						}
					}
				}
			}
		}

		/*
		 * Now add reference information for the model (if available).
		 */
		long entityId = sbmlImporter.getEntityId();		

		final ModelBiologicMap modelJSON = new ModelBiologicMap(model);
		final Map<Long, ReferenceMap> referencesMap = new HashMap<>();
		final Map<Long, ModelReferenceMap> modelReferencesMap = new HashMap<>();
		final Map<Long, ContentReferenceMap> contentReferencesMap = new HashMap<>();

		/**
		 * Setting citations
		 */
		if (CollectionUtils.isNotEmpty(sbmlImporter.getModelCitations())) {
			for (String citation : sbmlImporter.getModelCitations()) {
				if (citation.startsWith("urn:miriam:pubmed:")) {
					final String pmid = citation.replace("urn:miriam:pubmed:", StringUtils.EMPTY);
					Reference reference = null;
					try {
						reference = retrieveExistingCitationByPmid(pmid);
					} catch (Exception e) {
					}
					if (reference == null) {
						try {
							reference = retrieveNewCitationByPmid(pmid, userId);
						} catch (Exception e) {
						}
					}
					if (reference != null) {
						--entityId;

						ModelReference modelReference = new ModelReference();						
						modelReference.setId(entityId);
						modelReference.setCreationUser(userId);
						modelReference.setReference(reference);
						
						ReferenceMap referNodeMap = new ReferenceMap(reference);
						ModelReferenceMap modelReferNodeMap = new ModelReferenceMap(modelReference);

						referencesMap.put(reference.getId(), referNodeMap);
						modelReferencesMap.put(entityId, modelReferNodeMap);
					}
				}
			}
		}

		/*
		 * Need to re-id dominance, condition species, and sub-condition species.
		 */
		if (MapUtils.isNotEmpty(modelJSON.getConditionSpeciesMap())) {
			final List<ConditionSpeciesId> conditionSpeciesList = new ArrayList<>(
					modelJSON.getConditionSpeciesMap().values());
			modelJSON.getConditionSpeciesMap().clear();
			for (ConditionSpeciesId conditionSpeciesId : conditionSpeciesList) {
				--entityId;
				modelJSON.getConditionSpeciesMap().put(Long.toString(entityId), conditionSpeciesId);
			}
		}
		if (MapUtils.isNotEmpty(modelJSON.getSubConditionSpeciesMap())) {
			final List<SubConditionSpeciesId> subConditionSpeciesList = new ArrayList<>(
					modelJSON.getSubConditionSpeciesMap().values());
			modelJSON.getSubConditionSpeciesMap().clear();
			for (SubConditionSpeciesId subConditionSpeciesId : subConditionSpeciesList) {
				--entityId;
				modelJSON.getSubConditionSpeciesMap().put(Long.toString(entityId), subConditionSpeciesId);
			}
		}
		if (MapUtils.isNotEmpty(modelJSON.getDominanceMap())) {
			final List<DominanceId> dominanceList = new ArrayList<>(modelJSON.getDominanceMap().values());
			modelJSON.getDominanceMap().clear();
			for (DominanceId dominanceId : dominanceList) {
				--entityId;
				modelJSON.getDominanceMap().put(Long.toString(entityId), dominanceId);
			}
		}

		if (MapUtils.isNotEmpty(sbmlImporter.getKnowledgeBaseNodesMap())) {
			int sectionPos = 0;
			for (Entry<Page, Set<List<KnowledgeBaseNode>>> entry : sbmlImporter.getKnowledgeBaseNodesMap().entrySet()) {
				Set<List<KnowledgeBaseNode>> sectionListByType = entry.getValue();
				final Page page = entry.getKey();

				Set<Section> pageSections = new HashSet<>(sectionListByType.size(), 1.0f);
				Set<PageReference> pageReferences = new HashSet<>();

				//List of {Description, RegulatorySummary}
				for (List<KnowledgeBaseNode> sectionNodes : sectionListByType) {
					final Section section = new Section();
					sectionPos++;
					--entityId;
					section.setId(entityId);
					section.setPage(page.getIdentifier());
					section.setType(sectionNodes.get(0).getContentType());
					section.setTitle(sectionNodes.get(0).getTitle());
					section.setPosition(sectionPos);
					section.setUpdateUser(userId);
					section.setCreationUser(userId);
	
					final Set<Content> contentMap = new HashSet<>();
	
					int contentPos = 0;
					for (KnowledgeBaseNode contentNode : sectionNodes) {
							final Content content = new Content();
							content.setId(entityId);
							content.setText(contentNode.getText());
							content.setPosition(contentPos);
							content.setSection(section.getIdentifier());
							content.setUpdateUser(userId);
							content.setCreationUser(userId);
							contentMap.add(content);

							long entityReferId = entityId-99;
							for (ReferenceNode referNode: contentNode.getReferences()) {
								Reference referValue = null;

								if (referNode.getReferType().equals("PMID")) {
									final String pmid = referNode.getPmid();
									try {
										referValue = retrieveExistingCitationByPmid(pmid);
									} catch (Exception e) {
									}
									if (referValue == null) {
										try {
											referValue = retrieveNewCitationByPmid(pmid, userId);
										} catch (Exception e) {
										}
									}									
								}

								if (referNode.getReferType().equals("DOI")) {
									final String doi = referNode.getDoi();
									try {
										referValue = retrieveExistingCitationByDoi(doi);
									} catch (Exception e) {
									}
									if (referValue == null) {
										try {
											referValue = retrieveNewCitationByDoi(doi, userId);
										} catch (Exception e) {
										}
									}									
								}

								//If was found Resource
								if (referValue != null) {
									ContentReference contentReferValue = new ContentReference();
									PageReference pageReference = new PageReference();

									--entityId;
									
									pageReference.setId(entityId);
									pageReference.setPage(page.getIdentifier());
									pageReference.setReference(referValue);
									pageReferences.add(pageReference);

									contentReferValue.setReference(referValue);
									contentReferValue.setCreationUser(userId);
									contentReferValue.setContent(content);

									ReferenceMap referNodeMap = new ReferenceMap(referValue);
									ContentReferenceMap contentReferNodeMap = new ContentReferenceMap(contentReferValue);

									referencesMap.put(referValue.getId(), referNodeMap);
									contentReferencesMap.put(entityReferId, contentReferNodeMap);
								}

								--entityReferId;
							}

						--entityId;
						contentPos++;
					}

					section.setContents(contentMap);
					pageSections.add(section);
				}

				page.setUpdateUser(userId);
				page.setCreationUser(userId);
				page.setSections(pageSections);
				modelJSON.constructKnowledgeBaseMapping(page);
			}
		}

		/**
		 * Store references
		 */
		if (MapUtils.isNotEmpty(referencesMap) == true) {
			if (MapUtils.isNotEmpty(contentReferencesMap)) {
				modelJSON.setContentReferenceMap(contentReferencesMap);
			}		
			if (MapUtils.isNotEmpty(modelReferencesMap)) {
				modelJSON.setModelReferenceMap(modelReferencesMap);
			}	

			modelJSON.setModelReference(referencesMap);					
		}

		/*
		 * Now add page and associated reference information (if applicable).
		 */
		if (MapUtils.isNotEmpty(sbmlImporter.getPageCitationsMap())) {
			for (Entry<Page, List<String>> entry : sbmlImporter.getPageCitationsMap().entrySet()) {
				List<String> citations = entry.getValue();
				final Page page = entry.getKey();
				Set<PageReference> pageReferences = new HashSet<>(citations.size(), 1.0f);

				for (String citation : citations) {
					if (citation.startsWith("urn:miriam:pubmed:")) {
						final String pmid = citation.replace("urn:miriam:pubmed:", StringUtils.EMPTY);
						Reference reference = null;
						try {
							reference = retrieveExistingCitationByPmid(pmid);
						} catch (Exception e) {
						}
						if (reference == null) {
							try {
								reference = retrieveNewCitationByPmid(pmid, userId);
							} catch (Exception e) {
							}
						}
						if (reference != null) {
							PageReference pageReference = new PageReference();
							--entityId;
							pageReference.setId(entityId);
							pageReference.setPage(page.getIdentifier());
							pageReference.setReference(reference);
							pageReferences.add(pageReference);
						}
					}
					page.setReferences(pageReferences);
					modelJSON.constructKnowledgeBaseMapping(page);
				}
			}
		}

		if (sbmlImporter.getModelLayout() != null) {
			List<Layout> layouts = new ArrayList<>(1);
			layouts.add(sbmlImporter.getModelLayout());
			modelJSON.constructLayoutMapping(layouts);
			modelJSON.setDefaultLayoutId(sbmlImporter.getModelLayout().getId());
			modelJSON.setLayoutId(sbmlImporter.getModelLayout().getId());

			modelJSON.constructLayoutNodeMapping(sbmlImporter.getModelLayoutNodes());
		}

		final Map<Integer, ModelBiologicMap> modelMap = new HashMap<>(1, 1.0f);
		modelMap.put(IMPORT_MODEL_ID, modelJSON);
		logger.info("Successfully imported SBML File: {}.", uploadedFileName);
		return new ResponseEntity<Object>(modelMap, HttpStatus.OK);
	}

	private String logFailure(final Map<String, String> functionMap,
			final Map<String, String> biologicSpeciesToBoolExpressionMap,
			final Map<String, String> getBiologicalConstructsResponseMap, final String failureSpecies, final byte[] sbmlBytes) {
		final String failureUUID = UUID.randomUUID().toString();

		final Path importErrorPath = ccFileManager.getCcImportPath().resolve(failureUUID);
		try {
			Files.createDirectories(importErrorPath);
		} catch (IOException e) {
			logger.error("Failed to create Import Error Directory: " + importErrorPath.toString() + ".", e);
			return failureUUID;
		}

		final Path exprTxtPath = importErrorPath.resolve("expr.txt");
		final Path sbmlPath = importErrorPath.resolve("file.sbml");
		final List<String> contents = new LinkedList<>();
		for (String sbmlId : biologicSpeciesToBoolExpressionMap.keySet()) {
			final String sbmlExpr = functionMap.get(sbmlId);
			final String biologicExpr = biologicSpeciesToBoolExpressionMap.get(sbmlId);
			final String getBiologicalConstructsResponse = getBiologicalConstructsResponseMap.get(sbmlId);
			if (sbmlExpr == null || biologicExpr == null || getBiologicalConstructsResponse == null) {
				continue;
			}

			if (failureSpecies.equals(sbmlId))
			{
				contents.add(sbmlId + " ===> [[[FAILED]]]");
			}
			else 
			{
				contents.add(sbmlId);
			}
			contents.add("SBML Expr: " + sbmlExpr);
			contents.add("Biologic Expr: " + biologicExpr);
			contents.add("getBiologicalConstructs Response: " + getBiologicalConstructsResponse);
			contents.add(StringUtils.EMPTY);
		}

		try {
			Files.write(exprTxtPath, contents);
		} catch (IOException e) {
			logger.error("Failed to write the Import Error Expression File: " + exprTxtPath.toString() + ".", e);
		}

		if (sbmlBytes != null) {
			try {
				Files.write(sbmlPath, sbmlBytes);
			} catch (IOException e) {
				logger.error("Failed to write the Import Error SBML File: " + sbmlPath.toString() + ".", e);
			}
		}

		return failureUUID;
	}

	private String shortenName(String name, int maxNameLen) {
		final int NAME_HASH_SUFFIX_LEN = 8;
		int origNamePartLen = maxNameLen - (NAME_HASH_SUFFIX_LEN + 1);
		if (name.length() <= origNamePartLen)
			return name;
		String hash = DigestUtils.sha1Hex(name);
		return name.substring(0, origNamePartLen) + "_" + hash.substring(0, NAME_HASH_SUFFIX_LEN);
	}
}