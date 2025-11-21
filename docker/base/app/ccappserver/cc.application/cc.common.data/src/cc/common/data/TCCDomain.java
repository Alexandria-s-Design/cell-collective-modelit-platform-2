/**
 * 
 */
package cc.common.data;

import java.util.Map;
import java.util.HashMap;

/**
 * @author Bryan Kowal
 */
public class TCCDomain {

	private static final String TEACH_DOMAIN = "teach.cellcollective.org";

	private static final String LEARN_DOMAIN = "learn.cellcollective.org";

	private static final String RESEARCH_DOMAIN = "research.cellcollective.org";

	private static final Map<String, Domain> domainOverrideLookupMap;
	
	public static enum Domain {
		LEARN, TEACH, RESEARCH
	}

	static {
		domainOverrideLookupMap = new HashMap<>(Domain.values().length, 1.0f);
		for (Domain domain : Domain.values()) {
			domainOverrideLookupMap.put(domain.name(), domain);
		}
	}

	public static Domain determineDomain(final String origin) {
		if (origin == null || origin.isEmpty()) {
			return null;
		}

		if (origin.contains(LEARN_DOMAIN)) {
			return Domain.LEARN;
		}
		if (origin.contains(TEACH_DOMAIN)) {
			return Domain.TEACH;
		}

		if (origin.contains(RESEARCH_DOMAIN)) {
			return Domain.RESEARCH;
		}

		return null;
	}

	public static Domain determineDomainFromOverride(final String domainOverride) {
		return domainOverrideLookupMap.get(domainOverride);
	}

	protected TCCDomain() {
	}
}