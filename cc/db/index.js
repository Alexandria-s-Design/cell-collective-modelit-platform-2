import path from 'path';

import walk from 'walk-sync';
import Sequelize from 'sequelize';
import ACL from 'acl';
import ACLSequelize from 'acl-sequelize';

import { PATH, IS_WORKER } from '../const';
import { getenv } from '../util/environment';
import logger from '../logger';

import functions from './functions';
import { db } from '../models';

export default class DataBase {
  constructor(
    name,
    {
      host = getenv('DATABASE_HOST', '127.0.0.1'),
      port = getenv('DATABASE_PORT', 5432),
      username = getenv('DATABASE_USERNAME', ''),
      password = getenv('DATABASE_PASSWORD', ''),
    } = {},
  ) {
    this.name = name;

    this.host = host;
    this.port = port;

    this.username = username;
    this.password = password;

    this.models = {};

    this.connected = false;
  }

	async connect ({ sync = false, silent = false } = { }) {
			if ( !this.sequelize ) {
					this.sequelize = new Sequelize(this.name, this.username, this.password, {
									host: this.host,
									port: this.port,
							dialect: "postgres",
								define: { timestamps: false },
							 logging: false
					});
			}

			const paths  = walk(PATH.MODELS);
			const models = [ ];

			logger.info(`Loading Models...`);
			for ( const fpath of paths ) {
					const basename = path.basename(fpath);
					
					if ( basename.endsWith(".js") && basename != path.basename(__filename) ) {
							const abspath  = path.join(PATH.MODELS, fpath);
							const model    = this.sequelize["import"](abspath);
							
							const { name } = model;

							this.models[name] = model;

							models.push(name);
					}
			}

			logger.info(`Associating models...`);
			for ( const model of models ) {
					if ( this.models[model].associate ) {

							try {
								this.models[model].associate(this.models);
							} catch (e) {
								logger.warn(`Unable to associate model ${model}: ${e}...`)
							}
					}
			}

			try {
					await this.sequelize.authenticate();
					
					this.connected = true;

					if ( IS_WORKER ) {
						if ( sync ) {
							logger.info(`Syncing models...`)
							await this.sequelize.sync()
						}
	
						logger.info(`Defining functions...`);
						for (const fn of functions) {
							await this.query(fn);
						}
					}

					logger.info(`Successfully connected DataBase ${this.name}`);
			} catch (err) {
					logger.error(`Unable to connect to DataBase ${this.name}: ${err}`);
					
					if ( !silent ) {
							throw err;
					}
			}
	}
	
  async query(query, replacements = {}) {
    if (!this.connected) {
      await this.connect();
    }

    const results = await this.sequelize.query(query, {
			replacements,
      type: this.sequelize.QueryTypes.SELECT,
    });

    return results;
  }
}
