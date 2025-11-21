import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";

import { getenv } from "../../../util/environment";
import { buildSocialLogin } from "./util";

export default buildSocialLogin("linkedin", {
	Strategy: LinkedInStrategy,
	strategyArgs: {
		clientID: getenv("LINKEDIN_KEY"),
		clientSecret: getenv("LINKEDIN_SECRET"),
		scope: ['r_emailaddress', 'r_liteprofile']
	},
	authenticateArgs: {
		state: "state"
	}
});