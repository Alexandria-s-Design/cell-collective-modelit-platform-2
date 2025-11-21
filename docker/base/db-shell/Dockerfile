FROM python:3.7.15-slim

RUN apt update -qy && \
    apt upgrade -qy && \
    apt install gcc libpq-dev python-dev -qy

RUN pip install pgcli

COPY ./entrypoint /entrypoint
RUN sed -i 's/\r//' /entrypoint \
	&& chmod +x /entrypoint

ENTRYPOINT ["/entrypoint"]