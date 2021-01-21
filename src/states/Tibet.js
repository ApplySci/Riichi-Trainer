import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import History from "../components/History";
import DiscardPool from "../components/DiscardPool";
import { generateHand, fillHand } from '../scripts/GenerateHand';
import { calculateDiscardUkeire, calculateUkeireFromOnlyHand } from "../scripts/UkeireCalculator";
import { calculateStandardShanten } from "../scripts/ShantenCalculator";
import { convertHandToTenhouString, convertHandToTileIndexArray } from "../scripts/HandConversions";
import { evaluateBestDiscard } from "../scripts/Evaluations";
import { shuffleArray, removeRandomItem } from '../scripts/Utils';
import { withTranslation } from 'react-i18next';
import LocalizedMessage from '../models/LocalizedMessage';
import UkeireHistoryData from '../components/ukeire-quiz/UkeireHistoryData';
import HistoryData from '../models/HistoryData';
import ShowWin from "./ShowWin";
const padTile = 31;

class Tibet extends React.Component {
    constructor(props) {
        super(props);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            hand: null,
            lastDraw: -1,
            remainingTiles: null,
            tilePool: null,
            players: [{discards: []}],
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            settings: { spoilers: true, verbose: true, minShanten: 1 },
            stats: {
                totalDiscards: 0,
                totalTenpai: 0,
                totalEfficiency: 0,
                totalPossibleEfficiency: 0,
                totalOptimalDiscards: 0
            },
            history: [],
            isComplete: false,
            shuffle: [],
            disclaimerSeen: false,
            currentTime: 0,
            currentBonus: 0,
            verbose: true,
            spoilers: true
        }
    }

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

    /** Puts all the tiles in the player's hand into the player's discards. */
    discardHand() {
        let hand = this.state.hand;
        let players = this.state.players.slice();

        for (let i = 0; i < hand.length; i++) {
            if (hand[i] === 0) continue;

            for (let j = 0; j < hand[i]; j++) {
                players[0].discards.push(i);
            }
        }

        this.setState({
            players: players
        });
    }

    /**
     * Sets the state to a clean slate based on the given parameters.
     * @param {TileCounts} hand The player's hand.
     * @param {TileCounts} availableTiles The tiles remaining in the wall.
     * @param {TileIndex[]} tilePool A list of tile indexes representing the remaining tiles.
     * @param {UkeireHistoryData[]} history A list of history objects.
     * @param {TileIndex} lastDraw The tile the player just drew.
     */
    setNewHandState(hand, availableTiles, tilePool, history, lastDraw = false) {
        history.unshift(new HistoryData(new LocalizedMessage("trainer.start", { hand: convertHandToTenhouString(hand) })));

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
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            history: history,
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

    /** Generates a new hand and fresh game state. */
    onNewHand() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let history = [];
        let hand, availableTiles, tilePool;

        let minShanten = this.state.settings.minShanten;
        minShanten = Math.max(0, minShanten);

        let remainingTiles = this.getStartingTiles();
        let thisShanten = minShanten - 1;
        do {
            let generationResult = generateHand(remainingTiles, parseInt(this.props.match.params.hs));
            hand = generationResult.hand;
            availableTiles = generationResult.availableTiles;
            tilePool = generationResult.tilePool;

            if (!hand) {
                history.push(new HistoryData(new LocalizedMessage("trainer.error.wallEmpty")));

                this.setState({
                    history: history
                });
                return;
            }
            thisShanten = calculateStandardShanten(this.padHand(hand));
        } while (thisShanten < minShanten)

        this.setNewHandState(hand, availableTiles, tilePool, history);
    }

    /**
     * Creates an array containing how many of each tile should be in the wall at the start of the game based on the current settings.
     * @returns {TileCounts} The available tiles.
     */
    getStartingTiles() {
        let availableTiles = Array(38).fill(0);

        if (this.props.match.params.m === "1") {
            for (let i = 1; i < 10; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.props.match.params.p === "1") {
            for (let i = 11; i < 20; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.props.match.params.s === "1") {
            for (let i = 21; i < 30; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.props.match.params.h === "1") {
            for (let i = 31; i < 38; i++) {
                availableTiles[i] = 4;
            }
        }

        return availableTiles;
    }

    padHand(hand) {
        let paddedHand = hand.slice();
        let nTiles = paddedHand.reduce((a, b) => a + b, 0);
        paddedHand[padTile] += 14 - nTiles;
        return paddedHand;
    }

    /** Discards the clicked tile, adds a message comparing its efficiency with the best tile, and draws a new tile */
    onTileClicked(event) {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();
        let paddedHand = this.padHand(hand);
        let remainingTiles = this.state.remainingTiles.slice();

        let shantenFunction = calculateStandardShanten;
        let ukeire = calculateDiscardUkeire(paddedHand, remainingTiles, shantenFunction);
        if (parseInt(this.props.match.params.hs) < 14) {
            ukeire[padTile] = {value: 0, tiles: []};
        }
        let chosenUkeire = ukeire[chosenTile];

        let handString = convertHandToTenhouString(hand);
        hand[chosenTile]--;
        paddedHand[chosenTile]--;

        let shanten = shantenFunction(paddedHand);
        let handUkeire = calculateUkeireFromOnlyHand(paddedHand, this.getStartingTiles(), shantenFunction);
        let bestTile = evaluateBestDiscard(ukeire);

        let players = this.state.players.slice();
        players[0].discards.push(chosenTile);

        let achievedTotal = this.state.achievedTotal + chosenUkeire.value;
        let possibleTotal = this.state.possibleTotal + ukeire[bestTile].value;
        let tilePool = this.state.tilePool.slice();
        let drawnTile = -1;

        let historyData = new UkeireHistoryData(
            chosenTile,
            chosenUkeire,
            bestTile,
            ukeire[bestTile].value,
            shanten,
            handString,
            handUkeire,
            players[0].discards.slice()
        );

        if (shanten <= 0 && handUkeire.value > 0) {
            // If the hand is tenpai, and has winning tiles outside of the hand, training is complete
            let message = new LocalizedMessage("trainer.complete", { achieved: achievedTotal, total: possibleTotal, percent: Math.floor(achievedTotal / possibleTotal * 1000) / 10 })
            historyData.message = message;
            isComplete = true;
        }

        if (!isComplete) {
            if (this.state.settings.simulate) {
                for (let i = 1; i < players.length; i++) {
                    if (tilePool.length === 0) continue;

                    let simulatedDiscard = removeRandomItem(tilePool);
                    players[i].discards.push(simulatedDiscard);
                    remainingTiles[simulatedDiscard]--;
                }
            }

            if (tilePool.length > 0) {
                drawnTile = removeRandomItem(tilePool);
                hand[drawnTile]++;
                remainingTiles[drawnTile]--;

                historyData.drawnTile = drawnTile;

                if (this.state.settings.useTimer) {
                    this.timer = setTimeout(
                        () => {
                            this.onTileClicked({target:{name:this.state.lastDraw}});
                            this.setState({
                                currentBonus: 0
                            });
                        },
                        (this.state.settings.time + this.state.currentBonus) * 1000
                    );
                    this.timerUpdate = setInterval(this.updateTime, 100);
                }
            }
            else {
                // No tiles left in the wall
                isComplete = true;
            }
        }

        let history = this.state.history;
        history.unshift(historyData);

        let shuffle = this.state.shuffle.slice();

        if (chosenTile !== this.state.lastDraw) {
            for (let i = 0; i < shuffle.length; i++) {
                if (shuffle[i] === chosenTile) {
                    shuffle[i] = this.state.lastDraw;
                    break;
                }
            }
        }

        this.setState({
            hand: hand,
            handUkeire: handUkeire,
            tilePool: tilePool,
            remainingTiles: remainingTiles,
            players: players,
            discardCount: this.state.discardCount + 1,
            optimalCount: this.state.optimalCount + (chosenUkeire.value === ukeire[bestTile].value ? 1 : 0),
            hasCopied: false,
            achievedTotal: achievedTotal,
            possibleTotal: possibleTotal,
            history: history,
            isComplete: isComplete,
            lastDraw: drawnTile,
            shuffle: shuffle,
            disclaimerSeen: true,
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

    /**
     * Starts a new round with the hand the player loaded, if possible.
     * @param {{hand:TileCounts, tiles:number, draw:TileIndex}} loadData The data from the hand parser.
     */
    onHandLoaded(loadData) {
        if (loadData.tiles === 0) {
            this.logToHistory("trainer.error.load");
            return;
        }

        let remainingTiles = this.getStartingTiles();

        // Remove the tiles in the hand from the wall
        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let { hand, availableTiles, tilePool } = fillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if (!hand) {
            this.logToHistory("trainer.error.wallEmpty");
            return;
        }

        let draw = loadData.draw;

        if (draw !== false) {
            draw = Math.min(Math.max(0, draw), 37);
            // Ensure the drawn tile is in the hand
            if (hand[draw] <= 0) draw = false;
        }

        this.setNewHandState(hand, availableTiles, tilePool, [], draw);
    }

    /**
     * Adds an object to the history containing just a message.
     * @param {string} text The localization key to log to the history.
     */
    logToHistory(text) {
        let history = this.state.history;
        history.unshift(new HistoryData(new LocalizedMessage(text)));
        this.setState({
            history: history,
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params !== prevProps.match.params) {
          this.onNewHand();
        }
    }

    render() {
        let { t } = this.props;
        let nGroups = Math.floor(this.props.match.params.hs/3);
        return (
            <Container>
                <Row>A winning hand has {nGroups} group{nGroups > 1 ? "s" : ""} of three tiles, and an identical pair.
                Within any one group, all the tiles must come from the same suit. Different groups can come from different suits.</Row>
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
                    <History history={this.state.history} concise={this.state.settings.extraConcise} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers}/>
                    <DiscardPool players={this.state.players} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} showIndexes={this.state.settings.showIndexes} />
                </Row>
            </Container>
        );
    }
}

export default withTranslation()(Tibet);
