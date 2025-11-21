/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.List;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.CollectionUtils;

import cc.common.data.knowledge.ModelReferenceTypes;
import cc.common.data.knowledge.Page;
import cc.dataaccess.main.repository.ModelReferenceTypesRepository;
import cc.dataaccess.main.repository.PageRepository;

/**
 * @author Bryan Kowal
 */
public class PageDao {

	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private ModelReferenceTypesRepository modelReferenceTypesRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public PageDao() {
	}

	public Page getById(final long id) {
		return transactionTemplate.execute(new TransactionCallback<Page>() {
			@Override
			public Page doInTransaction(TransactionStatus status) {
				return pageRepository.findOne(id);
			}
		});
	}

	public List<Page> getAllPages() {
		return transactionTemplate.execute(new TransactionCallback<List<Page>>() {
			@Override
			public List<Page> doInTransaction(TransactionStatus status) {
				return pageRepository.findAll();
			}
		});
	}

	public List<Page> getPagesForIds(Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<Page>>() {
			@Override
			public List<Page> doInTransaction(TransactionStatus status) {
				List<Page> pages = pageRepository.findByIdIn(ids);
				if (pages == null || pages.isEmpty()) {
					return Collections.emptyList();
				}

				return pages;
			}
		});
	}

	public List<Page> getPageRecordsForIdIn(Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<Page>>() {
			@Override
			public List<Page> doInTransaction(TransactionStatus status) {
				List<Object> returnValues = pageRepository.getPageRecordsForIdIn(ids);
				if (CollectionUtils.isEmpty(returnValues)) {
					return Collections.emptyList();
				}

				List<Page> pages = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					pages.add(buildPageFromRecord((Object[]) returnValue));
				}
				return pages;
			}
		});
	}

	public List<ModelReferenceTypes> getModelReferenceTypesForModel(final long modelId) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelReferenceTypes>>() {
			@Override
			public List<ModelReferenceTypes> doInTransaction(TransactionStatus status) {
				return modelReferenceTypesRepository.findByModelId(modelId);
			}
		});
	}

	public List<ModelReferenceTypes> getModelReferenceTypesForIdsIn(Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<ModelReferenceTypes>>() {
			@Override
			public List<ModelReferenceTypes> doInTransaction(TransactionStatus status) {
				return modelReferenceTypesRepository.findAll(ids);
			}
		});
	}

	private Page buildPageFromRecord(final Object[] objects) {
		Page page = new Page();
		page.setId((Long) objects[0]);
		page.setCreationDate((Calendar) objects[1]);
		page.setCreationUser((Long) objects[2]);
		page.setUpdateDate((Calendar) objects[3]);
		page.setUpdateUser((Long) objects[4]);
		return page;
	}
}