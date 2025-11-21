export default (db, DataTypes) => {
	const User = db.define("User", {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultVal: true
		},
	}, {
		tableName: "user"
	});

	return User;
}