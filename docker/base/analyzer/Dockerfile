# Dockerfile
FROM its-registry.unl.edu/helikarlab/cc_analysis:latest

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="${PYTHONPATH}:/app"
ENV COMO_BRANCH="main"

COPY . /app
COPY requirements.txt requirements.txt
COPY requirements_como.txt requirements_como.txt
COPY requirements_como_deps.txt requirements_como_deps.txt
WORKDIR /app

RUN chmod +x /app/manage/unittest && cp /app/manage/unittest /usr/local/bin/test && \
    echo "Installing dependencies..." && \
    pip install -r requirements.txt

RUN pip install --no-deps -r requirements_como.txt
RUN pip install -r requirements_como_deps.txt