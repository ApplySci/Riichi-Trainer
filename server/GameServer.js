import BaseGame from '../src/states/BaseGame';
import Player from '../src/states/Player';
import { calculateStandardShanten } from "../../src/scripts/ShantenCalculator";
import { removeRandomItem, getRandomItem } from '../../src/scripts/Utils';
import { convertHandToTileIndexArray } from "../../src/scripts/HandConversions";

export default class GameServer extends BaseGame {

    constructor(props) {
        super(props);

        this.checkWin = this.checkWin.bind(this);
        this.getStartingTiles = this.getStartingTiles.bind(this);
        this.newHand = this.newHand.bind(this);
        this.onDiscard = this.onDiscard.bind(this);
        this.setPlayer = this.setPlayer.bind(this);
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
        players[0].discards.push(chosenTile);

        // TODO check if this is anyone's winning tile



        // TODO draw a tile

        let paddedHand = this.padHand(hand);
        let remainingTiles = this.state.remainingTiles.slice();

        let shanten = calculateStandardShanten(paddedHand);

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

    }


    padHand(hand) {
        let paddedHand = hand.slice();
        let nTiles = paddedHand.reduce((a, b) => a + b, 0);
        paddedHand[padTile] += 14 - nTiles;
        return paddedHand;
    }

    setPlayer(name, socket) {

    }

    setWaits(player, waits) {

    }


}