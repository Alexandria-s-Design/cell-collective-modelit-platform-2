/***** Entry point for computation node */

import pickBy from "lodash.pickby";
import { PREFIX as ENV_PREFIX, getenv } from "../../util/environment";
import logger from "../../logger";
import {NODE} from './consts';

//load all jobs
import {loadTasksFromDirectory, getQueueClient} from '../task';

const envs = pickBy(process.env, (v, k) => k.startsWith(ENV_PREFIX));
logger.info(`Environment Variables: ${JSON.stringify(envs)}`);

const queue = getQueueClient(NODE);
const tasks = loadTasksFromDirectory(`${__dirname}/tasks`, queue);
queue.startProcessingTasks(tasks);