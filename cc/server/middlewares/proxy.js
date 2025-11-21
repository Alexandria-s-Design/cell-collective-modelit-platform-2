import proxy from 'http-proxy-middleware';

import AppService from '../../service/app';

import logger from '../../logger';

import { getenv } from '../../util/environment.js';
import AppConfig from '../../client/app/app.json';

const secure = !['development', 'test'].includes(getenv('ENVIRONMENT', 'development'));

const buildBasicAuthorizationToken = (userId, email) => Buffer.from(`${userId}:${email}`).toString('base64');

const registerUserSession = async (req, auth_token) => {
	if (auth_token) {
		const response = await AppService.request.get('/user/getProfile', {
			headers: {				
				'Authorization': `Basic ${auth_token}`, //X-AUTH-TOKEN
			},
		});

		const { data } = response;

		if (data.id) {
			req.user = {
				id: data.id,
				basic_token: auth_token
			}
			req.session.user = {
				id: data.id,
				basic_token: auth_token
			};

			req.session.save((err) => {
				if (err) {
					logger.error(`Unable to save SESSION.`);
				}
				logger.info(`SESSION Saved: ${JSON.stringify(req.session)}`);
				logger.info(`User SESSION has been stored for user ${JSON.stringify(req.session.user)}`);
			});
		} else {
			logger.error(`Unable to fetch User Details from the App Server.`);
			// TODO: Login Error.
		}
	} else {
		logger.error(`Unable to fetch Authorization from the App Server.`);
		// TODO: throw response for login error.
	}
}

const AppProxy = proxy({
  target: AppConfig.api,
  changeOrigin: true,
  pathRewrite: {
    '^/web/_api/': '/'
  },
  secure: secure,
  onProxyReq: (proxyReq, req, res) => {
		proxyReq.setHeader('Authorization', '');
		if (req.session && 'user' in req.session && req.session.user.basic_token) {
			logger.info(`Setting basic authorization token...`);
			proxyReq.setHeader('Authorization', `Basic ${req.session.user.basic_token}`);
		}
		
		if (req.headers['x-timezone']) {
			proxyReq.setHeader('X-Timezone', req.headers['x-timezone']);
		}
		if (req.headers['x-timezone-offset']) {
			proxyReq.setHeader('X-Timezone-Offset', req.headers['x-timezone-offset']);
		}
		
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: async (proxyRes, req, res) => {
		res.statusCode = proxyRes.statusCode;
		/* moved to /web/login endpoint
    if (req.url == '/login') {
      const auth_token = proxyRes.headers['Authorization'];
      registerUserSession(req, auth_token);
    }*/

    for (const header in proxyRes.headers) {
      res.setHeader(header, proxyRes.headers[header]);
    }

    proxyRes.on('data', d => {
      res.write(d);
    });
    proxyRes.on('end', () => res.end());
  },
  selfHandleResponse: true,
});


const AppLoginProxy = proxy({
  target: AppConfig.api,
  changeOrigin: true,
  pathRewrite: {
    '^/web/login': '/login'
  },
  secure: secure,
  onProxyReq: (proxyReq, req, res) => {
    if (req.headers['x-timezone']) {
      proxyReq.setHeader('X-Timezone', req.headers['x-timezone']);
    }
    if (req.headers['x-timezone-offset']) {
      proxyReq.setHeader('X-Timezone-Offset', req.headers['x-timezone-offset']);
    }
    
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: async (proxyRes, req, res) => {
		res.statusCode = proxyRes.statusCode;	
    for (const header in proxyRes.headers) {
      res.setHeader(header, proxyRes.headers[header]);
    }
    proxyRes.on('data', d => {
      res.write(d);
    });
    proxyRes.on('end', async () => res.end());
  },
  selfHandleResponse: false,
});

const WebLoginSessionProxy = async (req, res, next) => {
	if (['/web/api/users/me/profile'].includes(req.url)) {
			try {
				await registerUserSession(req, req.headers['x-auth-token']);
			} catch(err) {
				return res.status(400).json({
					'error': err.message
				})
			}
	}
	next();
}

export { AppProxy, AppLoginProxy, WebLoginSessionProxy, registerUserSession, buildBasicAuthorizationToken };
