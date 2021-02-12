/*

This file does the communications with the clients. It delegates all game tasks down to the GameServer object

*/
import './GameServer';

import Fraud from 'fraud';  // for saving stuff to disk https://www.npmjs.com/package/fraud
const database = new Fraud({
    directory: "./database"
});
const admin = database.read('admin');

const httpServer = require('http').Server(); // (app)
const io = require('socket.io')(httpServer, {
    cors: {
      origin: [/learn.mahjong.ie$/, /localhost/, /azps.info/],
      methods: ["GET", "POST"]
    }
  });

const port = 4227

let players = {};
let scores = [];
let games = [];

// to force a new game to be created when we add the first player
let seat = 3;
let table = -1;

io.on('connection', function (socket) {

    let pSeat;
    let pTable;

    seat++;
    if (seat > 3) {
        seat = 0;
        table++;
    }

    pSeat = seat;
    pTable = table;

    socket.emit('hello', { table: table, seat: seat });

    socket.join('T' + table);

    socket.on('disconnect', function () {
        console.log('disconnect');
        // TODO socketsToSeats.delete(socket);
    });

    socket.on('winningtiles', function(tiles) {
        console.log('winning tiles:');
        console.log(tiles);
        io.emit('winningtiles',  { table: pTable, seat: pSeat, winningtiles: tiles });
    });

    socket.on('pons', function(pons) {
        console.log('pons:');
        console.log(pons);
        io.emit('pons',  { table: pTable, seat: pSeat, pons: pons });
    });

    socket.on('voidsuit', function(suit) {
        console.log('voided suit:');
        console.log(suit);
        io.emit('void', { table: pTable, seat: pSeat, voidsuit: suit });
    });

    socket.on('discard', function(discard) {
        console.log('discard:');
        console.log(discard);
        io.to('T' + pTable).emit('discard', { table: pTable, seat: pSeat, discard: discard });


        // is the game live

        // is it this player's turn?

        // update table

        // send discard to all players at this table
        socket.to('T' + pTable).emit('discard', { table: pTable, seat: pSeat, discard: discard });

        // check victory - are any of the players at this table waiting on this discard?

        // rotate to next player
        socket.to('T' + pTable).emit('turn', { table: table, turn: pSeat });
    });
});

io.listen(port);
console.log('Listening on port ' + port + '...');
