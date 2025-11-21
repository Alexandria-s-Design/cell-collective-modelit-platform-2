/**
 * 
 */
package cc.application.main.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.InputStream;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import cc.application.main.WebServiceUtil;
import cc.application.main.json.ReferenceMap;
import cc.application.main.json.knowledge.DOIResult;
import cc.application.main.json.knowledge.UidResult;
import cc.common.data.knowledge.Reference;
import cc.dataaccess.main.dao.ReferenceDao;

import javax.annotation.PostConstruct;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/knowledge")
public class KnowledgeController extends AbstractController {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	private static final String FROM_ADDRESS = WebServiceUtil.getenv("FROM_ADDRESS", "support@cellcollective.org");

	private static final String PUBMED_SERVICE_URL = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=%s&retmode=json&tool=thecellcollective.org&email=my_email@bkowal@outlook.com";

	private static final String DOI_SERVICE_URL = "https://doi.org/%s";

	private static final String SPACE = " ";

	private static final String COMMA = ", ";

	private static final String AND = " and ";

	private static final String SEMICOLON = "; ";

	private static final String COMMA_AND = COMMA.trim() + AND;

	private static final String PERIOD = ".";

	private static final String I_FORMAT = "<i>%s</i>";

	private static final String PARENS_FORMAT = "(%s)";

	private static final String PMID = "pmid:";

	private static final String TITLE = "\"View or buy article from publisher (if available)\"";

	private static final String SHORT_CITATION_FORMAT = "%s, %s";

	private static final String DOI_REGEX = "10\\.\\S+/\\S+";

	private static final Pattern DOI_PATTERN = Pattern.compile(DOI_REGEX);

	@Autowired
	protected ReferenceDao referenceDao;

	private final HttpClient httpClient = HttpClientBuilder.create().disableCookieManagement().build();

	private final HttpClient httpClientCustom = HttpClientBuilder.create()
    .disableCookieManagement()
    .setDefaultRequestConfig(RequestConfig.custom()
        .setRedirectsEnabled(true)
        .setConnectTimeout(12000)
        .setSocketTimeout(12000)
        .build())
    .build();

	private final ObjectMapper objectMapper = new ObjectMapper();

	public class ReferencesMapResult {
		private Map<Long, ReferenceMap> referencesMap;
		private String errorMessage;

		public ReferencesMapResult(Map<Long, ReferenceMap> referencesMap) {
				this.referencesMap = referencesMap;
		}

		public ReferencesMapResult(String errorMessage) {
				this.errorMessage = errorMessage;
		}

		public boolean hasError() {
				return errorMessage != null;
		}

		public Map<Long, ReferenceMap> getReferencesMap() {
				return referencesMap;
		}

		public String getErrorMessage() {
				return errorMessage;
		}
	}

	@RequestMapping(value = "/lookupRefs", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> lookupRefs(@RequestBody Map<String, List<String>> dataRefs,
                                                      ServletRequest request) {
   
	 	if (dataRefs == null || !dataRefs.containsKey("refs")) {
        return new ResponseEntity<>("Error: Missing or invalid refs data", HttpStatus.BAD_REQUEST);
    }

    List<String> refidsList = dataRefs.get("refs");
    if (refidsList == null || refidsList.isEmpty()) {
        return new ResponseEntity<>("Error: refs list is empty", HttpStatus.BAD_REQUEST);
    }

    final Long userId = this.getAuthenticatedUserId();
    ReferencesMapResult retrievedReferencesMap = retrieveReferencesMap(refidsList, userId);

    if (retrievedReferencesMap.getErrorMessage() != null && !retrievedReferencesMap.getErrorMessage().isEmpty()) {
        return new ResponseEntity<>(retrievedReferencesMap.getErrorMessage(), HttpStatus.NOT_FOUND);
    }
    return new ResponseEntity<>(retrievedReferencesMap.getReferencesMap(), HttpStatus.OK);
	}

	@RequestMapping(value = "/lookup", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> lookupPMID(
			@RequestParam(value = "refid", required = true) String[] refids) {
		if (refids.length == 0) {
			return new ResponseEntity<Object>(new HashMap<Object, Object>(), HttpStatus.OK);
		}
		final Long userId = this.getAuthenticatedUserId();

		Map<Long, ReferenceMap> retrievedReferencesMap = new HashMap<>(refids.length, 1.0f);
		for (String refid : refids) {
			refid = refid.trim();
			Reference reference = null;

			try {
				if (DOI_PATTERN.matcher(refid).matches()) {
					reference = retrieveExistingCitationByDoi(refid);
					if (reference == null) {
						reference = retrieveNewCitationByDoi(refid, userId);
					}
					if (reference == null) {
						return new ResponseEntity<Object>("Unable to find a Reference with doi: " + refid + ".",
								HttpStatus.NOT_FOUND);
					}
				} else if (NumberUtils.isDigits(refid)) {
					reference = this.retrieveExistingCitationByPmid(refid);
					if (reference == null) {
						reference = this.retrieveNewCitationByPmid(refid, userId);
					}
					if (reference == null) {
						return new ResponseEntity<Object>("Unable to find a Reference with pmid: " + refid + ".",
								HttpStatus.NOT_FOUND);
					}
				} else {
					return new ResponseEntity<Object>(
							"Reference: " + refid + " is not recognized as a valid pmid or doi.",
								HttpStatus.BAD_REQUEST);
				}
			} catch (Exception e) {
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			}
			retrievedReferencesMap.put(reference.getId(), new ReferenceMap(reference));
		}
		return new ResponseEntity<Object>(retrievedReferencesMap, HttpStatus.OK);
	}

	protected ReferencesMapResult retrieveReferencesMap(List<String> refids, Long userId) {
		Map<Long, ReferenceMap> retrievedReferencesMap = new HashMap<>(refids.size(), 1.0f);
		Integer xDelay = 0;
		Integer vDelay = 0;
		for (String refid : refids) {
			refid = refid.trim();
			Reference reference = null;

			if (xDelay < 3) {
				vDelay = 800;
				xDelay++;
			} else {
				vDelay = 1600;
				xDelay = 0;
			}

			try {
				if (DOI_PATTERN.matcher(refid).matches()) {
					logger.info("Loading DOI: "+refid);
					reference = retrieveExistingCitationByDoi(refid);
					if (reference == null) {
						Thread.sleep(vDelay);
						reference = retrieveNewCitationByDoi(refid, userId);
					}
					if (reference == null) {
						logger.info("Unable to find a Reference with doi: " + refid + ".");
					}
				} else if (NumberUtils.isDigits(refid)) {
					logger.info("Loading PMID: "+refid);
					reference = this.retrieveExistingCitationByPmid(refid);
					if (reference == null) {
						Thread.sleep(vDelay);
						reference = this.retrieveNewCitationByPmid(refid, userId);
					}
					if (reference == null) {
						logger.info("Unable to find a Reference with pmid: " + refid + ".");
					}
				} else {
					logger.info("Reference: " + refid + " is not recognized as a valid pmid or doi.");
				}
			} catch (Exception e) {
				reference = null;
				logger.error("Error on loading PMID or DOI: : " + e.getMessage());
			}
			if (reference != null) {
				retrievedReferencesMap.put(reference.getId(), new ReferenceMap(reference));
			}			
		}
		return new ReferencesMapResult(retrievedReferencesMap);
	}

	protected Reference retrieveExistingCitationByPmid(final String pmid) throws Exception {
		List<Reference> matchingReferences = this.referenceDao.findByPmid(pmid);
		if (CollectionUtils.isEmpty(matchingReferences)) {
			return null;
		}

		return matchingReferences.iterator().next();
	}

	protected Reference retrieveExistingCitationByDoi(final String doi) throws Exception {
		List<Reference> matchingReferences = this.referenceDao.findByDoi(doi);
		if (CollectionUtils.isEmpty(matchingReferences)) {
			return null;
		}

		return matchingReferences.iterator().next();
	}

	protected Reference retrieveNewCitationByPmid(final String pmid, final Long userId) throws Exception {
		String pmidURL	= String.format("%s/web/api/pmid/%s", WebServiceUtil.getWebServiceURL(), pmid);
		HttpGet httpGet = new HttpGet(pmidURL);
		HttpResponse httpResponse;

		try {
			logger.info("Connecting to PMID Web Service: " + pmidURL);
			httpResponse = httpClient.execute(httpGet);
		} catch (IOException e) {
			e.printStackTrace();
			throw new Exception("Cannot access pmid api from Web Service.", e);
		}

		BufferedReader br = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));

		StringBuilder jsonResponse = new StringBuilder();
		String jsonPart = null;

		try {
			while ((jsonPart = br.readLine()) != null) {
				jsonResponse.append(jsonPart.trim());
			}
		} catch (IOException e) {
			throw new Exception("Failed to read the JSON response from pmid api from Web Service.", e);
		}

		String publicationDate 	= null;
		String source 			= null;
		String authors 			= null;
		String title 			= null;
		String volume 			= null;
		String issue 			= null;
		String pages 			= null;
		String firstAuthor 		= null;

		int statusCode = httpResponse.getStatusLine().getStatusCode();
		if (statusCode == 200) {
			try {
				if ( jsonResponse.indexOf("error") > 1 ) {
					throw new Exception("Invalid PMID.");
				} else {
					int index 			= jsonResponse.indexOf("publicationDate");
					String uidResponse 	= jsonResponse.substring(index - 2); // {"
					JSONObject uidData	= new JSONObject(uidResponse);

					publicationDate 		= uidData.getString("publicationDate");
					source				 	= uidData.getString("source");
					authors 				= authors(uidData.getJSONArray("authors"));
					title 					= uidData.getString("title");
					volume 					= uidData.getString("volume");
					issue 					= uidData.getString("issue");
					pages 					= uidData.getString("pages");
					firstAuthor 			= uidData.getString("firstAuthor");
				}
			} catch (JSONException e) {
				e.printStackTrace();
				logger.error("Unable to read JSON Response for pmid.");
				throw new Exception("Error reading JSON Response for pmid from Web Service.", e);
			}
		} else {
			logger.info("Error Response from pmid api from Web Service: " + jsonResponse);
			throw new Exception("Error Response from pmid api from Web Service.");
		}

		try {
			EntityUtils.consume(httpResponse.getEntity());
		} catch (IOException e) {
			throw new Exception("Failed to close the HTTP connection to the PubMed service!", e);
		}

		StringBuilder originStr = new StringBuilder(source).append(SPACE).append(publicationDate);
		if (volume.isEmpty() == false) {
			originStr.append(volume).append(SEMICOLON);
			if (issue.isEmpty() == false) {
				originStr.append(String.format(PARENS_FORMAT, issue));
			}
		}
		if (pages.isEmpty() == false) {
			originStr.append(SPACE).append(pages);
		}

		title = period(title);
		title = italic(title);
		authors = period(authors);
		String origin = period(originStr.toString());

		final String codes = PMID + pmid;
		final String style = "class=\"extiw\" style=\"color:Black; text-decoration:none\"";

		final String citation = "<a href=\"http://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?cmd=prlinks&dbfrom=pubmed&retmode=ref&id="
				+ pmid + "\" title=" + TITLE + " " + style + ">" + authors + title + origin + "</a>" + codes;

		Reference reference = new Reference();
		reference.setText(citation);
		reference.setPmid(pmid);
		String citeYear = "YYYY";
		if (publicationDate.length() >= 4) {
			citeYear = publicationDate.substring(0, 4);
		}
		String shortCitation = String.format(SHORT_CITATION_FORMAT, firstAuthor, citeYear);

		reference.setShortCitation(shortCitation);
		reference.setCreationUser(userId);
		reference.setUpdateUser(userId);

		return this.referenceDao.save(reference);
	}

	protected Reference retrieveNewCitationByDoi(final String doi, final Long userId) throws Exception {
		String citation = getDoiCitation(doi);
		String shortCitation = getShortDoiCitation(doi);

		Reference reference = new Reference();
		reference.setText(citation);
		reference.setShortCitation(shortCitation);
		reference.setDoi(doi);
		reference.setCreationUser(userId);
		reference.setUpdateUser(userId);

		return this.referenceDao.save(reference);
	}

	private String getShortDoiCitation(final String doi) throws Exception {
		HttpGet httpGet = new HttpGet(String.format(DOI_SERVICE_URL, doi));
		httpGet.addHeader("User-Agent", String.format("ImmuneID/1.0 (mailto:%s)", FROM_ADDRESS) );
		httpGet.addHeader("Accept", "application/vnd.citationstyles.csl+json");
		HttpResponse httpResponse = httpClientCustom.execute(httpGet);

		InputStream content = httpResponse.getEntity().getContent();
		try {
			String json = IOUtils.toString(content);
			DOIResult doiResult = objectMapper.readValue(json, DOIResult.class);

			String citeYear = "YYYY";
			if (doiResult.getCreated() != null && doiResult.getCreated().getTimestamp() != null) {
				Calendar calendar = Calendar.getInstance();
				calendar.setTimeInMillis(doiResult.getCreated().getTimestamp());

				citeYear = Integer.toString(calendar.get(Calendar.YEAR));
			}

			String firstAuthor = null;
			if (doiResult.getAuthor() != null && doiResult.getAuthor().length > 0) {
				firstAuthor = doiResult.getAuthor()[0].getFamily();
			}

			return String.format(SHORT_CITATION_FORMAT, firstAuthor, citeYear);

		} finally {
				content.close();
		}
	}

	private String getDoiCitation(final String doi) throws Exception {

			HttpGet httpGet = new HttpGet(String.format(DOI_SERVICE_URL, doi));
			httpGet.addHeader("User-Agent", String.format("ImmuneID/1.0 (mailto:%s)", FROM_ADDRESS) );
			httpGet.addHeader("Accept", "text/x-bibliography; style=chicago-fullnote-bibliography");

			HttpResponse httpResponse = httpClientCustom.execute(httpGet);
			System.out.println(httpResponse);
			int statusCode = httpResponse.getStatusLine().getStatusCode();
			System.out.println(statusCode);

			if (statusCode >= 400 && statusCode < 600) {
					throw new RuntimeException("Internal server error (HTTP " + statusCode + ") from CrossRef.");
			} else if (statusCode != 200) {
					throw new RuntimeException("Failed to fetch citation (HTTP " + statusCode + ") for DOI: " + doi);
			}

			InputStream content = httpResponse.getEntity().getContent();
			try {
					String citation = IOUtils.toString(content);
					return "<a href=\"https://doi.org/" + doi + "\">" + citation + "</a>";
			} finally {
					content.close();
			}
	}

	private String authors(JSONArray authors) {
		if (authors == null || authors.length() == 0) {
			return StringUtils.EMPTY;
		}

		final int authorsCount = authors.length();
		StringBuilder authorsString = new StringBuilder(authors.getJSONObject(0).getString("name"));
		for (int i = 1; i <= authorsCount - 2; i++) {
			authorsString.append(COMMA).append(authors.getJSONObject(i).getString("name"));
		}
		if (authorsCount == 2) {
			authorsString.append(AND).append(authors.getJSONObject(authorsCount - 1).getString("name")).append(PERIOD);
		} else if (authorsCount > 2) {
			authorsString.append(COMMA_AND).append(authors.getJSONObject(authorsCount - 1).getString("name")).append(PERIOD);
		}

		return authorsString.toString();
	}

	private String period(String s) {
		return s.isEmpty() ? StringUtils.EMPTY : (s.endsWith(PERIOD)) ? s : s + PERIOD;
	}

	private String italic(String s) {
		return s.isEmpty() ? StringUtils.EMPTY : String.format(I_FORMAT, s);
	}
}