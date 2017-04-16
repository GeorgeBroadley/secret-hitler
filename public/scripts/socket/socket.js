'use strict';

var SocketIO = require('socket.io-client');

var CommonConsts = require('common/constants');

var Config = require('util/config');
var Data = require('util/data');

//LOCAL

var params;
if (Data.uid && Data.auth) {
	params = {query: 'uid=' + Data.uid + '&auth=' + Data.auth + '&v=' + CommonConsts.VERSION};
}

var socket = SocketIO(Config.TESTING ? 'http://localhost:8004' : process.env.APP_URL, params);

//PUBLIC

module.exports = socket;
