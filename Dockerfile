FROM node:18-slim

LABEL "com.github.actions.name"="commit-rewarder"
LABEL "com.github.actions.description"="Reward contributors with by high quality commit."

ENV NODE_ENV="production"
WORKDIR /usr/src/app
COPY . .
ENTRYPOINT [ "node", "dist/index.js" ]
