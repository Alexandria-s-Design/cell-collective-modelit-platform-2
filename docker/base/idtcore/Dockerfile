# Dockerfile
FROM python:3.11
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH="${PYTHONPATH}:/app"
RUN apt-get update -qq
RUN  apt-get install -y --no-install-recommends \
		software-properties-common \
		dirmngr \
		git \
		libncurses5

COPY . /app

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

RUN git config --global http.version HTTP/1.1
RUN git config --global https.postBuffer 157286400