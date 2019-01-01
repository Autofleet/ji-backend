const bodyParser = require('body-parser');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
app.use(bodyParser.json())
app.post('/send/:vehicleId', (req, res) => {
  const sent = wss.broadcast(req.params.vehicleId, req.body);
  res.json({
    msg: req.body,
    sent,
  })
})


const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const send = (msg) => ws.send(JSON.stringify(msg))
  send({ type: 'welcome' })
  //connection is up, let's add a simple simple event
  ws.on('message', (message) => {
    console.log('received: %s', message);
    console.log()
    const msg = JSON.parse(message)
    console.log(msg)
    ws.vehicleId = msg.vehicleId;
  });
});

wss.broadcast = function broadcast(vehicleId, data) {
  let sent = 0;
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN && client.vehicleId === vehicleId) {
      client.send(JSON.stringify(data));
      sent += 1;
    }
  });

  return sent;
};

//start our server
server.listen(process.env.PORT || 8081, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});