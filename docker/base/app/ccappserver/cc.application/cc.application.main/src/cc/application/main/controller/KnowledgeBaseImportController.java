/**
 * 
 */
package cc.application.main.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.common.data.knowledge.Content;
import cc.dataaccess.main.dao.ContentDao;
import cc.dataaccess.main.repository.ContentRepository;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/knowledge")
public class KnowledgeBaseImportController extends AbstractController {

	private static final Path KNOWLEDGE_IMPORT_PATH = Paths.get("C:\\Users\\Bryan Kowal\\Downloads\\kb\\KnowledgeBase");

	// private static final Path KNOWLEDGE_IMPORT_PATH =
	// Paths.get("/home/helikarlab/Downloads/logProc4");

	private static final String CONTENT_FILE_EXPORT_REGEX = "(\\d+)_(\\d+)_(\\d+)_(\\d+).txt";

	private static final int CONTENT_ID_GROUP = 3;

	private static final int POSITION_GROUP = 4;

	private static final Pattern CONTENT_FILE_EXPORT_PATTERN = Pattern.compile(CONTENT_FILE_EXPORT_REGEX);

	@Autowired
	private ContentDao contentDao;

	@Autowired
	private ContentRepository contentRepository;

	public KnowledgeBaseImportController() {
	}

	@RequestMapping(value = "/import", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> importKnowledge() {
		if (!Files.exists(KNOWLEDGE_IMPORT_PATH)) {
			return new ResponseEntity<Object>("Import Knowledge Directory does not exist.", HttpStatus.OK);
		}
		int count = 0;
		Collection<File> knowledgeImportFiles = FileUtils.listFiles(KNOWLEDGE_IMPORT_PATH.toFile(),
				new String[] { "txt" }, false);
		for (File knowledgeFile : knowledgeImportFiles) {
			logger.info("Importing Knowledge File: {} ...", knowledgeFile.getAbsolutePath());
			final String knowledgeFileName = knowledgeFile.toPath().getFileName().toString();
			final Matcher matcher = CONTENT_FILE_EXPORT_PATTERN.matcher(knowledgeFileName);
			if (!matcher.matches()) {
				continue;
			}

			String contentIdStr = matcher.group(CONTENT_ID_GROUP);
			String positionStr = matcher.group(POSITION_GROUP);

			long contentId = Long.parseLong(contentIdStr);
			int position = Integer.parseInt(positionStr);

			Content content = contentDao.getById(contentId);
			if (content == null) {
				continue;
			}

			String text = null;
			try {
				text = FileUtils.readFileToString(knowledgeFile).trim();
			} catch (Exception e) {
				continue;
			}

			if (text == null) {
				continue;
			}

			content.setText(text);
			if (content.getPosition() != position) {
				content = new Content(content);
				content.setPosition(position);
				content.setId(0);
			}

			contentRepository.save(content);
			++count;
		}

		return new ResponseEntity<Object>("Published Knowledge Base Import Complete; total imported = " + count + ".",
				HttpStatus.OK);
	}
}