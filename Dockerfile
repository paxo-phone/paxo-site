ARG NODE_IMAGE=node:20-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./yarn.lock ./
RUN yarn install
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build --production

FROM base AS production

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV DRIVE_DISK=local
ENV SESSION_DRIVER=cookie
ENV CACHE_VIEWS=true
# To make it work out of the box, should be changed in production
ENV DB_CONNECTION=sqlite
ENV APP_KEY=2y0GyEz7jdzyZsFum6-jQ7Lu7Or1fmUE

COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./yarn.lock ./
RUN yarn install --production
COPY --chown=node:node --from=build /app/build .
COPY --chown=node:node production.sh ./
EXPOSE 80
CMD [ "dumb-init", "sh", "production.sh" ]
