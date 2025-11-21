/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.Layout;
import cc.common.data.model.LayoutNode;
import cc.common.data.model.Model;
import cc.dataaccess.main.repository.LayoutNodeRepository;
import cc.dataaccess.main.repository.LayoutRepository;

/**
 * @author Bryan Kowal
 */
public class LayoutDao {

	@Autowired
	private LayoutRepository layoutRepository;

	@Autowired
	private LayoutNodeRepository layoutNodeRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	public LayoutDao() {
	}

	public List<Layout> getLayoutsForModel(final Model model) {
		return transactionTemplate.execute(new TransactionCallback<List<Layout>>() {
			@Override
			public List<Layout> doInTransaction(TransactionStatus status) {
				return layoutRepository.findByModelId(model.getId());
			}
		});
	}

	public List<LayoutNode> getLayoutNodesForLayout(final Layout layout) {
		return transactionTemplate.execute(new TransactionCallback<List<LayoutNode>>() {
			@Override
			public List<LayoutNode> doInTransaction(TransactionStatus status) {
				return layoutNodeRepository.findByLayoutId(layout.getId());
			}
		});
	}

	public List<Layout> getLayoutsForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<Layout>>() {
			@Override
			public List<Layout> doInTransaction(TransactionStatus status) {
				return layoutRepository.findAll(ids);
			}
		});
	}

	public List<LayoutNode> getLayoutNodesForIds(final Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<LayoutNode>>() {
			@Override
			public List<LayoutNode> doInTransaction(TransactionStatus status) {
				return layoutNodeRepository.findAll(ids);
			}
		});
	}
}