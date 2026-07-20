# Minodu

Monorepo containing all the minodu apps and services

## Deployment on raspberry pi

### Prerequisites

* setup ollama
```
# install ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:1b && ollama pull nomic-embed-text && ollama pull all-minilm:l6-v2
```

* edit and enable ollama service
```
# edit startup service file
sudo systemctl edit ollama.service

# Add these lines:
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
CPUAffinity=0 1 2

# then enable service
sudo systemctl enable ollama
```

* install other dependencies
```
# install docker
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo systemctl enable docker

# install git-lfs and get lfs files
sudo apt install git-lfs

# install npm and poetry
sudo apt install npm
sudo apt install python3-poetry

# install pyenv
curl https://pyenv.run | bash

# Add to your ~/.bashrc or ~/.zshrc
export PYENV_ROOT="$HOME/.pyenv"
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init - bash)"

pyenv install 3.12.11
```

### Run App

* create `.env` file in root folder and set password, rootpassword and secret key:
```
MYSQL_USER=minodu_user
MYSQL_PASSWORD=<password>
MYSQL_ROOT_PASSWORD=<rootpassword>
DB_NAME=minodu
JWT_SECRET_KEY=secret
FORUM_ADMIN_PASSWORD=<some_password>
ADMIN_PASSWORD=<admin_password>
ADMIN_PHONE=<90000000>
ENVIRONMENT=production
```

* install docker containers
```
# run this inside minodu repo folder
git lfs pull
npm install

# build and start services
sudo npm run docker:start

# set user right for data dir:
chown -R pi:pi data

# once the database is running, sync online database to local one and update embeddings
(cd tools/sync && poetry install)
npm run sync:database && npm run sync:rag
```

## Development

### Prerequesites

* install node and npm with `brew install node`
* install poetry with `brew install poetry`
* install nx with `npm install -g nx`
* install docker
* install python 3.12.x

#### Project specific requirements

* minodu-ai-services requirements:
    * install olama `curl -fsSL https://ollama.com/install.sh | sh` or on mac: `brew install ollama`
    * add olama to autostart: `sudo systemctl enable ollama` (or manually start ollama with `ollama serve`)
    * install models: `ollama pull llama3.2:1b && ollama pull nomic-embed-text && ollama pull all-minilm:l6-v2`
    * unzip vosk models with `(cd models/stt_models && unzip -o vosk-model-small-fr-0.22.zip && unzip -o vosk-model-small-en-us-0.15.zip)`in folder *apps/minodu-ai-services/minodu_ai_services*

### Setup
* create `.env` file in root folder and set these credentials:
```
MYSQL_USER=minodu_user
MYSQL_PASSWORD=password
MYSQL_ROOT_PASSWORD=rootpassword
JWT_SECRET_KEY=secret
ADMIN_PHONE=123456789
ADMIN_PASSWORD=admin_password
ENVIRONMENT=development
```
* run `npm install`
* run development docker container with `npm run docker:start` and stop with `npm run docker:stop`

### Run apps with

* install dependencies with `npx nx install <app>`
* run tests with `npx nx test <app>`
* servie with `npx nx serve <app>`

### NX Usage

```
# List projects with
npx nx show nx show projects

# install dependencies for specific project
npx nx install <project>

# Run a specific project
npx nx serve <project>

# test a single poroject
npx nx test <project>

# Run tests across all projects
npx nx run-many --target=test --all

# See project dependency graph
npx nx graph

# add python project
npx nx g @nxlv/python:poetry-project <name> --directory=apps/<name> --projectType=application

# add node project
npx nx g @nx/node:application <name> --directory=apps/<name>
```

## Update Procedure

* run `(cd tools/sync && poetry install)` to install dependencies
* run `sync:update_backup` to create new backup file on digital ocean
* run `sync:database`to fetch and sync data locally
* run `sync:rag`to update embeddings

or run all three steps with

* `npm run sync`

## Update docker prebuild stages on ghcr

* change Dockerfile.base to include new dependencies
* login `echo "YOUR_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin`
* run `docker build -f Dockerfile.base -t ghcr.io/minodulcn/minodu-python-base:latest .`
* run `docker push ghcr.io/minodulcn/minodu-python-base:latest`
