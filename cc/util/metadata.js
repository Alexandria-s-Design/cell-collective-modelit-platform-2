import { db } from '../models';

const MetadataTypes = {
	INTEGER: 'value_int',
	BOOLEAN: 'value_bool',
	DECIMAL: 'value_decimal',
	TEXT: 'value_text',
	DATE: 'value_date',
	ATTACHMENT: 'value_attachment'
};

const MetadataQuery = (col, condition) => {
	let where = '1';
	if (condition.id && !isNaN(parseInt(condition.id))) {
		where = `id = ${parseInt(condition.id)}`;
	} else if (condition.entity_id && !isNaN(parseInt(condition.entity_id))) {
		where = `entity_id = ${parseInt(condition.entity_id)}`;
	}
	return `SELECT id, entity_id, definition_id, position, visibleall, range, index, ${col} AS value FROM metadata.entity_metadata_view \
WHERE ${where} LIMIT 1`;
};

const getEntityByPk = async (id, type) => {
	const query = MetadataQuery(type, { id });
	const result = await db.query(query);
	return result[0] || null; 
};

export { MetadataTypes, getEntityByPk };