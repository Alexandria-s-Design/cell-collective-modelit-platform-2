/**
 * 
 */
package cc.application.main.controller;

import javax.servlet.ServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author Bryan Kowal
 */
@Controller
@RequestMapping("/support")
public class SupportFeedbackController extends AbstractController {

	@RequestMapping(value = "/log", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
	public @ResponseBody ResponseEntity<Object> log(@RequestBody String data, ServletRequest req) {
		if (data == null || data.trim().isEmpty()) {
			return new ResponseEntity<Object>("No Data to Log!", HttpStatus.NO_CONTENT);
		}

		logger.info(data.trim());

		return new ResponseEntity<Object>("Data Successfully Logged.", HttpStatus.OK);
	}
}