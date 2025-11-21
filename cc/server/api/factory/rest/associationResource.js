import { Router } from 'express';
import util from 'util';

import { AuthRequired } from '../../../middlewares/auth';
import models from '../../../../models';
import { Response } from '../../../../server';

const DELETE_TOKENS = ['r', 'remove', 'delete', 'rm'];
const ADD_TOKENS = ['a', 'add'];

export class AssocInstruction {
  constructor(id, type) {
    this.id = id;
    const types = [...DELETE_TOKENS, ...ADD_TOKENS];
    if (!types.includes(type)) {
      throw new Error(`type need to be of string ${types.join('|')}`);
    }
    this.type = type;
  }
  static fromJSON(json) {
    return new AssocInstruction(json.id, json.type);
  }
}

export default class AssociationResourceFactory {
  constructor(name, mappingBetween, { createActionRoutes = true, middlewares = null, permissionCheck = async (req, data) => true }) {
    this.modelName = name;
    this._model = models[name];
    this._mappingBetween = mappingBetween;
    this.permissionCheck = permissionCheck;
    this.router = Router();
    if (middlewares) {
      this.router.use(middlewares);
    }
    createActionRoutes && this._createRoutes();
  }

  _createRoutes() {
    this.router.post(`/association/${this.modelName}`, AuthRequired, async (req, res) => {
      const response = new Response();
      try {
        await this.addOrModify(req, req.body, true);
        response.type = Response.HTTP.CREATED;
        response.data = 'Successfully created row(s)';
      } catch (err) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
      }
      res.status(response.code).json(response.json);
    });

    this.router.delete(`/association/${this.modelName}`, AuthRequired, async (req, res) => {
      const response = new Response();
      try {
        await this.addOrModify(req, req.body, false);
        response.type = Response.HTTP.OK;
        response.data = 'Successfully deleted row(s)';
      } catch (err) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
      }
      res.status(response.code).json(response.json);
    });
  }
  /*
   * bind or remove binding between id and data.
   * id: @Int
   * data: {id1: [AssocInstruction,...], id2: Integer}
   */
  async addAndRemoveInstruction(req, data, { transaction = null } = {}) {
    let assocIdName = this._mappingBetween[0],
      idName = this._mappingBetween[1];
    if (typeof data[assocIdName] === 'object') {
      if (data[assocIdName].length > 0 && !(data[assocIdName][0] instanceof AssocInstruction)) {
        assocIdName = this._mappingBetween[1];
        idName = data[this._mappingBetween[0]];
      }
    }
    for (const instruction of data[assocIdName]) {
      const _data = {};
      _data[idName] = data[idName];
      _data[assocIdName] = instruction.id;
      if (ADD_TOKENS.includes(String(instruction.type).toLowerCase())) {
        await this.addOrModify(req, _data, true, { transaction: transaction });
      } else if (DELETE_TOKENS.includes(String(instruction.type).toLowerCase())) {
        await this.addOrModify(req, _data, false, { transaction: transaction });
      }
    }
  }

	async updatePrevId(courseId, data = [], t = null) {
		if (!data.length) { return; }
		for (const prevId of data) {
			const valPrevId = Object.entries(prevId)[0];
			await models.sequelize.query(
				`UPDATE "ModelCourse" SET "prevId"=${valPrevId[1]} WHERE "ModelId"=${valPrevId[0]} and "CourseId" = ${courseId}`,
				{
					transaction: t,
					type: models.sequelize.QueryTypes.UPDATE
				});	
		}
	}

  /*
   * data: { this.mappingBetween[0]: ids, this.mappingBetween[1]: ids} where ids is Integer|Array
   */
  async addOrModify(req, data, add, { ignorePermissionCheck = false, transaction = null } = {}) {
    if (Object.keys(data).length < 2) {
      throw new Error('Association must be between at least 2 keys');
    }

    for (const [k, v] of Object.entries(data)) {
      if (!this._mappingBetween.includes(k)) {
        throw new Error(`Key: ${k} is not part of the association mapping`);
      }
      if (!v) {
        throw new Error(`Key: ${k} cannot hold NULL val`);
      }
      if (!Array.isArray(v)) {
        data[k] = [v];
      }
    }

    const newTransaction = transaction ? transaction : await models.sequelize.transaction();
    try {
      for (const id0 of data[this._mappingBetween[0]]) {
        for (const id1 of data[this._mappingBetween[1]]) {
          const rowData = {};
          rowData[this._mappingBetween[0]] = id0;
          rowData[this._mappingBetween[1]] = id1;
          if (!ignorePermissionCheck && !(await this.permissionCheck(req, rowData))) {
            throw new Error(`Unauthorized`);
          }

          const row = await this._model.findOne({ where: rowData, transaction: newTransaction });

          if (add) {
            if (row) {
              throw new Error(`Row: ${JSON.stringify(rowData)} already exist`);
            }
            rowData._createdBy = req.user.id;
            rowData._createdAt = Date.now();
            await this._model.create(rowData, { transaction: newTransaction });
          } else {
            if (!row) {
              throw new Error(`Row: ${JSON.stringify(rowData)} doesn't exist`);
            }
            await row.destroy({ transaction: newTransaction });
          }
        }
      }
      if (!transaction) {
        await newTransaction.commit();
      }
    } catch (err) {
      if (newTransaction && !transaction) {
        await newTransaction.rollback();
      }
      throw err;
    }
  }

  async getAssociationById(idName, where, { transaction } = {}) {
    if (!this._mappingBetween.includes(idName)) {
      throw new Error(`${idName} must be either ${this._mappingBetween.join(',')}`);
    }
    const associatedIdName = idName == this._mappingBetween[0] ? this._mappingBetween[1] : this._mappingBetween[0];
    const associations = await models.ModelCourse.findAll({ where: where, transaction: transaction });
    return associations.map(row => row.get()[associatedIdName]);
  }
}
