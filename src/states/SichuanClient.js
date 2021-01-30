/*

*/
import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import DiscardPool from "../components/DiscardPool";
import withTranslation from 'react-i18next';
import LocalizedMessage from '../models/LocalizedMessage';
import openSocket from 'socket.io-client';
import ShowWin from "./ShowWin";

class SichuanClient extends React.Component {
    constructor(props) {
        super(props);
        this.socket = openSocket('wss://mahjong.azps.info/');

        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            currentBonus: 0,
            currentTime: 0,
            discards: [ [], [], [], [] ],
            drawnTile: null,
            gameScores: [],
            hand: [2,2,2,3,3,3,4,4,5,5],
            isComplete: false,
            melds: [ [1,1,1] ],
            myTurn: false,
            players: [],
            settings: { useTimer: true },
        }

        let self = this

        this.state.socket.on('board', board => {
            this.setState(...self.state, {board: board})
        });

        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.setTimer = this.setTimer.bind(this);

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
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
        let isComplete = this.state.isComplete;
        if (isComplete) return;
        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();
        hand[chosenTile]--;
        this.setState({hand: hand});
    }


    render() {
        let { t } = this.props;
        return (
            <Container>
                <Row className="mt-2 no-gutters">
                    <DiscardPool
                        players={this.state.players}
                        discardCount={this.state.discardCount}
                        wallCount={this.state.tilePool && this.state.tilePool.length}
                        showIndexes={this.state.settings.showIndexes} />
                </Row>

                <Hand tiles={this.state.hand}
                    lastDraw={this.state.lastDraw}
                    onTileClick={this.onTileClicked}
                    showIndexes={true}
                    blind={false} />

                <Melds melds={this.state.melds} />

                <Row>Click on a tile to discard it</Row>
                {this.state.settings.useTimer ?
                    <Row className="mt-2" style={{justifyContent:'flex-end', marginRight:1}}><span>{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span></Row>
                    : ""
                }
            </Container>
        );
    }
}

export default withTranslation()(SichuanClient);
