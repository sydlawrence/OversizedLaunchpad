
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , midi = require('midi')
  , config = require('./config').config
  , io = require('socket.io').listen(config.input_socket);
io.set('log level', 1);
console.log(config);



var connections = [];

io.sockets.on('connection', function (socket) {

  connections.push(socket);

  socket.on('disconnect', function() {
    connections.forEach(function(connection, i) {
      if (connection === socket) {
        connections.splice(i, 1);
      }
    });
  });

});

// Set up a new input.
var input = new midi.input();

// Configure a callback.
input.on('message', function(deltaTime, message) {
	connections.forEach(function(connection) {
		connection.emit('midijs', { message: message, deltaTime:deltaTime });
	});
});

// Open the first available input port.
input.openPort(config.midiPort);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
//input.ignoreTypes(false, false, false);

// ... receive MIDI messages ...

