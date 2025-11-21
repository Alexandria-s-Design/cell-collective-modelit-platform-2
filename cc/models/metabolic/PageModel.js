/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PageModel', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
			autoIncrement: true,
			primaryKey: true,
    },
		reactionId: {
			allowNull: true,
			type: DataTypes.BIGINT,
		},
		geneId: {
			allowNull: true,
			type: DataTypes.BIGINT,
		},
		speciesId: {
			allowNull: true,
			type: DataTypes.BIGINT,
		},
		metaboliteId: {
			allowNull: true,
			type: DataTypes.BIGINT,
		},
		compartmentId: {
			allowNull: true,
			type: DataTypes.BIGINT,
		},
		ModelVersionId: {
			allowNull: true,
			type: DataTypes.BIGINT,
		},
		creationdate: {
			type: DataTypes.DATE
		},
		creationuser: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		updatedate: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updateuser: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		_deletedBy: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		_deletedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		_deleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
  }, {
    tableName: 'PageModel'
  });
};
