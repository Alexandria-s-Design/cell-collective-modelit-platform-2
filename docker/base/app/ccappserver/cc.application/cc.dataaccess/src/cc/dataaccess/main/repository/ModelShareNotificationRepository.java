/**
 * 
 */
package cc.dataaccess.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cc.common.data.model.ModelShareNotification;
import cc.common.data.model.ModelShareNotificationId;

/**
 * @author Bryan Kowal
 */
public interface ModelShareNotificationRepository
		extends JpaRepository<ModelShareNotification, ModelShareNotificationId> {
}