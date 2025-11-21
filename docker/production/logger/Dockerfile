FROM golang:alpine AS build
RUN apk add git
WORKDIR /app
RUN mkdir /data
COPY ./src ./
RUN go build -o /tmp/http-server

FROM alpine:edge
COPY --from=build /tmp/http-server /sbin/http-server
CMD /sbin/http-server
ADD ./templates /templates
EXPOSE 8085