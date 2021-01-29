import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import DiscardPool from "../components/DiscardPool";
import { generateHand, fillHand } from '../scripts/GenerateHand';
import { calculateStandardShanten } from "../scripts/ShantenCalculator";
import { convertHandToTileIndexArray } from "../scripts/HandConversions";
import { shuffleArray, removeRandomItem } from '../scripts/Utils';
import { withTranslation } from 'react-i18next';
import LocalizedMessage from '../models/LocalizedMessage';
import openSocket from 'socket.io-client';
import ShowWin from "./ShowWin";
import BaseGame from './BaseGame';
import Player from './Player';

class SichuanClient extends React.Component {
    constructor(props) {
        super(props);
        this.game = new BaseGame();
        this.onTileClicked = this.onTileClicked.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            currentBonus: 0,
            currentTime: 0,
            myTurn: false,
            socket: openSocket('wss://ws.azps.info/')
        }

      let self = this

      this.state.socket.on('board', board => {
          this.setState(...self.state, {board: board})
      });

    }
/*
    componentDidMount() {
        this.setState({}, () => this.onNewHand());
    }

    componentWillUnmount() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
    }

    onSettingsChanged(settings) {
        if (!settings.useTimer) {
            if (this.timer != null) {
                clearTimeout(this.timer);
                clearInterval(this.timerUpdate);
            }
        }

        this.setState({
            settings: settings
        });
    }
*/

    /**
     * Sets the state to a clean slate based on the given parameters.
     * @param {TileCounts} hand The player's hand.
     * @param {TileCounts} availableTiles The tiles remaining in the wall.
     * @param {TileIndex[]} tilePool A list of tile indexes representing the remaining tiles.
     * @param {TileIndex} lastDraw The tile the player just drew.
     */
/*
    setNewHandState(hand, availableTiles, tilePool, lastDraw = false) {

        let players = [{discards: []}];

        if (lastDraw !== false) hand[lastDraw]--;
        let shuffle = convertHandToTileIndexArray(hand);
        if (lastDraw !== false) hand[lastDraw]++;
        shuffle = shuffleArray(shuffle);

        this.setState({
            hand: hand,
            remainingTiles: availableTiles,
            tilePool: tilePool,
            players: players,
            discardCount: 0,
            isComplete: false,
            lastDraw: lastDraw || shuffle.pop(),
            shuffle: shuffle,
            currentTime: this.state.settings.time + 2,
            currentBonus: this.state.settings.extraTime
        });

        if (this.state.disclaimerSeen && this.state.settings.useTimer) {
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

    // Generates a new hand and fresh game state.
    onNewHand() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let hand, availableTiles, tilePool;

        this.setNewHandState(hand, availableTiles, tilePool);
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

        let shantenFunction = calculateStandardShanten;

        hand[chosenTile]--;

        this.setState({
            hand: hand,
            hasCopied: false,
            isComplete: isComplete,
            currentTime: this.state.settings.time,
        });
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


    componentDidUpdate(prevProps) {
        if (this.props.match.params !== prevProps.match.params) {
          this.onNewHand();
        }
    }
*/
    render() {
        let { t } = this.props;
        let nGroups = Math.floor(this.props.match.params.hs/3);
        return (
            <Container>
                <Hand tiles={this.state.hand}
                    lastDraw={this.state.lastDraw}
                    onTileClick={this.onTileClicked}
                    showIndexes={true}
                    blind={false} />
                {this.state.settings.useTimer ?
                    <Row className="mt-2" style={{justifyContent:'flex-end', marginRight:1}}><span>{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span></Row>
                    : ""
                }
                {this.state.isComplete
                    ? <Container>
                        <Row>The hand is now ready to win!</Row>
                        <ShowWin winningTiles={this.state.handUkeire.tiles} remainingTiles={this.state.remainingTiles}/>
                        <Row>Click on the button below for a new hand, or select a new format from the list on the left.</Row>
                      </Container>
                    : <Row>Click on a tile to discard it</Row>
                }
                <Row className="mt-2">
                    <Col xs="6" sm="3" md="3" lg="2">
                        <Button className="metal linear smallmetal" color={this.state.isComplete ? "success" : "warning"} onClick={() => this.onNewHand()}>{t("trainer.newHandButtonLabel")}</Button>
                    </Col>
                </Row>
                <Row className="mt-2 no-gutters">
                    <DiscardPool players={this.state.players} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} showIndexes={this.state.settings.showIndexes} />
                </Row>
            </Container>
        );
    }
}
//                    <History history={this.state.history} concise={this.state.settings.extraConcise} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers}/>

export default withTranslation()(SichuanClient);
