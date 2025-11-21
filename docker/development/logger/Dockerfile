FROM golang:alpine
RUN apk add git curl

RUN go install github.com/air-verse/air@latest

WORKDIR /app

RUN mkdir /data
COPY .air.toml /usr/local/etc/
ADD ./templates /templates

EXPOSE 8085
CMD ["air", "-c", "/usr/local/etc/.air.toml"]