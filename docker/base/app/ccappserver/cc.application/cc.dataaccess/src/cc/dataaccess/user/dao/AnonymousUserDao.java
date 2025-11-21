/**
 * 
 */
package cc.dataaccess.user.dao;

import java.util.Calendar;
import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.user.AnonymousUser;
import cc.dataaccess.user.repository.AnonymousUserRepository;

/**
 * @author Bryan Kowal
 */
public class AnonymousUserDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private AnonymousUserRepository anonymousUserRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public AnonymousUserDao() {
	}

	public AnonymousUser save(final AnonymousUser anonymousUser) {
		anonymousUser.setCreationDate(Calendar.getInstance());
		return transactionTemplate.execute(new TransactionCallback<AnonymousUser>() {
			@Override
			public AnonymousUser doInTransaction(TransactionStatus status) {
				try {
					anonymousUserRepository.save(anonymousUser);
					logger.info("Successfully persisted: {}.", anonymousUser.toString());
				} catch (Exception e) {
					status.setRollbackOnly();
					logger.error("Failed to persist: " + anonymousUser.toString() + ".", e);
					return null;
				}

				return anonymousUser;
			}
		});
	}

	public AnonymousUser getAnonymousUser(final String ip, final String userAgent) {
		return transactionTemplate.execute(new TransactionCallback<AnonymousUser>() {
			@Override
			public AnonymousUser doInTransaction(TransactionStatus status) {
				List<AnonymousUser> anonymousUsers = anonymousUserRepository.findByIpAndUserAgent(ip, userAgent);
				if (CollectionUtils.isEmpty(anonymousUsers)) {
					return null;
				}

				if (anonymousUsers.size() > 1) {
					logger.warn("More than one Anonymous User exists for ip: {} and user agent: {}.", ip, userAgent);
				}
				return anonymousUsers.iterator().next();
			}
		});
	}
}