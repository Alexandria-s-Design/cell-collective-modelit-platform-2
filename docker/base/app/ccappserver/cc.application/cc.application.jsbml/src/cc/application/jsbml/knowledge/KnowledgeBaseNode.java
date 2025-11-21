package cc.application.jsbml.knowledge;

import java.util.List;

public interface KnowledgeBaseNode {
	public String getContentType();
	public void setTitle(String value);
	public String getTitle();
	public void setText(String value);
	public String getText();
	public List<ReferenceNode> getReferences();
	public void setReferences(List<ReferenceNode> references);
}
