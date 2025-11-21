package cc.application.jsbml.knowledge;

import java.util.List;
import java.util.ArrayList;

public class Description implements KnowledgeBaseNode {

	private String title = "";
	private String text = "";
	private List<ReferenceNode> referenceList = new ArrayList<>();

	public Description() {}

	public String getContentType() {
		return KnowledgeBaseAdapter.KB_SECTION_DESCRIPTION;	
	}

	public void setTitle(String value) {
		this.title = value;
	}

	public String getTitle() {
		return this.title;
	}

	public void setText(String value) {
		this.text = value;
	}

	public String getText() {
		return this.text;
	}

	public List<ReferenceNode> getReferences() {
		return referenceList;
	}
	
	@Override
	public void setReferences(List<ReferenceNode> references) {
		this.referenceList = references;
	}

}
