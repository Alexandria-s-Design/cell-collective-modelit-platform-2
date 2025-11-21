import { Seq } from "immutable";

const STMT_FROM_CONSTRAINT_MODEL = `from "ConstraintBasedModels" cbm
inner join "PageModel" pr on pr."ModelVersionId" = cbm."ModelVersionId" `;

const STMT_FROM_MODEL = `from "model" md
inner join "model_reference" mr on mr."model_id" = md.id `;

export default class ModelMetabolic {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async saveReactionContent(modelMap = {}, userId, modelVersionId=null) {
		if (!modelMap.contentMap && !modelMap.pageMap) {
			return;
		}
		const defaultAttrs = {
			creationdate: new Date(),
			creationuser: userId,
			updatedate: new Date(),
			updateuser: userId
		}
		try {
		for (const [key, data] of Seq(modelMap.pageMap)) {
			const createData = {...defaultAttrs, ...data, ModelVersionId: modelVersionId};
			const saved = await this.dbInstance.PageModel.create(createData, {transation: this.transaction});
			createData.newId = saved.id;
			modelMap.pageMap[key] = createData;
		}
		for (const [key, data] of Seq(modelMap.sectionMap)) {
			const _page = modelMap.pageMap[data.pageId];
			const createData = {...defaultAttrs, ...data};
			createData.pageModelId = _page.newId;
			const saved = await this.dbInstance.SectionModel.create(createData, {transation: this.transaction});
			createData.newId = saved.id;
			modelMap.sectionMap[key] = createData;
		}
		for (const [key, data] of Seq(modelMap.contentMap)) {
			const _section = modelMap.sectionMap[data.sectionId];
			const createData = {...defaultAttrs, ...data};
			createData.sectionModelId = _section.newId;
			createData.flagged = false;
			const saved = await this.dbInstance.ContentModel.create(createData, {transation: this.transaction});
			createData.newId = saved.id;
			modelMap.contentMap[key] = createData;
		}
		} catch(err) {
			throw err
		}
	}

	getPagesByConstraintModel(constraintId = 0) {
		let queryStmt = `select
			pr.id,
			pr."reactionId",
			pr."geneId",
			pr."metaboliteId",
			pr."compartmentId",
			true AS "newType"
		${STMT_FROM_CONSTRAINT_MODEL}
		where
			cbm."id" = :constraintId
			and pr._deleted != true
			and pr._deleted != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId }
		})
	}

	getSectionsByConstraintModel(constraintId = 0) {
		let queryStmt = `select
			sr.id,
			sr."pageModelId" as "pageId",
			sr."type",
			sr.title,
			sr."position"
		${STMT_FROM_CONSTRAINT_MODEL}
		inner join "SectionModel" sr on sr."pageModelId" = pr.id
		where
			cbm."id" = :constraintId
			and pr._deleted != true
			and sr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId }
		})
	}

	getContentsByConstraintModel(constraintId = 0) {
		let queryStmt = `select
			cr.id,
			cr."sectionModelId" as "sectionId",
			cr."text",
			cr.flagged,
			cr."position"
		${STMT_FROM_CONSTRAINT_MODEL}
		inner join "SectionModel" sr on sr."pageModelId" = pr.id
		inner join "ContentModel" cr on cr."sectionModelId" = sr.id 
		where
			cbm."id" = :constraintId
			and pr._deleted != true
			and sr."_deleted" != true
			and cr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId }
		})
	}

	getContentsByModel(modelId) {
		let queryStmt = `select
				cr.id,
				cr."sectionModelId" as "sectionId",
				cr."text",
				cr.flagged,
				cr."position"
			from model_version mv
			inner join "ConstraintBasedModels" cbm on cbm."ModelVersionId" = mv.id 
			inner join "PageModel" pr on pr."ModelVersionId" = mv.id
			inner join "SectionModel" sr on sr."pageModelId" = pr.id
			inner join "ContentModel" cr on cr."sectionModelId" = sr.id 
			where
				mv.modelid = :modelId
				and mv."_deleted" != true
				and pr._deleted != true
				and cr."_deleted" != true
				and cr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { modelId }
		})
	}

	getContentReferenceMapByConstraintModel(constraintId) {
		let queryStmt = `select
				cor.id,
				cor.creationdate as "creationDate",
				cor.creationuser as "creationUser",
				cor."content_id" as "contentId",
				cor.citationtype as "citationType",
				cor.datatype as "dataType",
				cor."reference_id" as "referenceId",
				cor."position"
			${STMT_FROM_CONSTRAINT_MODEL}
			inner join "SectionModel" sr on sr."pageModelId" = pr.id
			inner join "ContentModel" cr on cr."sectionModelId" = sr.id 
			inner join "ContentModelReference" cor on cor."content_id" = cr.id
			inner join "reference" re on cor."reference_id" = re.id
			where
				cbm."id" = :constraintId
				and pr."_deleted" != true
				and sr."_deleted" != true
				and cr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId }
		})
	}

	getModelReferenceMapByConstraintModel(constraintId){
		let queryStmt = `select
			ARRAY_AGG(mr."reference_id") AS "referenceIds"
		${STMT_FROM_MODEL}
		where
			md."id" = :constraintId`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId }
		})
	}

	getReferenceMapByConstraintModel(constraintId, baseModelId) {
		let queryStmt = `select
				re.id,
				re.creationdate AS "creationDate",
				re.creationuser AS "creationUser",
				re.pmid,
				re.text,
				re.updatedate AS "updateDate",
				re.updateuser AS "updateUser",
				re.shortcitation AS "shortCitation",
				re.doi
			${STMT_FROM_CONSTRAINT_MODEL}
			inner join "PageModelReference" pmr on pmr."pageModelId" = pr.id
			inner join "reference" re on pmr."referenceId" = re.id
			where
				cbm."id" = :constraintId
				and pmr."_deleted" != true
			UNION
				select
				re.id,
				re.creationdate AS "creationDate",
				re.creationuser AS "creationUser",
				re.pmid,
				re.text,
				re.updatedate AS "updateDate",
				re.updateuser AS "updateUser",
				re.shortcitation AS "shortCitation",
				re.doi
			${STMT_FROM_CONSTRAINT_MODEL}
			inner join "SectionModel" sr on sr."pageModelId" = pr.id
			inner join "ContentModel" cr on cr."sectionModelId" = sr.id
			inner join "ContentModelReference" cmr on cmr."content_id" = cr.id
			inner join "reference" re on   cmr."reference_id" = re.id
			where
				cbm."id" = :constraintId
			UNION 
				select
				re.id,
				re.creationdate AS "creationDate",
				re.creationuser AS "creationUser",
				re.pmid,
				re.text,
				re.updatedate AS "updateDate",
				re.updateuser AS "updateUser",
				re.shortcitation AS "shortCitation",
				re.doi
			${STMT_FROM_MODEL}
			inner join "reference" re on mr."reference_id" = re.id
			where
				md."id" = :baseModelId`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId, baseModelId }
		})
	}

	getPageModelReferenceMapByConstraintModel(constraintId){
		let queryStmt = `select
				pmr.id,
				pmr."pageModelId" AS "pageId",
				re.id AS "referenceId",
				re.creationdate AS "creationDate",
				re.creationuser AS "creationUser",
				re.pmid,
				re.text,
				re.updatedate AS "updateDate",
				re.updateuser AS "updateUser",
				re.shortcitation AS "shortCitation",
				re.doi
			${STMT_FROM_CONSTRAINT_MODEL}
			inner join "PageModelReference" pmr on pmr."pageModelId" = pr.id
			inner join "reference" re on pmr."referenceId" = re.id
			where
				cbm."id" = :constraintId
				and pmr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { constraintId }
		})
	}

	async getObjectivesFuncByConstraintModel(constraintId) {
		const results = await this.dbInstance.ObjectiveFunction.findAll({
			attributes: [
				"id",	"name", "_createdBy", "_createdAt"
			],
			where: {
				ConstraintBasedModelId: constraintId,
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true}
			}
		})

		return results.map(v => {
			let result = {...v.dataValues}
			result.reactions = {};
			return result;
		});
	}
	
	async getObjectivesReaction(reactionsId=[]) {
		const results = await this.dbInstance.ObjectiveReaction.findAll({
			attributes: [
				"id", "coefficient",
				["ReactionId", "reaction"],
				["ObjectiveFunctionId","objectiveFunction"]				
			],
			where: {
				ReactionId: {[this.dbInstance.Sequelize.Op.in]: reactionsId},
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true}
			}
		})
		return results.map(v => v.dataValues).map(v => ({
			id: v.id,
			reaction: v.reaction,
			coefficient: v.coefficient,
			objectiveFunction: v.objectiveFunction
		}))
	}

	async getSubsystemsByConstraintModel(constraintId = 0) {
		const results = await this.dbInstance.SubSystem.findAll({
			attributes: ["id", "name"],
			where: {
				ConstraintBasedModelId: {[this.dbInstance.Sequelize.Op.eq]: constraintId},
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true}
			}
		})
		return results.map(v => v.dataValues).map(v => ({
			id: v.id,
			name: v.name
		}))
	}

	async getDrugEnvironmentByConstraintModel(constraintId = 0) {
		const results = await this.dbInstance.DrugEnvironment.findAll({
			attributes: ["id", "name", "isDefault"],
			where: {
				ConstraintBasedModelId: {[this.dbInstance.Sequelize.Op.eq]: constraintId},
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true}
			}
		})
		return results.map(v => v.dataValues).map(v => ({
			id: v.id,
			name: v.name,
			isDefault: v.isDefault
		}))
	}
}