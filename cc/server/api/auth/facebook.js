import { Strategy as FacebookStrategy } from "passport-facebook";

import { getenv } from "../../../util/environment";
import { buildSocialLogin } from "./util";

export default buildSocialLogin("facebook", {
	Strategy: FacebookStrategy,
	strategyArgs: {
		clientID: getenv("FACEBOOK_APP_ID"),
		clientSecret: getenv("FACEBOOK_APP_SECRET"),
		profileFields: ['email','name']
	}
});