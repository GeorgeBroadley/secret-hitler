'use strict';

var Postgres = require('pg');

var CommonUtil = require.main.require('./common/util');

var Config = require('./config');
var Utils = require('./utils');

//SETUP

Postgres.defaults.parseInt8 = true;
Postgres.defaults.ssl = true;

var connectURL = Config.LOCAL_DB_URL;
var dbConfigured = connectURL != '';
if (!dbConfigured) {
	console.log('Database not configured');
}

//HELPERS

var query = function(statement, params, callback) {
	Postgres.connect(connectURL, function(err, client, done) {
		if (!client) {
			if (dbConfigured) {
				console.error('CLIENT CONNECTION ERROR');
				console.log(err, client, connectURL);
			}
			done();
			return;
		}
		client.query(statement, params, function(err, result) {
			done();
			if (result) {
				if (callback) {
					callback(result.rows);
				}
			} else if (dbConfigured) {
				console.error('QUERY ERROR', statement, params);
				console.log(err);
			}
		});
	});
};

var queryOne = function(statement, params, callback) {
	query(statement, params, function(result) {
		if (callback) {
			callback(result[0]);
		}
	});
};

var fetch = function(columns, table, where, params, callback) {
	queryOne('SELECT ' + columns + ' FROM ' + table + ' WHERE ' + where + ' LIMIT 1', params, callback);
};

var fetchAll = function(columns, table, where, params, callback) {
	query('SELECT ' + columns + ' FROM ' + table + ' WHERE ' + where, params, callback);
};

var property = function(column, table, where, params, callback) {
	fetch(column, table, where, params, function(result) {
		callback(result[column]);
	});
};

var generateGameId = function(callback) {
	var gid = Utils.uuid(5);
	fetch('id', 'games', 'id = $1', [gid], function(exists) {
		if (exists) {
			console.log('Collision', gid);
			return generateGameId(callback);
		}
		callback(gid);
	});
};

//UPSERT

var update = function(table, where, columnsValues, returning, callback) {
	columnsValues.updated_at = CommonUtil.now();

	var columns = [], values = [], placeholders = [];
	var index = 0;
	for (var column in columnsValues) {
		columns.push(column);
		values.push(columnsValues[column]);
		placeholders.push('$' + (++index));
	}
	var queryString = 'UPDATE ' + table + ' SET (' + columns.join() + ') = (' + placeholders.join() + ') WHERE ' + where;
	queryString += ' RETURNING ' + (returning || 1);
	queryOne(queryString, values, callback);
};

var insert = function(table, columnsValues, returning, callback) {
	var now = CommonUtil.now();
	if (!columnsValues.created_at) {
		columnsValues.created_at = now;
	}
	columnsValues.updated_at = now;

	var columns = [], values = [], placeholders = [];
	var index = 0;
	for (var column in columnsValues) {
		columns.push(column);
		values.push(columnsValues[column]);
		placeholders.push('$' + (++index));
	}
	var queryString = 'INSERT INTO ' + table + ' (' + columns.join() + ') VALUES (' + placeholders.join() + ')';

	queryString += ' RETURNING ' + (returning || 1);
	queryOne(queryString, values, callback);
};

//PUBLIC

module.exports = {

	exists: dbConfigured,

	query: query,

	queryOne: queryOne,

	fetch: fetch,

	fetchAll: fetchAll,

	property: property,

	update: update,

	insert: insert,

	delete: function(table, where, params, callback) {
		query('DELETE FROM ' + table + ' WHERE ' + where, params, callback);
	},

	upsert: function(table, updateWhere, updateColsVals, returning, insertColsVals, callback) {
		update(table, updateWhere, updateColsVals, returning, function(updated) {
			if (updated) {
				callback(updated);
			} else {
				insert(table, insertColsVals, returning, callback);
			}
		});
	},

	count: function(table, callback) {
		query('SELECT COUNT(*) FROM ' + table, null, function(result) {
			callback(result[0].count);
		});
	},

	updatePlayers: function(userIds, state, gid, logged) {
		if (logged) {
			console.log('Update players', state, gid, userIds);
		}
		if (userIds.length > 0) {
			var now = CommonUtil.now();
			query('UPDATE users SET games_'+state+'=games_'+state+'+1, gid=$1, online_at=$2, updated_at=$3 WHERE id IN ('+userIds.join(',')+')', [gid, now, now]);
		}
	},

	gid: generateGameId,

};
