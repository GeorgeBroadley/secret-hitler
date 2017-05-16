'use strict';

//SETUP

var ping = function(kFreq, kDecayTime, kGain) {
    window.audioContext = window.audioContext || new (window.AudioContext || window.webkitAudioContext)();
    var kFreq = kFreq ? kFreq : 1000,
        kDecayTime = kDecayTime ? kDecayTime : 0.1,
        kStartTime = 0.0,
        kGain = kGain ? kGain : 0.5;
    var oscNode = audioContext.createOscillator();
    oscNode.frequency.value = kFreq;
    var gainNode = audioContext.createGain();
    gainNode.gain.value = kGain;
    gainNode.gain.setTargetAtTime(0.0, audioContext.currentTime, kDecayTime);
    oscNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscNode.start(audioContext.currentTime + kStartTime); // Start a little into the future.
    oscNode.stop(audioContext.currentTime + kStartTime + 12 * kDecayTime); // Stop when the sound decays by enough.
};

var gameStartingAlert = function(secondsRemaining) {
    ping(secondsRemaining > 0 ? 200 : 200, 0.1, 0.2);
    ping(secondsRemaining > 0 ? 400 : 800, 0.1, 0.3);
    ping(secondsRemaining > 0 ? 1600 : 2800, 0.1, 0.3);
};

var chatAlert = function() {
    ping(1200, 0.002, 0.2);
};

var chancellorChosenAlert = function(secondsRemaining) {
    ping(400, 0.05, 0.2);
    ping(200, 0.2, 0.2);
};

var votedAlert = function() {
    ping(200, 0.02, 0.2);
    ping(1600, 0.02, 0.2);
    setTimeout(function(){
        ping(800, 0.005, 0.5);
    }, 100);
};

var enactedAlert = function(secondsRemaining) {
    setTimeout(function(){
        ping(1800, 0.005, 0.5);
    }, 0);
    setTimeout(function(){
        ping(1800, 0.005, 0.5);
    }, 50);
    setTimeout(function(){
        ping(1800, 0.005, 0.5);
    }, 100);
};

// Not in use currently.
// But can be used for other kind of alerts in future.
var alert1 = function(secondsRemaining) {
    ping(200, 0.02);
    ping(2800, 0.02);
    setTimeout(function(){
        ping(800, 0.01);
    }, 100);
};

// Not in use currently.
// But can be used for other kind of alerts in future.
var alert2 = function(secondsRemaining) {
//     ping(600, 0.1, 0.3);
//     ping(200, 0.2, 0.1);
    setTimeout(function(){
        ping(1800, 0.005, 0.5);
    }, 0);
    setTimeout(function(){
        ping(2000, 0.005, 0.5);
    }, 50);
    setTimeout(function(){
        ping(1800, 0.01, 0.5);
    }, 100);
};

//PUBLIC

module.exports = {
	gameStartingAlert: gameStartingAlert,
    chatAlert: chatAlert,
    chancellorChosenAlert: chancellorChosenAlert,
    enactedAlert: enactedAlert,
    votedAlert: votedAlert
};
