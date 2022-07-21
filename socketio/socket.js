const { existsSync, readFileSync } = require("fs");
const { createServer: createHttpServer } = require("http");
const { createServer: createHttpsServer } = require("https");
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const ioRedis = require('ioredis');

dotenv.config();

const useHttps = existsSync(process.env.SSL_KEY_PATH) && existsSync(process.env.SSL_CERT_PATH);
const server = useHttps ?
  createHttpsServer({
    key: readFileSync(process.env.SSL_KEY_PATH),
    cert: readFileSync(process.env.SSL_CERT_PATH)
  }) :
  createHttpServer();

const io = new Server(server, { /* options */ });

const redis = new ioRedis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});
redis.psubscribe('*', (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`
    );
  }
});
redis.on('pmessage', (pattern, channel, message) => {
  console.log(`Message received in channel ${channel}: ${message}`);
  const { event: rawEvent, data } = JSON.parse(message);
  const event = rawEvent.split(/[\\]+/).pop();
  io.emit(`${channel}:${event}`, data);
});
server.listen(process.env.BROADCAST_PORT, () => {
  console.log(`Listening on Port ${process.env.BROADCAST_PORT}`);
});
