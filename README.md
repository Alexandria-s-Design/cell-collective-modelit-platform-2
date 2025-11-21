# Cell Collective Model-It

## Table of Contents
* [Installation](#installation)

### Installation - use our Wiki page https://git.unl.edu/helikarlab/cellcollective/-/wikis/Home/2.-Installation

First, you need to have [Docker](https://docker.com) installed onto your system.

Then, clone the repository using `git`

```
$ git clone https://gitlab.com/unebraska/lagbh/modelit.git
```

To initialize CC, simply

```
$ ./ccman init
```

* Sync your models to the database...

```
$ ./ccman db sync
```

* Perform any migrations

```
$ ./ccman db migrate
```



* Get GitLab token and username then,

* Clone the repository

```sh
$ git clone https://oauth:"token"@gitlab.com/unebraska/lagbh/modelit.git
```

*  Fetch Origin

```sh
$ git fetch origin
```

* Checkout origin/hotfix and develop

```sh
$ git checkout --track origin/hotfix
$ git checkout --track origin/develop
```

**Note:** For linux user, if you see error like ERROR: Couldn't connect to Docker daemon at http+docker://localunixsocket - is it running? or something similar. Try:

```sh
# Check if docker is in groups
$ groups
# If not, add docker
$ sudo usermod -aG docker $USER
# Reboot system 
$ reboot
```


* Geerate environment files ( must have python3 installed on the machine first )

```sh
$ cd ./scripts ; python3 ./genEnvFiles.py ; cd ..
```


* In case you have previous cellcollective development docker containers, stop all of them

```sh
$ ./ccman stop
```


* Build the development environment

```sh
$ ./ccman build --no-cache
```

* Start the `db` container

```sh
$ ./ccman up -d db

# In the development environment, change the PostgreSQL password
./ccman exec db shell
ALTER USER postgres WITH PASSWORD 'postgres'; \q
./ccman restart
```

* Installing User Management System (UMS)

```sh
$ ./ccman up -d dbccapp
$ ./ccman up -d ccapp
# Migrations are ready to be run
```

* Restore a seed database

```sh
# Download the seed database from http://static.cellcollective.org
$ curl -fsSL "http://static.cellcollective.org/db.dump.gz" -o ~/db-dev.dump.gz
# Copy the seed database into your `db` container
$ docker cp ~/db-dev.dump.gz "$(./ccman ps -q db)":/db.dump.gz
# Restore the dump into the database
$ ./ccman exec db restore /db.dump.gz
```
* Start the `web` container

```sh
$ ./ccman up -d web
```

* Restart all services

```sh
$ ./ccman restart
```

* Migrate the database
```sh
# Once ccman is up, after the databate is restored, run
$ ./ccman web sh
# Migrate the database
$ yarn run db:migrate
```

* Migrate the User Management System (UMS) database
```sh
./ccman ccapp migrate
./ccman ccapp seed_users
```

* Restart all services

```sh
$ ./ccman restart
```


### Start working on your own issue
```sh
$ git checkout develop # >>develop<< in case if this issue is FEATURE, >>hotfix<< if it is HOTFIX
$ git pull # so you are sure that your branch is up to date with upstream
$ git checkout -b ISSUE_NUMBER # create a new branch with the issue number of the issue
```

### Save your work
```sh
$ git push origin ISSUE_NUMBER # issue number must match your branch name
```

### Continue working on your own issue
if you DO NOT have it in your local branch
```sh
$ git checkout --track origin/ISSUE_NUMBER
```
if you DO have it in your local branch
```sh
$ git checkout ISSUE_NUMBER
```

### How to Release

```
$ git pull
$ CC_ENVIRONMENT=production ./ccman up -d --no-deps --force-recreate --always-recreate-dep --build --remove-orphans web app proxy
$ docker system prune
```

The last command, `docker system prune`, cleans out previous stopped and unused containers and frees up a very significant amount of space (usually multiple gigabytes).
It should always be run after a release.


### Unit Tests

If you're not sure that Jest is installed in the WEB container, then you need to run:

```
$ ./ccman up -d --build web
```
#### Run tests

We should guarantee that our tests are properly cleaned up and running smoothly.

```
# Basic
$ ./ccman web yarn test:spec
$ ./ccman web yarn test:spec tests/spec/TEST_NAME.spec.js

# Generate reports (Good to analysis)
$ ./ccman web yarn test:spec --coverage

# Potentially keeping Jest from exiting
$ ./ccman web yarn test:spec --detectOpenHandles
```

#### Run Python tests

```
# Basic
$ ./ccman exec web pytest
$ ./ccman exec web pytest ccpy/tests/TEST_NAME.py
```

### Fix ERR! stack Error: ENOSPC: no space left on device

```
$ ./ccman web sh
$ rm -rf ~/.cache/node-gyp
```

### Fix error Command "husky-run" not found

```bash
npx husky install
```
