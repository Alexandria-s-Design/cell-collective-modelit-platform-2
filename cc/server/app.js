import "./instrument";
import http from "http";
import https from "https";
import express from "express";
import ExpressValidator from "express-validator";
import Session from "express-session";
import ConnectRedis from "connect-redis";
import CookieParser from "cookie-parser";
import bodyParser from "body-parser";
import socketio from "socket.io";
import compression from "compression";
import morgan from "morgan";
import errorhandler from "errorhandler";
import lusca from "lusca";
import passport from "passport";
import cors from "cors";
// import ExpressStaticGZIP from "express-static-gzip";

import { PATH } from "../config";
import { DEFAULT, IS_WORKER } from "../const";
import { BaseRoute } from "./routes";
import { router as APIRoute } from "./api";
import { getenv } from "../util/environment";
import { AppMiddleware } from "../service/app";
import cache from "../cache";
import logger from "../logger";
import { getCoverImage } from './api/model/utils.js';
import methodOverride from 'method-override';

import fs from 'fs';
import path from 'path';

import { AppProxy, AppLoginProxy, WebLoginSessionProxy } from "./middlewares/proxy";
import { timezoneMiddleware } from "./middlewares/timezone";

import socketEvents from "./socket";

import Response from './response';

import promClient from "prom-client";
import * as Sentry from "@sentry/node";
import { getModelCount, getModelCardData,  DashboardCategory, getMyModels, getSharedModels, getInstitutions, getUserProfile } from "./api/research-dashboard.js"
import { CCAppMiddleware } from "../service/ccapp";

const DEVELOPMENT = getenv("ENVIRONMENT") === "development";
const TEST = getenv("ENVIRONMENT") === "test";

const app = express();
const server = http.Server(app);
const io = socketio(server);

http.globalAgent.maxSockets 	= Infinity;
https.globalAgent.maxSockets 	= Infinity;

//TODO: only in production mode
app.set('trust proxy', true);
//app.enable('trust proxy');

const cookie     = CookieParser();

const RedisStore = ConnectRedis(Session);

const DAY_IN_SECONDS = 24 * 60 * 60;

const store = new RedisStore({
    client: cache,
    ttl: DAY_IN_SECONDS
});

const session = Session({
    store: store,
    secret: getenv("SECRET_KEY", DEFAULT.KEY.SECRET),
    resave: false,
    saveUninitialized: false //,
/*    cookie: {
        maxAge: DAY_IN_SECONDS
    }*/
});

let onConnection = fn => fn()

io.on("connection", async (socket) => {
		logger.info("User connected via Socket.");
		onConnection = fn => fn(socket);

    let nconnections = await cache.get("cc:nonline") || 0;
    nconnections = io.engine.clientsCount;

    await cache.set("cc:nonline", nconnections);

    socketEvents(socket);
});

app.use(Sentry.Handlers.requestHandler());

const register = new promClient.Registry();
promClient.collectDefaultMetrics({register});

// Define the HTTP request counter
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'], 
});

register.registerMetric(httpRequestsTotal);

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5] // response time buckets
});

register.registerMetric(httpRequestDuration);

const httpRequestsFailed = new promClient.Counter({
  name: 'http_requests_failed_total',
  help: 'Total number of failed HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestsFailed);
// middleware to time response times
app.use((req, res, next) => {
  const start = process.hrtime(); // High-resolution time

  res.on('finish', () => { // Fires when response is sent
    const duration = process.hrtime(start);
    const seconds = duration[0] + duration[1] / 1e9; // Convert to seconds
    
    httpRequestDuration.observe({ 
      method: req.method, 
      route: req.path, 
      status_code: res.statusCode 
    }, seconds);
  });

  next();
});

// middleware to increment counter
app.use((req, res, next) => {
  res.on('finish', () => { // Ensure it runs after response is sent
    httpRequestsTotal.inc({ 
      method: req.method, 
      route: req.path, 
      status_code: res.statusCode 
    });
		// track failed requests
		if (res.statusCode >= 500) {
      httpRequestsFailed.inc({ method: req.method, route: req.path,  status_code: res.statusCode });
    }
  });
  next();
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
})

app.disable('etag');
const pub = express.static(PATH.PUBLIC, {
    etag: false
});
app.use(pub);

// const expressStaticGZIP = ExpressStaticGZIP(PATH.PUBLIC, {
// 	enableBrotli: true
// });
// app.use("/", expressStaticGZIP);

const log = morgan(DEVELOPMENT ? "dev" : "combined");
app.use(log);

// configure passport
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(cookie);

app.use(ExpressValidator());

app.use(lusca());

app.use(compression());

app.use(cors());

app.use(AppMiddleware);

app.use(timezoneMiddleware);

if ( DEVELOPMENT ) {
    if ( !TEST && IS_WORKER ) {
        app.use(errorhandler());
    }
		
		app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
			next();
		});
}

/**
 * Endpoint that creates a JWT for the authorization code in the App service
 */
app.post('/web/login', AppLoginProxy)

/**
 * Middleware that creates a session for the authorization code in the web service
 */
app.use(WebLoginSessionProxy);

/**
 * Endpoint that checks a user session for the authorization code in the Web service
 */
app.get('/web/login-verifier', (req, res) => {
  if (req.session.user) {
    res.json({
			logged: true,
			user: req.session.user,
			sessionID: req.sessionID
		});
  } else {
    res.json({
			logged: false,
			sessionID: req.sessionID,
			message: `No session data found: ${req.sessionID}`
		});
  }
});

app.use("/web/_api", AppProxy);
app.get("/ccapp", CCAppMiddleware, (_, res) => {
	const response = new Response();
	response.data = {	'ccapp': 'Passed middleware' }
	res.status(response.code).json(response.json);
});

// app.use(CCAppMiddleware);
app.use((req, _, next) => {
    logger.info(`Session Details: ${JSON.stringify(req.session)}`);

    if ( req.session ) {
        req.user = req.session.user ? JSON.parse(JSON.stringify(req.session.user)) : null;

        if (req.user) {
            logger.info(`User ${JSON.stringify(req.user)} currently logged in.`);
        }
		}

		req.AUTH_TOKEN = req.header("Authorization");

    next();
});

app.use(bodyParser.json({
    limit: getenv("CLIENT_MAX_BODY_LIMIT", DEFAULT.CLIENT_MAX_BODY_LIMIT)
}));
app.use(bodyParser.urlencoded({
    limit: getenv("CLIENT_MAX_BODY_LIMIT", DEFAULT.CLIENT_MAX_BODY_LIMIT),
    extended: true
}));

if (DEVELOPMENT) {
	app.get('/dev/ui-test', (_, res) => {
		const uiSourceMap = {};

		const demos = path.join(PATH.BASE, "data", "demo");
		const files = fs.readdirSync(demos).filter(file => (file !== 'index.js' && (file.endsWith(".js") || file.endsWith(".jsx"))));
		for (const file of files) {
			const pieces = file.split(".");
			const keypieces = pieces.slice(0, pieces.length - 1);
			const key = keypieces.join(".");
			const source = fs.readFileSync(path.join(demos, file), { encoding: "utf-8" });
			uiSourceMap[key] = source;
		}

		res.status(200).json(uiSourceMap);
	});
}

app.use("/web/api",  APIRoute);
app.get('/web/cache/model_images/:filename', (req, res) => {
  res.sendFile(path.join("/cache", "model_images", req.params.filename));
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.get('/web/research/dashboard', async (req, res) => {
	let languageOptions = [], refreshKey = Date.now();
	try {
    languageOptions = require('../data/languages.json');
  } catch (err) { console.error('Error loading languages') }

	let modelTypes = req.query.modelTypes || ["boolean", "metabolic", "kinetic", "pharmacokinetic"];
	const limit = req.query.pageSize || 999999999 ;
	const offset = (req.query.page || 1) - 1;
	const searchValue = req.query.search;

  let userId = 0
	let user = null;
	if(req.user) {
		userId = req.user.id;
		user = await getUserProfile(userId);
	}

	const domain  = "research"

	// if search string is available. use that as the only filter
	if(searchValue) {
		const formatDate = function (date) {
			if (date) {
				return moment(date).format('DD/MM/YYYY'); 
			}
			return '';
		}
		
		const searchResult = await getModelCardData([domain], modelTypes, DashboardCategory.RECENT,  limit,  offset, searchValue )
		
		const searchResultData = await Promise.all(searchResult.map(async (model) => {

			let mdata = {
				id: model.id,
				name: model.name,
				description: model.description,
				tags: model.tags,
				userId: model.userId,
				author: model.author,
				createdAt: formatDate(model.creationdate),
				biologicUpdateDate: formatDate(model.biologicupdatedate),
				knowledgeBaseUpdateDate: formatDate(model.knowledgebaseupdatedate),
				updateDate: formatDate(model.updatedate),
				components: model.components,
				interactions: model.interactions,
				public: model.public,
				cited: model.cited,
				domainType: model.domaintype,
				originId: model.originid,
				modelType: model.modeltype,
				version: model.modelversion,
				defaultVersionId: model.modelversionid,
				modelVersionName: model.modelversionname,
				updatedAt: formatDate(model.myupdatedate),
				citations: model.citations,
				score: model.score,
				hash: (new Date()).getTime() + '003',
				coverImage: await getCoverImage(`${model.id}`)
			}

			return mdata;
		}))

		return res.render('dashboard', { data: {
			"published": {
				"count": 0 ,
				"recent": [],
				"popular": [],
				"recommended":[],
				"referenced": []
			},
			"mymodels": {
				"count":  0,
				"data": []
			},
			"shared": {
				"count":  0,
				"data": []
			},
      "searchResults": {
				"count": searchResultData.length,
				"data": searchResultData, 
				"searchParam": searchValue
			},
			"institutions": await getInstitutions(),
		}, languageOptions, refreshKey
		});
	}

	if(typeof modelTypes == 'string') {
		modelTypes = [modelTypes]
	}

	const modelCountMap  = await getModelCount([domain], modelTypes, userId);
	const modelData = {
		"published": {
			"count": modelCountMap.published ,
			"recent": await getModelCardData([domain], modelTypes, DashboardCategory.RECENT,  limit,  offset ),
			"popular": await getModelCardData([domain], modelTypes, DashboardCategory.POPULAR, limit, offset),
			"recommended": await getModelCardData([domain], modelTypes, DashboardCategory.RECOMMENDED, limit, offset ),
			"referenced": await getModelCardData([domain], modelTypes, DashboardCategory.REFERENCED, limit, offset ),
		},
		"mymodels": {
			"count":  modelCountMap.my_model,
			"data": await getMyModels([domain], modelTypes, userId)
		},
		"shared": {
			"count":  modelCountMap.shared,
			"data": await getSharedModels([domain], modelTypes, userId)
		},
		"searchResults": {
			"count": 0,
			"data": [], 
		},
		"institutions": await getInstitutions(),
		"user": user && {
			"email": user.email,
			"firstname": user.firstname,
			"lastname": user.lastname,
			"institution": user.institution
		},
	}		

	res.render('dashboard', { data: modelData, languageOptions, refreshKey });
});

app.get('/web/api/config/client', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	const p = path.resolve(__dirname, '..');
	const configPath = path.join(p, 'config', '.client.json')
	const data = fs.readFileSync(configPath, 'utf8');
  res.send( JSON.parse(data));
});


app.get("/web/api/exports-status", async (req, res) => {
	const response = new Response();
	const { ping, download }	= req.query;
	if (download) {
		return res.status(response.code).sendFile(`/uploads/exports/sbml/${ping}`);
	}
	if (fs.existsSync(`/uploads/exports/sbml/ok_${ping}.txt`)) {
		response.data = {ping: true};
	} else {
		response.data = {ping: false};
	}	
	res.status(response.code).json(response.json);
});

app.use("/*",    BaseRoute);

app.use(Sentry.Handlers.errorHandler());

app.use(methodOverride());

app.use((err, req, res, next) => {
	logger.error(`Unhandled Error: ${JSON.stringify(err)}`);

	const response = new Response();
	response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.toString());

	res.status(response.code)
			.json(response.json);
});

export { server, app, io, onConnection };
