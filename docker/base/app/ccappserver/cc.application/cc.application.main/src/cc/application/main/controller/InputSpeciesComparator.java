/**
 * 
 */
package cc.application.main.controller;

import java.util.Comparator;

/**
 * @author Bryan Kowal
 *
 */
public class InputSpeciesComparator implements Comparator<String> {

	/**
	 * 
	 */
	public InputSpeciesComparator() {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
	 */
	@Override
	public int compare(String arg0, String arg1) {
		return Integer.compare(arg1.length(), arg0.length());
	}
}