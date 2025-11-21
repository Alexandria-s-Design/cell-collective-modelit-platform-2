/**
 * 
 */
package cc.common.data.simulation;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.ClientEditableField;
import cc.common.data.model.ModelIdentifier;

/**
 * @author Bryan
 *
 */
@Entity
@Table(name = "simulation",
		uniqueConstraints = @UniqueConstraint(columnNames = { "name", "model_id", "userId" },
				name = "uk_name") )
public class Simulation {

	public static enum Type {
		REALTIME, DYNAMIC
	}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(length = 100,
			nullable = false)
	public String name;

	@Column(length = 10,
			nullable = false)
	@Enumerated(EnumType.STRING)
	private Type type;

	@ManyToOne(optional = true,
			fetch = FetchType.EAGER,
			targetEntity = ModelIdentifier.class)
	@JoinColumn(name = "model_id",
			nullable = false,
			updatable = false,
			foreignKey = @ForeignKey(name = "fk_simulation_to_model") )
	@JsonIgnore
	private ModelIdentifier model;

	@Column(nullable = true)
	private Long userId;

	@Column(nullable = false)
	private boolean complete;
	
	@Column(nullable = false)
	private boolean failed;

	@ClientEditableField
	@Column(nullable = false)
	private boolean shared = false;

	@ClientEditableField
	@Column(nullable = false)
	private boolean published = false;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar lastAccessDate;

	/**
	 * 
	 */
	public Simulation() {
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
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the type
	 */
	public Type getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(Type type) {
		this.type = type;
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
	 * @return the complete
	 */
	public boolean isComplete() {
		return complete;
	}

	/**
	 * @param complete
	 *            the complete to set
	 */
	public void setComplete(boolean complete) {
		this.complete = complete;
	}

	/**
	 * @return the failed
	 */
	public boolean isFailed() {
		return failed;
	}

	/**
	 * @param failed the failed to set
	 */
	public void setFailed(boolean failed) {
		this.failed = failed;
	}

	/**
	 * @return the shared
	 */
	public boolean isShared() {
		return shared;
	}

	/**
	 * @param shared
	 *            the shared to set
	 */
	public void setShared(boolean shared) {
		this.shared = shared;
	}

	/**
	 * @return the published
	 */
	public boolean isPublished() {
		return published;
	}

	/**
	 * @param published
	 *            the published to set
	 */
	public void setPublished(boolean published) {
		this.published = published;
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
	 * @return the lastAccessDate
	 */
	public Calendar getLastAccessDate() {
		return lastAccessDate;
	}

	/**
	 * @param lastAccessDate
	 *            the lastAccessDate to set
	 */
	public void setLastAccessDate(Calendar lastAccessDate) {
		this.lastAccessDate = lastAccessDate;
	}
}