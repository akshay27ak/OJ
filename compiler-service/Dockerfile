FROM node:22-alpine
WORKDIR /app
RUN apk update && apk add --no-cache g++ openjdk21 python3 py3-pip
COPY . .
RUN npm install
EXPOSE 8000
CMD ["node","index.js"]