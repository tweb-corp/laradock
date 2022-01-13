const socketApp = require('express')();
const httpServer = require('http').Server(socketApp);
const io = require('socket.io')(httpServer);
const dotenv = require('dotenv');
const ioRedis = require('ioredis');

dotenv.config();
const redis = new ioRedis(process.env.REDIS_PORT, process.env.REDIS_HOST);
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
  console.log(`Message Received: ${message}`);
  const { event, data } = JSON.parse(message);
  io.emit(`${channel}:${event}`, data);
});
httpServer.listen(process.env.BROADCAST_PORT, () => {
  console.log(`Listening on Port ${process.env.BROADCAST_PORT}`);
});
