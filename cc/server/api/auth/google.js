import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";

import { getenv } from "../../../util/environment";
import { buildSocialLogin } from "./util";

export default buildSocialLogin("google", {
	Strategy: GoogleStrategy,
	strategyArgs: {
		clientID: getenv("GOOGLE_CLIENT_ID"),
		clientSecret: getenv("GOOGLE_CLIENT_SECRET")
	},
	authenticateArgs: {
		scope: ["profile", "email"]
	}
});