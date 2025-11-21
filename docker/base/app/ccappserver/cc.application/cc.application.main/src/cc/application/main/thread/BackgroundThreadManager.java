/**
 * 
 */
package cc.application.main.thread;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Bryan Kowal
 */
public class BackgroundThreadManager {

	private static final int EXECUTOR_THREADS = 3;

	public static final int SHUTDOWN_DELAY_SECS = 15;

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private final ScheduledExecutorService scheduledExecutorService;

	public BackgroundThreadManager() {
		scheduledExecutorService = Executors.newScheduledThreadPool(EXECUTOR_THREADS);
	}

	public Object scheduleTask(final AbstractScheduledTask task) {
		logger.info("Scheduling the {} task ...", task.getDisplayName());
		scheduledExecutorService.scheduleWithFixedDelay(task, task.getInitialDelay(), task.getExecutionDelay(),
				task.getTimeUnit());
		return this;
	}

	public void shutdown() {
		logger.info("Shutting down scheduled tasks ...");
		try {
			scheduledExecutorService.awaitTermination(SHUTDOWN_DELAY_SECS, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			logger.warn("Interrupted while waiting for scheduled tasks to terminate.", e);
			scheduledExecutorService.shutdownNow();
		}
	}
}