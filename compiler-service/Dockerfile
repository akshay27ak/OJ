FROM node:22-alpine
WORKDIR /app

RUN apk update && apk add --no-cache g++ openjdk21 python3 py3-pip

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
