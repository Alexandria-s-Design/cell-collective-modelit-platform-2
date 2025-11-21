#!/usr/bin/env sh
set -e

REQUIRED_VARS="APP_DOMAIN APP_DOMAIN_TEACH APP_DOMAIN_LEARN"

for VAR in $REQUIRED_VARS; do
  if [ -z "$(eval echo \$$VAR)" ]; then
    echo "ERROR: Environment variable '$VAR' is not set!"
    exit 1
  fi
done

echo "+ All required environment variables are set."

# Replace env vars in template and output to traefik.yml
envsubst < /etc/traefik/traefik.temp.yml > /etc/traefik/traefik.yml

# Run Traefik
exec traefik