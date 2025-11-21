# DataBase Variables
CC_DATABASE_HOST=db
CC_DATABASE_PORT=5432
CC_DATABASE_NAME=postgres
CC_DATABASE_USERNAME=postgres
CC_DATABASE_PASSWORD=postgres

# Web Variables
CC_WEB_HOST=web
CC_WEB_PORT=5003
CC_ENVIRONMENT=development


# Mail Configuration
CC_SMTP_HOST=mailhog
CC_SMTP_PORT=1025
CC_SMTP_AUTH=false
CC_AUTHORITY_APPROVAL_ADDRESS=hello.helikarlab@cellcollective.org
CC_FROM_ADDRESS=hello.helikarlab@cellcollective.org
CC_SMTP_TIMEOUT=4000
CC_SMTP_DEBUG=true

CC_HEADER_LOGO_IMAGE=https://cellcollective.org/assets/img/logo/base-title-inverse.png

CC_DOMAIN_RESEARCH=localhost:5003
CC_DOMAIN_LEARN=localhost:5003
CC_DOMAIN_TEACH=localhost:5003
CC_DOMAIN_API=localhost:5003/_api/

CC_ADMIN_EMAIL_ADDRESS=hello.helikarlab@cellcollective.org
CC_USER_REGISTRATION_NOTIFICATION_DELAY_IN_MINUTE=5

CC_APP_JAVA_OPTS=-Xms4g -Xmx4g -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005

# CCBooleanAnalysis
CC_BOOLEAN_URL=http://ccba:5023