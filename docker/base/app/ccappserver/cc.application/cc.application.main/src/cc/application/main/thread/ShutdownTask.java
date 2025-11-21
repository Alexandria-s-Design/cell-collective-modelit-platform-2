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
public class ShutdownTask implements Runnable {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private static final int SUCCESS_STATUS = 0;

	private static final int EXECUTOR_THREADS = 1;

	public static final int SHUTDOWN_DELAY_SECS = 15;

	private static final ScheduledExecutorService scheduledExecutorService = Executors
			.newScheduledThreadPool(EXECUTOR_THREADS);

	public static void schedule() {
		scheduledExecutorService.schedule(new ShutdownTask(), SHUTDOWN_DELAY_SECS, TimeUnit.SECONDS);
	}

	public ShutdownTask() {
	}

	@Override
	public void run() {
		logger.info("Terminated the Application Server.");
		System.exit(SUCCESS_STATUS);
	}
}