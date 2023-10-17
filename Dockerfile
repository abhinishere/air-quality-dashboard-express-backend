FROM node:19-alpine3.15 AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM node:19-alpine3.15 AS final
WORKDIR /app
COPY --from=builder ./app/dist ./dist
COPY package.json .
COPY package-lock.json .
RUN npm install --production
CMD [ "npm", "start" ]