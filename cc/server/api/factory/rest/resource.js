import { Op } from 'sequelize';
import { Router } from 'express';
import compact from "lodash.compact";

import { toResourceName, excludeAttributes } from './util';
import { AuthRequired } from '../../../middlewares/auth';
import { DEFAULT } from '../../../../const';
import { Response } from '../../../../server';
import models, { db } from '../../../../models';
import search from '../../../../search';

export default (
  name,
  {
    as,
    middlewares,
    attributes = {},
    query = {
      where: {}, // [ Function | Object ]
      include: {}, // [Function|List of associated sequelize models name]
    },
    customFields = {
      set: (req, data, { transaction }) => null, // [Function] apply on "POST"/"PUT" to set extra field.
      get: (req, data) => null, // [Function] apply on "GET"/"GETID" to filter or add extra fields.
    },
    skipRoutes = [],
    getModelData = req => req.body,
  } = {},
) => {
  // Option Management
  if (Array.isArray(attributes)) {
    attributes = { include: attributes, exclude: [] };
  } else {
    if (!attributes.include) {
      attributes.include = [];
    }
    if (!attributes.exclude) {
      attributes.exclude = [];
    }
  }
  if (!getModelData) {
    getModelData = req => req.body;
  }

  if (!query.include) {
    query.include = {};
  }
  if (!query.where) {
    query.where = {};
  }

  const router = Router();

  if (middlewares) {
    router.use(middlewares);
	}
	
  const model = models[name];

  !skipRoutes.includes('get') &&
    router.get('/', async (req, res) => {
			let { offset } = req.query;

      offset = offset || 0;
      const response = new Response();
      try {
				let _where = query.where;
        if (query.where && typeof query.where === 'function') {
          _where = query.where(req);
        }
        let _include = query.include;
        if (query.include && typeof query.include === 'function') {
          _include = query.include(req);
        }
        if (!Array.isArray(_include)) {
          _include = [_include];
        }
        let { count, rows: resources } = attributes.include.length !== 0 ?
         await model.findAndCountAll({
          attributes: {
            include: [...attributes.include],
            exclude: [...attributes.exclude],
          },
          where: {
            [Op.and]: compact([
              !model.app && {
                _deleted: false,
              },
            ]),
            ..._where,
          },
          include: _include,
          offset: offset,
          order: compact([model.name == 'Model' ? ['updatedate', 'DESC'] : null, !model.app && ['_updatedAt', 'DESC']]),
        }) :
          await model.findAndCountAll({
          attributes: {
            include: [...attributes.include],
            exclude: [...attributes.exclude],
          },
          where: {
            [Op.and]: compact([
              !model.app && {
                _deleted: false,
              },
            ]),
            ..._where,
          },
          offset: offset,
          order: compact([model.name == 'Model' ? ['updatedate', 'DESC'] : null, !model.app && ['_updatedAt', 'DESC']]),
        });

        resources = resources.map(resource => excludeAttributes(resource.get(), null, attributes.include));
        if (customFields.get) {
          const getCustomField = await customFields.get(req, resources);
          if (getCustomField) {
            resources = getCustomField;
          }
        }
				const name = as ? as : toResourceName(model);
				response.data = { name: name, total: resources.length, data: resources };
      } catch (e) {
				response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
      }
      res.status(response.code).json(response.json);
    });

  !skipRoutes.includes('search') &&
    router.get('/search', async (req, res) => {
      let { since, size, q } = req.query;

      since = since || 0;
      size = parseInt(size);
      size = !size || size <= 0 || size > DEFAULT.REST.MAX_GET_RESOURCE_SIZE ? DEFAULT.REST.MAX_GET_RESOURCE_SIZE : size;

      const response = new Response();

      // const body = { size: size, from: since, query: { fuzzy: { name: q } } };
			const body = { size: size, from: since, query: { match_phrase_prefix: { name: `${q}` } } };

      try {
        const results = await search.search({
          index: 'cc',
          body: body,
          type: name,
        });
        const data = results.body.hits.hits.map(h => h._source);
        response.data = { name: name, size: size, data: data };
      } catch (e) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
      }

      res.status(response.code).json(response.json);
    });

  !skipRoutes.includes('getid') &&
    router.get('/:id', async (req, res) => {
      const response = new Response();

      const { id } = req.params;
      try {
        let _include = query.include;
        if (query.include && typeof query.include === 'function') {
          _include = query.include(req);
        }
        let resource = (
          await model.findByPk(id, {
            attributes: {
              include: [...attributes.include],
              exclude: [...attributes.exclude],
            },
            where: {
              _deleted: true,
            },
            include: _include,
          })
        ).get();

        if (customFields.get) {
          const getCustomField = await customFields.get(req, resource);
          if (getCustomField) {
            resource = getCustomField;
          }
        }

        response.data = resource;
      } catch (e) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
      }

      res.status(response.code).json(response.json);
    });

  !skipRoutes.includes('post') &&
    router.post('/', AuthRequired, async (req, res) => {

      const user = req.user;
      const response = new Response();
      let transaction;
      try {
        const data = {
          ...getModelData(req),
          _createdAt: models.Sequelize.fn('NOW'),
          _createdBy: parseInt(user.id),
          _updatedAt: models.Sequelize.fn('NOW'),
          _updatedBy: parseInt(user.id),
        };
        transaction = await db.sequelize.transaction();
        let resource = (await model.create(data, { transaction: transaction })).get();
        if (customFields.set) {
          const setCustomFields = await customFields.set(req, resource, { transaction: transaction });
          if (setCustomFields) {
            resource = setCustomFields;
          }
        }
        await transaction.commit();

        const result = excludeAttributes(resource, attr => !attributes.exclude.includes(attr));

        response.type = Response.HTTP.CREATED;
        response.data = result;
      } catch (err) {
        if (transaction) {
          await transaction.rollback();
        }
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
      }

      res.status(response.code).json(response.json);
    });

  !skipRoutes.includes('put') &&
    router.put('/:id', AuthRequired, async (req, res) => {
      const user = req.user;
      const response = new Response();
      const { id } = req.params;

      let transaction;
      try {
        transaction = await db.sequelize.transaction();
        const existingRow = await model.findByPk(id, { transaction: transaction });
        if (!existingRow) {
          response.setError(Response.Error.NOT_FOUND, `${name} with ID ${id} not found.`);
        } else if (!model.app && parseInt(existingRow._createdBy) !== user.id) {
          response.setError(Response.Error.UNAUTHORIZED, `Cannot update ${name} with ID ${id}.`);
        } else {
          const data = {
            ...getModelData(req),
            _updatedAt: models.Sequelize.fn('NOW'),
            _updatedBy: user.id,
          };
          await existingRow.update(data, { where: { id } });

          let resource = excludeAttributes(existingRow.get(), attr => req.body[attr] !== undefined && !attributes.exclude.includes(attr));

          if (customFields.set) {
            const setCustomFields = await customFields.set(req, resource, { transaction: transaction });
            if (setCustomFields) {
              resource = setCustomFields;
            }
          }
          await transaction.commit();
          response.type = Response.HTTP.OK;
          response.data = resource;
        }
      } catch (err) {
        if (transaction) {
          await transaction.rollback();
        }
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
      }

      res.status(response.code).json(response.json);
    });

  !skipRoutes.includes('delete') &&
    router.delete('/:id', AuthRequired, async (req, res) => {
      const user = req.user;
      const response = new Response();
      const { id } = req.params;

      try {
        const resource = await model.findByPk(id);
        if (!resource) {
          response.setError(Response.Error.NOT_FOUND, `${name} with ID ${id} not found.`);
        } else if (resource._deleted) {
          response.setError(Response.Error.GONE, `${name} ${id} already deleted.`);
        } else if (!model.app && resource._createdBy !== user.id) {
          const data = {
            _deleted: true,
            _deletedBy: user.id,
            _deletedAt: models.Sequelize.fn('NOW'),
          };
          await resource.update(data, { where: { id } });

          response.type = Response.HTTP.OK;
          response.data = true;
        }
      } catch (err) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
      }

      res.status(response.code).json(response.json);
    });

  return router;
};
