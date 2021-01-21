import React from 'react';
import { Container, Row, Button } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import Tile from '../components/Tile';

class ShowWin extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedTiles: [], done: false };
        this.onTileClicked = this.onTileClicked.bind(this);
        this.onDone = this.onDone.bind(this);
    }

    componentDidMount() {
    }

    onTileClicked(evt) {
        if (this.state.done) return;
        let selectedTiles = this.state.selectedTiles.slice();
        let tile = parseInt(evt.target.name);
        let pos = selectedTiles.indexOf(tile);
        if (pos > -1) {
            selectedTiles.splice(pos, 1);
        } else {
            selectedTiles.push(tile);
        }
        this.setState({ selectedTiles: selectedTiles });
    }

    onDone(evt) {
        this.setState({ done: true });
    }

    render() {
        const tiles = [];
        const c = this;
        const callback = c.onTileClicked;
        let rightWrong = [0, 0, 0, 0];
        c.props.remainingTiles.forEach(function (v, i, a) {
            if (v > 0) {
                let className = 'handTile';
                if (c.state.selectedTiles.includes(i)) className += ' selected';
                if (c.state.done) {
                    let correct = c.state.selectedTiles.includes(i) === c.props.winningTiles.includes(i);
                    className += correct ? ' right' : ' wrong';
                    let ndx;
                    if (c.state.selectedTiles.includes(i)) {
                        ndx = correct ? 0 : 1;
                    } else {
                        ndx = correct ? 3 : 2;
                    }
                    rightWrong[ndx] += 1;
                }
                tiles.push(<Tile className={className} tile={i} onClick={callback} showIndexes={true} />);
            } else return null;
        })
        return (
          <Container className="pickWinners">
            <Row>Pick the tiles that you can win on, and click the Done button when you've found them all.</Row>
            <Row>{tiles}</Row>
            { c.state.done ? (<Row>
                You scored {rightWrong[0] + rightWrong[3]} out of {tiles.length}.<br/>
                You correctly found {rightWrong[0]} of the {c.props.winningTiles.length} winning tiles,
                and correctly avoided {rightWrong[3]} tiles which you couldn't win on.<br/>
                {(rightWrong[1] + rightWrong[2] === 0) ? " Congratulations!" :
                  " However, "
                + (rightWrong[2] > 0 ? ('you missed ' + rightWrong[2] + ' winning tiles; ') : '')
                + (rightWrong[1] > 0 ? ('you wrongly selected ' + rightWrong[1] + ' non-winning tiles.') : '')
                }
                </Row>)
             : <Button onClick={c.onDone}>Done</Button> }
          </Container>
        );
    }
}

export default withTranslation()(ShowWin);
