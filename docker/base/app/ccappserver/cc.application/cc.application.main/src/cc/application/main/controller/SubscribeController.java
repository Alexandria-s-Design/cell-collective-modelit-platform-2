/**
 * 
 */
package cc.application.main.controller;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletRequest;

import com.stripe.Stripe;
import com.stripe.exception.APIConnectionException;
import com.stripe.exception.APIException;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.model.Charge;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import cc.application.main.configuration.DomainProperties;
import cc.common.data.TCCDomain.Domain;
import cc.common.data.user.UserSubscription;

// https://stripe.com/docs/api#errors
// https://stripe.com/docs/charges
// https://stripe.com/docs/checkout/tutorial

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/user")
public class SubscribeController extends AbstractController {

	private static final String PARAM_AMOUNT = "amount";

	private static final String PARAM_CURRENCY = "currency";

	private static final String PARAM_DESCRIPTION = "description";

	private static final String PARAM_SOURCE = "source";

	private static final String CURRENCY = "usd";

	private static final String DESCRIPTION = "ModelIt Subscription (Expires: %s)";

	private static final int EXPIRE_DAYS = 180;

	@Autowired
	private DomainProperties domainProperties;

	@RequestMapping(value = "/subscribe/purchase", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Object> subscribe(@RequestBody SubscribeRequest subscribeRequest, final ServletRequest req) {
		final Long userId = getAuthenticatedUserId();
		if (userId == null) {
			return new ResponseEntity<Object>("This method is only available to authenticated users.",
					HttpStatus.FORBIDDEN);
		}
		final Domain domain = this.getOrigin(req, userId);
		if (domain == null) {
			return new ResponseEntity<Object>("Request was made from an unrecognized origin.", HttpStatus.BAD_REQUEST);
		}

		if (domainProperties.getStripeAPIKey() == null) {
			return new ResponseEntity<Object>("Subscription Service has not been properly configured.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		Stripe.apiKey = domainProperties.getStripeAPIKey();

		/*
		 * If successful, determine when the subscription will expire.
		 */
		final Calendar currentDate = Calendar.getInstance();
		final Calendar expireDate = Calendar.getInstance();
		expireDate.setTimeInMillis(currentDate.getTimeInMillis());
		expireDate.add(Calendar.DATE, EXPIRE_DAYS);

		/*
		 * Attempt to submit the payment.
		 */
		final String description = String.format(DESCRIPTION, expireDate.toString());
		Map<String, Object> parameters = new HashMap<String, Object>();
		parameters.put(PARAM_AMOUNT, subscribeRequest.getAmount());
		parameters.put(PARAM_CURRENCY, CURRENCY);
		parameters.put(PARAM_DESCRIPTION, description);
		parameters.put(PARAM_SOURCE, subscribeRequest.getToken());

		Charge charge = null;
		try {
			charge = Charge.create(parameters);
		} catch (AuthenticationException | InvalidRequestException | APIConnectionException | CardException
				| APIException e) {
			return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

		/*
		 * Create the user subscription.
		 */
		UserSubscription userSubscription = new UserSubscription();
		userSubscription.setUserId(userId);
		userSubscription.setCreationDate(currentDate);
		userSubscription.setExpirationDate(expireDate);
		try {
			userDao.saveUserSubscription(userSubscription);
		} catch (Exception e) {
			return new ResponseEntity<Object>(
					"Failed to record the subscription. Please contact: support@cellcollective.org and reference charge id: "
							+ charge.getId() + ".",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		/*
		 * If we have reached this point, the subscription was successful.
		 */
		return new ResponseEntity<Object>(new SubscribeResponse(charge.getId(), expireDate), HttpStatus.OK);
	}
}