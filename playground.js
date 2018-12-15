var Player = require('player')

// create player instance
var player = new Player('./xxx.mp3')

// play now and callback when playend
player.play(function (err, player) {
    console.log('playend!');
})