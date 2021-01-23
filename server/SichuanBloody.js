import { isTupleTypeNode } from "typescript";
import { calculateStandardShanten } from "../../src/scripts/ShantenCalculator";
import { removeRandomItem, getRandomItem } from '../../src/scripts/Utils';
import { convertHandToTileIndexArray } from "../../src/scripts/HandConversions";
import { Game } from './Game';

// const Fraud = require("fraud");  // for saving stuff to disk https://www.npmjs.com/package/fraud
const io = require('socket.io')(); // https://socket.io/docs/v3/emit-cheatsheet/

const port = 4227

let players = [];
let scores = [];
let seat = 3; // to force a new game to be created when we add the first player
let table = -1;
let games = [];

function reset(game) {
  seats.splice(game, 1);
  hands.splice(game, 1);
  discards.splice(game*4, 4);
  remainingTiles.splice(game, 1);
}

io.on('connection', function (socket) {

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
    }

    let pSeat = seat;
    let pTable = table;

    socket.emit('table', table);
    socket.emit('seat', seat);

    socket.join('T' + table);

    socket.on('disconnect', function () {
        // TODO socketsToSeats.delete(socket);
    });

    socket.on('name', (name) => games[table].assignSeat(pSeat, name));

    socket.on('winningTiles', function(tiles) {

    });

    socket.on('claimWin', function(dummy) {

    });

    socket.on('discard', function() {
        // is the game live

        // is it this player's turn?

        // update table

        // send discard to all players at this table
        io.emit({table: pTable, player: , discard});

        // check victory - are any of the players at this table waiting on this discard?


        // rotate to next player
        io.emit('turn', {table: table, seat: pSeat, discard: });
    });

    socket.on('', function() {

    });



});

io.listen(port)
console.log('Listening on port ' + port + '...')

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