# Use the official Node.js image from the Docker Hub
FROM node:18

WORKDIR /client

COPY package*.json ./

# RUN npm install --production

COPY . /client/

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
