import path from "path";

import { getenv } from "./util/environment";
import { pardir } from "./util/system";
import { generateHash } from "./util/crypto";
import { template } from "./util/string";

const PLATFORM = {
	isModelIt: true
}

const DEFAULT = {
    HOST: {
        WEB: "127.0.0.1"
    },
    PORT: {
        WEB: 5000
    },
    KEY: {
        SECRET: generateHash("SESSION_SuperSecretKey")  //TODO: Maybe add CC version
    },
    REST: {
        MAX_GET_RESOURCE_SIZE: 30
    },
    MINIMUM_PASSWORD_LENGTH: 8,
    PASSWORD_SALT_ROUNDS: 10,
    CLIENT_MAX_BODY_LIMIT: "50mb",
    STRIPE_API_KEY_SANDBOX: getenv("STRIPE_SECRET_KEY","")
};

const PATH         = { };

PATH.BASE          = pardir(__filename);

PATH.PUBLIC        = path.join(PATH.BASE, "public");
PATH.PRIVATE       = path.join(PATH.BASE, "private");
PATH.TEMPLATES     = path.join(PATH.BASE, "templates");
PATH.MODELS        = path.join(PATH.BASE, "models");
PATH.DOCUMENTATION = path.join(PATH.BASE, "docs");
PATH.UPLOADS       = path.join(PATH.BASE, "..", "..", "uploads");
PATH.UI_TEST_ENV   = path.join(PATH.BASE, "client", "test");

PATH.BENCH         = getenv("BENCH_PATH", process.cwd());
PATH.LOGS          = path.join(PATH.BENCH, "logs");

const IS_WORKER		 = getenv("WORKER", true);

const UPLOAD       = { };

UPLOAD.FILECHARS   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:+_";

const EMAIL        = { };

EMAIL.SMTP_OPTIONS = {
	HOST: getenv("SMTP_HOST", ""),
	PORT: getenv("SMTP_PORT", ""),
	USER: getenv("SMTP_AUTH_USER", ""),
	PASSWORD: getenv("SMTP_AUTH_PASSWORD", "")
};

EMAIL.REMINDER_TEMPLATE = template`Dear Student,<br /><br /><p>Your instructor requests that you please do the following:<br />${'todo'}<br />\
Best regards,<br />&nbsp;&nbsp;&nbsp;The CellCollective Team on behalf of your instructor, ${'instructor_first'} ${'instructor_last'}</p>`;

export { DEFAULT, PATH, UPLOAD, EMAIL, IS_WORKER, PLATFORM };