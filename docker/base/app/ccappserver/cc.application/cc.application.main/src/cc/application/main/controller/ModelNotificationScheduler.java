/**
 * 
 */
package cc.application.main.controller;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;

import cc.application.main.configuration.DomainProperties;
import cc.application.main.email.ModelShareMailContent;
import cc.application.main.email.SendMail;
import cc.application.main.thread.AbstractScheduledTask;
import cc.common.data.model.ModelIdentifier;
import cc.common.data.model.ModelShare;
import cc.common.data.model.ModelShareNotification;
import cc.common.data.user.Profile;
import cc.common.data.user.User;
import cc.dataaccess.main.dao.ModelDao;
import cc.dataaccess.main.dao.ModelNotificationDao;
import cc.dataaccess.main.dao.ModelShareDao;
import cc.dataaccess.user.dao.UserDao;

/**
 * @author Bryan Kowal
 */
public class ModelNotificationScheduler extends AbstractScheduledTask {

	private static final String NAME = "Model Notification Scheduler";

	private static final long INITIAL_DELAY = 1;

	// 5 minutes
	private static final long DELAY = 5;

	private static final int ATTEMPT_MAX = 3;

	@Autowired
	private ModelDao modelDao;

	@Autowired
	private UserDao userDao;

	@Autowired
	private ModelNotificationDao modelNotificationDao;

	@Autowired
	private ModelShareDao modelShareDao;

	@Autowired
	private DomainProperties domainProperties;

	public ModelNotificationScheduler() {
		super(NAME, INITIAL_DELAY, DELAY, TimeUnit.MINUTES);
	}

	@Override
	public void run() {
		logger.info("Checking for Model Share Notifications ...");
		List<ModelShareNotification> modelShareNotifications = modelNotificationDao.getAllModelShareNotifications();
		if (modelShareNotifications.isEmpty()) {
			logger.info("No Model Share Notifications exist.");
			return;
		}

		logger.info("Processing {} Model Share Notification(s) ...", modelShareNotifications.size());
		final List<ModelShareNotification> complete = new ArrayList<>();
		final List<ModelShareNotification> failed = new ArrayList<>();
		final Calendar updateDate = Calendar.getInstance();
		for (ModelShareNotification modelShareNotification : modelShareNotifications) {
			if (modelShareNotification.getAttempts() == ATTEMPT_MAX) {
				logger.warn("Skipping: {}. The maximum number of attempts {} has been reached.",
						modelShareNotification.toString(), ATTEMPT_MAX);
				continue;
			}
			int attempt = modelShareNotification.getAttempts();
			++attempt;
			boolean success = true;
			logger.info("Attempting: {} (attempt = {}) ...", modelShareNotification.toString(), attempt);
			final String modelMailLink = domainProperties.getModelLink(modelShareNotification.getDomain(),
					modelShareNotification.getId().getModelId());
			/*
			 * Attempt to retrieve information about the Model that was shared.
			 */
			final ModelIdentifier modelIdentifier = modelDao
					.getModelIdentifier(modelShareNotification.getId().getModelId());
			if (modelIdentifier == null) {
				logger.error("Failed to find the Model associated with: " + modelShareNotification.toString() + ".");
				success = false;
			}

			/*
			 * Attempt to retrieve information about the User that shared the
			 * Model.
			 */
			Profile sharingUserProfile = null;
			if (success) {
				sharingUserProfile = userDao.getProfileByUserId(modelShareNotification.getUserId());
				if (sharingUserProfile == null) {
					logger.error("Failed to find the Profile of the User that shared a Model associated with: "
							+ modelShareNotification.toString() + ".");
					success = false;
				}
			}

			/*
			 * Attempt to retrieve information about the User that the Model was
			 * shared with.
			 */
			User receivingUser = userDao.getUserByEmail(modelShareNotification.getId().getEmail());

			/*
			 * Attempt to retrieve information about the actual sharing of the
			 * Model.
			 */
			ModelShare modelShare = null;
			if (success) {
				modelShare = modelShareDao.getForId(modelShareNotification.getModelShareId());
				if (modelShare == null) {
					logger.error("Failed to find the Model Share associated with: " + modelShareNotification.toString()
							+ ".");
					success = false;
				}
			}

			if (success) {
				try {
					ModelShareMailContent modelShareMailContent = new ModelShareMailContent(
							modelShareNotification.getId().getModelId(), modelMailLink);
					modelShareMailContent.setReceivingUser(receivingUser);
					modelShareMailContent.setSharingUser(sharingUserProfile);
					modelShareMailContent.setModelName(modelIdentifier.getName());
					modelShareMailContent.setToAddress(modelShareNotification.getId().getEmail());
					modelShareMailContent.setReplyToAddress(sharingUserProfile.getEmail());
					modelShareMailContent.setShareAccess(modelShare.getAccess());

					SendMail.sendModelShareNotification(modelShareMailContent);
					complete.add(modelShareNotification);
					logger.info("Successfully completed: {} (attempt = {}).", modelShareNotification.toString(),
							attempt);
				} catch (Exception e) {
					logger.error(
							"Failed to send: " + modelShareNotification.toString() + " (attempt = " + attempt + ").",
							e);
					success = false;
				}
			}

			if (!success) {
				modelShareNotification.setAttempts(attempt);
				modelShareNotification.setUpdateDate(updateDate);
				failed.add(modelShareNotification);
			}
		}

		if (!complete.isEmpty() || !failed.isEmpty()) {
			modelNotificationDao.persistNotificationResults(complete, failed);
		}

		logger.info("Finished processing Model Share Notifications.");
	}
}