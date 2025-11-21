FROM  achillesrasquinha/cobrapy

LABEL maintainer=achillesrasquinha@gmail.com

ENV CCPY_PATH=/usr/local/src/ccpy

RUN apk add --no-cache \
        bash \
        git \
    && mkdir -p $CCPY_PATH

COPY . $CCPY_PATH
COPY ./docker/entrypoint.sh /entrypoint.sh

RUN pip install $CCPY_PATH

WORKDIR $CCPY_PATH

ENTRYPOINT ["/entrypoint.sh"]

CMD ["ccpy"]