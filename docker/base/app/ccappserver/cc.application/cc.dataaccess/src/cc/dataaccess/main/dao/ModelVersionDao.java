/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Collection;
import java.util.Collections;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.CollectionUtils;

import cc.common.data.model.LearningActivity;
import cc.common.data.model.LearningActivityGroup;
import cc.common.data.model.ModelVersion;
import cc.common.data.model.Model;
import cc.common.data.model.ModelVersionId;
import cc.dataaccess.main.repository.LearningActivityRepository;
import cc.dataaccess.main.repository.LearningActivityGroupRepository;
import cc.dataaccess.main.repository.ModelVersionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Bryan Kowal
 */
public class ModelVersionDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelVersionRepository modelVersionRepository;

	@Autowired
	private LearningActivityRepository learningActivityRepository;

	@Autowired
	private LearningActivityGroupRepository learningActivityGroupRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	@Qualifier("mainEntityManagerFactory")
	private EntityManager em;

	public List<ModelVersion> getPossibleVersionsForModels(final Collection<Long> modelVersionIds) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelVersion>>() {
			@Override
			public List<ModelVersion> doInTransaction(TransactionStatus status) {
				List<ModelVersion> modelVersions = modelVersionRepository.getPossibleVersionsForModels(modelVersionIds);
				if (modelVersions == null || modelVersions.isEmpty()) {
					return Collections.emptyList();
				}
				return modelVersions;
			}
		});
	}

	// get current version - either the latest selected version (if any version or versions are selected) or the latest version overall (if no versions are selected)
	public ModelVersion getCurrentVersion(final Long modelVersionId) {
		return transactionTemplate.execute(new TransactionCallback<ModelVersion>() {
			@Override
			public ModelVersion doInTransaction(TransactionStatus status) {
				return modelVersionRepository.getSelectedOrLatest(modelVersionId);
			}
		});
	}

	public List<ModelVersion> getAllVersionsForVersionModelId(final Long modelId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelVersion>>() {
			@Override
			public List<ModelVersion> doInTransaction(TransactionStatus status) {
				return modelVersionRepository.getAllVersionsForVersionModelId(modelId);
			}
		});
	}

	public List<ModelVersion> getVersionsForModel(final Long modelVersionId) {
		List<Long> l = new ArrayList<>();
		l.add(modelVersionId);
		return getPossibleVersionsForModels(l);
	}

	public List<ModelVersion> getSelectedModelVersions(final Long versionId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelVersion>>() {
			@Override
			public List<ModelVersion> doInTransaction(TransactionStatus status) {
				List<ModelVersion> modelVersions = modelVersionRepository.getSelectedModelVersions(versionId);
				if (modelVersions == null || modelVersions.isEmpty()) {
					return Collections.emptyList();
				}
				return modelVersions;
			}
		});
	}

	public ModelVersion getVersionIdForModel(final Long modelId) {
		return transactionTemplate.execute(new TransactionCallback<ModelVersion>() {
			@Override
			public ModelVersion doInTransaction(TransactionStatus status) {
				List<ModelVersion> results = modelVersionRepository.getVersionForModel(modelId,
						new PageRequest(0, 1));
				return CollectionUtils.isEmpty(results) ? null : results.iterator().next();
			}
		});
	}

	public ModelVersion getLatestVersionForVersionId(final Long versionId) {
		return transactionTemplate.execute(new TransactionCallback<ModelVersion>() {
			@Override
			public ModelVersion doInTransaction(TransactionStatus status) {
				List<ModelVersion> results = modelVersionRepository.getLatestVersionForModelVersionId(versionId,
						new PageRequest(0, 1));
				if (CollectionUtils.isEmpty(results)) {
					return null;
				}
				return results.iterator().next();
			}
		});
	}

	public ModelVersion getById(final ModelVersionId id) {
		return transactionTemplate.execute(new TransactionCallback<ModelVersion>() {
			@Override
			public ModelVersion doInTransaction(TransactionStatus status) {
				return modelVersionRepository.findOne(id);
			}
		});
	}

	public List<LearningActivity> getLearningActivityByMasterId(final long masterId) {
		return transactionTemplate.execute(new TransactionCallback<List<LearningActivity>>() {
			@Override
			public List<LearningActivity> doInTransaction(TransactionStatus status) {
				List<LearningActivity> results = learningActivityRepository.findByMasterId(masterId);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public List<LearningActivity> getLearningActivityByMasterIds(final Iterable<Long> masterIds) {
		if (!masterIds.iterator().hasNext()) {
			return Collections.emptyList();
		}
		return transactionTemplate.execute(new TransactionCallback<List<LearningActivity>>() {
			@Override
			public List<LearningActivity> doInTransaction(TransactionStatus status) {
				List<LearningActivity> results = learningActivityRepository.findByMasterIdIn(masterIds);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public List<LearningActivityGroup> getLearningActivityGroupByMasterId(final long masterId) {
		return transactionTemplate.execute(new TransactionCallback<List<LearningActivityGroup>>() {
			@Override
			public List<LearningActivityGroup> doInTransaction(TransactionStatus status) {
				List<LearningActivityGroup> results = learningActivityGroupRepository.findByMasterId(masterId);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public List<LearningActivityGroup> getLearningActivityGroupByMasterIds(final Iterable<Long> masterIds) {
		if (!masterIds.iterator().hasNext()) {
			return Collections.emptyList();
		}
		return transactionTemplate.execute(new TransactionCallback<List<LearningActivityGroup>>() {
			@Override
			public List<LearningActivityGroup> doInTransaction(TransactionStatus status) {
				List<LearningActivityGroup> results = learningActivityGroupRepository.findByMasterIdIn(masterIds);
				if (CollectionUtils.isEmpty(results)) {
					return Collections.emptyList();
				}
				return results;
			}
		});
	}

	public LearningActivity getLearningActivityById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<LearningActivity>() {
			@Override
			public LearningActivity doInTransaction(TransactionStatus status) {
				return learningActivityRepository.findOne(id);
			}
		});
	}

	public LearningActivityGroup getLearningActivityGroupById(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<LearningActivityGroup>() {
			@Override
			public LearningActivityGroup doInTransaction(TransactionStatus status) {
				return learningActivityGroupRepository.findOne(id);
			}
		});
	}

}