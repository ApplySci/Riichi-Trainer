import React from 'react';
import { Container, Row, Button } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import Tile from '../components/Tile';

class ShowWin extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedTiles: [] };
        this.onTileClicked = this.onTileClicked.bind(this);
    }

    componentDidMount() {
    }

    onTileClicked(evt) {
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

    render() {
        const tiles = [];
        const selectedTiles = this.state.selectedTiles;
        const callback = this.onTileClicked;
        console.log(selectedTiles);
        this.props.remainingTiles.forEach(function (v, i, a) {
            if (v > 0) {
                tiles.push(<Tile className={'handTile' + (selectedTiles.indexOf(i) > -1 ? ' selected': '')}
                      tile={i}
                      onClick={callback}
                      showIndexes={true}
                />);
            } else return null;
        })
        return (
          <Container className="pickWinners">
            <Row>Pick the tiles that you can win on, and click the Done button when you've found them all.</Row>
            <Row>{tiles}</Row>
            <Button>Done</Button>
          </Container>
        );
    }
}

export default withTranslation()(ShowWin);
