/**
 * 
 */
package cc.dataaccess.main.dao;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.Upload;
import cc.core.configuration.manager.CCFileManager;
import cc.dataaccess.main.repository.UploadRepository;

/**
 * @author Bryan Kowal
 */
public class UploadDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private UploadRepository uploadRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	private final CCFileManager ccFileManager;

	public UploadDao(final CCFileManager ccFileManager) {
		this.ccFileManager = ccFileManager;
	}

	@PostConstruct
	public void initialize() {
		if (Files.exists(this.ccFileManager.getCCUploadPath()) == false) {
			try {
				Files.createDirectories(this.ccFileManager.getCCUploadPath());
			} catch (Exception e) {
				final String msg = "Failed to create the CC Uploads directory: "
						+ this.ccFileManager.getCCUploadPath().toString() + "!";
				logger.error(msg, e);
				throw new RuntimeException(msg, e);
			}
		}
	}

	public List<Upload> getAllUploadsForUser(final Long userId) {
		List<Upload> uploads = transactionTemplate.execute(new TransactionCallback<List<Upload>>() {
			@Override
			public List<Upload> doInTransaction(TransactionStatus status) {
				return uploadRepository.findByUserId(userId);
			}
		});

		if (uploads == null || uploads.isEmpty()) {
			return Collections.emptyList();
		}
		return uploads;
	}

	public List<Upload> getAllUploads() {
		List<Upload> uploads = transactionTemplate.execute(new TransactionCallback<List<Upload>>() {
			@Override
			public List<Upload> doInTransaction(TransactionStatus status) {
				return uploadRepository.findAll();
			}
		});

		if (uploads == null || uploads.isEmpty()) {
			return Collections.emptyList();
		}
		return uploads;
	}

	public Upload saveUpload(final Upload upload, final byte[] content) {
		return transactionTemplate.execute(new TransactionCallback<Upload>() {
			@Override
			public Upload doInTransaction(TransactionStatus status) {
				final Path uploadPath = getUploadPath(upload);
				final Path containingUploadPath = uploadPath.getParent();
				if (Files.exists(containingUploadPath) == false) {
					try {
						Files.createDirectories(containingUploadPath);
					} catch (IOException e) {
						status.setRollbackOnly();

						throw new RuntimeException(
								"Failed to create user upload directory: " + containingUploadPath.toString() + ".", e);
					}
				}

				try {
					Files.write(uploadPath, content);
				} catch (Exception e) {
					status.setRollbackOnly();

					throw new RuntimeException("Failed to write uploaded file: " + uploadPath.toString() + ".", e);
				}

				upload.setUploadDate(Calendar.getInstance());
				try {
					return uploadRepository.save(upload);
				} catch (Exception e) {
					status.setRollbackOnly();

					throw new RuntimeException("Failed to persist upload: " + upload.toString() + ".", e);
				}
			}
		});
	}

	public Path getUploadPath(final Upload upload) {
		return Paths.get(this.ccFileManager.getCCUploadPath().toString(), Long.toString(upload.getUserId()),
				upload.getStorageName());
	}
}