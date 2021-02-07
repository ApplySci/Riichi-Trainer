/*

This file does the communications with the clients. It delegates all game tasks down to the GameServer object

*/

//import GameServer from './GameServer';

//const Fraud = require("fraud");  // for saving stuff to disk https://www.npmjs.com/package/fraud
//const app = require('express')();
const httpServer = require('http').Server(); // (app)
const io = require('socket.io')(httpServer, {
    cors: {
      origin: "https://azps.info",
      methods: ["GET", "POST"]
    }
  }); // https://socket.io/docs/v3/emit-cheatsheet/

/*
const database = new Fraud({
    directory: "./database"
});*/

//const admin = database.read('admin');

const port = 4227

let players = {};
let scores = [];
let seat = 3; // to force a new game to be created when we add the first player
let table = -1;
let games = [];

io.on('connection', function (socket) {
    console.log(socket);

    let pSeat;
    let pTable;

    function gotName(name) {
        if (name in players.keys()) {

        } else {
            players[name] = socket;
        }
        games[table].assignSeat(pSeat, name);
    }

    seat++;
    if (seat > 3) {
        seat = 0;
        table++;
        games.push(new Game({
            handSize: 14,
            characters: true,
            bamboo: true,
            circles: true,
        }));
        /*
        if (admin !== null) {
            admin.join('T' + table);
        }*/
    }

    pSeat = seat;
    pTable = table;

    socket.emit('hello', { table: table, seat: seat });

    socket.join('T' + table);

    socket.on('disconnect', function () {
        console.log('disconnect');
        // TODO socketsToSeats.delete(socket);
    });

    socket.on('name', gotName);

    socket.on('winningTiles', function(tiles) {
        console.log('winning tiles');
        console.log(tiles);
    });

    socket.on('discard', function(discard) {
        console.log('discard');
        console.log(discard);
        // is the game live

        // is it this player's turn?

        // update table

        // send discard to all players at this table
        socket.to('T' + pTable).emit('discard', { table: pTable, seat: pSeat, discard: discard });

        // check victory - are any of the players at this table waiting on this discard?

        socket.on('claimWin', function(dummy) {

        });

        // handle complete game here
        if (games.isComplete) {


        } else {
                // rotate to next player
            socket.to('T' + pTable).emit('turn', { table: table, turn: pSeat });
        }
    });

    socket.on('', function() {

    });

});

io.listen(port);
console.log('Listening on port ' + port + '...');

/*

https://socket.io/docs/v3/handling-cors/

// server-side
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "https://example.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// client-side
const io = require("socket.io-client");
const socket = io("https://api.example.com", {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});
*/