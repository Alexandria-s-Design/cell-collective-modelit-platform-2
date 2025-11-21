/**
 * 
 */
package cc.common.data.model;

/**
 * @author Bryan Kowal
 */
public enum UploadType {

	PDF(".pdf"), JPG(".jpg"),PNG(".png"), TXT(".txt"), SVG(".svg"), GIF(".gif"), MP4(".mp4");

	private final String extension;

	private UploadType(final String extension) {
		this.extension = extension;
	}

	/**
	 * @return the extension
	 */
	public String getExtension() {
		return extension;
	}
}