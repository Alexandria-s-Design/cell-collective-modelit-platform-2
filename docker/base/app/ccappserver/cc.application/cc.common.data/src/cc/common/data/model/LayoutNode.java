/**
 * 
 */
package cc.common.data.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import cc.common.data.ClientEditableField;
import cc.common.data.IdManagementConstants;

/**
 * @author Bryan Kowal
 */
@Entity
@Table(name = "layout_node")
@SequenceGenerator(name = LayoutNode.GENERATOR_NAME,
		sequenceName = LayoutNode.SEQUENCE_NAME,
		allocationSize = 1)
public class LayoutNode {

	protected static final String GENERATOR_NAME = "layout_node" + IdManagementConstants.GENERATOR_NAME_SUFFIX;

	protected static final String SEQUENCE_NAME = "layout_node" + IdManagementConstants.SEQUENCE_NAME_SUFFIX;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE,
			generator = GENERATOR_NAME)
	private long id;

	@Column(nullable = false)
	private long componentId;

	@Column(nullable = false)
	private long layoutId;

	@ClientEditableField
	@Column(nullable = true)
	private Double x;

	@ClientEditableField
	@Column(nullable = true)
	private Double y;

	public LayoutNode() {
	}

	protected LayoutNode(LayoutNode layoutNode) {
		this.id = layoutNode.id;
		this.componentId = layoutNode.componentId;
		this.layoutId = layoutNode.layoutId;
		this.x = layoutNode.x;
		this.y = layoutNode.y;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getComponentId() {
		return componentId;
	}

	public void setComponentId(long componentId) {
		this.componentId = componentId;
	}

	public long getLayoutId() {
		return layoutId;
	}

	public void setLayoutId(long layoutId) {
		this.layoutId = layoutId;
	}

	public Double getX() {
		return x;
	}

	public void setX(Double x) {
		this.x = x;
	}

	public Double getY() {
		return y;
	}

	public void setY(Double y) {
		this.y = y;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("LayoutNode [");
		sb.append("id=").append(id);
		sb.append(", componentId=").append(componentId);
		sb.append(", layoutId=").append(layoutId);
		sb.append(", x=").append(x);
		sb.append(", y=").append(y);
		sb.append("]");
		return sb.toString();
	}
}