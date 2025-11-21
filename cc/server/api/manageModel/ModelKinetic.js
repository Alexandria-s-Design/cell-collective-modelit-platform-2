import { Seq } from "immutable";

const STMT_FROM_KINETIC_MODEL = `from "KineticModels" km
inner join "KineticSpecies" ks on ks."KineticModelId" = km.id
inner join "PageModel" pm on pm."speciesId" = ks.id `;

const STMT_FROM_MODEL = `from "model" md
inner join "model_reference" mr on mr."model_id" = md.id `;

export default class ModelKinetic {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	getPagesByKineticModel(kineticId = 0) {
		let queryStmt = `select
			pm.id,
			ks.id AS "metaboliteId"
		${STMT_FROM_KINETIC_MODEL}
		WHERE
			km.id = :kineticId`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { kineticId }
		})
	}

	getSectionsByKineticModel(kineticId = 0) {
		let queryStmt = `select
			distinct sm.id,
			pm.id AS "pageId",
			sm."position",
			sm.title,
			sm."type" 
		${STMT_FROM_KINETIC_MODEL}
		inner join "SectionModel" sm on sm."pageModelId" = pm.id
		WHERE
			km.id = :kineticId`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { kineticId }
		})
	}

	getContentsByKineticModel(kineticId = 0) {
		let queryStmt = `select
			distinct cm.id,
			sm.id AS "sectionId",
			cm."position",
			cm."text",
			pm.id AS "pageId",
			cm."flagged"
		${STMT_FROM_KINETIC_MODEL}
		inner join "SectionModel" sm on sm."pageModelId" = pm.id
		inner join "ContentModel" cm on cm."sectionModelId" = sm.id
		WHERE
			km.id = :kineticId`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { kineticId }
		})
	}

	async fillContentReferenceDefaults(targetModel = {}, KineticModel) {
		if (targetModel.contentReferenceMap) {
			let pageReference = {};
			const contentReferenceMap = targetModel.contentReferenceMap;
			const contents = await this.getContentsByKineticModel(KineticModel.id);
			const maxId = await this.dbInstance.ContentModelReference.max('id');
			let newId = (maxId || 0) + 1;	
			let negativeKey = 1;
			for (const key in contentReferenceMap) {
					negativeKey++;
					if (!contentReferenceMap[key]) {
						continue;
					}
					if (key.startsWith('-')) {
							contentReferenceMap[key].id = newId++;
					}
					if (!('position' in contentReferenceMap[key])) {
							contentReferenceMap[key].position = 0;
					}					
					// let contentRef =  contents.find(c => c.id == contentReferenceMap[key].contentId);
					// if (contentRef) {
					// 	pageReference[`-${negativeKey}`] = {
					// 		pageId: contentRef.pageId,
					// 		referenceId: contentReferenceMap[key].referenceId,
					// 	}
					// }
			}
			// targetModel.pageReferenceMap = pageReference;
		}
	}

	getReferenceMapByKineticModel(kineticId, baseModelId) {
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
			${STMT_FROM_KINETIC_MODEL}
			inner join "PageModelReference" pmr on pmr."pageModelId" = pm.id
			inner join "reference" re on pmr."referenceId" = re.id
			where
				km.id = :kineticId
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
			${STMT_FROM_KINETIC_MODEL}
			inner join "SectionModel" sr on sr."pageModelId" = pm.id
			inner join "ContentModel" cr on cr."sectionModelId" = sr.id
			inner join "ContentModelReference" cmr on cmr."content_id" = cr.id
			inner join "reference" re on   cmr."reference_id" = re.id
			where
				km.id = :kineticId
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
			replacements: { kineticId, baseModelId }
		})
	}

	getContentReferenceMapByKineticModel(kineticId) {
		let queryStmt = `select
				distinct cor.id,
				cor.creationdate as "creationDate",
				cor.creationuser as "creationUser",
				cor."content_id" as "contentId",
				cor.citationtype as "citationType",
				cor.datatype as "dataType",
				cor."reference_id" as "referenceId",
				cor."position"
			${STMT_FROM_KINETIC_MODEL}
			inner join "SectionModel" sr on sr."pageModelId" = pm.id
			inner join "ContentModel" cr on cr."sectionModelId" = sr.id 
			inner join "ContentModelReference" cor on cor."content_id" = cr.id
			where
				km.id = :kineticId
				and pm."_deleted" != true
				and sr."_deleted" != true
				and cr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { kineticId }
		})
	}

	getModelReferenceMapByKineticModel(constraintId){
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

	getPageModelReferenceMapByKineticModel(kineticId){
		let queryStmt = `select
				pmr.id,
				pmr.creationdate AS "creationDate",
				pmr.creationuser AS "creationUser",
				pmr."referenceId",
				pmr."pageModelId" AS "pageId"
			${STMT_FROM_KINETIC_MODEL}
			inner join "PageModelReference" pmr on pmr."pageModelId" = pm.id
			where
				km.id = :kineticId
				and pmr."_deleted" != true`;

		return this.dbInstance.sequelize.query(queryStmt, {
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
			replacements: { kineticId }
		})
	}

	async updateStoichiometryByList(mEntityName, data = [], source) {
		if (!Array.isArray(data)) { return }
		let i=0;
		for (const val of data) {
			await this.dbInstance[mEntityName].update({
				stoichiometry: source[i].stoichiometry
			}, {
				where: {id: val.id}
			});
			i++;
		}
	}

}