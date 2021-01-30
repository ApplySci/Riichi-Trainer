const padTile = 31;

export default class BaseGame {
    constructor(props) {
        this.deltas = [];
        this.players = [];
        this.remainingTiles = [];
        this.seatWinds = [32, 33, 34, 31], // like this because we rotate the winds before turn 1
        this.tilePool = [];
        this.turn = 0; // index of player whose turn it is, 0-3

        this.addPlayer = this.addPlayer.bind(this);
    }

    addPlayer(name) {
        let playerCount = this.players.length;
        if (playerCount > 3) {
            return -1;
        }
        let player = new Player();
        playerCount++;
        player.name = name;
        this.players.push(player);
        if (playerCount == 4) {
            // TODO START GAME
        }
        return playerCount - 1;
    }
}
