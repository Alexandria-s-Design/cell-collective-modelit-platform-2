/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.model.LayoutNode;

/**
 * @author Bryan Kowal
 */
public class LayoutNodeJSON extends LayoutNode implements INullableFields {

	public static class NullableFields {
		public static String X = "x";

		public static String Y = "y";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	private long speciesId;

	public LayoutNodeJSON() {
	}

	public LayoutNodeJSON(LayoutNode layoutNode) {
		super(layoutNode);
	}

	public LayoutNode constructNew() {
		LayoutNode layoutNode = new LayoutNode();
		layoutNode.setComponentId(getComponentId());
		if (layoutNode.getComponentId() == 0) {
			layoutNode.setComponentId(speciesId);
		}
		layoutNode.setLayoutId(getLayoutId());
		layoutNode.setX(getX());
		layoutNode.setY(getY());
		return layoutNode;
	}

	@Override
	public boolean wasSetNull(String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@Override
	public void setX(Double x) {
		super.setX(x);
		nullableFields.handleNullSet(x, NullableFields.X);
	}

	@Override
	public void setY(Double y) {
		super.setY(y);
		nullableFields.handleNullSet(y, NullableFields.Y);
	}

	public long getSpeciesId() {
		if (speciesId == 0) {
			return getComponentId();
		}
		return speciesId;
	}

	public void setSpeciesId(long speciesId) {
		this.speciesId = speciesId;
	}
}