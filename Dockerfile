FROM node:20-alpine as build

ARG TRUST_ORIGIN

WORKDIR /app

COPY . .

RUN  yarn --frozen-lockfile \
  && TRUST_ORIGIN=$TRUST_ORIGIN yarn build


FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist

RUN mv ./dist/index.js ./index.js

RUN chmod -R 777 /app

CMD ["node", "index.js"]
