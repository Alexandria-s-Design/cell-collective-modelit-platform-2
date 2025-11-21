/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "model_version")
public class ModelVersion {

	public static final int NAME_LENGTH = 80;

	public static final int DESCRIPTION_LENGTH = 4096;

	@EmbeddedId
	private ModelVersionId id;

	@Column(nullable = true, insertable=false, updatable=false)
	private int version;

	@Column(nullable = true, length = NAME_LENGTH)
	private String name;

	@Column(nullable = true, length = DESCRIPTION_LENGTH)
	private String description;

	@Column(nullable = false)
	private Long modelId;

	@Column(nullable = true)
	private Long userId;

	@Column(nullable = false)
	private Calendar creationDate;

	@Column(nullable = false)
	private Boolean selected = Boolean.FALSE;

	public ModelVersion() {
	}

	protected ModelVersion(ModelVersion modelVersion) {
		this.id = modelVersion.id;
		this.version = modelVersion.version;
		this.name = modelVersion.name;
		this.description = modelVersion.description;
		this.modelId = modelVersion.modelId;
		this.userId = modelVersion.userId;
		this.creationDate = modelVersion.creationDate;
		this.selected = modelVersion.selected;
	}

	public ModelVersionId getId() {
		return id;
	}

	public void setId(ModelVersionId id) {
		this.id = id;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Long getModelId() {
		return modelId;
	}

	public void setModelId(Long modelId) {
		this.modelId = modelId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Calendar getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	public Boolean isSelected() {
		return selected;
	}

	public void setSelected(Boolean selected) {
		this.selected = selected;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ModelVersion [");
		sb.append("id=").append(id);
		sb.append(", version=").append(version);
		sb.append(", name=").append(name);
		sb.append(", description=").append(description);
		sb.append(", modelId=").append(modelId);
		sb.append(", userId=").append(userId);
		sb.append(", creationDate=").append(creationDate.getTime().toString());
		sb.append(", selected=").append(selected);
		sb.append("]");
		return sb.toString();
	}
}