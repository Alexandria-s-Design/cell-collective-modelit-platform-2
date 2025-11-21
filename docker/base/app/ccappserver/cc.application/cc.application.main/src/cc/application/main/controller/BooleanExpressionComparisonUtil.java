/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.io.InputStream;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.json.JSONObject;

import com.mchange.v1.lang.BooleanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Bryan Kowal
 *
 */
public final class BooleanExpressionComparisonUtil {

	private BooleanExpressionComparisonUtil() {
	}

	public static Boolean compareBooleanExpressions(final CloseableHttpClient httpClient, final String expr1,
			final String expr2) throws Exception {
		StringEntity requestEntity = new StringEntity("{ \"expr1\": \"" + expr1 + "\", \"expr2\": \"" + expr2 + "\"}",
				ContentType.APPLICATION_JSON);

		// HttpPost httpPost = new HttpPost("http://"+System.getenv("CC_WEB_HOST")+":"+System.getenv("CC_WEB_PORT")+"/web/api/boolean/compare");
		String serviceURL = System.getenv("CC_BOOLEAN_URL")+"/compare";
		HttpPost httpPost = new HttpPost(serviceURL);

		httpPost.setEntity(requestEntity);

		CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
		int statusCode = httpResponse.getStatusLine().getStatusCode();
		InputStream content = httpResponse.getEntity().getContent();
		try {
			if (statusCode == 200) {				
				final String json = IOUtils.toString(content);
				JSONObject res	  = new JSONObject(json);
				return new Boolean(res.getBoolean("data"));
			}
		} finally {
			content.close();
			if (httpResponse != null) {
				try {
					httpResponse.close();
				} catch (IOException e) {
					/*
					 * Skip for now.
					 */
				}
			}
		}

		return Boolean.FALSE;
	}
}