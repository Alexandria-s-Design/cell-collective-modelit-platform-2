#!/bin/bash

BINDIR=/usr/local/bin
REPO=$HOME/cellcollective
BRANCH=master

USER=$(whoami)

echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

echo "ModelIt! Installer Script..."

echo "Updating System..."
sudo apt update
sudo apt -y upgrade

echo "Installing System Dependencies..."
sudo apt install -y \
	git \
	ca-certificates \
    	curl \
    	gnupg \
    	lsb-release \
	python3-pip \
	nginx \
	certbot \
	python3-certbot-nginx \
	htop \
	openssh-server \
	fail2ban

sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

if [[ ! $(which docker) ]]; then
	echo "Installing Docker..."

	sudo mkdir -p /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

	echo \
  	"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  	$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

	sudo apt-get update
	sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

	sudo usermod -aG docker $USER
	exec su -l $USER
else
	echo "Docker already exists."
fi

if [[ ! -f $BINDIR/python ]]; then
	echo "Symlinking python..."
	sudo ln -s /usr/bin/python3 $BINDIR/python
fi

if [[ ! -f $BINDIR/pip ]]; then
	echo "Symlinking pip..."
	sudo ln -s /usr/bin/pip3 $BINDIR/pip
	echo "export PATH=$HOME/.local/bin:$PATH" >> $HOME/.bashrc
fi

if [[ ! $(which docker-compose) ]]; then
	echo "Installing docker-compose..."
	pip install docker-compose
else
	echo "docker-compose already exists."
fi

if [[ ! -d $REPO ]]; then
	git clone https://oauth2:$GITLAB_TOKEN@gitlab.com/unebraska/lagbh/modelit.git --branch $BRANCH $REPO
else
	echo "$REPO already exists."
fi

cd $REPO

export DOCKER_BUILDKIT=1

echo "Allowing to write in the Docker volumes"
PATH_DOCKER_APP_VOL="/var/lib/docker"
if [ -d "$PATH_DOCKER_APP_VOL" ]; then 
  sudo chmod -R g+w $PATH_DOCKER_APP_VOL"/volumes/cellcollective_production_app_data"
  echo "Allowed to write into the folder "$PATH_DOCKER_APP_VOL"/volumes/cellcollective_production_app_data"
fi

echo "Installing ModelIt!..."

CC_ENVIRONMENT=production ./ccman init-env

DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILDKIT=1 CC_ENVIRONMENT=production ./ccman "up -d --build --force-recreate --always-recreate-deps --remove-orphans"

