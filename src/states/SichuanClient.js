/*

*/
import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import SortedHand from '../components/SortedHand';
import DiscardPool from "../components/DiscardPool";
import { withTranslation } from 'react-i18next';
import LocalizedMessage from '../models/LocalizedMessage';
import Melds from '../components/Melds';
import { calculateStandardShanten } from "../scripts/ShantenCalculator";
import {calculateUkeire} from "../scripts/UkeireCalculator";
import ShowWin from "./ShowWin";
import openSocket from 'socket.io-client';
import Tile from '../components/Tile';

const padTile = 31;
const fullSet = Array(38).fill(4);
const HANDSTAGE = { selectVoidSuit: 0, firstDiscard: 1, mainHand: 2, complete: 3 };

function padHand(hand) {
    let paddedHand = hand.slice();
    let nTiles = paddedHand.reduce((a, b) => a + b, 0);
    paddedHand[padTile] += 14 - nTiles;
    return paddedHand;
}

function shortHandToArray(hand) {
    let out = new Array(38).fill(0);
    for (let tile of hand) {
        out[tile]++;
    }
    return out;
}

class SichuanClient extends React.Component {
    constructor(props) {
        super(props);
        this.inEvent = false;
        this.socket = openSocket('wss://ws.mahjong.azps.info/');
        this.tilesGone = Array(38).fill(0);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            currentBonus: 0,
            currentTime: 0,
            discardPiles: [ [], [], [], [] ],
            drawnTile: null,
            gameScores: [],
            hand: [2,2,2,3,3,3,4,4,5,5,9],
            handStage: HANDSTAGE.selectVoidSuit,
            isComplete: false,
            melds: [ [1,1,1] ],
            myTurn: false,
            players: [],
            settings: { useTimer: true },
            totalScores: [],
            voidedSuits: [],
            waits: [],
        }

        this.socket.on('board', board => {
            this.setState({board: board})
        });

        this.newHand = this.newHand.bind(this);
        this.pickVoid = this.pickVoid.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.setTimer = this.setTimer.bind(this);

    }

    newHand() {
        let state = {
            currentBonus: 0,
            currentTime: 0,
            discardPiles: [ [], [], [], [] ],
            drawnTile: null,
            hand: [],
            handStage: HANDSTAGE.selectVoidSuit,
            isComplete: false,
            melds: [],
            myTurn: false,
            voidedSuits: [],
        }
        this.setState(state);
    }

    componentWillUnmount() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
    }

    /**
     * Sets the state to a clean slate based on the given parameters.
     * @param {TileCounts} hand The player's hand.
     * @param {TileCounts} availableTiles The tiles remaining in the wall.
     * @param {TileIndex[]} tilePool A list of tile indexes representing the remaining tiles.
     * @param {TileIndex} lastDraw The tile the player just drew.
     */
    setTimer() {

        if (this.state.settings.useTimer) {
            this.timer = setTimeout(
                () => {
                    this.onTileClicked({target:{name:this.state.lastDraw}});
                    this.setState({
                        currentBonus: 0
                    });
                },
                (this.state.settings.time + this.state.settings.extraTime + 2) * 1000
            );
            this.timerUpdate = setInterval(this.updateTime, 100);
        }

    }


    onUpdateTime() {
        if (this.state.currentTime > 0.1) {
            this.setState({
                currentTime: Math.max(this.state.currentTime - 0.1, 0)
            });
        } else {
            this.setState({
                currentBonus: Math.max(this.state.currentBonus - 0.1, 0)
            });
        }
    }


    // Discards the clicked tile
    onTileClicked(event) {
        if (this.state.isComplete || this.inEvent) return;
        this.inEvent = true;
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();
        let pos = hand.indexOf(chosenTile);
        hand.splice(pos, 1);
        this.setState({ myTurn: false, hand: hand });
        let endOfTurn = { tile: chosenTile };
        let newState = {};

        // are we now tenpai?
        let longHand = shortHandToArray(hand);
        longHand[padTile] += 13 - hand.length;
        let shanten = calculateStandardShanten(longHand);
        if (shanten === 0) {
            // yes, we are in tenpai
            let ukeire = calculateUkeire(longHand, fullSet, calculateStandardShanten, 0);
            newState.waits = ukeire.tiles;
            endOfTurn.waits = ukeire.tiles;
        }

        // TODO are there pairs? Ask if they want to pon them, if so
        for (let i=0; i < hand.length - 1; i++) {
            if (hand[i] === hand[i+1]) {

            }
        }

        // and finally tell the server
        this.setState(newState);
        this.socket.emit('discard', endOfTurn);
        this.inEvent = false;
    }


    pickVoid(event) {
        let chosenTile = parseInt(event.target.name);
        let voidSuits = this.state.voidedSuits.slice();
        voidSuits[0] = chosenTile;
        this.setState({ handStage: HANDSTAGE.firstDiscard, voidedSuits:voidSuits, myTurn: true }); // TODO remove myTurn here
        this.socket.emit('void', chosenTile);
    }


    render() {
        console.log(this.state.waits);
        return (
            <Container>
                <Row className="mt-2 no-gutters">
                    <DiscardPool
                        players={this.state.players}
                        discardCount={this.state.discardCount}
                        wallCount={this.state.tilePool && this.state.tilePool.length}
                        showIndexes={true} />
                </Row>
                <Row className={'voidTiles hand' + (this.state.handStage === HANDSTAGE.selectVoidSuit ? '' : ' noCursor')}>
                    {this.state.handStage === HANDSTAGE.selectVoidSuit
                    ?   <span>Pick the void suit:
                            <Tile tile={0} displayTile={2} onClick={this.pickVoid} className='handTile' />
                            <Tile tile={1} displayTile={12} onClick={this.pickVoid} className='handTile' />
                            <Tile tile={2} displayTile={22} onClick={this.pickVoid} className='handTile' />
                        </span>
                    : <span>Void suit: <Tile name={null} displayTile={this.state.voidedSuits[0]*10+2} onClick={null} className='handTile' /></span>
                } </Row>
                { this.state.waits.length === 0 ? null : <Row className='voidTiles hand noCursor'>
                    Tiles you can win off:
                    <SortedHand tiles={this.state.waits}
                        lastDraw={-1}
                        onTileClick={null}
                        showIndexes={true}
                        blind={false} />
                </Row> }
                <div className={this.state.myTurn && !this.inEvent ? "hand" : "hand noCursor"}>
                    <SortedHand tiles={this.state.hand}
                        lastDraw={this.state.lastDraw}
                        onTileClick={this.state.myTurn && !this.inEvent ? this.onTileClicked : null}
                        showIndexes={true}
                        blind={false} />
                    {this.state.myTurn ? <Row>Click on a tile to discard it</Row> : null}
                </div>
                <hr />
                <Melds melds={this.state.melds} />
                {this.state.settings.useTimer ?
                    <Row className="mt-2" style={{justifyContent:'flex-end', marginRight:1}}>
                        <span>{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span>
                    </Row>
                    : ""
                }
            </Container>
        );
    }
}

export default withTranslation()(SichuanClient);
