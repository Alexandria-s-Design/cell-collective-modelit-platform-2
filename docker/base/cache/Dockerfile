FROM redislabs/rejson

RUN set -o errexit -o nounset \
	&& echo "Installing dependencies" \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends \
		bash

COPY ./manage /manage

RUN chmod +x /manage/* \
    && mv /manage/* /usr/local/bin \
    && rmdir /manage
