FROM traefik:v2.2.11

# Install envsubst (from gettext)
RUN apk add --no-cache gettext

# Create ACME folder and set permissions
RUN mkdir -p /etc/traefik/acme \
    && touch /etc/traefik/acme/acme.json \
    && chmod 600 /etc/traefik/acme/acme.json

# Copy your template config
COPY ./traefik.yml /etc/traefik/traefik.temp.yml

# Copy startup script
COPY ./render-traefik.sh /usr/local/bin/render-traefik

RUN chmod +x /usr/local/bin/render-traefik

ENTRYPOINT ["/usr/local/bin/render-traefik"]
