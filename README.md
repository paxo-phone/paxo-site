![logo](https://github.com/paxo-phone/paxo-site/assets/45568523/4f1ece58-91e2-4954-9844-d275ed7b54ae)

# Paxo site

- [Build the docker image](#build-the-docker-image)
- [Running in a dev environment](#running-in-a-dev-environment)
- [Environment variables](#environment-variables)
- [Contact](#contact)
- [See More](#see-more)
- [Contributors](#contributors)

## App structure

name/
├── manifest.json
├── icon.png
├── app.lua

- manifest.json is mandatory and gives the capabilities used by the app.
```
{
    "access": ["files", "files_root", "os", "gsm", "gui", "time"]
}
```
- icon.png is mandatory and must be 40x40

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
yarn add uuid
yarn add -D @types/uuid
yarn add extract-zip
yarn add fast-glob
npm install @octokit/rest @octokit/auth-app
mkdir tmp
mkdir tmp/apps
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
Please complete

# Contact

You can contact us via our [Website](https://www.paxo.fr) or our [Discord](https://discord.com/invite/MpqbWr3pUG) server

# See more

See more on [paxo.fr](https://www.paxo.fr)

# Contributors 

<a href="https://github.com/paxo-phone/paxo-site/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=paxo-phone/paxo-site" />
</a>

