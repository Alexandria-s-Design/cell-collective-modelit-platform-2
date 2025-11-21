FROM alpine

RUN set -o errexit -o nounset \
	&& echo "Installing dependencies" \
	&& apk update \
	&& apk add --no-cache \
		bash \
		postgresql-client

ENV CC_PROJECT_NAME=$CC_PROJECT_NAME
ENV HOST_HOSTNAME=$HOST_HOSTNAME

# RUN apt-get update \
# && (echo y | apt-get install \
#      gnupg2 \
#      wget)

# RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
# RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list

# #install dependencies
# RUN apt-get update \
#  && (echo y | apt-get install \
#       openssh-server \
#       cron \
#       postgresql-client-11 \
#   ) \
#  && apt-get clean \
#  && rm -rf /var/lib/apt/lists/

# COPY ./config/crontab/root /root/crontab

RUN touch /var/log/cron.log

# RUN crontab /root/crontab

COPY ./manage /manage

RUN chmod +x /manage/* \
    && mv /manage/* /usr/local/bin \
    && rmdir /manage

# COPY ./docker/production/backup/scripts /scripts
# RUN chmod +x /scripts/* /scripts/backups/*

CMD /usr/sbin/crond -f -l 2
