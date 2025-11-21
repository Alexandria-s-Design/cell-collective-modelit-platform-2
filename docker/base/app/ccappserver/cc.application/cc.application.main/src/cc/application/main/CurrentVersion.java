/**
 * 
 */
package cc.application.main;

import java.util.Calendar;

/**
 * @author Bryan Kowal
 *
 */
public class CurrentVersion {

	private static final CurrentVersion instance = new CurrentVersion();
	
	private final Calendar startupDate = Calendar.getInstance();
	
	protected CurrentVersion() {
	}
	
	public static CurrentVersion getInstance() {
		return instance;
	}

	/**
	 * @return the startupDate
	 */
	public Calendar getStartupDate() {
		return startupDate;
	}
}