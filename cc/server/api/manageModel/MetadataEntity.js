
export class Value {
	position;
	definition_id;
	constructor (fields) {
		this.position = fields.position;
		this.definition_id = fields.definition_id;
	}
}

export class ValueText {
	value_id;
	value;
	constructor (fields) {
		this.value_id = fields.value_id;
		this.value = fields.value;
	}
}

export class EntityValue {
	value_id;
	entity_id;
	constructor (fields) {
		this.value_id = fields.value_id;
		this.entity_id = fields.entity_id;
	}
}

export class TempValue {
	key;
	version;
	version_id;
	constructor (fields) {
		this.key = fields.key;
		this.version = fields.version;
		this.version_id = fields.version_id;
	}
}

export class TempObjective {
	version;
	valueId;
	versionId;
	valueRefId;
	constructor (fields) {
		this.version = fields.version;
		this.valueId = fields.valueId;
		this.versionId = fields.versionId;
		this.valueRefId = fields.valueRefId;
	}
}

export class RemoveLearningObjective {
	version;
	valueId;
	versionId;
	constructor (fields) {
		this.version = fields.version;
		this.valueId = fields.valueId;
		this.versionId = fields.versionId;
	}
}

export class LearningObjective {
	Value;
	ValueText;
	EntityValue;
	TempValue;
	constructor (value, valueText, entityValue, tempValue) {
		if (!(value instanceof Value)) { throw new Error("Expected Value entity") };
		if (!(valueText instanceof ValueText)) { throw new Error("Expected ValueText entity") };
		if (!(entityValue instanceof EntityValue)) { throw new Error("Expected EntityValue entity") };
		this.Value = value;
		this.ValueText = valueText;
		this.EntityValue = entityValue;
		this.TempValue = tempValue;
	}
}
