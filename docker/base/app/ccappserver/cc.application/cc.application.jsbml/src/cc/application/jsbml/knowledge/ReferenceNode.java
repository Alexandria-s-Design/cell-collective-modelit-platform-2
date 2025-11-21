package cc.application.jsbml.knowledge;

public class ReferenceNode {
	private String referType;
	private int position;
	private String doi;
	private String pmid;
	private String sectionType;

	public ReferenceNode() {

	}

	public void setValue(String name, String value) {

			String key = name.trim();

			switch (key.toLowerCase()) {
					case "refertype":
							this.referType = value;
							break;
					case "position":
							this.position = Integer.parseInt(value);
							break;
					case "doi":
							this.doi = value;
							break;
					case "pmid":
							this.pmid = value;
							break;
					default:
							System.out.println("Invalid key from References: " + key);
							break;
			}

	}

	public String getReferType() {
		return referType;
	}

	public void setReferType(String value) {
		this.referType = value;
	}

	public int getPosition() {
		return position;
	}

	public void setPosition(int value) {
		this.position = value;
	}

	public String getDoi() {
		return doi;
	}

	public void setDoi(String value) {
		this.doi = value;
	}

	public String getPmid() {
		return pmid;
	}

	public void setPmid(String value) {
		this.pmid = value;
	}

	public String getSectionType() {
		return sectionType;
	}

	public void setSectionType(String type) {
		this.sectionType = type;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder("ReferenceNode [");
		sb.append("refertype=").append(this.referType);
		sb.append(", position=").append(this.position);		
		sb.append(", doi=").append(this.doi);	
		sb.append(", pmid=").append(this.pmid);	
		sb.append("]");		
		return sb.toString();
	}

}

