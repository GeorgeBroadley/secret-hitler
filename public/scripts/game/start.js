'use strict';

var $ = require('jquery');

var CommonConsts = require('common/constants');
var CommonGame = require('common/game');

var Data = require('util/data');

var App = require('ui/app');
var Chat = require('ui/chat');
var Overlay = require('ui/overlay');

var Process = require('socket/process');

var Game = require('game/game');
var Players = require('game/players');
var Policies = require('game/policies');
var State = require('game/state');

//LOCAL

var startGame = function(data) {
	$('.chat-container').html('');
	$('#chat-box').show();
	$('.policy-placeholder.policy-revealed').html('');
	$('.tracker-slot').removeClass('danger');

	Data.gameId = data.gid;
	App.showSection('game');

	State.inGame = true;
	State.started = true;
	State.initializedPlay = false;
	State.finished = false;
	State.positionIndex = data.startIndex;
	State.presidentIndex = State.positionIndex;
	State.chancellorIndex = null;
	State.players = data.players;
	State.playerCount = State.players.length;
	State.currentCount = State.playerCount;
	State.canVeto = false;
	Chat.setEnacting(false);

	// Election tracker
	State.presidentPower = null;
	State.specialPresidentIndex = null;
	State.presidentElect = 0;
	State.chancellorElect = 0;
	State.electionTracker = -1;
	Game.advanceElectionTracker();

	// Policy deck
	State.enactedFascist = 0;
	State.enactedLiberal = 0;
	Policies.shuffle();

	var fascistPlaceholders = $('#board-fascist .policy-placeholder');
	for (var index = 0; index < CommonConsts.FASCIST_POLICIES_REQUIRED; ++index) {
		var fascistPower = CommonGame.getFascistPower(index + 1, State.playerCount);
		if (!fascistPower) {
			continue;
		}
		var placeholder = fascistPlaceholders.eq(index);
		var description = '';
		if (fascistPower.indexOf('veto') > -1) {
			description = 'Veto power is unlocked<br><br>';
		}
		if (fascistPower.indexOf('peek') > -1) {
			description += 'President examines the top 3 cards';
		} else if (fascistPower.indexOf('investigate') > -1) {
			description += 'President investigates a player\'s identity card';
		} else if (fascistPower.indexOf('election') > -1) {
			description += 'President picks the next presidential candidate';
		} else if (fascistPower.indexOf('bullet') > -1) {
			description += 'President must kill a player';
		}

		placeholder.data('power', fascistPower);
		placeholder.html('<div class="detail">' + description + '</div>');
	}

	// Display players
	var playerString = '<div class="player-section">';
	var centerIndex = Math.ceil(State.playerCount / 2);

	var floatIndex = 0;
	State.players.forEach(function(player) {
		var playerIndex = player.index;

		var centerBreak = playerIndex == centerIndex;
		if (centerBreak) {
			playerString += '</div><div class="player-section bottom">';
		}
		var floatingLeft = floatIndex % 2 == 0;
		var floatClass = floatingLeft ? 'left' : 'right';
		if (centerBreak) {
			var evenRemaining = ((State.playerCount - playerIndex) % 2) == 0;
			if (floatingLeft) {
				if (!evenRemaining) {
					floatClass = 'right clear';
					++floatIndex;
				}
			} else {
				if (evenRemaining) {
					floatClass = 'left';
					++floatIndex;
				} else {
					floatClass += ' clear';
				}
			}
		}
		if (player.uid == Data.uid) {
			State.localPlayer = player;
			State.localIndex = playerIndex;
			floatClass += ' local';
		}
		var name = player.name + ' ['+(playerIndex+1)+']'; //TODO
		playerString += '<div id="ps'+player.uid+'" class="player-slot '+floatClass+'" data-uid="'+player.uid+'"><div class="avatar image"><div class="vote" style="display:none;"></div></div><div class="contents"><div class="title"><h2>'+name+'</h2><span class="typing icon" style="display:none;">💬</span><span class="talking icon" style="display:none;">🎙</span></div><div class="chat"></div></div></div>';
		++floatIndex;
	});
	playerString += '</div>';

	$('#players').html(playerString);

	// Local player
	if (State.localPlayer) {
		State.localRole = State.localPlayer.role;
		$('#card-role .label').text(State.localRoleName());
		$('#card-party .label').text(State.localPartyName());
	} else {
		console.error('Local player not found');
	}

	State.players.forEach(function(player) {
		if (player.role != null) {
			Players.displayAvatar(player, player.role);
		}
	});

	if (data.history) {
		Process.history(data.history);
	}

	if (!State.initializedPlay) {
		Overlay.show('start');
		Game.playTurn();
		// Cards.show('role');
	}
};

//PUBLIC

module.exports = {

	play: startGame,

};
