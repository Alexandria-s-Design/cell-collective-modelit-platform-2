'use strict'

module.exports = {
	up: async (queryInterface) => {
		const sqlUpdateQuery = `
		WITH publish_collisions AS (
			select m1.id
			from model_version mv
			inner join model_version mv2 ON mv2.id = mv.id
			inner join model m1 on m1.id = mv.modelid
			inner join model m2 on m2.id = mv2.modelid
			where m1.published != m2.published
			group by 1
		)
		UPDATE model SET published = true WHERE id IN (select id from publish_collisions);`
		await queryInterface.sequelize.query(
			sqlUpdateQuery,
		)
	},

	down: async () => { }
}
