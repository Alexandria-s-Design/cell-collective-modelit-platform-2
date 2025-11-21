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
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_link")
@SequenceGenerator(name = ModelLink.GENERATOR_NAME,
		sequenceName = ModelLink.SEQUENCE_NAME,
		allocationSize = 1)
public class ModelLink {

	public static enum LINK_ACCESS {
		/*
		 * Allows anybody to see the {@link Model} even if it is not public.
		 */
		VIEW,
		/*
		 * Automatically shares the {@link Model} with the currently
		 * AUTHENTICATED user.
		 */
		SHARE

	}

	protected static final String GENERATOR_NAME = "model_link" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model_link" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false,
			length = 80)
	private String accessCode;

	@ClientEditableField
	@Column(length = 6,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private LINK_ACCESS access;

	@JsonIgnore
	@Column(nullable = false)
	private long model_id;

	/*
	 * Id of the user that created the share link.
	 */
	@Column(nullable = false)
	private Long userId;

	@ClientEditableField
	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar startDate;

	@ClientEditableField
	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar endDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	@Column(nullable = false)
	private int accessCount = 0;

	public ModelLink() {
	}

	protected ModelLink(ModelLink link) {
		this.id = link.id;
		this.accessCode = link.accessCode;
		this.access = link.access;
		this.model_id = link.model_id;
		this.userId = link.userId;
		this.startDate = link.startDate;
		this.endDate = link.endDate;
		this.creationDate = link.creationDate;
		this.updateDate = link.updateDate;
		this.accessCount = link.accessCount;
	}

	public void incrementAccessCount() {
		++this.accessCount;
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
	 * @return the accessCode
	 */
	public String getAccessCode() {
		return accessCode;
	}

	/**
	 * @param accessCode
	 *            the accessCode to set
	 */
	public void setAccessCode(String accessCode) {
		this.accessCode = accessCode;
	}

	/**
	 * @return the access
	 */
	public LINK_ACCESS getAccess() {
		return access;
	}

	/**
	 * @param access
	 *            the access to set
	 */
	public void setAccess(LINK_ACCESS access) {
		this.access = access;
	}

	public long getModel_id() {
		return model_id;
	}

	public void setModel_id(long model_id) {
		this.model_id = model_id;
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
	 * @return the startDate
	 */
	public Calendar getStartDate() {
		return startDate;
	}

	/**
	 * @param startDate
	 *            the startDate to set
	 */
	public void setStartDate(Calendar startDate) {
		this.startDate = startDate;
	}

	/**
	 * @return the endDate
	 */
	public Calendar getEndDate() {
		return endDate;
	}

	/**
	 * @param endDate
	 *            the endDate to set
	 */
	public void setEndDate(Calendar endDate) {
		this.endDate = endDate;
	}

	/**
	 * @return the creationDate
	 */
	public Calendar getCreationDate() {
		return creationDate;
	}

	/**
	 * @param creationDate
	 *            the creationDate to set
	 */
	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	/**
	 * @return the updateDate
	 */
	public Calendar getUpdateDate() {
		return updateDate;
	}

	/**
	 * @param updateDate
	 *            the updateDate to set
	 */
	public void setUpdateDate(Calendar updateDate) {
		this.updateDate = updateDate;
	}

	/**
	 * @return the accessCount
	 */
	public int getAccessCount() {
		return accessCount;
	}

	/**
	 * @param accessCount
	 *            the accessCount to set
	 */
	public void setAccessCount(int accessCount) {
		this.accessCount = accessCount;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelLink [");
		sb.append("id=").append(id);
		sb.append(", accessCode=").append(accessCode);
		sb.append(", access=").append(access.name());
		sb.append(", model_id=").append(model_id);
		sb.append(", userId=").append(userId);
		if (startDate != null) {
			sb.append(", startDate=").append(startDate.getTime().toString());
		}
		if (endDate != null) {
			sb.append(", endDate=").append(endDate.getTime().toString());
		}
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		sb.append(", updateDate=").append(updateDate.getTime().toString());
		sb.append(", accessCount=").append(accessCount);
		sb.append("]");
		return sb.toString();
	}
}