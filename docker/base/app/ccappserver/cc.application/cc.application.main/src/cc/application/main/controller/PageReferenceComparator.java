/**
 * 
 */
package cc.application.main.controller;

import java.util.Comparator;

import cc.common.data.knowledge.PageReference;

/**
 * @author Bryan Kowal
 */
public class PageReferenceComparator implements Comparator<PageReference> {

	public PageReferenceComparator() {
	}

	@Override
	public int compare(PageReference arg0, PageReference arg1) {
		if (arg0.getId() == arg1.getId()) {
			return 0;
		} else if (arg0.getId() > arg1.getId()) {
			return 1;
		}
		return -1;
	}
}