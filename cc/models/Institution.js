import defaultAttributes from "../db/mixins/attributes";
import searchable from "../db/mixins/searchable";

export default (db, DataTypes) => {
    const Institution = searchable(
        db.define("Institution", {
            ...defaultAttributes,
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            category: {
							type: DataTypes.STRING(25),
							allowNull: true
						},
            city: {
							type: DataTypes.STRING,
							allowNull: true
						},
            country: {
							type: DataTypes.STRING,
							allowNull: true
						},
            state: {
							type: DataTypes.STRING,
							allowNull: true
						},
						domains: {
                type: DataTypes.ARRAY(DataTypes.STRING),
								allowNull: true
            },
            websites: {
                type: DataTypes.ARRAY(DataTypes.STRING),
								allowNull: true
            }
        })
    );

    // Institution.associate = models => {
    //   Institution.belongsTo(models.Country);
    // }

    return Institution;
}