package cc.application.jsbml.knowledge;

public class KnowledgeBaseAdapter {
	
	public static final String KB_SECTION_DESCRIPTION = "Description";
	public static final String KB_SECTION_REGULATORY_SUMMARY = "RegulatorySummary";
	public static final String KB_SECTION_UPSTREAM_REGULATOR = "UpstreamRegulator";

	private KnowledgeBaseNode nodeContent;

	public KnowledgeBaseAdapter(Description pNode) {
		this.nodeContent = pNode;
	}

	public KnowledgeBaseNode getNodeContent() {
		return nodeContent;
	}

}
