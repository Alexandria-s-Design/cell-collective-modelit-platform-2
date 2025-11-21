import Sequelize from "sequelize";

const createAttributes = () => {
	const ATTRIBUTE_USER_ID = {
		type: Sequelize.BIGINT,
		allowNull: true,
	};
	const ATTRIBUTE_TIMESTAMP = {
		type: Sequelize.DATE,
		allowNull: true,
		defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
	};

	return {
		_createdBy: { ...ATTRIBUTE_USER_ID },
		_createdAt: { ...ATTRIBUTE_TIMESTAMP },
		_updatedBy: { ...ATTRIBUTE_USER_ID },
		_updatedAt: { ...ATTRIBUTE_TIMESTAMP },
		_deletedBy: { ...ATTRIBUTE_USER_ID },
		_deletedAt: Sequelize.DATE,
		_deleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		}
	};
}

const createDefaultAttributes = (models, user) => {
	return {
		_createdBy: user.id,
		_createdAt: models.sequelize.fn('NOW'),
		_updatedBy: user.id,
		_updatedAt: models.sequelize.fn('NOW')
	}
}

export { createAttributes, createDefaultAttributes };

export default createAttributes(Sequelize);

