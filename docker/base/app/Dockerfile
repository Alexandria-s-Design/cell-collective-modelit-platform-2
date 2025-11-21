#FROM openjdk:8-jdk-alpine AS build
FROM eclipse-temurin:8-jdk-alpine  AS build

ENV GRADLE_HOME=/opt/gradle \
	GRADLE_VERSION=2.14.1

ARG GRADLE_DOWNLOAD_SHA256=cfc61eda71f2d12a572822644ce13d2919407595c2aec3e3566d2aab6f97ef39
RUN set -o errexit -o nounset \
	&& echo "Installing dependencies" \
	&& apk update \
	&& apk add --no-cache \
		bash \
		libstdc++ \
	\
	&& echo "Downloading Gradle" \
	&& wget -qO gradle.zip "https://github.com/cellcollective/gradle-dist/blob/main/gradle-${GRADLE_VERSION}-bin.zip?raw=true" \
	\
	&& echo "Checking download hash" \
	&& echo "${GRADLE_DOWNLOAD_SHA256} *gradle.zip" | sha256sum -c - \
	\
	&& echo "Installing Gradle" \
	&& unzip gradle.zip \
	&& rm gradle.zip \
	&& mkdir -p /opt \
	&& mv "gradle-${GRADLE_VERSION}" "${GRADLE_HOME}/" \
	&& ln -s "${GRADLE_HOME}/bin/gradle" /usr/bin/gradle \
	\
	&& echo "Testing Gradle installation" \
	&& gradle --version

COPY ./ccappserver /ccappserver

RUN gradle build -p /ccappserver/cc.application

# FROM openjdk:8-jdk-alpine
FROM eclipse-temurin:8-jdk-alpine

ENV CC_ROOT_DIR=/app

RUN set -o errexit -o nounset \
	&& echo "Installing dependencies" \
	&& apk update \
	&& apk add --no-cache \
		bash \
		curl \
	\
	&& echo "Adding user and group" \
	&& addgroup -S app \
	&& adduser -S -G app app

WORKDIR /app

COPY --from=build /ccappserver/cc.application/cc.application.main/build/libs/app.jar /app/app.jar
COPY ./_configs/jdbc.properties /app/conf/jdbc.properties
COPY ./ccappserver/cc.application/deploy.server/app/conf/server-logback.xml /app/conf/server-logback.xml
COPY ./ccappserver/cc.application/deploy.server/app/conf/simulation-config.xml /app/conf/simulation-config.xml

COPY ./start /start
RUN sed -i 's/\r//' /start \
	&& chmod +x /start \
	&& chown app /start

COPY ./manage /manage

RUN chmod +x /manage/* \
    && mv /manage/* /usr/local/bin \
    && rmdir /manage

RUN mkdir /app/data /app/data_export /app/export /app/import /backups

RUN chown -R app /app && \
	chown -R app /backups

USER app

EXPOSE 8080 5005
