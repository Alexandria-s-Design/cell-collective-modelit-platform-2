import { createAttributes } from "../db/mixins/attributes";
import { generateUniqueStringId } from "../server/api/teach/util";

'use strict';

const DEFAULT_TITLE = "Migrated from former My Teaching";

module.exports = {
  up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query("BEGIN TRANSACTION");
		try{

			const sql = "SELECT user_id FROM authority WHERE role_id=(SELECT id FROM role WHERE name='INSTRUCTOR')";
			const users = await queryInterface.sequelize.query(sql, {
				type: Sequelize.QueryTypes.SELECT
			});
	
			const processUser = async userId => {
				userId = parseInt(userId);
				console.log("PROCESSING USER "+userId);
				const sql = `SELECT * FROM model_domain_access WHERE domain='TEACH' AND userId = ${userId}`;
				const workspace = (await queryInterface.sequelize.query(sql, {
					type: Sequelize.QueryTypes.SELECT
				}));
	
				const modelIdsToCreate = workspace.map(({modelid}) => modelid);

				if(modelIdsToCreate.length > 0){
					console.log(`.... Migrated ${modelIdsToCreate.length} courses`);
					const [course] = await queryInterface.bulkInsert('Courses', [{
						_createdBy: userId,
						_createdAt: new Date(),
						title: DEFAULT_TITLE
					}], {returning: true});
					const courseId = course.id;

					//create ModelCourse binding :)
					await queryInterface.bulkInsert(
								'ModelCourse', 
								workspace.map(({modelid}) => ({ModelId: modelid, CourseId: courseId}))
					);

				}
			};
	
			for(let i = 0; i < users.length; i++){
				const {user_id} = users[i];
				await processUser(user_id);
			}

			await queryInterface.sequelize.query("COMMIT");
		}catch(e){
			console.error(e);
			await queryInterface.sequelize.query("ROLLBACK");
			throw e;
		}
  },
  down: async (queryInterface) => {
		await queryInterface.sequelize.query(`DELETE FROM "ModelCourse" where "ModelCourse"."CourseId" IN (SELECT id FROM "Courses" where title='${DEFAULT_TITLE}'`);
		await queryInterface.sequelize.query(`DELETE FROM "Courses" where title='${DEFAULT_TITLE}'`);
  }
};
