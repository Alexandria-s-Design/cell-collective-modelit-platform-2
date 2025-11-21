/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.http.MediaType;

import javax.servlet.ServletResponse;

import org.apache.commons.lang3.time.StopWatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import cc.application.main.cache.LocalUploadCacheManager;
import cc.common.data.model.Upload;
import cc.common.data.model.UploadType;
import cc.dataaccess.main.dao.UploadDao;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.core.io.ByteArrayResource;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/model")
public class DownloadController extends AbstractController {

	@Autowired
	private UploadDao uploadDao;

	@RequestMapping(value = "/download", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> download(@RequestParam(value = "token") String token,
			@RequestParam(value = "bytes", required = false) boolean bytes, ServletResponse res)
			throws UnsupportedEncodingException {
		final Claims claims = Jwts.parser().setSigningKey("DOWNLOAD").parseClaimsJws(token.trim()).getBody();
		final Object uploadIdObject = claims.get("UPLOAD");
		final Object userIdObject = claims.get("USER");
		Upload upload = null;
		Long userId = null;
		if (uploadIdObject instanceof Integer) {
			final Long uploadId = new Long((Integer) uploadIdObject);
			upload = LocalUploadCacheManager.getInstance().getAllUploads().get(uploadId);
		}
		if (userIdObject instanceof Integer) {
			userId = new Long((Integer) userIdObject);
		}

		if (upload == null) {
			return new ResponseEntity<Object>("Unable to find the requested file.", HttpStatus.BAD_REQUEST);
		}

		logger.info("Retrieving Upload: {} for User: {} ...", upload.toString(), userId);
		final StopWatch timer = new StopWatch();
		timer.start();

		final Path uploadPath = this.uploadDao.getUploadPath(upload);

		byte[] contents = null;
		try {
			contents = Files.readAllBytes(uploadPath);
		} catch (IOException e) {
			logger.error("Failed to read file: " + uploadPath.toString() + ".", e);
			return new ResponseEntity<Object>("Failed to read uploaded file: " + upload.getUploadName() + ".",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		this.addCacheControlResponse(res);

		if (bytes) {
			timer.stop();
			logger.info("Successfully retrieved Upload: {} for User: {} in {} ms.", upload.toString(), userId,
					timer.getTime());
			return new ResponseEntity<Object>(contents, HttpStatus.OK);
		} else {
			HttpHeaders headers = new HttpHeaders();
			headers.set("Content-Disposition",
					"attachment; filename=" + URLEncoder.encode(upload.getUploadName(), "UTF-8"));
			if (upload.getFileType() == UploadType.SVG) {
				headers.set("Content-Type", "image/svg+xml");
			} else if (upload.getFileType() == UploadType.PDF) {
				headers.set("Content-Type", "application/pdf");
			} else if (upload.getFileType() == UploadType.GIF) {
				headers.set("Content-Type", "image/gif");
			}else if (upload.getFileType() == UploadType.MP4) {

				headers.set("Content-Type", "video/mp4");
				headers.setContentType(MediaType.valueOf("video/mp4"));

				timer.stop();
				logger.info("INSIDE VIDEO IF");
				logger.info("Successfully retrieved Upload: {} for User: {} in {} ms.", upload.toString(), userId,
						timer.getTime());
				return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM).body(new ByteArrayResource(contents));
			}

			headers.setContentLength(contents.length);
			timer.stop();
			logger.info("Successfully retrieved Upload: {} for User: {} in {} ms.", upload.toString(), userId,
					timer.getTime());
			return new ResponseEntity<Object>(contents, headers, HttpStatus.CREATED);
		}
	}
}