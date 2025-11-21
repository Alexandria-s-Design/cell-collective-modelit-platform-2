/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.common.data.biologic.Species;
import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Section;
import cc.common.data.model.Model;
import cc.dataaccess.main.dao.PageDao;
import cc.dataaccess.main.dao.SpeciesDao;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/knowledge")
public class KnowledgeBaseExportController extends AbstractController {

	private static final String KNOWLEDGE_DIRECTORY = "knowledge";

	private static final String CONTENT_FILE_EXPORT_FORMAT = "%s_%s_%s_%s.txt";

	private static final String PMID_FILE_EXPORT_FORMAT = "%s.txt";

	private Path knowledgeExportPath;

	@Autowired
	private SpeciesDao speciesDao;

	@Autowired
	private PageDao pageDao;

	@PostConstruct
	public void initialize() {
		this.knowledgeExportPath = ccFileManager.getCcExportPath().resolve(KNOWLEDGE_DIRECTORY);
		if (!Files.exists(knowledgeExportPath)) {
			try {
				Files.createDirectories(knowledgeExportPath);
				logger.info("Successfully created Knowledge Export directory: {}.", knowledgeExportPath.toString());
			} catch (IOException e) {
				throw new RuntimeException(
						"Failed to create Knowledge Export directory: " + knowledgeExportPath.toString() + ".", e);
			}
		}
	}

	@RequestMapping(value = "/export", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> export() {

		/*
		 * Retrieve a list of all published Models.
		 */
		List<Model> publishedModels = modelDao.getViewableModels(null);
		for (Model model : publishedModels) {
			logger.info("Exporting Knowledge Base for Model: {} ...", model.getModelIdentifier().toString());

			final Path modelKnowledgeExportPath = knowledgeExportPath.resolve(Long.toString(model.getId()));
			if (Files.exists(modelKnowledgeExportPath)) {
				logger.info(
						"Knowledge for Model: {} has already previously been exported. Please remove the previous export to generate a new export.",
						model.getModelIdentifier());
				continue;
			}

			final List<Species> speciesList = speciesDao.getSpeciesForModel(model.getId());
			for (Species species : speciesList) {
				Page page = pageDao.getById(species.getId());
				if (page == null) {
					logger.info("No Knowledge Base Page exists for Species: {}. Skipping.",
							species.getSpeciesIdentifier());
					continue;
				}
				logger.info("Generating Knowledge Base Page Export for Species: {} ...",
						species.getSpeciesIdentifier());
				try {
					writeKBExport(page, model, modelKnowledgeExportPath);
				} catch (Exception e) {
					return new ResponseEntity<Object>(
							"Failed to complete Knowledge Export for Model: " + model.getModelIdentifier().toString()
									+ ". Please refer to the logs for additional information.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
			logger.info("Successfully exported Knowledge Base for Model: {}.", model.getModelIdentifier().toString());
		}

		return new ResponseEntity<Object>("Published Knowledge Base Export Complete.", HttpStatus.OK);
	}

	private void writeKBExport(final Page page, final Model model, final Path modelKnowledgeExportPath)
			throws Exception {
		if (!Files.exists(modelKnowledgeExportPath)) {
			try {
				Files.createDirectories(modelKnowledgeExportPath);
			} catch (IOException e) {
				throw new Exception(
						"Failed to create Knowledge Export directory: " + modelKnowledgeExportPath.toString()
								+ "for Model: " + model.getModelIdentifier().toString() + ".",
						e);
			}
		}

		// {page id}_{section id}_{content id}_{position}.txt
		if (CollectionUtils.isEmpty(page.getSections())) {
			/*
			 * Nothing to export.
			 */
			return;
		}

		/*
		 * Iterate the Sections and check for Content.
		 */
		for (Section section : page.getSections()) {
			if (CollectionUtils.isEmpty(section.getContents())) {
				/*
				 * Nothing to export for this Section.
				 */
				continue;
			}

			for (Content content : section.getContents()) {
				final String contentExportName = String.format(CONTENT_FILE_EXPORT_FORMAT, Long.toString(page.getId()),
						Long.toString(section.getId()), Long.toString(content.getId()),
						Long.toString(content.getPosition()));
				final Path contentExportPath = modelKnowledgeExportPath.resolve(contentExportName);
				try {
					Files.write(contentExportPath, content.getText().getBytes());
					logger.info("Successfully wrote Knowledge Content export file: {} for Model: {}.",
							contentExportPath.toString(), model.getModelIdentifier().toString());
				} catch (IOException e) {
					throw new Exception(
							"Failed to write Knowledge Content to export file: " + contentExportPath.toString()
									+ " for Model: " + model.getModelIdentifier().toString() + ".",
							e);
				}
			}
		}

		// {page_id}.txt
		if (CollectionUtils.isNotEmpty(page.getReferences())) {
			final List<PageReference> pageReferencesList = new ArrayList<>(page.getReferences());
			Collections.sort(pageReferencesList, new PageReferenceComparator());

			final List<String> pmidList = new LinkedList<>();
			for (PageReference pageReference : pageReferencesList) {
				pmidList.add(pageReference.getReference().getPmid());
			}

			final String pmidExportName = String.format(PMID_FILE_EXPORT_FORMAT, Long.toString(page.getId()));
			final Path pmidExportPath = modelKnowledgeExportPath.resolve(pmidExportName);
			try {
				Files.write(pmidExportPath, pmidList);
			} catch (IOException e) {
				throw new Exception("Failed to write Knowledge PMIDs to export file: " + pmidExportPath.toString()
						+ " for Model: " + model.getModelIdentifier().toString() + ".", e);
			}
		}
	}
}