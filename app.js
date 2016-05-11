var W3CWebSocket = require('websocket').w3cwebsocket;

var client = new W3CWebSocket('ws://167.114.209.42:1518');

client.binaryType = 'arraybuffer';

client.onerror = function() {
  console.log('Connection Error');
};

client.onopen = function() {
  console.log('WebSocket Client Connected');

  function sendNumber() {
    if (client.readyState === client.OPEN) {
      var number = Math.round(Math.random() * 0xFFFFFF);
      client.send(number.toString());
      setTimeout(sendNumber, 1000);
    }
  }
  sendNumber();
};

client.onclose = function() {
  console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
  //console.log("Received: '" + new Uint8Array(e.data) + "'");
  var msg = new Uint8Array(e.data);
  var handler = packetHandlers[msg[0]];

  if (handler) {
    handler(msg);
  } else {
    console.log('Unhanded packet type:', msg);
  }

};

function auth() {
  var data = new Uint8Array([-2, 6, 0, 0, 0]);
  client.send(data);

  data = new Uint8Array([-1, 95, 1, 101, 37]);
  client.send(data);
}

function spawn() {
  var data = new Uint8Array([0, 0]);
  client.send(data);
}

function postAuth() {
  var data = new Uint8Array([113, -82, -76, -2, -8, -88, -75, -95, 20, -102, 48, 6, 116, 37, -28, -71, -1, -30, -99, -120, 28]);
  client.send(data);
}

var packetHandlers = {
  18: function() {
    console.log('Server ask for authentiation');
    auth();
  },
  49: function(data) {
    //console.log('Leaderboard:', data);
  },
  112: function(data) {
    console.log('Server is ready or ask for sth?', data);
    postAuth();
  },
  128: function() {
    console.log('Server asks for reload client, client is outdated?');
  },
  241: function(data) {
    console.log('Connected to room?:', data);
    spawn();
  },
  255: function(data) {
    //console.log('World update:', data);
  }
};
