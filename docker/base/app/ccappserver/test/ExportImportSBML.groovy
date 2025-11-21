package test1;

import groovy.lang.Grab;
import groovy.lang.Grapes;

@Grapes ([
	@Grab(group='commons-codec', module='commons-codec', version='1.10'),
	@Grab(group='org.apache.httpcomponents', module='httpclient', version='4.4.1'),
	@Grab(group='org.apache.httpcomponents', module='httpmime', version='4.4.1'),
	@Grab(group='commons-io', module='commons-io', version='2.4'),
	@Grab(group='com.fasterxml.jackson.core', module='jackson-core', version='2.5.2'),
	@Grab(group='com.fasterxml.jackson.core', module='jackson-annotations', version='2.5.2'),
	@Grab(group='com.fasterxml.jackson.core', module='jackson-databind', version='2.5.2')
])

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.HttpEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.entity.ContentType;
import org.apache.commons.io.IOUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.apache.http.util.EntityUtils;
import java.io.ByteArrayOutputStream;

public class ExportImportSBML {

	private static final int EXIT_FAILURE = -1;

	private static final int EXIT_SUCCESS = 0;
	
	private static String service;

	public static void main(String[] args) {
		if (args.length != 1) {
			System.out.println 'ERROR - no Service URL has been specified!';
			System.exit(EXIT_FAILURE);
		}
		service = args[0];
		final ObjectMapper objectMapper = new ObjectMapper();
		final CloseableHttpClient httpClient = HttpClients.createDefault();

		HttpGet httpGet = new HttpGet(service + "/model/get");

		/*
		 * Retrieve the available published models.
		 */
		CloseableHttpResponse httpResponse = null;
		ModelGetEntity[] modelGetEntities = null;
		HttpEntity httpEntity = null;
		try {
			httpResponse = httpClient.execute(httpGet);
			int statusCode = httpResponse.getStatusLine().getStatusCode();
			if (statusCode != 200) {
				System.out.println 'Failed to retrieve the available Models - response = ' + statusCode + '!';
				System.exit(EXIT_FAILURE);
			}
			httpEntity = httpResponse.getEntity();
			final String json = IOUtils.toString(httpEntity.getContent());
			modelGetEntities = objectMapper.readValue(json, ModelGetEntity[].class);
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println 'Failed to parse the returned Models!';
			System.exit(EXIT_FAILURE);
		} finally {
			if (httpEntity != null) {
				EntityUtils.consume(httpEntity);
			}
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

		if (modelGetEntities != null ) {
			System.out.println 'Running the SBML Import/Export Verification for ' + modelGetEntities.length + ' Model(s) ...';
			for (ModelGetEntity modelGetEntity : modelGetEntities) {
				System.out.println ''
				final long modelId = modelGetEntity.getModel().getId();
				System.out.println 'Exporting SBML for Model: ' + modelId + ' ...';
				final byte[] content = exportSBML(httpClient, modelId);
				if (content == null) {
					System.out.println 'Failed to export SBML for Model: ' + modelId + '!';
					continue;
				}
				importSBML(httpClient, modelId, content);
			}
		}

		System.out.println 'The SBML Import/Export Verification has concluded.'
		System.exit(EXIT_SUCCESS);
	}

	private static byte[] exportSBML(final CloseableHttpClient httpClient, final long modelId) {
		HttpGet httpGet = new HttpGet(service + "/model/export/" + Long.toString(modelId) + "?type=SBML");
		CloseableHttpResponse httpResponse = null;
		HttpEntity httpEntity = null;
		try {
			httpResponse = httpClient.execute(httpGet);
			int statusCode = httpResponse.getStatusLine().getStatusCode();
			if (statusCode != 201) {
				return null;
			}
			httpEntity = httpResponse.getEntity();
			final ByteArrayOutputStream baos = new ByteArrayOutputStream();
			httpEntity.writeTo(baos);

			return baos.toByteArray();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (httpEntity != null) {
				EntityUtils.consume(httpEntity);
			}
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
	}

	private static void importSBML(final CloseableHttpClient httpClient, final long modelId, final byte[] sbmlContent) {
		System.out.println 'Importing SBML for Model: ' + modelId + ' ...';
		HttpPost httpPost = new HttpPost(service + "/model/import");

		HttpEntity requestEntity = MultipartEntityBuilder.create()
				.addBinaryBody("upload", sbmlContent, ContentType.APPLICATION_OCTET_STREAM, "file.sbml").build();
		httpPost.setEntity(requestEntity);

		CloseableHttpResponse httpResponse = null;
		try {
			httpResponse = httpClient.execute(httpPost);
			int statusCode = httpResponse.getStatusLine().getStatusCode();
			if (statusCode == 200) {
				System.out.println 'Export/Import of Model ' + modelId + ' = SUCCESS';
			} else {
				System.out.println 'Export/Import of Model ' + modelId + ' = FAILURE';
			}
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println 'Failed to import SBML for Model: ' + modelId + '!';
		} finally {
			if (httpResponse != null) {
				EntityUtils.consume(httpResponse.getEntity());
				try {
					httpResponse.close();
				} catch (IOException e) {
					/*
					 * Skip for now.
					 */
				}
			}
		}
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private static class ModelGetEntity {

		private Model model;

		public ModelGetEntity() {
		}

		public Model getModel() {
			return model;
		}

		public void setModel(Model model) {
			this.model = model;
		}
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private static class Model {

		private long id;

		private String name;

		public Model() {
		}

		public long getId() {
			return id;
		}

		public void setId(long id) {
			this.id = id;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}
	}
}