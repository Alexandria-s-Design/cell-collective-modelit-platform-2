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
import org.hibernate.annotations.BatchSize;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_share")
@SequenceGenerator(name = ModelShare.GENERATOR_NAME, sequenceName = ModelShare.SEQUENCE_NAME, allocationSize = 1)
@BatchSize(size = 100)
public class ModelShare {
	public static enum SHARE_ACCESS {
		/*
		 * Allows the user to see the {@link Model} even if it is not public.
		 */
		VIEW,
		/*
		 * Allows the user to edit the {@link Model}.
		 */
		EDIT,
		/*
		 * Allows the user to take every action except deleting the {@link
		 * Model}.
		 */
		ADMIN
	}

	protected static final String GENERATOR_NAME = "model_share" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "model_share" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = GENERATOR_NAME)
	private long id;

	@JsonIgnore
	@Column(nullable = false)
	private long model_id;

	/*
	 * Id of the user that the {@link Model} has been shared with.
	 */
	@Column(nullable = true)
	private Long userId;

	/*
	 * e-mail will not be stored in the database if the userId has been set.
	 * When the userId is set, the e-mail will be retrieved from the user
	 * profile during record retrieval.
	 */
	@ClientEditableField
	@Column(nullable = true)
	private String email;

	@ClientEditableField
	@Column(length = 6, nullable = false)
	@Enumerated(EnumType.STRING)
	private SHARE_ACCESS access;

	@Column(nullable = true)
	private Long modelLinkId;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	public ModelShare() {
	}

	protected ModelShare(ModelShare modelShare) {
		this.id = modelShare.id;
		this.model_id = modelShare.model_id;
		this.userId = modelShare.userId;
		this.email = modelShare.email;
		this.access = modelShare.access;
		this.modelLinkId = modelShare.modelLinkId;
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
	 * @return the email
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * @param email
	 *            the email to set
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * @return the access
	 */
	public SHARE_ACCESS getAccess() {
		return access;
	}

	/**
	 * @param access
	 *            the access to set
	 */
	public void setAccess(SHARE_ACCESS access) {
		this.access = access;
	}

	/**
	 * @return the modelLinkId
	 */
	public Long getModelLinkId() {
		return modelLinkId;
	}

	/**
	 * @param modelLinkId
	 *            the modelLinkId to set
	 */
	public void setModelLinkId(Long modelLinkId) {
		this.modelLinkId = modelLinkId;
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

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelShare [");
		sb.append("id=").append(id);
		sb.append(", model_id=").append(model_id);
		sb.append(", userId=").append(userId);
		sb.append(", email=").append(email);
		sb.append(", access=").append(access.name());
		if (modelLinkId != null) {
			sb.append(", modelLinkId=").append(modelLinkId);
		}
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		sb.append(", updateDate=").append(updateDate.getTime().toString());
		sb.append("]");
		return sb.toString();
	}
}