/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.model.Layout;

/**
 * @author Bryan Kowal
 */
public class LayoutJSON extends Layout implements INullableFields {

	private static class NullableFields {
		public static String NAME = "name";

		public static String TOP = "top";

		public static String BOTTOM = "bottom";

		public static String LEFT = "left";

		public static String RIGHT = "right";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public LayoutJSON() {
	}
	
	public LayoutJSON(Layout layout) {
		super(layout);
	}

	public Layout constructNew() {
		Layout layout = new Layout();
		layout.setName(getName());
		layout.setTop(getTop());
		layout.setBottom(getBottom());
		layout.setLeft(getLeft());
		layout.setRight(getRight());
		return layout;
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
	public void setName(String name) {
		super.setName(name);
		nullableFields.handleNullSet(name, NullableFields.NAME);
	}

	@Override
	public void setTop(Float top) {
		super.setTop(top);
		nullableFields.handleNullSet(top, NullableFields.TOP);
	}

	@Override
	public void setBottom(Float bottom) {
		super.setBottom(bottom);
		nullableFields.handleNullSet(bottom, NullableFields.BOTTOM);
	}

	@Override
	public void setLeft(Float left) {
		super.setLeft(left);
		nullableFields.handleNullSet(left, NullableFields.LEFT);
	}

	@Override
	public void setRight(Float right) {
		super.setRight(right);
		nullableFields.handleNullSet(right, NullableFields.RIGHT);
	}
}