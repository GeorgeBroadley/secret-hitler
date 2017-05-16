#!/usr/bin/env node
'use strict';

//EXPRESS

var express = require('express');
var path = require('path');

var app = express();
var http = require('http').createServer(app);

//APP

var portNumber = process.env.PORT || 8004;

app.use(express.static(path.resolve(__dirname, 'public')));

app.get('*', function(request, response, next) {
	response.sendFile(path.resolve(__dirname, 'public/index.html'));
});

http.listen(portNumber);

//SETUP

var CommonConsts = require.main.require('./common/constants');

var Socket = require.main.require('./server/connect/io');

console.log('Secret Hitler Online v' + CommonConsts.VERSION + ' ' + (process.env.NODE_ENV || 'TESTING') + ' on port ' + portNumber);

Socket.init(http);

require.main.require('./server/play/setup');
