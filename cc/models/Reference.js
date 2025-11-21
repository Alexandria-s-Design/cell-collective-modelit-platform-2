
export default (db, DataTypes) => {
    const Reference = db.define("Reference", {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },			
			// creationate: {
			// 	type: DataTypes.DATE,
			// },
			creationuser: {
				type: DataTypes.BIGINT,
			},
			pmid: {
				type: DataTypes.STRING,
			},
			text: {
				type: DataTypes.TEXT,
			},
			updatedate: {
				type: DataTypes.DATE,
			},
			updateuser: {
				type: DataTypes.BIGINT,
			},
			shortcitation: {
				type: DataTypes.STRING,
			},
			doi: {
				type: DataTypes.STRING,
			},

    }, {
      tableName: "reference"
    });

    Reference.associate = models => {

    }

    return Reference;
};