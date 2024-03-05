FROM node:21-alpine3.19 AS builder

COPY . /sbw
WORKDIR /sbw
ENV HOME=/sbw

RUN yarn install &&\
    yarn clean build


FROM node:21-alpine3.19

USER 1000:1000
WORKDIR /sbw
ENV HOME=/sbw

RUN chown 1000:1000 /sbw

COPY --from=builder --chown=1000:1000 /sbw/node_modules /sbw/node_modules
COPY --from=builder --chown=1000:1000 /sbw/.next.dev /sbw/.next.dev
COPY --from=builder --chown=1000:1000 /sbw/.next.prod /sbw/.next.prod
COPY --from=builder --chown=1000:1000 /sbw/src /sbw/src
COPY --from=builder --chown=1000:1000 /sbw/app.env.* /sbw/app.env /sbw/
COPY --from=builder --chown=1000:1000 /sbw/next.config.mjs /sbw/
COPY --from=builder --chown=1000:1000 /sbw/package.json /sbw/
COPY --from=builder --chown=1000:1000 /sbw/tsconfig.wss.json /sbw/tsconfig.json /sbw/
ENV PATH=/sbw/node_modules/.bin:$PATH