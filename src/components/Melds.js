import React from 'react';
import { Row } from 'reactstrap';
import Tile from './Tile';

function Melds(props) {

    if (!props.melds.length) {
        return null;
    }

    const tiles = [];
    for (let meld of props.melds) {
        for (let oneTile of meld) {
            tiles.push((
                <Tile className="handTile"
                    key=''
                    tile={oneTile}
                    onClick={null}
                    showIndexes={true}
                />
            ));
        }
        tiles.push(<span className='handTile'></span>);
    }
    return (
        <Row className='melds'>
            {tiles}
        </Row>
    );
}

export default Melds;