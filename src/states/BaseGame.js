export default class BaseGame {

    constructor(props) {
        super(props);
        const padTile = 31;

        this.state = {
            deltas: [],
            discards: [],
            emptySuit: [],
            hands: [],
            names: [null, null, null, null],
            players: [null, null, null, null],
            remainingTiles: [],
            scores: [0, 0, 0, 0],
            seatWinds: [32, 33, 34, 31], // like this because we rotate the winds before turn 1
            thisPlayer: 0,
            tilePool: [],
            turn: 0,
            waits: [],
        }

    }
}
