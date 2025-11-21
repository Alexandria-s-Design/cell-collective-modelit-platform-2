/**
 * 
 */
package cc.dataaccess.user.dao;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.EntityManager;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.ModelShare;
import cc.common.data.user.Activity;
import cc.common.data.user.AuthorityRequest;
import cc.common.data.user.AuthorityRequestId;
import cc.common.data.user.Profile;
import cc.common.data.user.Registration;
import cc.common.data.user.Role;
import cc.common.data.user.Role.USER_ROLE;
import cc.common.data.user.User;
import cc.common.data.user.UserRegistrationNotification;
import cc.common.data.user.UserSubscription;
import cc.dataaccess.UserIdentity;
import cc.dataaccess.main.repository.ModelShareRepository;
import cc.dataaccess.user.repository.ActivityRepository;
import cc.dataaccess.user.repository.AuthorityRequestRepository;
import cc.dataaccess.user.repository.ProfileRepository;
import cc.dataaccess.user.repository.RegistrationRepository;
import cc.dataaccess.user.repository.RoleRepository;
import cc.dataaccess.user.repository.UserRegistrationNotificationRepository;
import cc.dataaccess.user.repository.UserRepository;
import cc.dataaccess.user.repository.UserSubscriptionRepository;

/**
 * @author bkowal
 *
 */
@Transactional(value = "mainTransactionManager")
public class UserDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	public static int TYPE_ACCESS_SUPER = 1;
	public static int TYPE_ACCESS_ADMIN = 2;
	public static int TYPE_ACCESS_APPROVAL = 3;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ProfileRepository profileRepository;

	@Autowired
	private RegistrationRepository registrationRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private ActivityRepository activityRepository;

	@Autowired
	private UserRegistrationNotificationRepository userRegistrationNotificationRepository;

	@Autowired
	private UserSubscriptionRepository userSubscriptionRepository;

	@Autowired
	private AuthorityRequestRepository authorityRequestRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	@Qualifier("mainEntityManagerFactory")
	private EntityManager em;

	/*
	 * Used to update share information whenever a new user registers or when an
	 * existing user updates their e-mail address to an e-mail address that is
	 * listed in the model share information.
	 */
	@Autowired
	private ModelShareRepository modelShareRepository;

	public User getUserByEmail(final String email) {
		return transactionTemplate.execute(new TransactionCallback<User>() {
			@Override
			public User doInTransaction(TransactionStatus status) {
				Profile profile = profileRepository.findByEmail(email);
				if (profile == null) {
					return null;
				}
				return profile.getUser();
			}
		});
	}
	
	public User getUser(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<User>() {
			@Override
			public User doInTransaction(TransactionStatus status) {
				return userRepository.findOne(id);
			}
		});
	}

	public void saveUserActivity(final Activity activity) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				activityRepository.save(activity);
			}
		});
	}

	public boolean verifyUserUniqueness(final String email) {
		return this.profileRepository.verifyEmailUniqueness(email) == null;
	}

	public Role getUserRole(USER_ROLE name) {
		return transactionTemplate.execute(new TransactionCallback<Role>() {
			@Override
			public Role doInTransaction(TransactionStatus status) {
				return roleRepository.getByName(name);
			}
		});
	}
	
	public Role getUserRole(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<Role>() {
			@Override
			public Role doInTransaction(TransactionStatus status) {
				return roleRepository.findOne(id);
			}
		});
	}

	@Transactional(readOnly = false)
	public User save(User user) {
		final Profile profile = user.getProfile();
		final Registration registration = user.getRegistration();

		profile.setUser(user);
		if (registration != null) {
			registration.setUser(user);
		}
		user = this.userRepository.save(user);

		this.checkShareUpdates(profile.getEmail(), user.getId());

		return user;
	}

	public Profile save(Profile profile) {
		return transactionTemplate.execute(new TransactionCallback<Profile>() {
			@Override
			public Profile doInTransaction(TransactionStatus status) {
				checkShareUpdates(profile.getEmail(), profile.getUser().getId());

				return profileRepository.save(profile);
			}
		});
	}

	public Long getUserIdForEmail(final String email) {
		return transactionTemplate.execute(new TransactionCallback<Long>() {
			@Override
			public Long doInTransaction(TransactionStatus status) {
				Profile profile = profileRepository.findByEmail(email);
				if (profile == null) {
					return null;
				}
				return profile.getUser().getId();
			}
		});
	}

	public String getEmailForUser(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<String>() {
			@Override
			public String doInTransaction(TransactionStatus status) {
				Profile profile = profileRepository.findByUserId(id);
				if (profile == null) {
					return null;
				}
				return profile.getEmail();
			}
		});
	}

	public Profile getProfileByUserId(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<Profile>() {
			@Override
			public Profile doInTransaction(TransactionStatus status) {
				return profileRepository.findByUserId(id);
			}
		});
	}

	public Set<UserIdentity> getUserIdentities(final Collection<Long> userIds) {
		List<?> results = transactionTemplate.execute(new TransactionCallback<List<?>>() {
			@Override
			public List<?> doInTransaction(TransactionStatus status) {
				return em.createNativeQuery(
						"SELECT id, email, firstname, lastname, institution FROM public.user_identity_view WHERE id IN (?1)")
						.setParameter(1, userIds).getResultList();
			}
		});

		if (results.isEmpty()) {
			return Collections.emptySet();
		}

		Set<UserIdentity> userIdentities = new HashSet<>(results.size(), 1.0f);
		for (Object result : results) {
			Object[] resultValues = (Object[]) result;
			UserIdentity userIdentity = new UserIdentity();
			userIdentity.setId(getLongFromRecord(resultValues[USER_IDENTITY_INDEX.ID_INDEX]));
			userIdentity.setEmail((String) resultValues[USER_IDENTITY_INDEX.EMAIL_INDEX]);
			userIdentity.setFirstName((String) resultValues[USER_IDENTITY_INDEX.FIRST_NAME_INDEX]);
			userIdentity.setLastName((String) resultValues[USER_IDENTITY_INDEX.LAST_NAME_INDEX]);
			userIdentity.setInstitution((String) resultValues[USER_IDENTITY_INDEX.INSTITUTION_INDEX]);
			// // userIdentity.setAvatarUri((String) resultValues[USER_IDENTITY_INDEX.AVATAR_URI_INDEX]);
			// userIdentity
			// 		.setRegistrationDate(getCalendarFromRecord(resultValues[USER_IDENTITY_INDEX.REGISTRATION_INDEX]));
			userIdentities.add(userIdentity);
		}
		return userIdentities;
	}

	public UserSubscription saveUserSubscription(UserSubscription userSubscription) {
		return transactionTemplate.execute(new TransactionCallback<UserSubscription>() {
			@Override
			public UserSubscription doInTransaction(TransactionStatus status) {
				return userSubscriptionRepository.save(userSubscription);
			}
		});
	}

	public List<UserSubscription> getActiveUserSubscriptions(final Long userId, final Calendar currentDate) {
		return transactionTemplate.execute(new TransactionCallback<List<UserSubscription>>() {
			@Override
			public List<UserSubscription> doInTransaction(TransactionStatus status) {
				return userSubscriptionRepository.getActiveSubscriptions(userId, currentDate);
			}
		});
	}

	private void checkShareUpdates(final String email, final Long userId) {
		/*
		 * Determine if any {@link ModelShare} records need to be updated with the user
		 * id.
		 */
		List<ModelShare> modelSharesToUpdate = modelShareRepository.findByEmail(email);
		if (modelSharesToUpdate.isEmpty() == false) {
			for (ModelShare modelShare : modelSharesToUpdate) {
				modelShare.setEmail(null);
				modelShare.setUserId(userId);
			}
			modelShareRepository.save(modelSharesToUpdate);
		}
	}

	private Long getLongFromRecord(Object value) {
		if (value instanceof BigInteger) {
			return ((BigInteger) value).longValue();
		}

		return (Long) value;
	}

	private Calendar getCalendarFromRecord(Object value) {
		if (value instanceof Timestamp) {
			Calendar calendar = Calendar.getInstance();
			calendar.setTimeInMillis(((Timestamp) value).getTime());
			return calendar;
		}

		return (Calendar) value;
	}

	public void saveUserRegistrationNotification(final UserRegistrationNotification notification) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				final Calendar updateDate = Calendar.getInstance();
				notification.setCreationDate(updateDate);
				notification.setUpdateDate(updateDate);
				userRegistrationNotificationRepository.save(notification);
			}
		});
	}

	public List<UserRegistrationNotification> getAllUserRegistrationNotifications() {
		return transactionTemplate.execute(new TransactionCallback<List<UserRegistrationNotification>>() {
			@Override
			public List<UserRegistrationNotification> doInTransaction(TransactionStatus status) {
				List<UserRegistrationNotification> results = userRegistrationNotificationRepository.findAll();
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public void saveUserAuthorityRequest(final AuthorityRequest authorityRequest) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				final Calendar updateDate = Calendar.getInstance();
				if (authorityRequest.getCreationDate() == null) {
					authorityRequest.setCreationDate(updateDate);
				}
				authorityRequestRepository.save(authorityRequest);
			}
		});
	}

	public AuthorityRequest getAuthorityRequestByRequestId(final AuthorityRequestId authorityRequestId) {
		return transactionTemplate.execute(new TransactionCallback<AuthorityRequest>() {
			@Override
			public AuthorityRequest doInTransaction(TransactionStatus status) {
				return authorityRequestRepository.findById(authorityRequestId);
			}
		});
	}
	public AuthorityRequest getAuthorityRequestByToken(final String token) {
		return transactionTemplate.execute(new TransactionCallback<AuthorityRequest>() {
			@Override
			public AuthorityRequest doInTransaction(TransactionStatus status) {
				final List<AuthorityRequest> results = authorityRequestRepository.findByToken(token);
				if (CollectionUtils.isEmpty(results)) {
					return null;
				}
				return results.iterator().next();
			}
		});
	}

	public List<AuthorityRequest> getActiveAuthorityRequests(final Long userid) {
		return transactionTemplate.execute(new TransactionCallback<List<AuthorityRequest>>() {
			@Override
			public List<AuthorityRequest> doInTransaction(TransactionStatus status) {
				return authorityRequestRepository.findActiveAuthorityRequest(userid);
			}
		});
	}

	public AuthorityRequest getAuthorityRequestById(final AuthorityRequestId authorityRequestId) {
		return transactionTemplate.execute(new TransactionCallback<AuthorityRequest>() {
			@Override
			public AuthorityRequest doInTransaction(TransactionStatus status) {
				return authorityRequestRepository.findOne(authorityRequestId);
			}
		});
	}

	public void persistRegistrationNotificationResults(final Collection<UserRegistrationNotification> complete,
			final Collection<UserRegistrationNotification> failed) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					if (!failed.isEmpty()) {
						userRegistrationNotificationRepository.save(failed);
					}
					if (!complete.isEmpty()) {
						userRegistrationNotificationRepository.delete(complete);
					}
				} catch (Exception e) {
					logger.error("Failed to persist User Registration Notification results.", e);
					status.setRollbackOnly();
				}
			}
		});
	}

	public List<String> getEmailAddressesByAccessType(final int typeAccess) {
		List<Object> results = transactionTemplate.execute(new TransactionCallback<List<Object>>() {
			@Override
			public List<Object> doInTransaction(TransactionStatus status) {
				return em.createNativeQuery("SELECT email FROM profile WHERE \"accessType\" = ?1").setParameter(1, typeAccess).getResultList();
			}
		});

		List<String> emailList = new ArrayList<>();

    for (Object result : results) {
        if (result != null) {
            emailList.add((String) result);
        }
    }
    return emailList.isEmpty() ? null : emailList;
	}

	private static class USER_IDENTITY_INDEX {

		public static final int ID_INDEX = 0;

		public static final int EMAIL_INDEX = 1;

		public static final int FIRST_NAME_INDEX = 2;

		public static final int LAST_NAME_INDEX = 3;

		public static final int INSTITUTION_INDEX = 4;

		public static final int REGISTRATION_INDEX = 5;

		public static final int AVATAR_URI_INDEX = 6;

	}
}