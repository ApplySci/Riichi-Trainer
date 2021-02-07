/*

*/
import React from 'react';
import { Container, Row } from 'reactstrap';
import SortedHand from '../components/SortedHand';
import SortedHandCheckbox from '../components/SortedHandCheckbox';
import DiscardPool from "../components/DiscardPool";
import { withTranslation } from 'react-i18next';
import Melds from '../components/Melds';
import { calculateStandardShanten } from "../scripts/ShantenCalculator";
import {calculateUkeire} from "../scripts/UkeireCalculator";
import openSocket from 'socket.io-client';
import Tile from '../components/Tile';

const padTile = 31;
const fullSet = Array(38).fill(4);
const HANDSTAGE = { selectVoidSuit: 0, firstDiscard: 1, mainHand: 2, complete: 3 };
let inEvent;


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
        this.socket = openSocket('wss://ws.azps.info/');
        this.tilesGone = Array(38).fill(0);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            discardPiles: [ [21,23], [25,27], [31,35], [32,38] ],
            ponThis: [true, null, null, true, null, null, true, null, true, null, null],
            hand: [2,2,2,3,3,3,4,4,5,5,9],
            melds: [ [1,1,1] ],
/*
            discardPiles: [ [], [], [], [] ],
            ponThis: Array(14).fill(null),
            hand: [],
            melds: [],
*/
            currentBonus: 0,
            currentTime: 0,
            drawnTile: null,
            gameScores: [],
            handStage: HANDSTAGE.selectVoidSuit,
            isComplete: false,
            isReady: false,
            log: <hr/>,
            myTurn: false,
            players: [],
            settings: { useTimer: true },
            totalScores: [],
            voidedSuits: [],
            waits: [],
        }

        this.addTile = this.addTile.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.newHand = this.newHand.bind(this);
        this.onDiscard = this.onDiscard.bind(this);
        this.onHello = this.onHello.bind(this);
        this.otherDiscard = this.otherDiscard.bind(this);
        this.pickVoid = this.pickVoid.bind(this);
        this.ponChecked = this.ponChecked.bind(this);
        this.sendPons = this.sendPons.bind(this);
        this.setTimer = this.setTimer.bind(this);
        this.testPons = this.testPons.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);

        this.socket.on('hello', this.onHello);
        this.socket.on('discard', this.otherDiscard);
        this.socket.on('newTile', this.addTile);
        this.socket.on('newHand', this.newHand);

    }


    addTile(tile) {
        this.setState({ log: this.state.log + <p>newTile: {tile}</p> });
    }


    newHand(tiles) {
        let state = {
            currentBonus: 0,
            currentTime: 0,
            discardPiles: [ [], [], [], [] ],
            drawnTile: null,
            hand: tiles,
            handStage: HANDSTAGE.selectVoidSuit,
            isComplete: false,
            isReady: false,
            log: <p>newHand: {tiles}</p>,
            melds: [],
            myTurn: false,
            ponThis: Array(13).fill(null),
            voidedSuits: [],
        }
        this.setState(state);
    }


    onHello(greeting) {
        this.setState({ log: this.state.log + <p>hello: {greeting}</p> });
    }


    otherDiscard(discard) {
        this.setState({ log: this.state.log + <p>discard: {discard}</p> });
    }


    componentWillUnmount() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
    }


    setTimer() {

        if (this.state.settings.useTimer) {
            this.timer = setTimeout(
                () => {
                    this.onTileClicked({target:{name:this.state.lastDraw}});
                    this.setState({ currentBonus: 0 });
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


    testPons() {
        // are there pairs? Ask if they want to pon them, if so
        const hand = this.state.hand;
        let ponThis = this.state.ponThis.slice();
        console.log(ponThis);
        console.log(hand);
        for (let i=0; i < hand.length; i++) {
            if (i < hand.length - 1 && hand[i] === hand[i+1]) {
                if (ponThis[i]===null) {
                    ponThis[i] = false;
                }
                while (hand[i] === hand[i+1]) i++;
                // we don't want to offer pon on a winning tile
                if (this.state.waits.includes(hand[i])) {
                    ponThis[i] = null;
                }
            } else {
                // this tile is no longer ponnable
                ponThis[i] = null;
            }
        }
        console.log(ponThis);
        this.setState({ ponThis: ponThis }, this.sendPons);
    }


    // Discards the clicked tile
    onDiscard(event) {
        if (this.state.isComplete || inEvent) return;
        inEvent = true; // flag to prevent user clicking two discards and us having to handle both
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();
        let pos = hand.lastIndexOf(chosenTile);
        hand.splice(pos, 1);
        let ponThis = this.state.ponThis.slice();
        ponThis.splice(pos,1);
        ponThis.push(null);

        let endOfTurn = { tile: chosenTile };
        let waits = [];

        // are we now ready?
        let longHand = shortHandToArray(hand);
        longHand[padTile] += 13 - hand.length;
        let shanten = calculateStandardShanten(longHand);
        let nowWeAreReady = false;
        if (shanten === 0) {
            // check that the void suit is actually void!
            nowWeAreReady = true;
            let base = this.state.voidedSuits[0] * 10 + 1;
            for (let i=base; i < base + 10; i++) {
                if (hand.includes(i)) {
                    nowWeAreReady = false;
                    break;
                }
            }
            if (nowWeAreReady) {
                // yes, we are ready
                let ukeire = calculateUkeire(longHand, fullSet, calculateStandardShanten, 0);
                waits = ukeire.tiles;
            }
        }
        endOfTurn.waits = waits;
        let nextFn;
        if (nowWeAreReady && !this.state.isReady) {
            // we have only just become ready, so turn all the pons off
            for (let i=0; i < ponThis.length; i++) {
                if (ponThis[i]) ponThis[i] = false;
            }
            nextFn = null;
        } else {
            nextFn = this.testPons;
        }
        this.setState({ myTurn: false, hand: hand, waits: waits, ponThis: ponThis, isReady: nowWeAreReady }, nextFn);

        // and finally tell the server
        this.socket.emit('discard', endOfTurn);

        inEvent = false;
    }


    pickVoid(event) {
        let chosenTile = parseInt(event.target.name);
        let voidSuits = this.state.voidedSuits.slice();
        voidSuits[0] = chosenTile;
        this.setState({ handStage: HANDSTAGE.firstDiscard, voidedSuits:voidSuits, myTurn: true }); // TODO remove myTurn here
        this.socket.emit('voidsuit', chosenTile);
    }


    ponChecked(event) {
        // triggered when a pon checkbox is changed
        let tileIndex = parseInt(event.target.name.substr(2,99));
        let ponThis = this.state.ponThis.slice();
        let ponPos = this.state.hand.indexOf(tileIndex);
        ponThis[ponPos] = !ponThis[ponPos];
        this.setState({ ponThis: ponThis }, this.sendPons);
    }


    sendPons() {
        let pons = [];
        for (let i=0; i < this.state.ponThis.length; i++) {
            if (this.state.ponThis[i]) {
                pons.push(this.state.hand[i]);
            }
        }
        this.socket.emit('pons', pons);
    }


    render() {
        return (
            <Container>
                <Row className="mt-2 no-gutters">
                    <DiscardPool
                        players={this.state.players}
                        discardCount={this.state.discardCount}
                        wallCount={this.state.tilesLeft}
                        showIndexes={true} />
                </Row>
                <Row className={'voidTiles hand' + (this.state.handStage === HANDSTAGE.selectVoidSuit ? '' : ' noCursor')}>
                    {this.state.handStage === HANDSTAGE.selectVoidSuit
                    ?   <span><b>Pick the void suit:</b>
                            <Tile tile={0} displayTile={2} onClick={this.pickVoid} className='handTile' />
                            <Tile tile={1} displayTile={12} onClick={this.pickVoid} className='handTile' />
                            <Tile tile={2} displayTile={22} onClick={this.pickVoid} className='handTile' />
                        </span>
                    : <span>Void suit: <Tile
                        name={null}
                        displayTile={this.state.voidedSuits[0]*10+2}
                        onClick={null}
                        className='handTile' />
                    </span>
                } </Row>
                { this.state.waits.length === 0 ? null : <Row className='voidTiles hand noCursor'>
                    You are now ready to win this hand! The tiles you can win off are:
                    <SortedHand tiles={this.state.waits}
                        lastDraw={-1}
                        onTileClick={null}
                        showIndexes={true}
                        blind={false} />
                </Row> }
                <div className={this.state.myTurn && !this.inEvent ? "hand" : "hand noCursor"}>
                    <SortedHandCheckbox tiles={this.state.hand}
                        checked={this.state.ponThis}
                        checkedFn={this.ponChecked}
                        lastDraw={this.state.lastDraw}
                        onTileClick={this.state.myTurn && !this.inEvent ? this.onDiscard : null}
                        showIndexes={true}
                        blind={false} />
                    {this.state.myTurn ? <Row><b>Click on a tile to discard it</b></Row> : null}
                </div>
                <hr />
                <Melds melds={this.state.melds} />
                {this.state.settings.useTimer ?
                    <Row className="mt-2" style={{justifyContent:'flex-end', marginRight:1}}>
                        <span>{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span>
                    </Row>
                    : ""
                }
                <Container>{this.state.log}</Container>
            </Container>
        );
    }
}

export default withTranslation()(SichuanClient);
