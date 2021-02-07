const httpServer = require('http').Server(); // (app)
const io = require('socket.io')(httpServer, {
    cors: {
      origin: [/azps\.info$/, /localhost/],
      methods: ["GET", "POST"]
    }
  });

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
    });

    socket.on('winningtiles', function(tiles) {
        console.log('winning tiles:');
        console.log(tiles);
    });

    socket.on('pons', function(pons) {
        console.log('pons:');
        console.log(pons);
    });

    socket.on('voidsuit', function(suit) {
        console.log('voided suit:');
        console.log(suit);
    });

    socket.on('discard', function(discard) {
        console.log('discard:');
        console.log(discard);
        socket.to('T' + pTable).emit('discard', { table: pTable, seat: pSeat, discard: discard });
    });
});

io.listen(port);
console.log('Listening on port ' + port + '...');
