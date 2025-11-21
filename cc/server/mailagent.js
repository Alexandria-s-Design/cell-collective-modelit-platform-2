import nodemailer from "nodemailer";
import { EMAIL } from "../const";

const agent = nodemailer.createTransport({
	host: EMAIL.SMTP_OPTIONS.HOST,
	port: EMAIL.SMTP_OPTIONS.PORT,
	secure: true,
	auth: {
		user: EMAIL.SMTP_OPTIONS.USER,
		pass: EMAIL.SMTP_OPTIONS.PASSWORD
	}
});

const runTest = () => {
	return agent.verify();
};

const sendMail = (cfg) => {
	return agent.sendMail(cfg);
}

export { runTest, sendMail };