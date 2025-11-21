/**
 * 
 */
package cc.application.main.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.TimeUnit;

import cc.application.main.WebServiceUtil;
import org.springframework.beans.factory.annotation.Autowired;

import cc.application.main.configuration.DomainProperties;
import cc.application.main.email.SendMail;
import cc.application.main.thread.AbstractScheduledTask;
import cc.common.data.user.Profile;
import cc.common.data.user.UserRegistrationNotification;
import cc.dataaccess.user.dao.UserDao;

/**
 * @author Bryan Kowal
 *
 */
public class UserRegistrationNotificationScheduler extends AbstractScheduledTask {

	private static final String NAME = "User Registration Notification Scheduler";

	private static final long INITIAL_DELAY = 1;

	private static final long DELAY = Long.parseLong(WebServiceUtil.getenv("USER_REGISTRATION_NOTIFICATION_DELAY_IN_MINUTE", "60"));

	private static final int ATTEMPT_MAX = 3;

	@Autowired
	private UserDao userDao;

	@Autowired
	private DomainProperties domainProperties;

	public UserRegistrationNotificationScheduler() {
		super(NAME, INITIAL_DELAY, DELAY, TimeUnit.MINUTES);
	}

	@Override
	public void run() {
		logger.info("Checking for User Registration Notifications ...");
		List<UserRegistrationNotification> userRegistrationNotifications = userDao
				.getAllUserRegistrationNotifications();
		if (userRegistrationNotifications.isEmpty()) {
			logger.info("No User Registration Notifications exist.");
			return;
		}

		logger.info("Processing {} User Registration Notification(s) ...", userRegistrationNotifications.size());
		final List<UserRegistrationNotification> complete = new ArrayList<>();
		final List<Profile> completedProfile = new ArrayList<>();
		final List<UserRegistrationNotification> failed = new ArrayList<>();
		final Calendar updateDate = Calendar.getInstance();
		for (UserRegistrationNotification userRegistrationNotification : userRegistrationNotifications) {
			if (userRegistrationNotification.getAttempts() == ATTEMPT_MAX) {
				logger.warn("Skipping: {}. The maximum number of attempts {} has been reached.",
						userRegistrationNotification.toString(), ATTEMPT_MAX);
				continue;
			}
			int attempt = userRegistrationNotification.getAttempts();
			++attempt;
			boolean success = true;
			logger.info("Attempting: {} (attempt = {}) ...", userRegistrationNotification.toString(), attempt);
			/*
			 * Attempt to retrieve information about the User that registered.
			 */
			final Profile profile = userDao.getProfileByUserId(userRegistrationNotification.getId());
			if (profile == null) {
				logger.error(
						"Failed to find the User associated with: " + userRegistrationNotification.toString() + ".");
				success = false;
			}

			if (success) {
				complete.add(userRegistrationNotification);
				completedProfile.add(profile);
			} else {
				userRegistrationNotification.setAttempts(attempt);
				userRegistrationNotification.setUpdateDate(updateDate);
				failed.add(userRegistrationNotification);
			}
		}

		if (!complete.isEmpty()) {
			try {
				SendMail.sendUserRegistrationNotification(complete, completedProfile);
			} catch (Exception e) {
				logger.error("Failed to send user notification email. Exception: " + e);
				failed.addAll(complete);
				complete.clear();
			}
		}

		if (!complete.isEmpty() || !failed.isEmpty()) {
			userDao.persistRegistrationNotificationResults(complete, failed);
		}

		logger.info("Finished processing User Registration Notifications.");
	}
}