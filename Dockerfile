FROM node:8.11-alpine

LABEL author="Bob Liu" email="Bobliu0909@gmail.com"

ADD humpback-web /humpback-web

WORKDIR /humpback-web

EXPOSE 80

CMD ["node", "index.js"]
