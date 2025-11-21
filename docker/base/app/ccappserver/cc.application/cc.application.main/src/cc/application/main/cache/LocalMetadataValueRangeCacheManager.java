/**
 * 
 */
package cc.application.main.cache;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cc.application.main.json.metadata.DefinitionJSON;
import cc.application.main.json.metadata.MetadataValueRangeJSON;
import cc.dataaccess.MetadataValueRange;

/**
 * @author Bryan Kowal
 *
 */
public final class LocalMetadataValueRangeCacheManager {

	private static final LocalMetadataValueRangeCacheManager INSTANCE = new LocalMetadataValueRangeCacheManager();

	private final Map<Long, MetadataValueRangeJSON> metadataValueRangesJSONMap = new HashMap<>();

	private boolean loaded = false;

	protected LocalMetadataValueRangeCacheManager() {
	}

	public static LocalMetadataValueRangeCacheManager getInstance() {
		return INSTANCE;
	}

	public void load(List<MetadataValueRange> metadataValueRanges) {
		if (this.loaded) {
			throw new IllegalStateException(
					"An initial load of the Metadata Value Range Cache has already been completed!");
		}
		if (metadataValueRanges == null) {
			return;
		}

		final Map<Long, DefinitionJSON> definitionsJSONMap = LocalDefinitionCacheManager.getInstance()
				.getAllDefinitions();
		for (MetadataValueRange metadataValueRange : metadataValueRanges) {
			MetadataValueRangeJSON metadataValueRangeJSON = new MetadataValueRangeJSON(metadataValueRange);
			metadataValueRangeJSON.setAssociatedDefinition(
					definitionsJSONMap.get(metadataValueRange.getDefinitionId()).getDefinition());
			metadataValueRangesJSONMap.put(metadataValueRange.getId(), metadataValueRangeJSON);
		}

		this.loaded = true;
	}

	public Map<Long, MetadataValueRangeJSON> getAllMetadataValueRanges() {
		synchronized (this.metadataValueRangesJSONMap) {
			return new HashMap<>(this.metadataValueRangesJSONMap);
		}
	}

	public MetadataValueRange getMetadataValueRange(final Long id) {
		synchronized (this.metadataValueRangesJSONMap) {
			if (this.metadataValueRangesJSONMap.containsKey(id) == false) {
				return null;
			}

			return this.metadataValueRangesJSONMap.get(id).getMetadataValueRange();
		}
	}
}