/**
 * 
 */
package cc.application.main.controller;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.InputStreamReader;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.apache.http.HttpEntity;

import cc.application.main.CustomHeaders;
import cc.application.main.authentication.CCAuthority;
import cc.application.main.authentication.CCUser;
import cc.application.main.json.INullableFields;
import cc.application.main.json.ModelPermissions;
import cc.common.data.ClientEditableField;
import cc.common.data.TCCDomain;
import cc.common.data.TCCDomain.Domain;
import cc.common.data.model.Model;
import cc.common.data.model.ModelShare;
import cc.common.data.model.ModelShare.SHARE_ACCESS;
import cc.common.data.model.ModelVersion;
import cc.core.configuration.manager.CCFileManager;
import cc.dataaccess.main.dao.MetadataValueDao;
import cc.dataaccess.main.dao.ModelDao;
import cc.dataaccess.main.dao.ModelShareDao;
import cc.dataaccess.user.dao.UserDao;
import cc.application.main.WebServiceUtil;
import javax.servlet.http.HttpServletRequest;

/**
 * @author Bryan
 *
 */
public abstract class AbstractController {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	protected final Logger performanceLogger = LoggerFactory.getLogger("performanceLogger");

	private static final String ACCESS_CONTROL_MAX_AGE_HEADER = "Access-Control-Max-Age";

	private static final String CACHE_CONTROL_HEADER = "cache-control";

	private static final String MAX_AGE = "525600";

	private static final String CACHE_CONTROL_VALUE = "max-age=" + MAX_AGE;

	@Autowired
  private HttpServletRequest request;

	@Autowired
	protected CCFileManager ccFileManager;

	@Autowired
	protected UserDao userDao;

	@Autowired
	protected ModelDao modelDao;

	@Autowired
	protected ModelShareDao modelShareDao;

	@Autowired
	protected MetadataValueDao metadataValueDao;

	/**
	 * 
	 */
	protected AbstractController() {
	}

	protected void addCacheControlResponse(ServletResponse res) {
		HttpServletResponse response = (HttpServletResponse) res;
		response.setHeader(ACCESS_CONTROL_MAX_AGE_HEADER, MAX_AGE);
		response.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
	}

	private Authentication getAuthentication() {
		SecurityContext context = SecurityContextHolder.getContext();
		if (context == null) {
			return null;
		}

		return context.getAuthentication();
	}

	protected boolean isAnonymousUser() {
		Authentication authentication = this.getAuthentication();
		if (authentication == null) {
			return true;
		}

		return (authentication.getPrincipal() instanceof CCUser == false);
	}

	protected CCUser getAuthenticatedUser() {
		if (this.isAnonymousUser()) {
			return null;
		}

		Authentication authentication = this.getAuthentication();
		CCUser user = null;
		if (authentication.getPrincipal() instanceof CCUser) {
			user = (CCUser) authentication.getPrincipal();
		}

		return user;
	}

	protected Long getAuthenticatedUserId() {
		String authHeader = request.getHeader("Authorization");
		final CCUser user = this.getAuthenticatedUser();
		if (authHeader != null && user == null) {
			logger.info("No user found with Basic Authorization: {}", authHeader);
		}
		if (user == null) {
			return null;
		}
		logger.info("[LOGGED_IN_USER_ID]: {}", String.valueOf(user.getUserId()));
		return user.getUserId();
	}

	protected String getAuthentictedUsername() {
		if (this.isAnonymousUser()) {
			return null;
		}

		return this.getAuthenticatedUser().getUsername();
	}

	protected List<String> getRoles() {
		if (this.isAnonymousUser()) {
			return Collections.emptyList();
		}

		Authentication authentication = this.getAuthentication();
		if (CollectionUtils.isEmpty(authentication.getAuthorities())) {
			return Collections.emptyList();
		}

		List<String> roles = new ArrayList<>(authentication.getAuthorities().size());
		for (GrantedAuthority authority : authentication.getAuthorities()) {
			if (authority instanceof CCAuthority) {
				roles.add(((CCAuthority) authority).getAuthority());
			}
		}

		return roles;
	}

	protected <T, U extends T> void mergeChangesToEntity(T original, U provided) {
		Field[] fields = original.getClass().getDeclaredFields();
		for (Field originalField : fields) {
			if (originalField.isAnnotationPresent(ClientEditableField.class)) {
				Field providedField = null;
				try {
					providedField = provided.getClass().getSuperclass().getDeclaredField(originalField.getName());
					originalField.setAccessible(true);
					providedField.setAccessible(true);
					Object originalValue = originalField.get(original);
					Object providedValue = providedField.get(provided);

					if (providedValue == null) {
						/*
						 * Determine if it is a nullable field that was set back
						 * to null.
						 */
						if (provided instanceof INullableFields
								&& ((INullableFields) provided).wasSetNull(originalField.getName())) {
							/*
							 * Set the field to null.
							 */
							originalField.set(original, providedValue);
						}
						continue;
					}
					if (providedValue.equals(originalValue)) {
						continue;
					}
					originalField.set(original, providedValue);
				} catch (IllegalArgumentException | IllegalAccessException | NoSuchFieldException e) {
					// TODO: throw Exception.
					e.printStackTrace();
				} finally {
					originalField.setAccessible(false);
					if (providedField != null) {
						providedField.setAccessible(false);
					}
				}
			}
		}
	}

	public ModelPermissions determineModelPermissions(final Model model, final ModelVersion modelVersion,
			final Long userId, final Long tempModelId) {
		return determineModelPermissions(model, modelVersion, userId, tempModelId, null);
	}

	public ModelPermissions determineModelPermissions(final Model model, final ModelVersion modelVersion,
			final Long currentUserId, final Long tempModelId, final List<ModelShare> shareListPrefetch) {
			final Long versionId = modelVersion.getId().getId();

		List<String> roles = this.getRoles();
		if (roles.contains("ADMINISTRATOR")) {
			return new ModelPermissions(true, true, true, true, true);
		}

			boolean belongsToCourse = false;
			if(currentUserId != null){
				belongsToCourse = this.modelDao.modelIsAccessableThroughCourse(model.getId(), currentUserId);
			}

		if (tempModelId != null && model.getId() == tempModelId) {
			/*
			 * Only view permissions are allowed for temporary access {@link
			 * Model}s.
			 */
			logger.info("Only view permissions are allowed for temporary access @modelid: {}, tempModelId: {}, ", model.getId(), tempModelId);
			return new ModelPermissions(true, false, false, false);
		}
 
		boolean viewAllowed = (model.getUserId() == null) || model.isPublished() || (model.getUserId().equals(currentUserId)) || belongsToCourse;
		boolean editAllowed = (model.getUserId() == null) || (
			model.getUserId().equals(currentUserId) && !model.isPublished()
		);
		boolean publishAllowed = (model.getUserId() != null && model.getUserId().equals(currentUserId));
		boolean deleteAllowed = (model.getUserId() == null) || (model.getUserId().equals(currentUserId));
		boolean shareAllowed = (model.getUserId() != null) && model.getUserId().equals(currentUserId);
		
		if (!shareAllowed) {
			ModelShare modelShare = this.modelShareDao.getShareAccess(currentUserId, versionId, shareListPrefetch);
			if (modelShare != null) {
				/*
				 * The user is at a minimum allowed to view the {@link Model}.
				 */
				viewAllowed = true;
				editAllowed = (modelShare.getAccess() == SHARE_ACCESS.EDIT)
						|| (modelShare.getAccess() == SHARE_ACCESS.ADMIN);
				publishAllowed = editAllowed;
				shareAllowed = (modelShare.getAccess() == SHARE_ACCESS.ADMIN);
			}
		}

		//call to the  NODE.JS and check if thiis model id is in  COURSE

		// Verify if the student has this model enrolled in a course
		if (viewAllowed == false && model.getType().equals("learning") && currentUserId != null) {
			List<Integer> courses = this.modelDao.findCoursesByModelLearning(model.getId(), currentUserId);
			if (courses.size() > 0) {
				viewAllowed = true;
			}
		}
		
		return new ModelPermissions(viewAllowed, editAllowed, deleteAllowed, shareAllowed, publishAllowed);
	}

	protected Domain getOrigin(ServletRequest req, final Long userId) {
		HttpServletRequest request = (HttpServletRequest) req;
		String origin = request.getHeader("origin");
		Domain domain = TCCDomain.determineDomain(origin);
		if (domain == null) {
			/* Check for overrides */
			final String domainOverride = request.getHeader(CustomHeaders.OVERRIDE_DOMAIN);
			if (domainOverride == null) {
				return null;
			}
			domain = TCCDomain.determineDomainFromOverride(domainOverride);
			if (domain != null) {
				logger.info("Domain Override for Domain: {} has been initiated for User: {}.", domain.name(), userId);
			}
		}

		return domain;
	}
}