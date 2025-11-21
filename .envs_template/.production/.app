# DataBase Variables
CC_DATABASE_HOST=db
CC_DATABASE_PORT=5432
CC_DATABASE_NAME=postgres
CC_DATABASE_USERNAME=ccadmin
CC_DATABASE_PASSWORD=HelikarLab@aZZnAmtz

# Web Variables
CC_WEB_HOST=web
CC_WEB_PORT=5003
CC_ENVIRONMENT=production

# App mail configure
CC_SMTP_HOST=smtp.gmail.com
CC_SMTP_PORT=587
CC_SMTP_SSL=false
CC_SMTP_AUTH=true
CC_SMTP_AUTH_USER=modeliteducation@gmail.com
CC_SMTP_AUTH_PASSWORD=xxxx-xxxx-xxxx
CC_SMTP_DEBUG=true

CC_AUTHORITY_APPROVAL_ADDRESS=thelikar2@unl.edu,sloecker2@unl.edu
CC_FROM_ADDRESS=modeliteducation@gmail.com
CC_SMTP_TIMEOUT=4000

CC_HEADER_LOGO_IMAGE=https://cellcollective.org/assets/img/logo/base-title-inverse.png

#DomainProperties configure
CC_DOMAIN_RESEARCH=<<CC_URL_PREFIX(research)>>
CC_DOMAIN_LEARN=<<CC_URL_PREFIX(learn)>>
CC_DOMAIN_TEACH=<<CC_URL_PREFIX(teach)>>
CC_DOMAIN_API=<<CC_URL_PREFIX()>>/web/_api/

CC_ADMIN_EMAIL_ADDRESS=thelikar2@unl.edu
CC_USER_REGISTRATION_NOTIFICATION_DELAY_IN_MINUTE=60

# For large-memory systems
# CC_APP_JAVA_OPTS=-Xss4m -Xmx16g -XX:+UseConcMarkSweepGC

# For low-memory systems
CC_APP_JAVA_OPTS=-XX:+UseG1GC -XX:MaxRAMFraction=2 -Xms256m -Xss512k

# CCBooleanAnalysis
CC_BOOLEAN_URL=http://ccba:5023