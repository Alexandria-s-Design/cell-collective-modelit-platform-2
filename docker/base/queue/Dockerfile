FROM redis:alpine

RUN set -o errexit -o nounset \
	&& echo "Installing dependencies" \
	&& apk update \
	&& apk add --no-cache \
		bash

COPY ./manage /manage

RUN chmod +x /manage/* \
    && mv /manage/* /usr/local/bin \
    && rmdir /manage