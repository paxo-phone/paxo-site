![logo](https://github.com/paxo-phone/paxo-site/assets/45568523/4f1ece58-91e2-4954-9844-d275ed7b54ae)

# Paxo site

- [Build the docker image](#build-the-docker-image)
- [Running in a dev environment](#running-in-a-dev-environment)
- [Environment variables](#environment-variables)

## Build the docker image
Build everything with this command:
```sh
docker build -t ghcr.io/paxo-phone/paxo-site .
```
Then run it:
```sh
docker exec -d ghcr.io/paxo-phone/paxo-site
```
Don't forget to add all your environment variables !

## Running in a dev environment
> ℹ️ The project will consider that you have set `NODE_ENV` to `development`.

You must prepare the environement first:
```sh
yarn install
node ace migration:run
cp .env.example .env # Consider editing it before launching
```

Then you can launch the website with a watchman:
```sh
yarn run dev
```

## Environment variables
|Variable name|Description|
|-------------|--------------------------------------------|
|`NODE_ENV`|Set to `developement` or `production`.|
Please complete
