FROM node:10

WORKDIR /usr/src/app/socketio

COPY package*.json ./

RUN npm install

EXPOSE 3008

CMD ["npm", "start"]
