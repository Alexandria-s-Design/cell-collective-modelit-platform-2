/**
 * 
 */
package cc.dataaccess;

import java.util.Map;

import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.ContentReference;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Reference;
import cc.common.data.knowledge.Section;
import cc.common.data.model.ModelReference;

/**
 * @author Bryan Kowal
 */
public class KnowledgeBaseData {

	private Map<Number, Reference> referencesToSave;

	private Map<Number, Reference> referencesToDelete;

	private Map<Number, ModelReference> modelReferencesToSave;

	private Map<Number, ModelReference> modelReferencesToDelete;

	private Map<Number, PageReference> pageReferencesToSave;

	private Map<Number, PageReference> pageReferencesToDelete;

	private Map<Number, ContentReference> contentReferencesToSave;

	private Map<Number, ContentReference> contentReferencesToDelete;

	private Map<Number, Section> sectionsToSave;

	private Map<Number, Section> sectionsToDelete;

	private Map<Number, Content> contentsToSave;

	private Map<Number, Content> contentsToDelete;

	public KnowledgeBaseData() {
	}

	/**
	 * @return the referencesToSave
	 */
	public Map<Number, Reference> getReferencesToSave() {
		return referencesToSave;
	}

	/**
	 * @param referencesToSave the referencesToSave to set
	 */
	public void setReferencesToSave(Map<Number, Reference> referencesToSave) {
		this.referencesToSave = referencesToSave;
	}

	/**
	 * @return the referencesToDelete
	 */
	public Map<Number, Reference> getReferencesToDelete() {
		return referencesToDelete;
	}

	/**
	 * @param referencesToDelete the referencesToDelete to set
	 */
	public void setReferencesToDelete(Map<Number, Reference> referencesToDelete) {
		this.referencesToDelete = referencesToDelete;
	}

	/**
	 * @return the modelReferencesToSave
	 */
	public Map<Number, ModelReference> getModelReferencesToSave() {
		return modelReferencesToSave;
	}

	/**
	 * @param modelReferencesToSave the modelReferencesToSave to set
	 */
	public void setModelReferencesToSave(Map<Number, ModelReference> modelReferencesToSave) {
		this.modelReferencesToSave = modelReferencesToSave;
	}

	/**
	 * @return the modelReferencesToDelete
	 */
	public Map<Number, ModelReference> getModelReferencesToDelete() {
		return modelReferencesToDelete;
	}

	/**
	 * @param modelReferencesToDelete the modelReferencesToDelete to set
	 */
	public void setModelReferencesToDelete(Map<Number, ModelReference> modelReferencesToDelete) {
		this.modelReferencesToDelete = modelReferencesToDelete;
	}

	/**
	 * @return the pageReferencesToSave
	 */
	public Map<Number, PageReference> getPageReferencesToSave() {
		return pageReferencesToSave;
	}

	/**
	 * @param pageReferencesToSave the pageReferencesToSave to set
	 */
	public void setPageReferencesToSave(Map<Number, PageReference> pageReferencesToSave) {
		this.pageReferencesToSave = pageReferencesToSave;
	}

	/**
	 * @return the pageReferencesToDelete
	 */
	public Map<Number, PageReference> getPageReferencesToDelete() {
		return pageReferencesToDelete;
	}

	/**
	 * @param pageReferencesToDelete the pageReferencesToDelete to set
	 */
	public void setPageReferencesToDelete(Map<Number, PageReference> pageReferencesToDelete) {
		this.pageReferencesToDelete = pageReferencesToDelete;
	}

	/**
	 * @return the contentReferencesToSave
	 */
	public Map<Number, ContentReference> getContentReferencesToSave() {
		return contentReferencesToSave;
	}

	/**
	 * @param contentReferencesToSave the contentReferencesToSave to set
	 */
	public void setContentReferencesToSave(Map<Number, ContentReference> contentReferencesToSave) {
		this.contentReferencesToSave = contentReferencesToSave;
	}

	/**
	 * @return the contentReferencesToDelete
	 */
	public Map<Number, ContentReference> getContentReferencesToDelete() {
		return contentReferencesToDelete;
	}

	/**
	 * @param contentReferencesToDelete the contentReferencesToDelete to set
	 */
	public void setContentReferencesToDelete(Map<Number, ContentReference> contentReferencesToDelete) {
		this.contentReferencesToDelete = contentReferencesToDelete;
	}

	/**
	 * @return the sectionsToSave
	 */
	public Map<Number, Section> getSectionsToSave() {
		return sectionsToSave;
	}

	/**
	 * @param sectionsToSave the sectionsToSave to set
	 */
	public void setSectionsToSave(Map<Number, Section> sectionsToSave) {
		this.sectionsToSave = sectionsToSave;
	}

	/**
	 * @return the sectionsToDelete
	 */
	public Map<Number, Section> getSectionsToDelete() {
		return sectionsToDelete;
	}

	/**
	 * @param sectionsToDelete the sectionsToDelete to set
	 */
	public void setSectionsToDelete(Map<Number, Section> sectionsToDelete) {
		this.sectionsToDelete = sectionsToDelete;
	}

	/**
	 * @return the contentsToSave
	 */
	public Map<Number, Content> getContentsToSave() {
		return contentsToSave;
	}

	/**
	 * @param contentsToSave the contentsToSave to set
	 */
	public void setContentsToSave(Map<Number, Content> contentsToSave) {
		this.contentsToSave = contentsToSave;
	}

	/**
	 * @return the contentsToDelete
	 */
	public Map<Number, Content> getContentsToDelete() {
		return contentsToDelete;
	}

	/**
	 * @param contentsToDelete the contentsToDelete to set
	 */
	public void setContentsToDelete(Map<Number, Content> contentsToDelete) {
		this.contentsToDelete = contentsToDelete;
	}
}