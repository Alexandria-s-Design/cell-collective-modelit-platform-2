/**
 * 
 */
package cc.application.main.thread;

import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Bryan Kowal
 */
public abstract class AbstractScheduledTask implements Runnable {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	private String displayName;

	private final long initialDelay;

	private final long executionDelay;

	private final TimeUnit timeUnit;

	public AbstractScheduledTask(String displayName, long initialDelay, long executionDelay, TimeUnit timeUnit) {
		this.displayName = displayName;
		this.initialDelay = initialDelay;
		this.executionDelay = executionDelay;
		this.timeUnit = timeUnit;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public long getInitialDelay() {
		return initialDelay;
	}

	public long getExecutionDelay() {
		return executionDelay;
	}

	public TimeUnit getTimeUnit() {
		return timeUnit;
	}
}