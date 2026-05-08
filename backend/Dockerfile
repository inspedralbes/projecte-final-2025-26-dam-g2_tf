FROM node:24.15.0
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8088
CMD ["node", "server.js"]