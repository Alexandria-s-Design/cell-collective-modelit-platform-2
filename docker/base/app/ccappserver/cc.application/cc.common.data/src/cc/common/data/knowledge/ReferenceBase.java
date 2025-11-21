package cc.common.data.knowledge;

import java.sql.Ref;
import java.util.Calendar;

public class ReferenceBase {

	private Long pageId;
	private Long sectionId;
	private String sectionType;
	private Long contentId;
	private String contentText;
	private Boolean contentFlagged;
	private Integer contentPosition;
	private Long referenceId;
	private String referenceText;
	private String doi;
	private String pmid;
	private String shortCitation;
	private Calendar creationdate;
	private Long creationuser;

	public ReferenceBase() {

	}

	public Long getPageId() {
    return pageId;
	}

	public void setPageId(Long pageId) {
		this.pageId = pageId;
	}

	public Long getSectionId() {
		return sectionId;
	}

	public void setSectionId(Long sectionId) {
		this.sectionId = sectionId;
	}

	public String getSectionType() {
		return sectionType;
	}

	public void setSectionType(String sectionType) {
		this.sectionType = sectionType;
	}

	public Long getContentId() {
		return contentId;
	}

	public void setContentId(Long contentId) {
		this.contentId = contentId;
	}

	public String getContentText() {
		return contentText;
	}

	public void setContentText(String contentText) {
		this.contentText = contentText;
	}

	public Boolean getContentFlagged() {
		return contentFlagged;
	}

	public void setContentFlagged(Boolean contentFlagged) {
		this.contentFlagged = contentFlagged;
	}

	public Integer getContentPosition() {
		return contentPosition;
	}

	public void setContentPosition(Integer contentPosition) {
		this.contentPosition = contentPosition;
	}

	public Long getReferenceId() {
		return referenceId;
	}

	public void setReferenceId(Long referenceId) {
		this.referenceId = referenceId;
	}

	public String getReferenceText() {
		return referenceText;
	}

	public void setReferenceText(String referenceText) {
		this.referenceText = referenceText;
	}

	public String getDoi() {
		return doi;
	}

	public void setDoi(String doi) {
		this.doi = doi;
	}

	public String getPmid() {
		return pmid;
	}

	public void setPmid(String pmid) {
		this.pmid = pmid;
	}

	public String getShortCitation() {
		return shortCitation;
	}

	public void setShortCitation(String shortCitation) {
		this.shortCitation = shortCitation;
	}

	public Calendar getCreationdate() {
		return creationdate;
	}

	public void setCreationdate(Calendar creationdate) {
			this.creationdate = creationdate;
	}

	public Long getCreationuser() {
			return creationuser;
	}

	public void setCreationuser(Long creationuser) {
			this.creationuser = creationuser;
	}

	public Reference getReference() {
		final Reference setRefer = new Reference();

		setRefer.setId(referenceId);
		setRefer.setShortCitation(shortCitation);
		setRefer.setCreationDate(creationdate);
		setRefer.setCreationUser(creationuser);

		if (referenceText != null) {
			setRefer.setText(referenceText);
		}

		if (doi != null) {
			setRefer.setDoi(doi);
		}
		if (pmid != null) {
			setRefer.setPmid(pmid);
		}

		return setRefer;
	}

	@Override
	public String toString() {
			return "ReferenceBase {" +
							"pageId=" + pageId +
							", sectionId=" + sectionId +
							", sectionType='" + sectionType + '\'' +
							", contentId=" + contentId +
							", contentText='" + contentText + '\'' +
							", contentFlagged=" + contentFlagged +
							", contentPosition=" + contentPosition +
							", referenceId=" + referenceId +
							", referenceText='" + referenceText + '\'' +
							", doi='" + doi + '\'' +
							", pmid='" + pmid + '\'' +
							", shortCitation='" + shortCitation + '\'' +
							", creationdate='" + creationdate + '\'' +
							", creationuser='" + creationuser + '\'' +
							'}';
	}

}