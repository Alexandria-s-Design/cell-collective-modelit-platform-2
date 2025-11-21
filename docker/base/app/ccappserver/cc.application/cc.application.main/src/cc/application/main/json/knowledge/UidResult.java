/**
 * 
 */
package cc.application.main.json.knowledge;

/**
 * @author Bryan Kowal
 *
 */
public class UidResult {

	private String uid;

	private String error;

	private String pubdate;

	private String epubdate;

	private String source;

	private Author[] authors;

	private String lastauthor;

	private String title;

	private String sorttitle;

	private String volume;

	private String issue;

	private String pages;

	private String[] lang;

	private String nlmuniqueid;

	private String issn;

	private String essn;

	private String pubtype[];

	private String recordstatus;

	private String pubstatus;

	private ArticleId[] articleids;

	private History[] history;

	private PubmedReference[] references;

	private String[] attributes;

	private String pmcrefcount;

	private String fulljournalname;

	private String elocationid;

	private String viewcount;

	private String doctype;

	private String[] srccontriblist;

	private String booktitle;

	private String medium;

	private String edition;

	private String publisherlocation;

	private String publishername;

	private String srcdate;

	private String reportnumber;

	private String availablefromurl;

	private String locationlabel;

	private String[] doccontriblist;

	private String docdate;

	private String bookname;

	private String chapter;

	private String sortpubdate;

	private String sortfirstauthor;

	private String vernaculartitle;

	public UidResult() {
	}

	/**
	 * @return the uid
	 */
	public String getUid() {
		return uid;
	}

	/**
	 * @param uid
	 *            the uid to set
	 */
	public void setUid(String uid) {
		this.uid = uid;
	}

	/**
	 * @return the error
	 */
	public String getError() {
		return error;
	}

	/**
	 * @param error
	 *            the error to set
	 */
	public void setError(String error) {
		this.error = error;
	}

	/**
	 * @return the pubdate
	 */
	public String getPubdate() {
		return pubdate;
	}

	/**
	 * @param pubdate
	 *            the pubdate to set
	 */
	public void setPubdate(String pubdate) {
		this.pubdate = pubdate;
	}

	/**
	 * @return the epubdate
	 */
	public String getEpubdate() {
		return epubdate;
	}

	/**
	 * @param epubdate
	 *            the epubdate to set
	 */
	public void setEpubdate(String epubdate) {
		this.epubdate = epubdate;
	}

	/**
	 * @return the source
	 */
	public String getSource() {
		return source;
	}

	/**
	 * @param source
	 *            the source to set
	 */
	public void setSource(String source) {
		this.source = source;
	}

	/**
	 * @return the authors
	 */
	public Author[] getAuthors() {
		return authors;
	}

	/**
	 * @param authors
	 *            the authors to set
	 */
	public void setAuthors(Author[] authors) {
		this.authors = authors;
	}

	/**
	 * @return the lastauthor
	 */
	public String getLastauthor() {
		return lastauthor;
	}

	/**
	 * @param lastauthor
	 *            the lastauthor to set
	 */
	public void setLastauthor(String lastauthor) {
		this.lastauthor = lastauthor;
	}

	/**
	 * @return the title
	 */
	public String getTitle() {
		return title;
	}

	/**
	 * @param title
	 *            the title to set
	 */
	public void setTitle(String title) {
		this.title = title;
	}

	/**
	 * @return the sorttitle
	 */
	public String getSorttitle() {
		return sorttitle;
	}

	/**
	 * @param sorttitle
	 *            the sorttitle to set
	 */
	public void setSorttitle(String sorttitle) {
		this.sorttitle = sorttitle;
	}

	/**
	 * @return the volume
	 */
	public String getVolume() {
		return volume;
	}

	/**
	 * @param volume
	 *            the volume to set
	 */
	public void setVolume(String volume) {
		this.volume = volume;
	}

	/**
	 * @return the issue
	 */
	public String getIssue() {
		return issue;
	}

	/**
	 * @param issue
	 *            the issue to set
	 */
	public void setIssue(String issue) {
		this.issue = issue;
	}

	/**
	 * @return the pages
	 */
	public String getPages() {
		return pages;
	}

	/**
	 * @param pages
	 *            the pages to set
	 */
	public void setPages(String pages) {
		this.pages = pages;
	}

	/**
	 * @return the lang
	 */
	public String[] getLang() {
		return lang;
	}

	/**
	 * @param lang
	 *            the lang to set
	 */
	public void setLang(String[] lang) {
		this.lang = lang;
	}

	/**
	 * @return the nlmuniqueid
	 */
	public String getNlmuniqueid() {
		return nlmuniqueid;
	}

	/**
	 * @param nlmuniqueid
	 *            the nlmuniqueid to set
	 */
	public void setNlmuniqueid(String nlmuniqueid) {
		this.nlmuniqueid = nlmuniqueid;
	}

	/**
	 * @return the issn
	 */
	public String getIssn() {
		return issn;
	}

	/**
	 * @param issn
	 *            the issn to set
	 */
	public void setIssn(String issn) {
		this.issn = issn;
	}

	/**
	 * @return the essn
	 */
	public String getEssn() {
		return essn;
	}

	/**
	 * @param essn
	 *            the essn to set
	 */
	public void setEssn(String essn) {
		this.essn = essn;
	}

	/**
	 * @return the pubtype
	 */
	public String[] getPubtype() {
		return pubtype;
	}

	/**
	 * @param pubtype
	 *            the pubtype to set
	 */
	public void setPubtype(String[] pubtype) {
		this.pubtype = pubtype;
	}

	/**
	 * @return the recordstatus
	 */
	public String getRecordstatus() {
		return recordstatus;
	}

	/**
	 * @param recordstatus
	 *            the recordstatus to set
	 */
	public void setRecordstatus(String recordstatus) {
		this.recordstatus = recordstatus;
	}

	/**
	 * @return the pubstatus
	 */
	public String getPubstatus() {
		return pubstatus;
	}

	/**
	 * @param pubstatus
	 *            the pubstatus to set
	 */
	public void setPubstatus(String pubstatus) {
		this.pubstatus = pubstatus;
	}

	/**
	 * @return the articleids
	 */
	public ArticleId[] getArticleids() {
		return articleids;
	}

	/**
	 * @param articleids
	 *            the articleids to set
	 */
	public void setArticleids(ArticleId[] articleids) {
		this.articleids = articleids;
	}

	/**
	 * @return the history
	 */
	public History[] getHistory() {
		return history;
	}

	/**
	 * @param history
	 *            the history to set
	 */
	public void setHistory(History[] history) {
		this.history = history;
	}

	/**
	 * @return the references
	 */
	public PubmedReference[] getReferences() {
		return references;
	}

	/**
	 * @param references
	 *            the references to set
	 */
	public void setReferences(PubmedReference[] references) {
		this.references = references;
	}

	/**
	 * @return the attributes
	 */
	public String[] getAttributes() {
		return attributes;
	}

	/**
	 * @param attributes
	 *            the attributes to set
	 */
	public void setAttributes(String[] attributes) {
		this.attributes = attributes;
	}

	/**
	 * @return the pmcrefcount
	 */
	public String getPmcrefcount() {
		return pmcrefcount;
	}

	/**
	 * @param pmcrefcount
	 *            the pmcrefcount to set
	 */
	public void setPmcrefcount(String pmcrefcount) {
		this.pmcrefcount = pmcrefcount;
	}

	/**
	 * @return the fulljournalname
	 */
	public String getFulljournalname() {
		return fulljournalname;
	}

	/**
	 * @param fulljournalname
	 *            the fulljournalname to set
	 */
	public void setFulljournalname(String fulljournalname) {
		this.fulljournalname = fulljournalname;
	}

	/**
	 * @return the elocationid
	 */
	public String getElocationid() {
		return elocationid;
	}

	/**
	 * @param elocationid
	 *            the elocationid to set
	 */
	public void setElocationid(String elocationid) {
		this.elocationid = elocationid;
	}

	/**
	 * @return the viewcount
	 */
	public String getViewcount() {
		return viewcount;
	}

	/**
	 * @param viewcount
	 *            the viewcount to set
	 */
	public void setViewcount(String viewcount) {
		this.viewcount = viewcount;
	}

	/**
	 * @return the doctype
	 */
	public String getDoctype() {
		return doctype;
	}

	/**
	 * @param doctype
	 *            the doctype to set
	 */
	public void setDoctype(String doctype) {
		this.doctype = doctype;
	}

	/**
	 * @return the srccontriblist
	 */
	public String[] getSrccontriblist() {
		return srccontriblist;
	}

	/**
	 * @param srccontriblist
	 *            the srccontriblist to set
	 */
	public void setSrccontriblist(String[] srccontriblist) {
		this.srccontriblist = srccontriblist;
	}

	/**
	 * @return the booktitle
	 */
	public String getBooktitle() {
		return booktitle;
	}

	/**
	 * @param booktitle
	 *            the booktitle to set
	 */
	public void setBooktitle(String booktitle) {
		this.booktitle = booktitle;
	}

	/**
	 * @return the medium
	 */
	public String getMedium() {
		return medium;
	}

	/**
	 * @param medium
	 *            the medium to set
	 */
	public void setMedium(String medium) {
		this.medium = medium;
	}

	/**
	 * @return the edition
	 */
	public String getEdition() {
		return edition;
	}

	/**
	 * @param edition
	 *            the edition to set
	 */
	public void setEdition(String edition) {
		this.edition = edition;
	}

	/**
	 * @return the publisherlocation
	 */
	public String getPublisherlocation() {
		return publisherlocation;
	}

	/**
	 * @param publisherlocation
	 *            the publisherlocation to set
	 */
	public void setPublisherlocation(String publisherlocation) {
		this.publisherlocation = publisherlocation;
	}

	/**
	 * @return the publishername
	 */
	public String getPublishername() {
		return publishername;
	}

	/**
	 * @param publishername
	 *            the publishername to set
	 */
	public void setPublishername(String publishername) {
		this.publishername = publishername;
	}

	/**
	 * @return the srcdate
	 */
	public String getSrcdate() {
		return srcdate;
	}

	/**
	 * @param srcdate
	 *            the srcdate to set
	 */
	public void setSrcdate(String srcdate) {
		this.srcdate = srcdate;
	}

	/**
	 * @return the reportnumber
	 */
	public String getReportnumber() {
		return reportnumber;
	}

	/**
	 * @param reportnumber
	 *            the reportnumber to set
	 */
	public void setReportnumber(String reportnumber) {
		this.reportnumber = reportnumber;
	}

	/**
	 * @return the availablefromurl
	 */
	public String getAvailablefromurl() {
		return availablefromurl;
	}

	/**
	 * @param availablefromurl
	 *            the availablefromurl to set
	 */
	public void setAvailablefromurl(String availablefromurl) {
		this.availablefromurl = availablefromurl;
	}

	/**
	 * @return the locationlabel
	 */
	public String getLocationlabel() {
		return locationlabel;
	}

	/**
	 * @param locationlabel
	 *            the locationlabel to set
	 */
	public void setLocationlabel(String locationlabel) {
		this.locationlabel = locationlabel;
	}

	/**
	 * @return the doccontriblist
	 */
	public String[] getDoccontriblist() {
		return doccontriblist;
	}

	/**
	 * @param doccontriblist
	 *            the doccontriblist to set
	 */
	public void setDoccontriblist(String[] doccontriblist) {
		this.doccontriblist = doccontriblist;
	}

	/**
	 * @return the docdate
	 */
	public String getDocdate() {
		return docdate;
	}

	/**
	 * @param docdate
	 *            the docdate to set
	 */
	public void setDocdate(String docdate) {
		this.docdate = docdate;
	}

	/**
	 * @return the bookname
	 */
	public String getBookname() {
		return bookname;
	}

	/**
	 * @param bookname
	 *            the bookname to set
	 */
	public void setBookname(String bookname) {
		this.bookname = bookname;
	}

	/**
	 * @return the chapter
	 */
	public String getChapter() {
		return chapter;
	}

	/**
	 * @param chapter
	 *            the chapter to set
	 */
	public void setChapter(String chapter) {
		this.chapter = chapter;
	}

	/**
	 * @return the sortpubdate
	 */
	public String getSortpubdate() {
		return sortpubdate;
	}

	/**
	 * @param sortpubdate
	 *            the sortpubdate to set
	 */
	public void setSortpubdate(String sortpubdate) {
		this.sortpubdate = sortpubdate;
	}

	/**
	 * @return the sortfirstauthor
	 */
	public String getSortfirstauthor() {
		return sortfirstauthor;
	}

	/**
	 * @param sortfirstauthor
	 *            the sortfirstauthor to set
	 */
	public void setSortfirstauthor(String sortfirstauthor) {
		this.sortfirstauthor = sortfirstauthor;
	}

	/**
	 * @return the vernaculartitle
	 */
	public String getVernaculartitle() {
		return vernaculartitle;
	}

	/**
	 * @param vernaculartitle
	 *            the vernaculartitle to set
	 */
	public void setVernaculartitle(String vernaculartitle) {
		this.vernaculartitle = vernaculartitle;
	}
}