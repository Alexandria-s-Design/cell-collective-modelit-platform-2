/**
 * 
 */
package cc.dataaccess.main.dao;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.metadata.AbstractSetValue;
import cc.common.data.metadata.Definition;
import cc.common.data.metadata.EntityValue;
import cc.common.data.metadata.EntityValueId;
import cc.common.data.metadata.Value;
import cc.common.data.metadata.ValueType;
import cc.dataaccess.EntityMetadataValue;
import cc.dataaccess.MetadataValueRange;
import cc.dataaccess.main.repository.DefinitionRepository;
import cc.dataaccess.main.repository.EntityValueRepository;
import cc.dataaccess.main.repository.SetAttachmentValueRepository;
import cc.dataaccess.main.repository.SetBoolValueRepository;
import cc.dataaccess.main.repository.SetDateValueRepository;
import cc.dataaccess.main.repository.SetDecimalValueRepository;
import cc.dataaccess.main.repository.SetIntegerValueRepository;
import cc.dataaccess.main.repository.SetTextValueRepository;
import cc.dataaccess.main.repository.ValueRepository;

/**
 * @author Bryan Kowal
 */
public class MetadataValueDao {

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	private ValueRepository valueRepository;

	@Autowired
	private DefinitionRepository definitionRepository;

	@Autowired
	private SetIntegerValueRepository setIntegerValueRepository;

	@Autowired
	private SetDecimalValueRepository setDecimalValueRepository;

	@Autowired
	private SetTextValueRepository setTextValueRepository;

	@Autowired
	private SetBoolValueRepository setBoolValueRepository;

	@Autowired
	private SetAttachmentValueRepository setAttachmentValueRepository;

	@Autowired
	private SetDateValueRepository setDateValueRepository;

	@Autowired
	private EntityValueRepository entityValueRepository;

	@Autowired
	@Qualifier("mainEntityManagerFactory")
	private EntityManager em;

	public MetadataValueDao() {
	}

	public List<Value> getValuesForIds(Collection<Long> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<Value>>() {
			@Override
			public List<Value> doInTransaction(TransactionStatus status) {
				List<Value> values = valueRepository.findByIdIn(ids);
				if (values == null || values.isEmpty()) {
					return Collections.emptyList();
				}

				return values;
			}
		});
	}

	public AbstractSetValue<?> getSetValue(final Value value) {
		return transactionTemplate.execute(new TransactionCallback<AbstractSetValue<?>>() {
			@Override
			public AbstractSetValue<?> doInTransaction(TransactionStatus status) {
				switch (value.getDefinition().getType()) {
				case Bool:
					return setBoolValueRepository.findOne(value.getId());
				case Decimal:
					return setDecimalValueRepository.findOne(value.getId());
				case Integer:
					return setIntegerValueRepository.findOne(value.getId());
				case Text:
					return setTextValueRepository.findOne(value.getId());
				case Attachment:
					return setAttachmentValueRepository.findOne(value.getId());
				case Date:
					return setDateValueRepository.findOne(value.getId());
				default:
					return null;
				}
			}
		});
	}

	public List<EntityValue> getEntityValuesForIds(final Collection<EntityValueId> ids) {
		return transactionTemplate.execute(new TransactionCallback<List<EntityValue>>() {
			@Override
			public List<EntityValue> doInTransaction(TransactionStatus status) {
				return entityValueRepository.findByIdIn(ids);
			}
		});
	}

	public List<EntityMetadataValue> getMetadataForModel(final Long modelId, final boolean visibleAll) {
		List<?> results = transactionTemplate.execute(new TransactionCallback<List<?>>() {
			@Override
			public List<?> doInTransaction(TransactionStatus status) {
				return em
						.createNativeQuery(
								"SELECT * FROM metadata.entity_metadata_view WHERE entity_id = ?1 AND visibleall = ?2")
						.setParameter(1, modelId).setParameter(2, visibleAll).getResultList();
			}
		});

		return this.buildEntityMetadataValueFromRecord(results);
	}

	public List<EntityMetadataValue> getEntityMetadata() {
		List<?> results = transactionTemplate.execute(new TransactionCallback<List<?>>() {
			@Override
			public List<?> doInTransaction(TransactionStatus status) {
				return em.createNativeQuery("SELECT * FROM metadata.entity_metadata_view").getResultList();
			}
		});

		return this.buildEntityMetadataValueFromRecord(results);
	}
	
	public List<Long> getEntityIdsForModel(final Long modelId, final boolean visibleAll){
		List<Long> result = new ArrayList<Long>();

				 em.createNativeQuery("SELECT * FROM metadata.entity_metadata_view WHERE entity_id = ?1 AND visibleall = ?2")
				 .setParameter(1, modelId).setParameter(2, visibleAll)
				 .getResultList()
				 .forEach(_row -> {
					Object[] row = (Object[]) _row;
					Long entity_id = ((BigInteger) row[0]).longValue();
					result.add(entity_id);
				 });
			return result;
		}


	public List<MetadataValueRange> getAllValueRanges() {
		List<?> results = transactionTemplate.execute(new TransactionCallback<List<?>>() {
			@Override
			public List<?> doInTransaction(TransactionStatus status) {
				return em.createNativeQuery("SELECT * FROM metadata.metadata_range_view").getResultList();
			}
		});

		if (results == null || results.isEmpty()) {
			return Collections.emptyList();
		}

		List<MetadataValueRange> metadataValues = new ArrayList<>(results.size());
		for (Object object : results) {
			Object[] resultValues = (Object[]) object;

			MetadataValueRange metadataValueRange = new MetadataValueRange();
			metadataValueRange.setId(this.getLongFromRecord(resultValues[RANGE_METADATA_INDEX.VALUE_ID_INDEX]));
			metadataValueRange
					.setDefinitionId(this.getLongFromRecord(resultValues[RANGE_METADATA_INDEX.DEFINITION_ID_INDEX]));
			Object position = resultValues[RANGE_METADATA_INDEX.POSITION_INDEX];
			if (position != null) {
				metadataValueRange.setPosition((Integer) position);
			}
			int valueIndex = ((Integer) resultValues[RANGE_METADATA_INDEX.VALUE_POSITION_INDEX]
					+ RANGE_METADATA_INDEX.VALUE_POSITION_INDEX);
			metadataValueRange.setValue(resultValues[valueIndex]);
			metadataValues.add(metadataValueRange);
		}

		return metadataValues;
	}

	private List<EntityMetadataValue> buildEntityMetadataValueFromRecord(List<?> results) {
		if (results == null || results.isEmpty()) {
			return Collections.emptyList();
		}

		List<EntityMetadataValue> metadataValues = new ArrayList<>(results.size());
		for (Object result : results) {
			Object[] resultValues = (Object[]) result;

			EntityMetadataValue entityMetadataValue = new EntityMetadataValue();
			entityMetadataValue.setId(this.getLongFromRecord(resultValues[ENTITY_METADATA_INDEX.VALUE_ID_INDEX]));
			entityMetadataValue
					.setEntityId(this.getLongFromRecord(resultValues[ENTITY_METADATA_INDEX.ENTITY_ID_INDEX]));
			entityMetadataValue
					.setDefinitionId(this.getLongFromRecord(resultValues[ENTITY_METADATA_INDEX.DEFINITION_ID_INDEX]));
			Object position = resultValues[ENTITY_METADATA_INDEX.POSITION_INDEX];
			if (position != null) {
				entityMetadataValue.setPosition((Integer) position);
			}
			entityMetadataValue.setVisibleAll(getBoolFromRecord(resultValues[ENTITY_METADATA_INDEX.VISIBLE_ALL_INDEX]));
			entityMetadataValue.setRange(getBoolFromRecord(resultValues[ENTITY_METADATA_INDEX.RANGE_INDEX]));
			int valueIndex = ((Integer) resultValues[ENTITY_METADATA_INDEX.VALUE_POSITION_INDEX]
					+ ENTITY_METADATA_INDEX.VALUE_POSITION_INDEX);
			entityMetadataValue.setValue(resultValues[valueIndex]);
			metadataValues.add(entityMetadataValue);
		}

		return metadataValues;
	}

	@SuppressWarnings("unchecked")
	public <T extends Map<Long, Map<Long, EntityMetadataValue>>> T getEntityMetadataMap(final T entityMetadataMap) {
		final Map<Long, Definition> mapDefinition = new HashMap<>();
		definitionRepository.findAll().forEach(def -> mapDefinition.put(def.getId(), def));

		Map<Long, List<EntityMetadataValue>> valueIdToEntityMetadataMap = new HashMap<>();
		em.createNativeQuery("SELECT CAST(entity_id AS INTEGER), CAST(value_id AS INTEGER) FROM metadata.entity_value")
				.getResultList().forEach(_row -> {
					Object[] row = (Object[]) _row;
					Long entity_id = ((Integer) row[0]).longValue();
					Long vaule_id = ((Integer) row[1]).longValue();

					Map<Long, EntityMetadataValue> m = entityMetadataMap.get(entity_id);
					if (m == null) {
						entityMetadataMap.put(entity_id, m = new HashMap<>());
					}

					EntityMetadataValue emv = new EntityMetadataValue();
					emv.setEntityId(entity_id);
					emv.setId(vaule_id);

					m.put(vaule_id, emv);

					List<EntityMetadataValue> listEMV = valueIdToEntityMetadataMap.get(vaule_id);
					if (listEMV == null) {
						valueIdToEntityMetadataMap.put(vaule_id, listEMV = new ArrayList<>());
					}
					listEMV.add(emv);
				});

		em.createNativeQuery(
				"SELECT CAST(id AS INTEGER), CAST(definition_id AS INTEGER), \"position\" FROM metadata.value")
				.getResultList().forEach(_row -> {
					Object[] row = (Object[]) _row;

					List<EntityMetadataValue> listEMV = valueIdToEntityMetadataMap.get(((Integer) row[0]).longValue());
					if (listEMV == null) {
						return;
					}
					Long defId = ((Number) row[1]).longValue();
					Definition def = mapDefinition.get(defId);
					Boolean visAll = def.getVisibleAll();
					boolean range = def.getRange();
					listEMV.forEach(emv -> {
						emv.setDefinitionId(defId);
						emv.setPosition((Integer) row[2]);
						emv.setVisibleAll(visAll);
						emv.setRange(range);
					});
				});

		EntityValueFetcher fetchDataFn = (type, tblname, castTo, mapFn) -> {
			String sql = "SELECT CAST(value_id AS INTEGER), ";
			if (castTo != null) {
				sql += "CAST(value AS " + castTo + ") ";
			} else {
				sql += "value ";
			}
			sql += "FROM metadata." + tblname;
			em.createNativeQuery(sql).getResultList().forEach(_row -> {
				Object[] row = (Object[]) _row;

				List<EntityMetadataValue> listEMV = valueIdToEntityMetadataMap.get(((Number) row[0]).longValue());
				if (listEMV == null) {
					return;
				}
				if (mapFn != null) {
					listEMV.forEach(emv -> {
						if (mapDefinition.get(emv.getDefinitionId()).getType() == type) {
							emv.setValue(mapFn.apply(row[1]));
						}
					});
				} else {
					listEMV.forEach(emv -> {
						if (mapDefinition.get(emv.getDefinitionId()).getType() == type) {
							emv.setValue(row[1]);
						}
					});
				}
			});
		};

		fetchDataFn.apply(ValueType.Integer, "value_integer", null, null);
		fetchDataFn.apply(ValueType.Decimal, "value_decimal", null, null);
		fetchDataFn.apply(ValueType.Text, "value_text", null, null);
		fetchDataFn.apply(ValueType.Bool, "value_bool", null, null);
		fetchDataFn.apply(ValueType.Attachment, "value_attachment", "Integer", v -> ((Integer) v).longValue());
		fetchDataFn.apply(ValueType.Date, "value_date", null, null);

		return entityMetadataMap;
	}

	private Long getLongFromRecord(Object value) {
		if (value instanceof BigInteger) {
			return ((BigInteger) value).longValue();
		}

		return (Long) value;
	}

	public Boolean getBoolFromRecord(Object value) {
		if (value == null) {
			return Boolean.FALSE;
		}

		return (Boolean) value;
	}

	private static class ENTITY_METADATA_INDEX {

		public static final int VALUE_ID_INDEX = 0;

		public static final int ENTITY_ID_INDEX = 1;

		public static final int DEFINITION_ID_INDEX = 2;

		public static final int POSITION_INDEX = 3;

		public static final int VISIBLE_ALL_INDEX = 4;

		public static final int RANGE_INDEX = 5;

		public static final int VALUE_POSITION_INDEX = 6;

	}

	private static class RANGE_METADATA_INDEX {

		public static final int VALUE_ID_INDEX = 0;

		public static final int DEFINITION_ID_INDEX = 1;

		public static final int POSITION_INDEX = 2;

		public static final int VALUE_POSITION_INDEX = 3;

	}
}

@FunctionalInterface
interface EntityValueFetcher {

	void apply(ValueType type, String tblName, String castTo, Function<Object, Object> mapFn);

}