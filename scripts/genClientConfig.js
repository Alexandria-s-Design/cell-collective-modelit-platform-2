import fs from 'fs';
import { getenv } from "../cc/util/environment";
import dotenv from 'dotenv';

dotenv.config();

// console.log("======= envs =========")
// console.log(Object.keys(process.env).filter(e => e.startsWith("CC"))
// 	.reduce((prev, next) => ({ ...prev, [next]: process.env[next] })), {});

const ENVIRONMENT   = process.env.CC_ENVIRONMENT || "development";
const URL_RESEARCH  = getenv("URL_RESEARCH", "http://localhost:5000");
const URL_LEARN     = getenv("URL_LEARN", "http://localhost:5000");
const URL_TEACH     = getenv("URL_TEACH", "http://localhost:5000");

const CC_GIT_BRANCH = process.env.CC_GIT_BRANCH;
const CC_VERSION = process.env.CC_VERSION;
const CC_GIT_COMMIT = process.env.CC_GIT_COMMIT;
const CC_GIT_TAG = process.env.CC_GIT_TAG;
const CC_STRIPE_API_KEY = process.env.CC_STRIPE_API_KEY;
const CC_ANALYZER_URL = process.env.CC_ANALYZER_URL;
const CC_LOGGER_URL = process.env.CC_LOGGER_URL;

const data = {
	"name": "ModelIt!",
	"title": "Interactive Modeling of Biological Networks",
	"description": "ModelIt! is an interactive, open and collaborative modeling platform for Biological Networks for researchers, students and teachers worldwide.",
	"color": {
		"primary": "#1ABC9C"
	},
	"social": {
		"facebook":
		{
			"username": "CellCollectiveByDC",
			"app_id": "1902437750060978"
		},
		"twitter":
		{
			"username": "biocollective"
		},
		"linkedin":
		{
			"username": "discovery-collective"
		}
	},
	"contact":
	{
		"email": {
			"hello": "support@cellcollective.org"
		},
		"phone": "+14025478904"
	},
  "domains": [
		{ "name": "research", "key": "research", "title": "Research", "displayTitle": "Research Platform", "priority": 1, "image": "/landing/research/logo-rcc.png" },
		{ "name": "teaching", "key": "teach", "title": "Teaching", "displayTitle": "Instructor Access", "priority": 2, "image": "/landing/teaching/logo-tcc.png" },
		{ "name": "learning", "key": "learn", "title": "Learning", "displayTitle": "Student Access", "priority": 3, "image": "/landing/learning/logo-lcc.png" }
	],
	"version": CC_VERSION,
	"git": {
		"branch": CC_GIT_BRANCH,
		"commit": CC_GIT_COMMIT,
		"tag": CC_GIT_TAG
	},
	"mode": ENVIRONMENT,
	"urls":
	{
		"base": URL_RESEARCH,
		"support": "https://support.cellcollective.org",
		"research": URL_RESEARCH,
		"learn": URL_LEARN,
		"teach": URL_TEACH
	},
	"stripe_key": CC_STRIPE_API_KEY,
	"analyzer_url": CC_ANALYZER_URL,
	"logger_url": CC_LOGGER_URL,
}

const config = JSON.stringify(data, null, 2);
// console.log("====== GENERATED CONFIG =======");
// console.log(config);

const URL = 'cc/config/.client.json';
console.log(`====== WRITING TO FILE ${URL} =======`);
fs.writeFileSync(URL, config);
console.log(`====== SUCCESSFULLY WRITTEN =======`);
