
export default class CodeValidation {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}


	/**
	 * 
	 * @param {string} lessonCode
	 * @returns {Promise<{id:string, title:string, instructorId:number, startDate:Date, endDate:Date}>}
	 */
	async getCourseValidCode(lessonCode = '') {
		const queryStmt = `SELECT
			c.id,
			c.title,
			c."_createdBy" AS "instructorId",
			c."startDate",
			c."endDate"
		FROM "Courses" AS c
		INNER JOIN "user" AS u ON c."_createdBy" = u.id
		WHERE
			c."codeKey" = :lessonCode
			AND (c."_deleted" IS DISTINCT FROM TRUE)
			AND u.enabled = TRUE
		LIMIT 1`;

		const course = await this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.Sequelize.QueryTypes.SELECT,
			replacements: { lessonCode },
			plain: true,
		});
		
		return course || null;
	}

}