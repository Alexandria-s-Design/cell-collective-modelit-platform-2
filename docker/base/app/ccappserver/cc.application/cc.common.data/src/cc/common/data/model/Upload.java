/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "upload")
@SequenceGenerator(name = Upload.GENERATOR_NAME,
		sequenceName = Upload.SEQUENCE_NAME,
		allocationSize = 1)
public class Upload {

	protected static final String GENERATOR_NAME = "upload" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "upload" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false,
			length = 250)
	private String uploadName;

	@Column(nullable = false,
			length = 250)
	private String storageName;

	@Column(nullable = false,
			length = 20)
	@Enumerated(EnumType.STRING)
	private UploadType fileType;

	@Column(nullable = false)
	private Long userId;

	@ClientEditableField
	@Column
	private String description;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar uploadDate;

	public Upload() {
	}

	protected Upload(Upload upload) {
		this.id = upload.id;
		this.uploadName = upload.uploadName;
		this.storageName = upload.storageName;
		this.fileType = upload.fileType;
		this.userId = upload.userId;
		this.description = upload.description;
		this.uploadDate = upload.uploadDate;
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}

	/**
	 * @return the uploadName
	 */
	public String getUploadName() {
		return uploadName;
	}

	/**
	 * @param uploadName
	 *            the uploadName to set
	 */
	public void setUploadName(String uploadName) {
		this.uploadName = uploadName;
	}

	/**
	 * @return the storageName
	 */
	public String getStorageName() {
		return storageName;
	}

	/**
	 * @param storageName
	 *            the storageName to set
	 */
	public void setStorageName(String storageName) {
		this.storageName = storageName;
	}

	/**
	 * @return the fileType
	 */
	public UploadType getFileType() {
		return fileType;
	}

	/**
	 * @param fileType
	 *            the fileType to set
	 */
	public void setFileType(UploadType fileType) {
		this.fileType = fileType;
	}

	/**
	 * @return the userId
	 */
	public Long getUserId() {
		return userId;
	}

	/**
	 * @param userId
	 *            the userId to set
	 */
	public void setUserId(Long userId) {
		this.userId = userId;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description
	 *            the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the uploadDate
	 */
	public Calendar getUploadDate() {
		return uploadDate;
	}

	/**
	 * @param uploadDate
	 *            the uploadDate to set
	 */
	public void setUploadDate(Calendar uploadDate) {
		this.uploadDate = uploadDate;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((description == null) ? 0 : description.hashCode());
		result = prime * result + ((fileType == null) ? 0 : fileType.hashCode());
		result = prime * result + (int) (id ^ (id >>> 32));
		result = prime * result + ((storageName == null) ? 0 : storageName.hashCode());
		result = prime * result + ((uploadDate == null) ? 0 : uploadDate.hashCode());
		result = prime * result + ((uploadName == null) ? 0 : uploadName.hashCode());
		result = prime * result + ((userId == null) ? 0 : userId.hashCode());
		return result;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Upload other = (Upload) obj;
		if (description == null) {
			if (other.description != null)
				return false;
		} else if (!description.equals(other.description))
			return false;
		if (fileType == null) {
			if (other.fileType != null)
				return false;
		} else if (!fileType.equals(other.fileType))
			return false;
		if (id != other.id)
			return false;
		if (storageName == null) {
			if (other.storageName != null)
				return false;
		} else if (!storageName.equals(other.storageName))
			return false;
		if (uploadDate == null) {
			if (other.uploadDate != null)
				return false;
		} else if (!uploadDate.equals(other.uploadDate))
			return false;
		if (uploadName == null) {
			if (other.uploadName != null)
				return false;
		} else if (!uploadName.equals(other.uploadName))
			return false;
		if (userId == null) {
			if (other.userId != null)
				return false;
		} else if (!userId.equals(other.userId))
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("Upload [id=");
		builder.append(id);
		if (uploadName != null) {
			builder.append(", ");
			builder.append("uploadName=");
			builder.append(uploadName);
		}
		if (storageName != null) {
			builder.append(", ");
			builder.append("storageName=");
			builder.append(storageName);
		}
		if (fileType != null) {
			builder.append(", ");
			builder.append("fileType=");
			builder.append(fileType.name());
		}
		if (userId != null) {
			builder.append(", ");
			builder.append("userId=");
			builder.append(userId);
		}
		if (description != null) {
			builder.append(", ");
			builder.append("description=");
			builder.append(description);
		}
		if (uploadDate != null) {
			builder.append(", ");
			builder.append("uploadDate=");
			builder.append(uploadDate.getTime().toString());
		}
		builder.append("]");
		return builder.toString();
	}
}