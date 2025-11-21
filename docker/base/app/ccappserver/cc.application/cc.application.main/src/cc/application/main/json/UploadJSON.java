/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.model.Upload;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class UploadJSON extends Upload {

	private String token;

	private Upload upload;

	public UploadJSON() {
	}

	public UploadJSON(Upload upload) {
		super(upload);
		this.upload = upload;
	}

	public UploadJSON(Upload upload, final String token) {
		this(upload);
		this.token = token;
	}

	public UploadJSON(UploadJSON uploadJSON, String token) {
		super.setId(uploadJSON.getId());
		super.setUploadName(uploadJSON.getUploadName());
		super.setStorageName(uploadJSON.getStorageName());
		super.setFileType(uploadJSON.getFileType());
		super.setUserId(uploadJSON.getUserId());
		super.setDescription(uploadJSON.getDescription());
		super.setUploadDate(uploadJSON.getUploadDate());
		this.token = token;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public String getStorageName() {
		return super.getStorageName();
	}

	/**
	 * @return the token
	 */
	public String getToken() {
		return token;
	}

	/**
	 * @param token
	 *            the token to set
	 */
	public void setToken(String token) {
		this.token = token;
	}

	/**
	 * @return the upload
	 */
	@JsonIgnore
	public Upload getUpload() {
		return upload;
	}

	/**
	 * @param upload
	 *            the upload to set
	 */
	public void setUpload(Upload upload) {
		this.upload = upload;
	}
}