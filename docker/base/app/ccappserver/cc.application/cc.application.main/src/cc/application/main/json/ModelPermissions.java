/**
 * 
 */
package cc.application.main.json;

/**
 * @author Bryan
 *
 */
public class ModelPermissions {

	private boolean view;

	private boolean edit;

	private boolean delete;

	private boolean share;

	private boolean publish;

	public ModelPermissions() {
	}

	public ModelPermissions(boolean view, boolean edit, boolean delete, boolean share) {
		this.view = view;
		this.edit = edit;
		this.delete = delete;
		this.share = share;
		this.publish = false;
	}

	public ModelPermissions(boolean view, boolean edit, boolean delete, boolean share, boolean publish ){
		this(view, edit, delete, share);
		this.publish = publish;
	}

	/**
	 * @return the view
	 */
	public boolean isView() {
		return view;
	}

	/**
	 * @param view
	 *            the view to set
	 */
	public void setView(boolean view) {
		this.view = view;
	}

	/**
	 * @return the edit
	 */
	public boolean isEdit() {
		return edit;
	}

	/**
	 * @param edit
	 *            the edit to set
	 */
	public void setEdit(boolean edit) {
		this.edit = edit;
	}

	/**
	 * @return the delete
	 */
	public boolean isDelete() {
		return delete;
	}

	/**
	 * @param delete
	 *            the delete to set
	 */
	public void setDelete(boolean delete) {
		this.delete = delete;
	}

	/**
	 * @return the share
	 */
	public boolean isShare() {
		return share;
	}

	/**
	 * @param share the share to set
	 */
	public void setShare(boolean share) {
		this.share = share;
	}

	/**
	 * @return the publish
	 */
	public boolean isPublish(){
		return this.publish;
	}

	/**
	 * @param publish the publish to set
	 */
	public void setPublish(boolean publish){
		this.publish = publish;
	}
}