/**
 * 
 */
package cc.application.main;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import cc.core.configuration.ConfigDeployException;
import cc.core.configuration.manager.CCFileManager;

/**
 * @author bkowal
 *
 */
@SpringBootApplication(exclude = { HibernateJpaAutoConfiguration.class, DataSourceAutoConfiguration.class,
		DataSourceTransactionManagerAutoConfiguration.class })
@ImportResource({ Application.CC_BEANS })
public class Application {
	private static final Logger logger = LoggerFactory.getLogger(Application.class);

	private static final String SPRING_BEAN_LOCATION = "classpath:spring/";

	private static final String CONFIG_SPRING_BEANS = SPRING_BEAN_LOCATION + "cc-configuration-beans.xml";

	protected static final String CC_BEANS = SPRING_BEAN_LOCATION + "cc-application-beans.xml";

	public static void main(String[] args) throws ConfigDeployException {
		verifyApplication();

		SpringApplication.run(Application.class, args);
	}

	private static void verifyApplication() throws ConfigDeployException {
		logger.info("Startup Date/Time is: {}.", CurrentVersion.getInstance().getStartupDate().getTime().toString());
		ClassPathXmlApplicationContext springContext = null;
		try {
			springContext = new ClassPathXmlApplicationContext(CONFIG_SPRING_BEANS);

			/*
			 * Verify that all required application directories exist.
			 */
			CCFileManager fileManager = springContext.getBean(CCFileManager.class);
			verifyRequiredApplicationDirectory(fileManager.getCcDataPath());
		} finally {
			if (springContext != null) {
				springContext.close();
			}
		}
	}

	private static void verifyRequiredApplicationDirectory(final Path path) {
		if (Files.exists(path) == false) {
			logger.info("Creating required application directory {} ...", path.toString());
			try {
				Files.createDirectories(path);
			} catch (IOException e) {
				throw new RuntimeException("Failed to create required application directory: " + path.toString() + "!",
						e);
			}
			logger.info("Successfully created required application directory {}.", path.toString());
		}
	}
}