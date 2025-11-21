FROM its-registry.unl.edu/helikarlab/pynode:latest

WORKDIR /app

COPY ./scripts /app/scripts

RUN pip3 install -r /app/scripts/translate/translator/requirements.txt
RUN pip3 install -e /app/scripts/translate/translator

COPY ./package.json /app/package.json
COPY ./yarn.lock    /app/yarn.lock

RUN yarn install --network-timeout 1000000 --pure-lockfile

COPY . /app

COPY ./.envs/.development/.web /app/.env

COPY ./docker/base/web/entrypoint /entrypoint
RUN sed -i 's/\r//' /entrypoint \
	&& chmod +x /entrypoint

COPY ./docker/base/web/start /start
RUN sed -i 's/\r//' /start \
	&& chmod +x /start

EXPOSE 5003 5001

ENTRYPOINT ["/entrypoint"]