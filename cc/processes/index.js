import fs from 'fs';
import path from 'path';

import Queue from 'bull';

import { getenv } from '../util/environment';
import logger from '../logger';
import { generateHash } from '../util/crypto';
import { queue } from 'sharp';

const PATH_TASKS 				= path.join(__dirname, 'tasks');
const BULL_QUEUE_CONFIG = {
	redis: {
		host: getenv("QUEUE_HOST", "127.0.0.1"),
		port: getenv("QUEUE_PORT", 6379)
	}
}

export const add = (process) => {
	const taskName = generateHash()
	logger.info(`Processing Job: ${taskName}`)

	const queue = new Queue(taskName, BULL_QUEUE_CONFIG);
	queue.process(process);
	queue.add();

	queue.on('completed', () => {
		logger.info(`Job ${taskName} is completed.`)
	})
}

export const discover = () => {
	const taskList 	= fs.readdirSync(PATH_TASKS);
	const queues		= [ ]
	
	for ( const task of taskList ) {
		const pathTask 	= path.join(PATH_TASKS, task);
		
		const process	= require(pathTask);

		const taskName	= task.split(".")[0];
		
		const queue 	= new Queue(taskName, BULL_QUEUE_CONFIG);
		queue.process(process);

		queues.push(queue);
	}

	for ( const queue of queues ) {
		logger.info(`Adding Job: ${queue.name}`)
		queue.add();
	}

	queue.on('active', (job) => {
		logger.info(`Job ${job} currently active.`);
	});

	queue.on('failed', (job, err) => {
		logger.error(`Job ${job} failed due to: ${err}.`);
	});

	queue.on('process', (job, progress) => {
		logger.info(`Job ${job} currently in progress: ${progress}.`);
	});
}