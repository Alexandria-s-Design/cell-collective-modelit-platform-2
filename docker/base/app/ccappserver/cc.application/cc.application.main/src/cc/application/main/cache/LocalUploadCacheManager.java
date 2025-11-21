/**
 * 
 */
package cc.application.main.cache;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cc.application.main.json.UploadJSON;
import cc.common.data.model.Upload;

/**
 * @author Bryan Kowal
 *
 */
public final class LocalUploadCacheManager {

	private static final LocalUploadCacheManager INSTANCE = new LocalUploadCacheManager();

	private final Map<Long, UploadJSON> uploadJSONMap = new HashMap<>();

	private boolean loaded = false;

	protected LocalUploadCacheManager() {
	}

	public static LocalUploadCacheManager getInstance() {
		return INSTANCE;
	}

	public void load(List<Upload> uploads) {
		if (this.loaded) {
			throw new IllegalStateException("An initial load of the Upload Cache has already been completed!");
		}
		if (uploads == null) {
			return;
		}

		uploads.forEach((u) -> uploadJSONMap.put(u.getId(), new UploadJSON(u)));
		this.loaded = true;
	}

	public Map<Long, UploadJSON> getAllUploads() {
		synchronized (this.uploadJSONMap) {
			return new HashMap<>(this.uploadJSONMap);
		}
	}

	public boolean uploadExists(final Long id) {
		synchronized (this.uploadJSONMap) {
			return this.uploadJSONMap.containsKey(id);
		}
	}

	public void cache(final Upload upload) {
		synchronized (this.uploadJSONMap) {
			this.uploadJSONMap.put(upload.getId(), new UploadJSON(upload));
		}
	}
}