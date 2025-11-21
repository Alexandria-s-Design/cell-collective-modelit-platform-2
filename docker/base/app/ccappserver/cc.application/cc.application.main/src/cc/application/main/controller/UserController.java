/**
 * 
 */
package cc.application.main.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.annotation.PostConstruct;
import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import cc.application.main.WebServiceUtil;
import cc.application.main.model.UserService;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;

import cc.application.main.input.UserRegistrationForm;
import cc.application.main.json.ProfileJSON;
import cc.application.main.json.RequestTeachJSON;
import cc.application.main.json.Session;
import cc.application.main.json.UserTokenJSON;
import cc.application.main.json.UserAuthenticationJSON;
import cc.application.main.response.UserNotAuthenticatedException;
import cc.application.main.authentication.CCUser;
import cc.application.main.authentication.CCUserDetailsService;
import cc.application.main.authentication.token.TokenAuthenticationService;
import cc.application.main.authentication.token.TokenHandler;
import cc.application.main.configuration.DomainProperties;
import cc.application.main.email.SendMail;
import cc.application.main.input.UserActivation;
import cc.common.data.TCCDomain.Domain;
import cc.common.data.user.AuthorityRequest;
import cc.common.data.user.AuthorityRequestId;
import cc.common.data.user.Profile;
import cc.common.data.user.Registration;
import cc.common.data.user.Role;
import cc.common.data.user.Role.USER_ROLE;
import cc.dataaccess.RestrictedUserIdentity;
import cc.dataaccess.UserIdentity;
import cc.dataaccess.user.dao.UserDao;
import cc.common.data.user.User;
import cc.common.data.user.UserRegistrationNotification;

/**
 * @author Bryan
 *
 */
@Controller
@RequestMapping("/user")
public class UserController extends AbstractController {

	@Autowired
	private DomainProperties domainProperties;
	
	@Autowired
	private CCUserDetailsService userDetailsService;

	@Autowired
	private UserService userService;

	private TokenHandler tokenHandler;

	private TokenAuthenticationService tokenAuthenticationService;
	
	@PostConstruct
	public void afterPropertiesSet() throws Exception {
		tokenHandler = new TokenHandler("TEST", userDetailsService);
		this.tokenAuthenticationService = new TokenAuthenticationService(this.tokenHandler);
	}
	
	@RequestMapping(value = "/validateUserToken", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> validateUserToken(@RequestBody UserTokenJSON userTokenJSON)
	{
		if (userTokenJSON == null || userTokenJSON.getToken() == null)
		{
			return new ResponseEntity<Object>("Missing required parameter 'token'!", HttpStatus.BAD_REQUEST);
		}
		final CCUser ccUser = tokenAuthenticationService.getUserForToken(userTokenJSON.getToken());
		if (ccUser == null)
		{
			return new ResponseEntity<Object>(null, HttpStatus.NOT_FOUND);
		}
		
		return new ResponseEntity<Object>(ccUser.getUserId(), HttpStatus.OK);
	}

	@RequestMapping(value = "/register", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<?> register(@RequestParam(UserRegistrationForm.EMAIL) String email,
			@RequestParam(UserRegistrationForm.PASSWORD) String password,
			@RequestParam(UserRegistrationForm.V_PASSWORD) String verifyPassword,
			@RequestParam(UserRegistrationForm.FIRST_NAME) String firstName,
			@RequestParam(UserRegistrationForm.LAST_NAME) String lastName,
			@RequestParam(UserRegistrationForm.INSTITUTION) String institution,
			@RequestParam(value = UserRegistrationForm.REGISTRATION_CODE, required = false) String registrationCode,
			ServletRequest req) {
		/*
		 * Verify that all required information has been provided.
		 */
		String missingParam = null;
		if (StringUtils.isEmpty(email)) {
			missingParam = UserRegistrationForm.EMAIL;
		} else if (StringUtils.isEmpty(password)) {
			missingParam = UserRegistrationForm.PASSWORD;
		} else if (StringUtils.isEmpty(verifyPassword)) {
			missingParam = UserRegistrationForm.V_PASSWORD;
		} else if (StringUtils.isEmpty(firstName)) {
			missingParam = UserRegistrationForm.FIRST_NAME;
		} else if (StringUtils.isEmpty(lastName)) {
			missingParam = UserRegistrationForm.LAST_NAME;
		} else if (StringUtils.isEmpty(institution)) {
			missingParam = UserRegistrationForm.INSTITUTION;
		}

		if (missingParam != null) {
			return new ResponseEntity<String>("Missing required parameter '" + missingParam + "'!",
					HttpStatus.PRECONDITION_FAILED);
		}

		/*
		 * Trim and cleanup all fields.
		 */
		email = email.trim();
		password = password.trim();
		verifyPassword = verifyPassword.trim();
		if (StringUtils.isEmpty(registrationCode) == false) {
			registrationCode = registrationCode.trim();
		} else {
			registrationCode = null;
		}

		/*
		 * Verify the uniqueness of the username.
		 */
		if (!userDao.verifyUserUniqueness(email)) {
			return new ResponseEntity<String>(
					"Email: " + email + " is already in use. Please use a different email address.",
					HttpStatus.PRECONDITION_FAILED);
		}

		/*
		 * Verify the passwords.
		 */
		if (password.equals(verifyPassword) == false) {
			return new ResponseEntity<String>("Passwords do not match!", HttpStatus.PRECONDITION_FAILED);
		}

		/*
		 * Attempt to create the user account.
		 */
		Md5PasswordEncoder pwEncoder = new Md5PasswordEncoder();
		final String md5Password = pwEncoder.encodePassword(password, null);

		final Registration registration = new Registration();
		registration.setActivationCode(UUID.randomUUID().toString().toUpperCase());
		registration.setRegistrationDate(Calendar.getInstance());
		final Profile profile = new Profile();
		profile.setEmail(email);
		profile.setFirstName(firstName);
		profile.setLastName(lastName);
		profile.setInstitution(institution);
		// profile.setAvatarUri()
		User user = new User();
		user.setPassword(md5Password);
		user.setProfile(profile);
		user.setRegistration(registration);
		/*
		 * Always enable user accounts.
		 */
		user.setEnabled(true);

		/*
		 * Determine which domain the user used to register.
		 */
		UserRegistrationNotification userRegistrationNotification = new UserRegistrationNotification();
		Domain domain = getOrigin(req, null);
		if (domain != null) {
			userRegistrationNotification.setDomain(domain);
		}

		Role role = null;
		if (userRegistrationNotification.getDomain() != Domain.RESEARCH) {
			role = userDao.getUserRole(USER_ROLE.STUDENT);
		}
		if (role == null) {
			/*
			 * Research will be the default role.
			 */
			role = this.userDao.getUserRole(USER_ROLE.SCIENTIST);
		}
		if (role == null) {
			/*
			 * The role should definitely not be null at this point.
			 */
			logger.error("User account creation for user: " + email + " failed. Failed to determine user role.");
			return new ResponseEntity<String>("User account creation failed. Failed to determine user role.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		user.addUserRole(role);

		user = this.userDao.save(user);
		logger.info("Successfully registered user account: {} with role: {} (id = {}).", email, role.getName().name(),
				user.getId());

		/*
		 * Persist the user registration notification.
		 */
		userRegistrationNotification.setId(user.getId());
		try {
			userDao.saveUserRegistrationNotification(userRegistrationNotification);
			logger.info("Successfully saved: {}.", userRegistrationNotification.toString());
		} catch (Exception e) {
			logger.error("Failed to save: " + userRegistrationNotification.toString() + ".", e);
		}
		
		if (userRegistrationNotification.getDomain() == Domain.TEACH) {
			requestAuthority(user, profile, USER_ROLE.INSTRUCTOR);
		}
		Profile createdProfile = this.getProfileByEmail(email);
		return new ResponseEntity(createdProfile, HttpStatus.CREATED);
	}

	@RequestMapping(value = "/requestTeach", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> requestTeach(@RequestBody final RequestTeachJSON requestTeachJSON) {
		if (requestTeachJSON == null || requestTeachJSON.getEmail() == null || requestTeachJSON.getEmail().isEmpty()) {
			/*
			 * Invalid Request.
			 */
			return new ResponseEntity<String>("An e-mail address has not been specified.",
					HttpStatus.PRECONDITION_FAILED);
		}

		final String email = requestTeachJSON.getEmail().trim();
		final User user = userDao.getUserByEmail(email);
		if (user == null) {
			return new ResponseEntity<String>("E-Mail address: " + email + " is not associated with a registered User.",
					HttpStatus.NOT_FOUND);
		}

		// AuthorityRequest authorityRequest = doesAuthorityRequestExist(user, USER_ROLE.INSTRUCTOR);
		// if (authorityRequest != null && isPreviouslyDenied(authorityRequest)) {
		// 	return new ResponseEntity<String>(
		// 			"Your request got denied. Please contact us at " + WebServiceUtil.getenv("CC_FROM_ADDRESS", "support@cellcollective.org"),
		// 			HttpStatus.PRECONDITION_FAILED);
		// }

		if (requestNewAuthority(user, user.getProfile(), USER_ROLE.INSTRUCTOR)) {
			return new ResponseEntity<String>("Awaiting account approval/verification.", HttpStatus.CREATED);
		}

		return new ResponseEntity<String>("Failed to request account approval/verification.",
				HttpStatus.INTERNAL_SERVER_ERROR);
	}

	public AuthorityRequest doesAuthorityRequestExist(final User user, final USER_ROLE userRole) {
		Role requestedRole = userDao.getUserRole(userRole);
		AuthorityRequestId reqId = new AuthorityRequestId(user.getId(), requestedRole.getId());
		AuthorityRequest authorityRequest = userDao.getAuthorityRequestByRequestId(reqId);
		if (authorityRequest != null) {
			return authorityRequest;
		}
		return null;
	}

	public boolean isPreviouslyDenied(AuthorityRequest authorityRequest) {
		if (authorityRequest == null) { return false; }
		if (authorityRequest.getRejectionDate() != null) { return true; }
		return false;
	}

	private boolean requestAuthority(final User user, final Profile profile, final USER_ROLE userRole) {
		Role requestedRole = userDao.getUserRole(userRole);
		if (requestedRole == null) {
			logger.error("Authority request failed. Failed to retrieve/identify user role: " + userRole.name() + ".");
			return false;
		}

		AuthorityRequestId authorityRequestId = new AuthorityRequestId(user.getId(), requestedRole.getId());

		final String token = UUID.randomUUID().toString();
		AuthorityRequest authorityRequest = new AuthorityRequest();
		authorityRequest.setId(authorityRequestId);
		authorityRequest.setToken(token);
		try {
			userDao.saveUserAuthorityRequest(authorityRequest);
			logger.info("Successfully saved: {}.", authorityRequest.toString());
		} catch (Exception e) {
			logger.error("Failed to save: " + authorityRequest.toString() + ".", e);
			return false;
		}

		/*
		 * Attempt to send the email notification to CellCollective team.
		 */
		try {
			List<String> approvaladdresses = userDao.getEmailAddressesByAccessType(UserDao.TYPE_ACCESS_APPROVAL);
			// final String apiLinkApprove = domainProperties.getApiMethodLink("user/approveTeach/" + token);
			// final String apiLinkDeny = domainProperties.getApiMethodLink("user/denyTeach/" + token);
			final String adminLink = domainProperties.getAdminMethodLink("/admin");
			SendMail.sendAuthorityRequestNotification(profile, requestedRole,
					domainProperties.getUserEmailSuffix(), adminLink, adminLink, approvaladdresses);
		} catch (Exception e) {
			logger.error("Failed to send e-mail for: " +
					authorityRequest.toString() +
					". on sendAuthorityRequestNotification(). ", e);
			return false;
		}

		/*
		 * Attempt to send the email confirm user that they have success fully requested access
		 */
		try {
			SendMail.sendAuthotityRequestRequested(profile, domainProperties.getUserEmailSuffix());
		} catch (Exception e) {
			logger.error("Failed to send e-mail for: " +
					authorityRequest.toString() +
					". on sendAuthorityRequestNotification(). ", e);
		}

		return true;
	}

	private boolean requestNewAuthority(final User user, final Profile profile, final USER_ROLE userRole) {
		Role requestedRole = userDao.getUserRole(userRole);
		if (requestedRole == null) {
			logger.error("Authority request failed. Failed to retrieve/identify user role: " + userRole.name() + ".");
			return false;
		}
		
		try {
			List<String> approvaladdresses = userDao.getEmailAddressesByAccessType(UserDao.TYPE_ACCESS_APPROVAL);
			final String apiLinkApprove = WebServiceUtil.getenv("DOMAIN_RESEARCH", "https://cellcollective.org") + "/admin";
			final String apiLinkDeny = "";
			SendMail.sendAuthorityRequestNotification(profile, requestedRole,
					domainProperties.getUserEmailSuffix(), apiLinkApprove, apiLinkDeny, approvaladdresses);
		} catch (Exception e) {
			logger.error("Failed to send e-mail sendAuthorityRequestNotification(). ", e);
			return false;
		}

		/*
		 * Attempt to send the email confirm user that they have success fully requested access
		 */
		try {
			SendMail.sendAuthotityRequestRequested(profile, domainProperties.getUserEmailSuffix());
		} catch (Exception e) {
			logger.error("Failed to send e-mail sendAuthorityRequestNotification(). ", e);
		}

		return true;
	}

	@RequestMapping(value = "/approveTeach/{token}", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
	public ResponseEntity<String> approveTeach(@PathVariable String token) {
		return grantOrDenyAuthority(token, true);
	}

	@RequestMapping(value = "/denyTeach/{token}", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
	public ResponseEntity<String> denyTeach(@PathVariable String token) {
		return grantOrDenyAuthority(token, false);
	}

	private ResponseEntity<String> grantOrDenyAuthority(final String token, boolean approved) {
		final AuthorityRequest authorityRequest = userDao.getAuthorityRequestByToken(token);
		if (authorityRequest == null) {
			logger.error("Failed to find Authority Request for token: " + token + ".");
			return new ResponseEntity<String>("Failed to find Authority Request for token: " + token + ".",
					HttpStatus.NOT_FOUND);
		}
		final Calendar updateDate = Calendar.getInstance();
		final Long userId = authorityRequest.getId().getUserId();
		User user = userDao.getUser(userId);
		if (user == null) {
			return new ResponseEntity<String>("Failed to find User for id: " + userId + ".", HttpStatus.NOT_FOUND);
		}

		if (!approved) {
			authorityRequest.setRejectionDate(updateDate);
			/*TODO: if user user.getAuthorities().contains(role) then should we remove the role???*/
		} else {
			authorityRequest.setApprovalDate(updateDate);
			/*
			 * Determine which additional role needs to be assigned to the user.
			 */
			final Long roleId = authorityRequest.getId().getRoleId();
			final Role role = userDao.getUserRole(roleId);
			if (role == null) {
				return new ResponseEntity<String>("Failed to find User Role for id: " + roleId + ".",
						HttpStatus.NOT_FOUND);
			}
			if (user.getAuthorities().contains(role)) {
				return new ResponseEntity<String>("User already has requested role.", HttpStatus.OK);
			}
			user.getAuthorities().add(role);
			try {
				userDao.save(user);
				logger.info("Successfully added Role: {} for {}.", role.getName().name(), user.toString());
			} catch (Exception e) {
				logger.error("Failed to add Role: {} for {}.", role.getName().name(), user.toString(), e);
				return new ResponseEntity<String>("Failed to update user roles.", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}

		try {
			userDao.saveUserAuthorityRequest(authorityRequest);
			logger.info("Successfully updated: {}.", authorityRequest.toString());
		} catch (Exception e) {
			logger.warn("Failed to update: " + authorityRequest.toString() + ".", e);
		}

		if (user != null) {
			/*
			 * Send an e-mail notification to the user.
			 */
			try {
				if (approved) {
					SendMail.sendAuthorityRequestApproved(user.getProfile(), domainProperties.getUserEmailSuffix());
				} else {
					SendMail.sendAuthorityRequestDenied(user.getProfile(), domainProperties.getUserEmailSuffix());
				}
			} catch (Exception e) {
				logger.error("Failed to send authorization request notification to: "
						+ user.getProfile().getEmail() + ".", e);
				return new ResponseEntity<String>("User roles updated. Failed to send e-mail notification.",
						HttpStatus.OK);
			}
		}
		String updatedStatus = approved ? "approved" : "denied";
		return new ResponseEntity<String>("Successfully updated user roles. ( "+updatedStatus+")", HttpStatus.OK);
	}

	@RequestMapping(value = "/reset")
	public ResponseEntity<String> resetPassword(@RequestParam("email") String email) {
		/*
		 * First, verify that the e-mail is actually associated with a TCC acount.
		 */
		User user = this.userDao.getUserByEmail(email);
		if (user == null) {
			return new ResponseEntity<String>("There is no user account associated with the provided e-mail address!",
					HttpStatus.NOT_FOUND);
		}
		logger.info("Handling password reset request for user: {} ...", user.getId());

		Md5PasswordEncoder pwEncoder = new Md5PasswordEncoder();
		/*
		 * Generate a new password for the user.
		 */
		String generatedPassword = RandomStringUtils.randomAlphanumeric(10);

		try {
			SendMail.sendPasswordReset(email, generatedPassword);
		} catch (Exception e) {
			logger.error("Failed to send password reset email to: " + email + "!", e);
			return new ResponseEntity<String>("Failed to send password reset email!", HttpStatus.INTERNAL_SERVER_ERROR);
		}

		try {
			final String md5Password = pwEncoder.encodePassword(generatedPassword, null);
			user.setPassword(md5Password);
			this.userDao.save(user);
		} catch (Exception e) {
			logger.error("Failed to save generated user password!", e);
			return new ResponseEntity<String>("Failed to save generated user password!",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		logger.info("Successfully completed password reset request for user: {}.", user.getId());

		return new ResponseEntity<String>(generatedPassword, HttpStatus.OK);
	}

	// user/activate?username=&activationCode=
	@RequestMapping(value = "/activate")
	public ResponseEntity<String> activate(@RequestParam(UserActivation.USERNAME) String username,
			@RequestParam(UserActivation.ACTIVATION_CODE) String activationCode) {
		/*
		 * Verify that all required information has been provided.
		 */
		String missingParam = null;
		if (StringUtils.isEmpty(username)) {
			missingParam = UserActivation.USERNAME;
		} else if (StringUtils.isEmpty(activationCode)) {
			missingParam = UserActivation.ACTIVATION_CODE;
		}

		if (missingParam != null) {
			return new ResponseEntity<String>("Missing required parameter '" + missingParam + "'!",
					HttpStatus.PRECONDITION_FAILED);
		}

		/*
		 * Attempt to retrieve the referenced user account.
		 */
		User user = this.userDao.getUserByEmail(username);
		if (user == null) {
			return new ResponseEntity<String>("Invalid username!", HttpStatus.NOT_FOUND);
		}

		/*
		 * Verify the activation code.
		 */
		if (activationCode.equals(user.getRegistration().getActivationCode()) == false) {
			return new ResponseEntity<String>("Invalid activation code!", HttpStatus.NOT_FOUND);
		}

		/*
		 * Activate the user account.
		 */
		user.getRegistration().setActivationDate(Calendar.getInstance());
		user.setEnabled(true);
		this.userDao.save(user);

		logger.info("Successfully activated user account: {} (id = {}).", username, user.getId());

		return new ResponseEntity<String>("User account successfully activated.", HttpStatus.OK);
	}

	@RequestMapping(value = "/getProfile", produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody Profile getProfile() {
		if (this.isAnonymousUser()) {
			throw new UserNotAuthenticatedException();
		}
		return this.getProfileByEmail(this.getAuthenticatedUser().getUsername());
	}

	@RequestMapping(
			value = "/auth/login",
			method = RequestMethod.POST,
			consumes = MediaType.APPLICATION_JSON_VALUE,
			produces = MediaType.APPLICATION_JSON_VALUE
	)
	public @ResponseBody ResponseEntity<Object> getUserLogin(
			@RequestBody UserAuthenticationJSON userAuthRequest,
			HttpServletRequest request
	) {
			String email = userAuthRequest.getEmail();
			User user = this.userDao.getUserByEmail(email);
			HttpSession session = request.getSession(true);
			session.setAttribute("user_email", email);
			System.out.println("Session Created: " + session.getId());		
			return ResponseEntity.ok("User authenticated!");
	}


	private Profile getProfileByEmail(String email) {
		User user = this.userDao.getUserByEmail(email);
		if (user == null) {/* TODO: Handle. Unknown for now; extremely low probability.*/}

		final Profile profile = user.getProfile();
		profile.setId(user.getId());
		profile.setUserDomainAccess(userService.getCurrentUserDomainAccess(profile));
		profile.setActiveAuthorityRequests(this.userDao.getActiveAuthorityRequests(user.getId()));
		return profile;
	}

	@RequestMapping(value = "/saveProfile", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> saveProfile(@RequestBody ProfileJSON profile) {
		if (this.isAnonymousUser()) {
			throw new UserNotAuthenticatedException();
		}

		User user = this.userDao.getUserByEmail(this.getAuthenticatedUser().getUsername());
		if (user == null) {
			// TODO: Handle. Unknown for now; extremely low probability.
		}

		Profile originalProfile = user.getProfile();
		if (originalProfile == null) {
			/*
			 * Should be unlikely!
			 */
			return new ResponseEntity<String>("Unable to access the original profile!", HttpStatus.NOT_FOUND);
		}

		this.mergeChangesToEntity(originalProfile, profile);
		this.userDao.save(originalProfile);

		return new ResponseEntity<String>("Profile successfully updated.", HttpStatus.OK);
	}

	@RequestMapping(value = "/changePassword", method = RequestMethod.POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<String> changePassword(@RequestParam(ChangePasswordForm.C_PASSWORD) String currentPassword,
			@RequestParam(ChangePasswordForm.PASSWORD) String password,
			@RequestParam(ChangePasswordForm.V_PASSWORD) String verifyPassword) {
		if (this.isAnonymousUser()) {
			throw new UserNotAuthenticatedException();
		}

		/*
		 * Verify all form parameters have been specified.
		 */
		String missingParam = null;
		if (StringUtils.isEmpty(currentPassword)) {
			missingParam = ChangePasswordForm.C_PASSWORD;
		} else if (StringUtils.isEmpty(password)) {
			missingParam = ChangePasswordForm.PASSWORD;
		} else if (StringUtils.isEmpty(verifyPassword)) {
			missingParam = ChangePasswordForm.V_PASSWORD;
		}

		if (missingParam != null) {
			return new ResponseEntity<String>("Missing required parameter '" + missingParam + "'!",
					HttpStatus.PRECONDITION_FAILED);
		}

		/*
		 * Retrieve the currently authenticated user and compare passwords.
		 */
		User user = this.userDao.getUserByEmail(this.getAuthenticatedUser().getUsername());
		if (user == null) {
			// TODO: Handle. Unknown for now; extremely low probability.
		}

		Md5PasswordEncoder pwEncoder = new Md5PasswordEncoder();
		final String current_md5Password = pwEncoder.encodePassword(currentPassword, null);
		if (user.getPassword().equals(current_md5Password) == false) {
			return new ResponseEntity<String>("Invalid current password!", HttpStatus.FORBIDDEN);
		}

		/*
		 * Verify the new passwords match.
		 */
		if (password.equals(verifyPassword) == false) {
			return new ResponseEntity<String>("New passwords do not match!", HttpStatus.PRECONDITION_FAILED);
		}

		/*
		 * All required verification has been successfully completed. Update the user
		 * password.
		 */
		final String md5Password = pwEncoder.encodePassword(password, null);
		user.setPassword(md5Password);
		this.userDao.save(user);

		return new ResponseEntity<String>("Password successfully updated.", HttpStatus.OK);
	}

	@RequestMapping(value = "/getSession", produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody Session getSession() {
		if (this.isAnonymousUser()) {
			return new Session();
		}

		Session session = new Session();
		session.setUsername(this.getAuthenticatedUser().getUsername());
		session.setRoles(this.getRoles());
		return session;
	}

	@RequestMapping(value = "/lookupUsers", produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> lookupUsers(
			@RequestParam(value = "id", required = true) Long[] userIds) {

		final Long userId = getAuthenticatedUserId();

		Set<Long> ownerUserIds = Collections.emptySet();
		if (userId != null) {
			ownerUserIds = modelDao.getVisibleUsers(userId);
		}

		final List<Long> userIdsList = Arrays.asList(userIds);
		Set<UserIdentity> userIdentities = userDao.getUserIdentities(userIdsList);
		Map<Long, Object> userIdentityMap = new HashMap<>(userIdentities.size(), 1.0f);
		for (UserIdentity userIdentity : userIdentities) {
			if (ownerUserIds.contains(userIdentity.getId()) || userIdentity.getId().equals(userId)) {
				userIdentityMap.put(userIdentity.getId(), userIdentity);
			} else {
				userIdentityMap.put(userIdentity.getId(), new RestrictedUserIdentity(userIdentity));
			}
		}

		return new ResponseEntity<Object>(userIdentityMap, HttpStatus.OK);
	}
}