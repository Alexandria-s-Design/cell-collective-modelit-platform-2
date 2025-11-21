import os from "os";
import cluster from "cluster";
import pickBy from "lodash.pickby";
import { server } from "./server";
import { PREFIX as ENV_PREFIX, getenv } from "./util/environment";
import { DEFAULT, IS_WORKER } from "./const";
import logger from "./logger";

import { discover as discoverTasks } from './processes';

const envs = pickBy(process.env, (v, k) => k.startsWith(ENV_PREFIX));
logger.info(`Environment Variables: ${JSON.stringify(envs)}`);

const CPU_COUNT 	= os.cpus().length;
const DEVELOPMENT = getenv("ENVIRONMENT", "development")

if ( cluster.isMaster && !DEVELOPMENT ) {
	logger.info(`Forking Cluster...`);
	
	for ( let i = 1 ; i <= CPU_COUNT ; ++i ) {
		cluster.fork();
	}
} else {
	logger.info(`Running on Master Cluster...`);

	
	(async () => {
		const WEB_HOST = getenv("WEB_HOST", DEFAULT.HOST.WEB);
		const WEB_PORT = getenv("WEB_PORT", DEFAULT.PORT.WEB);
	
		logger.info(`Starting Web Server...`)
		
		server.listen(WEB_PORT, WEB_HOST, () => {
			logger.info(`Running server at ${WEB_HOST}:${WEB_PORT}`);

			if ( IS_WORKER ) {
				discoverTasks();
			}
		});
	})();
}