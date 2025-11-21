import { Client } from "@elastic/elasticsearch";

import { getenv } from "./util/environment";
import logger from "./logger";

logger.info(`Connecting Search to: http://${getenv("SEARCH_HOST", "localhost")}:${getenv("SEARCH_PORT", 9200)}`)

const client = new Client({
    node: `http://${getenv("SEARCH_HOST", "localhost")}:${getenv("SEARCH_PORT", 9200)}`
});

(async () => {
    try {
        await client.ping();
        logger.info(`Successfully connected to search sevice.`);
    } catch (e) {
        logger.error(`Error in connecting to search service: ${e}`);
    }
})();

export default client;
