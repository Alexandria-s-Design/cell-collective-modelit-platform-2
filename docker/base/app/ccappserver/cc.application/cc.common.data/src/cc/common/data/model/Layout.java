/**
 * 
 */
package cc.common.data.model;

import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@Table(name = "layout")
@SequenceGenerator(name = Layout.GENERATOR_NAME,
		sequenceName = Layout.SEQUENCE_NAME,
		allocationSize = 1)
public class Layout {

	protected static final String GENERATOR_NAME = "layout" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "layout" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long modelId;

	@ClientEditableField
	@Column(nullable = true)
	private String name;

	@ClientEditableField
	@Column(nullable = true)
	private Float top;

	@ClientEditableField
	@Column(nullable = true)
	private Float bottom;

	@ClientEditableField
	@Column(nullable = true, name = "[left]")
	private Float left;

	@ClientEditableField
	@Column(nullable = true, name = "[right]")
	private Float right;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar creationDate;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING,
			pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	private Calendar updateDate;

	public Layout() {
	}

	protected Layout(Layout layout) {
		this.id = layout.id;
		this.modelId = layout.modelId;
		this.name = layout.name;
		this.top = layout.top;
		this.bottom = layout.bottom;
		this.left = layout.left;
		this.right = layout.right;
		this.creationDate = layout.creationDate;
		this.updateDate = layout.updateDate;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getModelId() {
		return modelId;
	}

	public void setModelId(long modelId) {
		this.modelId = modelId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Float getTop() {
		return top;
	}

	public void setTop(Float top) {
		this.top = top;
	}

	public Float getBottom() {
		return bottom;
	}

	public void setBottom(Float bottom) {
		this.bottom = bottom;
	}

	public Float getLeft() {
		return left;
	}

	public void setLeft(Float left) {
		this.left = left;
	}

	public Float getRight() {
		return right;
	}

	public void setRight(Float right) {
		this.right = right;
	}

	public Calendar getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Calendar creationDate) {
		this.creationDate = creationDate;
	}

	public Calendar getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Calendar updateDate) {
		this.updateDate = updateDate;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Layout [");
		sb.append("id=").append(id);
		sb.append(", modelId=").append(modelId);
		sb.append(", name=").append(name);
		sb.append(", top=").append(top);
		sb.append(", bottom=").append(bottom);
		sb.append(", left=").append(left);
		sb.append(", right=").append(right);
		if (creationDate != null) {
			sb.append(", creationDate=").append(creationDate.getTime().toString());
		}
		if (updateDate != null) {
			sb.append(", updateDate=").append(updateDate.getTime().toString());
		}
		sb.append("]");
		return sb.toString();
	}
}