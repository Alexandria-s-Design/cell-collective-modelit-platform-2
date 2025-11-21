import Redis from "ioredis";

import { getenv } from "./util/environment";
import logger from "./logger";

const client = new Redis({
	host: getenv("CACHE_HOST", "localhost"),
	port: getenv("CACHE_PORT", 6379),
	password: getenv("CACHE_PASSWORD")
});

(async () => {
    try {
			await client.ping();
			logger.info(`Successfully connected to cache service.`);
    } catch (e) {
      logger.error(`Error in connecting to cache service: ${e}`);
    }
})();

export async function deleteCacheWith(pattern) {
	let cursor = '0';
	do {
			const [newCursor, keys] = await client.call('SCAN', cursor, 'MATCH', pattern);
			for (const key of keys) {
					await client.call('DEL', key);
					logger.info(`Deleted CACHE ${key}.`);
			}
			cursor = newCursor;
	} while (cursor !== '0');
}

export default client;