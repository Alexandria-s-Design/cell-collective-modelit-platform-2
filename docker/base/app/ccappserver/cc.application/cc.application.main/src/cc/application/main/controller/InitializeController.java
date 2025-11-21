/**
 * 
 */
package cc.application.main.controller;

import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.application.main.cache.LocalDefinitionCacheManager;
import cc.application.main.cache.LocalMetadataValueRangeCacheManager;
import cc.application.main.cache.LocalUploadCacheManager;
import cc.application.main.json.InitializeJSON;
import cc.application.main.json.PingRetJSON;
import cc.application.main.json.UploadJSON;
import cc.common.data.metadata.Definition;
import cc.common.data.model.ModelDomainAccess;
import cc.common.data.model.Upload;
import cc.common.data.user.UserSubscription;
import cc.dataaccess.MetadataValueRange;
import cc.dataaccess.main.dao.DefinitionDao;
import cc.dataaccess.main.dao.UploadDao;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * @author Bryan Kowal
 */
@Controller
public class InitializeController extends AbstractController {

	@Autowired
	private DefinitionDao definitionDao;

	@Autowired
	private UploadDao uploadDao;

	public InitializeController() {
	}

	@PostConstruct
	public void initialize() {
		long start = System.currentTimeMillis();
		logger.info("Pre-loading the Metadata Definitions ...");
		List<Definition> allDefinitions = this.definitionDao.getAllDefinitions();
		LocalDefinitionCacheManager.getInstance().load(allDefinitions);
		logger.info("Metadata Definitions pre-load complete. Elapsed time = {} ms.",
				(System.currentTimeMillis() - start));

		start = System.currentTimeMillis();
		logger.info("Pre-loading the Metadata Value Ranges ...");
		List<MetadataValueRange> allMetadataValueRanges = this.metadataValueDao.getAllValueRanges();
		LocalMetadataValueRangeCacheManager.getInstance().load(allMetadataValueRanges);
		logger.info("Metadata Value Ranges pre-load complete. Elapsed time = {} ms.",
				(System.currentTimeMillis() - start));

		start = System.currentTimeMillis();
		logger.info("Pre-loading the Uploads ...");
		List<Upload> allUploads = this.uploadDao.getAllUploads();
		LocalUploadCacheManager.getInstance().load(allUploads);
		logger.info("Upload pre-load complete. Elapsed time = {} ms.", (System.currentTimeMillis() - start));
	}

	@RequestMapping(value = "/ping", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getPing() {
		return new ResponseEntity<Object>(
				new PingRetJSON(),
				HttpStatus.OK);
	}

	@RequestMapping(value = "/initialize", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getInitializeDate() {
		final Long userId = this.getAuthenticatedUserId();

		final Map<Long, UploadJSON> allUploads = LocalUploadCacheManager.getInstance().getAllUploads();
		final Map<Long, UploadJSON> userFilteredUploads;
		if (userId == null || allUploads.isEmpty()) {
			userFilteredUploads = Collections.emptyMap();
		} else {
			userFilteredUploads = new HashMap<>(allUploads.size(), 1.0f);
			for (UploadJSON uploadJSON : allUploads.values()) {
				if (uploadJSON.getUserId().longValue() == userId.longValue()) {
					/*
					 * Build the upload access token.
					 */
					Map<String, Object> claims = new HashMap<>();
					claims.put("USER", userId);
					claims.put("UPLOAD", uploadJSON.getId());
					final String token = Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, "DOWNLOAD")
							.compact();
					userFilteredUploads.put(uploadJSON.getId(), new UploadJSON(uploadJSON, token));
				}
			}
		}

		Calendar subscriptionExpires = null;
		if (userId != null) {
			final List<UserSubscription> userSubscriptions = userDao.getActiveUserSubscriptions(userId,
					Calendar.getInstance());
			if (CollectionUtils.isNotEmpty(userSubscriptions)) {
				subscriptionExpires = userSubscriptions.iterator().next().getExpirationDate();
			}
		}

		final List<ModelDomainAccess> modelDomainAccessList = this.modelDao.getModelDomainAccessForUser(userId);
		return new ResponseEntity<Object>(
				new InitializeJSON(LocalDefinitionCacheManager.getInstance().getAllDefinitions(),
						LocalMetadataValueRangeCacheManager.getInstance().getAllMetadataValueRanges(),
						userFilteredUploads, modelDomainAccessList, subscriptionExpires),
				HttpStatus.OK);
	}
}