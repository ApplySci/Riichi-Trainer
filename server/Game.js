const padTile = 31;

class Game {

    constructor(props) {
        super(props);
        this.state = {
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
            waits: [],
        }

        this.checkWin = this.checkWin.bind(this);
        this.getStartingTiles = this.getStartingTiles.bind(this);
        this.newHand = this.newHand.bind(this);
        this.onDiscard = this.onDiscard.bind(this);
        this.setWaits = this.setWaits.bind(this);
    }


    checkWin(player, tile) {

    }


    getStartingTiles() {
        let availableTiles = Array(38).fill(0);

        if (this.props.characters) {
            for (let i = 1; i < 10; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.props.circles) {
            for (let i = 11; i < 20; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.props.bamboo) {
            for (let i = 21; i < 30; i++) {
                availableTiles[i] = 4;
            }
        }

        return availableTiles;
    }


    newHand() {

        let hands = [];
        let remainingTiles = this.getStartingTiles();
        for (let i=o; i<4; i++) {
            let generationResult = generateHand(remainingTiles, this.props.handSize);
            hands.push(generationResult.hand.splice());
            remainingTiles = generationResult.availableTiles.splice();
        }
        let tilePool = generationResult.tilePool;

        this.setState({
            discards: [ [], [], [], [] ],
            emptySuit: [null, null, null, null],
            hands: [ [], [], [], [] ],
            remainingTiles: remainingTiles,
            seatWinds: [this.state.seatWinds[3]].concat(this.state.seatWinds.slice(0,3)),
            tilePool: tilePool,
            waits: [[], [], [], []],
        });
    }


    onDiscard(player, chosenTile) {

        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let hand = this.state.hand.slice();
        hand[chosenTile]--;

        // TODO check if this is anyone's winning tile

        let paddedHand = this.padHand(hand);
        let remainingTiles = this.state.remainingTiles.slice();

        let shanten = calculateStandardShanten(paddedHand);

        let players = this.state.players.slice();
        players[0].discards.push(chosenTile);

        let achievedTotal = this.state.achievedTotal + chosenUkeire.value;
        let tilePool = this.state.tilePool.slice();
        let drawnTile = -1;

        if (!isComplete) {

            if (tilePool.length > 0) {
                drawnTile = removeRandomItem(tilePool);
                hand[drawnTile]++;
                remainingTiles[drawnTile]--;

                historyData.drawnTile = drawnTile;

            }
            else {
                // No tiles left in the wall
                isComplete = true;
            }
        }

        let shuffle = this.state.shuffle.slice();

        if (chosenTile !== this.state.lastDraw) {
            for (let i = 0; i < shuffle.length; i++) {
                if (shuffle[i] === chosenTile) {
                    shuffle[i] = this.state.lastDraw;
                    break;
                }
            }
        }
    }


    padHand(hand) {
        let paddedHand = hand.slice();
        let nTiles = paddedHand.reduce((a, b) => a + b, 0);
        paddedHand[padTile] += 14 - nTiles;
        return paddedHand;
    }


    setWaits(player, waits) {

    }


}