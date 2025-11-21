/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;

import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Bryan Kowal
 */
@Controller
public class RedirectController {

	@RequestMapping("")
	public void root(ServletResponse res) throws IOException {
		HttpServletResponse response = (HttpServletResponse) res;
		response.sendRedirect("http://cellcollective.org");
	}
}