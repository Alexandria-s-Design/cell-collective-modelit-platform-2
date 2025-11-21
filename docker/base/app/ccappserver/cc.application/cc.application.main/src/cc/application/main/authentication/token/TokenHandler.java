/**
 * 
 */
package cc.application.main.authentication.token;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import cc.application.main.authentication.CCUserDetailsService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * @author Bryan Kowal
 *
 */
public class TokenHandler {

	private final String secret;

	private final UserDetailsService userDetailsService;

	public TokenHandler(String secret, UserDetailsService userDetailsService) {
		this.secret = secret;
		this.userDetailsService = userDetailsService;
	}

	public UserDetails parseUserFromToken(String accessToken) {
		try {
			if (accessToken != null && accessToken.startsWith("Basic ")) {
					String base64Credentials = accessToken.substring(6).trim();
					byte[] decodedBytes = Base64.getDecoder().decode(base64Credentials);
					String decodedString = new String(decodedBytes, StandardCharsets.UTF_8);
					String[] credentials = decodedString.split(":", 2);
					if (credentials.length == 2) {
							String userId = credentials[0];
							String userEmail = credentials[1];
							System.out.println("Connecting user "+String.valueOf(userId)+" by Token: "+base64Credentials);
							return ((CCUserDetailsService) this.userDetailsService).loadUserByUsername(userEmail);
					} else {
							final String errorMessage = "Invalid Basic Authorization header format";
							System.out.println(errorMessage);
							throw new IllegalArgumentException(errorMessage);
					}
			}
			return null;
		} catch (Throwable e) {
			return null;
		}
	}

	public String createTokenForUser(UserDetails userDetails) {
		return Jwts.builder().setSubject(userDetails.getUsername()).signWith(SignatureAlgorithm.HS512, secret)
				.compact();
	}
}