FROM node:8.11-alpine

MAINTAINER Bob Liu <Bobliu0909@gmail.com>

ADD dist /humpback-web
ADD package.json /humpback-web/package.json
ADD package-lock.json /humpback-web/package-lock.json

WORKDIR /humpback-web

RUN npm config set registry https://registry.npm.taobao.org
RUN npm config set strict-ssl false
RUN npm install --production

CMD ["node", "index.js"]
