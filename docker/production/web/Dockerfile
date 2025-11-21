FROM nikolaik/python-nodejs:python3.10-nodejs12

ARG CC_GIT_COMMIT
ARG CC_GIT_BRANCH
ARG CC_GIT_TAG

ENV GLPK_VERSION="4.65"
ENV CC_GIT_COMMIT=$CC_GIT_COMMIT
ENV CC_GIT_BRANCH=$CC_GIT_BRANCH
ENV CC_GIT_TAG=$CC_GIT_TAG
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

RUN set -o errexit -o nounset \
	&& echo "Installing dependencies" \
	&& curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
	# If base is Debian buster (EOL), rewrite sources to archive and disable date checks
	&& if grep -q 'buster' /etc/apt/sources.list; then \
				sed -i -e 's|deb.debian.org/debian|archive.debian.org/debian|g' \
							-e 's|security.debian.org/debian-security|archive.debian.org/debian-security|g' /etc/apt/sources.list && \
				printf 'Acquire::Check-Valid-Until "false";\n' > /etc/apt/apt.conf.d/99no-check-valid ; \
			fi \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends \
				bash \
				netcat-openbsd \
				libncurses5 \
				libforms-dev \
	&& rm -rf /var/lib/apt/lists/* \
	&& echo "Creating empty node_modules folder" \
	&& mkdir -p /app/node_modules \
	&& echo "Creating symbolic links" \
	&& [ ! -e /usr/lib/x86_64-linux-gnu/libform.so.5 ] && ln -s /usr/lib/x86_64-linux-gnu/libform.so.6 /usr/lib/x86_64-linux-gnu/libform.so.5 || echo "Symbolic link /usr/lib/x86_64-linux-gnu/libform.so.5 already exists" \
	&& [ ! -e /lib/x86_64-linux-gnu/libtinfo.so.5 ] && ln -s /lib/x86_64-linux-gnu/libtinfo.so.6 /lib/x86_64-linux-gnu/libtinfo.so.5 || echo "Symbolic link /lib/x86_64-linux-gnu/libtinfo.so.5 already exists" \
	&& [ ! -e /lib/x86_64-linux-gnu/libncurses.so.5 ] && ln -s /lib/x86_64-linux-gnu/libncurses.so.6 /lib/x86_64-linux-gnu/libncurses.so.5 || echo "Symbolic link /lib/x86_64-linux-gnu/libncurses.so.5 already exists"

WORKDIR /app

COPY ./scripts /app/scripts

RUN cat /app/scripts/translate/translator/requirements.txt | xargs -t -n1 -P9 pip install 
RUN pip3 install -e /app/scripts/translate/translator

# DISABLED: moved to analysis
# COPY ./ccpy /app/ccpy
# RUN pip3 install -e /app/ccpy


COPY ./package.json /app/package.json
COPY ./yarn.lock    /app/yarn.lock


RUN yarn install --pure-lockfile --network-timeout 100000

COPY . /app

COPY ./.envs/.production/.web /app/.env

# RUN yarn build:production

COPY ./docker/base/web/entrypoint /entrypoint
RUN sed -i 's/\r//' /entrypoint \
	&& chmod +x /entrypoint

COPY ./docker/base/web/start /start
RUN sed -i 's/\r//' /start \
	&& chmod +x /start

EXPOSE 5003 5001

ENTRYPOINT ["/entrypoint"]
