/**
 * 
 */
package cc.application.main.cache;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import cc.application.main.json.metadata.DefinitionJSON;
import cc.common.data.metadata.Definition;
import cc.common.data.metadata.ValueType;

/**
 * @author Bryan Kowal
 *
 */
public final class LocalDefinitionCacheManager {

	private static final LocalDefinitionCacheManager INSTANCE = new LocalDefinitionCacheManager();

	private final Map<Long, DefinitionJSON> definitionsJSONMap = new HashMap<>();

	private final Set<Long> attachmentDefinitionIds = new HashSet<>();

	private boolean loaded = false;

	protected LocalDefinitionCacheManager() {
	}

	public static LocalDefinitionCacheManager getInstance() {
		return INSTANCE;
	}

	public void load(List<Definition> definitions) {
		if (this.loaded) {
			throw new IllegalStateException("An initial load of the Definition Cache has already been completed!");
		}
		if (definitions == null) {
			return;
		}

		for (Definition definition : definitions) {
			definitionsJSONMap.put(definition.getId(), new DefinitionJSON(definition));
			if (definition.getType() == ValueType.Attachment) {
				this.attachmentDefinitionIds.add(definition.getId());
			}
		}
		this.loaded = true;
	}

	public Map<Long, DefinitionJSON> getAllDefinitions() {
		synchronized (this.definitionsJSONMap) {
			return new HashMap<>(this.definitionsJSONMap);
		}
	}

	public Definition getDefinition(final Long id) {
		synchronized (this.definitionsJSONMap) {
			if (this.definitionsJSONMap.containsKey(id) == false) {
				return null;
			}

			return this.definitionsJSONMap.get(id).getDefinition();
		}
	}

	public Set<Long> getAttachmentDefinitionIds() {
		synchronized (attachmentDefinitionIds) {
			return new HashSet<>(attachmentDefinitionIds);
		}
	}
}