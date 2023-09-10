# Paxo-site
This repository holds the source code of the [paxo.fr](https://paxo.fr) website, which is built with [AdonisJS](https://adonisjs.com).

## Build & run
### Local development
Clone the repo:
```sh
git clone https://github.com/paxo-phone/paxo-site
cd paxo-site
```

Prepare the environnement:
```sh
yarn install
mkdir tmp
node ace migration:run
```

You can also set the default env variables:
```sh
set -a
source .env.example
set +a
```

Then run the server in watch mode:
```sh
yarn run dev
```

### Docker building (production)
The image can be built entirely from Docker:
```sh
docker build -t paxo-site .
```

Then you can run it:
```sh
docker exec -itd -p 80:80 paxo-site
```
*(Don't forget to add the environment variables)*

## Environment variables
| Name | Description | Default |
|-|-|-|
| `PORT` | Port where to expose the server | `3333` |
| `HOST` | Host where to expose the server | `0.0.0.0` |
| `APP_KEY` | String used for security keys generation. You can generate it with `node ace generate:key` | *Should be generated* |
| `DRIVE_DISK` || `local` |
| `SESSION_DRIVER` || `cookie` |
| `CACHE_VIEWS` || `false` |
| `DB_CONNECTION` | Database type | `sqlite` |
| `MYSQL_HOST` | MySQL/MariaDB Host | `localhost` |
| `MYSQL_PORT` | MySQL/MariaDB Port | `3306` |
| `MYSQL_USER` | MySQL/MariaDB Creditentials ||
| `MYSQL_PASSWORD` | MySQL/MariaDB Creditentials ||
| `MYSQL_DB_NAME` | MySQL/MariaDB Database name ||
| `SMTP_HOST` | SMTP mail server Host | `localhost` |
| `SMTP_PORT` | SMTP mail server Port | `465` |
| `SMTP_USERNAME` | SMTP mail server creditentials ||
| `SMTP_PASSWORD` | SMTP mail server creditentials ||
`NODE_ENV` should also be set