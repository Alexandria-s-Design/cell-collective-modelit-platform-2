import winston from "winston";
import LoggerService from "./service/logger";

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

class HttpTransport extends winston.Transport {
	constructor(opts) {
		super(opts);
		this.action = opts.action;
		this.file = opts.file;
		this.line = opts.line;
		this.stack = opts.stack;
		this.group = opts.group;
		this.user = opts.user;
	}
  log(info, callback) {
		let stack = '', group = 'NODEJS';
		let user = {id: 0, name: '', email: ''};

		if (info.level == 'error' && this.stack) {
			stack = this.stack;
		}
		if (this.user) {
			user = this.user;
		}
		if (this.group) {
			group = this.group;
		}
    LoggerService.request.post('/add/log', {
			level: `${info.level}`.toUpperCase(),
			file: this.file || __filename,
			line: this.line || 0,
			group: 'NODEJS',
			action: this.action || 'INTERNAL',
			message: `${info.message}`,
			stack,
			user
		})
		.then(resp => {
			const {data: respData} = resp.data;
			console.log(`LOG ID "${respData[0].id}" registered in file ${respData[0].log}`);
		})
		.catch(error => {
			console.error('LOG error registering: ', error);
		});
  }
}

const LoggerFactory = (opts) => {
	return winston.createLogger({
		transports: [ new HttpTransport(opts) ]
	})
}

export const loggerHttp = {
	info: (message, group, action, user) => LoggerFactory({group, action, user}).info(message),
	error: (ErrorClass, group, action, user, file, line) => LoggerFactory({
		group, action, user, file, line, stack: ErrorClass.stack
	}).error(ErrorClass.message)
}

export default logger;