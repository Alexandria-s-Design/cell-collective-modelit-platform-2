/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Calendar;
import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.knowledge.Reference;
import cc.common.data.knowledge.ReferenceBase;
import cc.dataaccess.main.repository.ReferenceRepository;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.NoResultException;
import org.hibernate.Session;
import org.hibernate.SQLQuery;

/**
 * @author Bryan Kowal
 *
 */
public class ReferenceDao {

	@Autowired
	private ReferenceRepository referenceRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	@Qualifier("mainEntityManagerFactory")
	private EntityManager em;

	public ReferenceDao() {
	}

	public Reference getById(final long id) {
		return transactionTemplate.execute(new TransactionCallback<Reference>() {
			@Override
			public Reference doInTransaction(TransactionStatus status) {
				return referenceRepository.findOne(id);
			}
		});
	}

	public List<Reference> findByPmid(final String pmid) {
		return transactionTemplate.execute(new TransactionCallback<List<Reference>>() {
			@Override
			public List<Reference> doInTransaction(TransactionStatus status) {
				return referenceRepository.findByPmid(pmid);
			}
		});
	}
	
	public List<Reference> findByDoi(final String doi) {
		return transactionTemplate.execute(new TransactionCallback<List<Reference>>() {
			@Override
			public List<Reference> doInTransaction(TransactionStatus status) {
				return referenceRepository.findByDoi(doi);
			}
		});
	}

	public Reference save(Reference reference) {
		final Calendar updateDate = Calendar.getInstance();

		return transactionTemplate.execute(new TransactionCallback<Reference>() {
			@Override
			public Reference doInTransaction(TransactionStatus status) {
				if (reference.getCreationDate() == null) {
					reference.setCreationDate(updateDate);
				}
				reference.setUpdateDate(updateDate);

				return referenceRepository.save(reference);
			}
		});
	}

	public List<ReferenceBase> getReferencesSbmlByPage(final long pageId) {
		
		final List<Object> refers = transactionTemplate.execute(new TransactionCallback<List<Object>>() {
			@Override
			public List<Object> doInTransaction(TransactionStatus status) {
				Session session = em.unwrap(Session.class);
				String sqlBuilt = "select "+
					"s.page_id as \"pageId\", "+
					"c.section_id as \"sectionId\", "+
					"s.\"type\" as \"sectionType\", "+
					"cr.content_id as \"contentId\", "+
					"c.\"text\" as \"contentText\", "+
					"c.flagged as \"contentFlagged\", "+
					"c.\"position\", "+
					"cr.reference_id as \"referenceId\", "+
					"r.\"text\", "+
					"r.doi, "+
					"r.pmid, "+
					"r.shortcitation, "+
					"r.creationdate, "+
					"r.creationuser "+
				"from page p "+
				"inner join \"section\" s on s.page_id = p.id "+
				"inner join \"content\" c on c.section_id = s.id "+
				"inner join content_reference cr on cr.content_id = c.id "+
				"left join reference r on r.id = cr.reference_id "+
				"where p.id = :pageId";

				SQLQuery query = session.createSQLQuery(sqlBuilt);
				query.setParameter("pageId", pageId);
				List<Object> referenceData = query.list();
				return referenceData;
			}
		});

		final List<ReferenceBase> references = new ArrayList<>();

		for (Object refer : refers) {
			Object[] row = (Object[]) refer;
			final ReferenceBase reference = new ReferenceBase();
			reference.setPageId(convertToLongValue(row[0]));
			reference.setSectionId(convertToLongValue(row[1]));			
			reference.setSectionType(convertToStringValue(row[2]));
			reference.setContentId(convertToLongValue(row[3]));
			reference.setContentText(convertToStringValue(row[4]));
			reference.setContentFlagged(convertToBoolValue(row[5]));
			reference.setContentPosition(convertToIntValue(row[6]));
			reference.setReferenceId(convertToLongValue(row[7]));
			reference.setReferenceText(convertToStringValue(row[8]));
			reference.setDoi(convertToStringValue(row[9]));
			reference.setPmid(convertToStringValue(row[10]));
			reference.setShortCitation(convertToStringValue(row[11]));
			
			references.add(reference);
		}
		return references;
	}

	private Long convertToLongValue(Object value) {
		if (value == null) {
			return null;
		}
		return Long.parseLong(value.toString());
	}

	private Boolean convertToBoolValue(Object value) {
		if (value == null) {
			return null;
		}
		return Boolean.valueOf(value.toString());
	}

	private Integer convertToIntValue(Object value) {
		if (value == null) {
			return null;
		}
		return Integer.parseInt(value.toString());
	}

	private String convertToStringValue(Object value) {
		if (value == null) {
			return null;
		}
		return value.toString();
	}

	private Calendar convertToDateValue(Object value) {
		return (Calendar) value;
	}
}