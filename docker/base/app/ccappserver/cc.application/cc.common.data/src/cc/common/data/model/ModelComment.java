/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_comment")
public class ModelComment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(nullable = false)
	private long userId;

	@ManyToOne(optional = false,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_comment_to_model") )
	@JsonIgnore
	private ModelIdentifier model;

	@ClientEditableField
	@Column(nullable = false,
			length = 4096)
	private String content;

	@ClientEditableField
	@Column(nullable = false)
	private boolean edited = false;

	@Column(nullable = true)
	private Long replyTo;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	/*
	 * Indicates that the {@link ModelComment} should be reviewed by an admin
	 * user.
	 */
	@Column(nullable = false)
	private boolean flagged = false;

	public ModelComment() {
	}
	
	protected ModelComment(ModelComment comment) {
		this.id = comment.id;
		this.userId = comment.userId;
		this.model = comment.model;
		this.content = comment.content;
		this.edited = comment.edited;
		this.replyTo = comment.replyTo;
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
	 * @return the userId
	 */
	public long getUserId() {
		return userId;
	}

	/**
	 * @param userId
	 *            the userId to set
	 */
	public void setUserId(long userId) {
		this.userId = userId;
	}

	/**
	 * @return the model
	 */
	public ModelIdentifier getModel() {
		return model;
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(ModelIdentifier model) {
		this.model = model;
	}

	/**
	 * @return the content
	 */
	public String getContent() {
		return content;
	}

	/**
	 * @param content
	 *            the content to set
	 */
	public void setContent(String content) {
		this.content = content;
	}

	/**
	 * @return the edited
	 */
	public boolean isEdited() {
		return edited;
	}

	/**
	 * @param edited
	 *            the edited to set
	 */
	public void setEdited(boolean edited) {
		this.edited = edited;
	}

	/**
	 * @return the replyTo
	 */
	public Long getReplyTo() {
		return replyTo;
	}

	/**
	 * @param replyTo
	 *            the replyTo to set
	 */
	public void setReplyTo(Long replyTo) {
		this.replyTo = replyTo;
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
	 * @return the flagged
	 */
	public boolean isFlagged() {
		return flagged;
	}

	/**
	 * @param flagged
	 *            the flagged to set
	 */
	public void setFlagged(boolean flagged) {
		this.flagged = flagged;
	}
}