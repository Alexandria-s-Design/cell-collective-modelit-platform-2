package cc.application.jsbml.knowledge;

import java.util.List;
import java.util.ArrayList;

public class RegulatorySummary implements KnowledgeBaseNode {

	private String title = "";
	private String text = "";
	private List<ReferenceNode> referenceList = new ArrayList<>();

	public RegulatorySummary() {}

	public String getContentType() {
		return KnowledgeBaseAdapter.KB_SECTION_REGULATORY_SUMMARY;	
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
