import Stripe from "stripe";

import { DEFAULT } from "../const"

const stripe = Stripe(DEFAULT.STRIPE_API_KEY_SANDBOX);

export default stripe;