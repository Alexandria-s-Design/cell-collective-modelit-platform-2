FROM postgres:16.4-alpine

COPY ./manage /manage

RUN chmod +x /manage/* \
    && mv /manage/* /usr/local/bin \
    && rmdir /manage

COPY ./bootstrap /docker-entrypoint-initdb.d