/**
 * 
 */
package cc.application.main.controller;

import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

import cc.application.main.cache.LocalUploadCacheManager;
import cc.application.main.json.UploadJSON;
import cc.common.data.model.Upload;
import cc.common.data.model.UploadType;
import cc.dataaccess.main.dao.UploadDao;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/model")
public class UploadController extends AbstractController {

	@Autowired
	private UploadDao uploadDao;

	private String allowedFileTypesReturnString;

	public UploadController() {
		StringBuilder sb = new StringBuilder();
		boolean first = true;
		for (UploadType uploadTypeIter : UploadType.values()) {
			if (first) {
				first = false;
			} else {
				sb.append(", ");
			}
			sb.append(uploadTypeIter.name());
		}
		this.allowedFileTypesReturnString = sb.toString();
	}

	@RequestMapping(value = "/upload",
			method = RequestMethod.POST,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> upload(@RequestParam("upload") MultipartFile uploadedFile,
			@RequestParam(value = "description",
					required = false) String description) {
		final String uploadedFileName = Paths.get(uploadedFile.getOriginalFilename()).getFileName().toString();

		final Long userId = this.getAuthenticatedUserId();

		/*
		 * Only authenticated users are allowed to upload files.
		 */
		if (userId == null) {
			return new ResponseEntity<Object>("You must be logged in to upload a file.", HttpStatus.FORBIDDEN);
		}

		UploadType uploadType = null;
		for (UploadType uploadTypeIter : UploadType.values()) {
			if (uploadedFileName.toLowerCase().endsWith(uploadTypeIter.getExtension())) {
				uploadType = uploadTypeIter;
				break;
			}
		}
		if (uploadType == null) {
			return new ResponseEntity<Object>(
					"Unsupported file type. Was expecting one of: " + this.allowedFileTypesReturnString + ".",
					HttpStatus.BAD_REQUEST);
		}

		Upload upload = new Upload();
		upload.setUploadName(uploadedFileName);
		final String storageName = UUID.randomUUID().toString() + uploadType.getExtension();
		upload.setStorageName(storageName);
		upload.setFileType(uploadType);
		upload.setUserId(userId);
		upload.setDescription(description);

		logger.info("Uploading file: {} for user: {}.", upload.toString(), userId);

		try {
			final byte[] content = uploadedFile.getBytes();
			upload = this.uploadDao.saveUpload(upload, content);
		} catch (Exception e) {
			logger.error("Failed to upload file: " + upload.toString() + " for user: " + userId + ".", e);
			return new ResponseEntity<Object>("Failed to upload the file: " + e.getMessage() + ".",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		final Map<Long, UploadJSON> uploadMap = new HashMap<>(1, 1.0f);
		Map<String, Object> claims = new HashMap<>();
		claims.put("USER", userId);
		claims.put("UPLOAD", upload.getId());
		final String token = Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, "DOWNLOAD").compact();
		uploadMap.put(upload.getId(), new UploadJSON(upload, token));
		LocalUploadCacheManager.getInstance().cache(upload);

		return new ResponseEntity<Object>(uploadMap, HttpStatus.OK);
	}
}