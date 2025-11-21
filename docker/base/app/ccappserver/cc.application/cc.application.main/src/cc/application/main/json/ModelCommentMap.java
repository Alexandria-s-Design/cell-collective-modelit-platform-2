/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.model.ModelComment;

/**
 * @author Bryan Kowal
 */
@JsonInclude(Include.NON_NULL)
public class ModelCommentMap extends ModelComment {

	public ModelCommentMap() {
	}

	public ModelCommentMap(ModelComment comment) {
		super(comment);
	}

	public ModelComment constructNewComment() {
		ModelComment comment = new ModelComment();
		comment.setUserId(super.getUserId());
		comment.setModel(super.getModel());
		comment.setContent(super.getContent());
		comment.setEdited(super.isEdited());
		comment.setReplyTo(super.getReplyTo());
		comment.setFlagged(super.isFlagged());

		return comment;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}
}