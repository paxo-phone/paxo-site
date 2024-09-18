![logo](https://github.com/paxo-phone/paxo-site/assets/45568523/4f1ece58-91e2-4954-9844-d275ed7b54ae)

# Paxo site

- [Build the docker image](#build-the-docker-image)
- [Running in a dev environment](#running-in-a-dev-environment)
- [Environment variables](#environment-variables)
- [Contact](#contact)
- [See More](#see-more)
- [Contributors](#contributors)

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
mkdir tmp
cp .env.example .env # Consider editing it before launching
node ace migration:run
```

Then you can launch the website with a watchman:
```sh
yarn run dev
```

## Environment variables
|Variable name|Description|
|-------------|--------------------------------------------|
|`NODE_ENV`|Set to `developement` or `production`.|
|`PORT`|Port to listen on.|
|`HOST`|Host to listen on. Should be `0.0.0.0`|
|`APP_KEY`|See AdonisJS documentation|
|`DRIVE_DISK`||
|`SESSION_DRIVER`||
|`CACHE_VIEWS`||
|`DB_CONNECTION`|See supported databases in AdonisJS docs|
|`MYSQL_*`|Configuration for MySQL, required if `DB_CONNECTION=mysql`. See AdonisJS docs|
|`SMTP_*`|SMTP server configuration, see AdonisJS docs. Not used yet|
|`ACCESS_ADDRESS`|URL where the server is reachable. Is used to build the Github redirect URI, and should not end with a `/`|

# Contact

You can contact us via our [Website](https://www.paxo.fr) or our [Discord](https://discord.com/invite/MpqbWr3pUG) server

# See more

See more on [paxo.fr](https://www.paxo.fr)

# Contributors 

<a href="https://github.com/paxo-phone/paxo-site/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=paxo-phone/paxo-site" />
</a>

