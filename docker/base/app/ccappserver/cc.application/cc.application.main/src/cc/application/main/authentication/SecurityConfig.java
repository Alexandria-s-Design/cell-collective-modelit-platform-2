/**
 * 
 */
package cc.application.main.authentication;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;

import cc.application.main.ClientRequestLoggingFilter;
import cc.application.main.authentication.token.CCJSONTokenSessionStrategy;
import cc.application.main.authentication.token.StatelessAuthenticationFilter;
import cc.application.main.authentication.token.TokenAuthenticationService;
import cc.application.main.authentication.token.TokenHandler;

/**
 * @author bkowal
 *
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter implements InitializingBean {

	@Autowired
	private CCUserDetailsService userDetailsService;

	private TokenHandler tokenHandler;

	private TokenAuthenticationService tokenAuthenticationService;

	public SecurityConfig() {
		super(true);
	}

	public void afterPropertiesSet() throws Exception {
		tokenHandler = new TokenHandler("TEST", userDetailsService);
		this.tokenAuthenticationService = new TokenAuthenticationService(this.tokenHandler);
	}

	@Override
	public void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(this.userDetailsService).passwordEncoder(new CCCustomPasswordEncoder());
	}

	@Override
	public void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests().antMatchers("/*").authenticated().and().formLogin()
				.successHandler(new CCAuthenticationSuccessHandler(this.userDetailsService.getUserDao()))
				.failureHandler(new CCAuthenticationFailureHandler()).and().logout().and().authorizeRequests()
				.antMatchers("/*").permitAll().and()
				.addFilterBefore(new StatelessAuthenticationFilter(tokenAuthenticationService),
						UsernamePasswordAuthenticationFilter.class)
				.addFilterAfter(new ClientRequestLoggingFilter(), UsernamePasswordAuthenticationFilter.class).csrf()
				.disable().setSharedObject(SessionAuthenticationStrategy.class,
						new CCJSONTokenSessionStrategy(this.tokenHandler));
	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}
}