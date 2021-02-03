import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';
import { useTranslation } from 'react-i18next';
import { TILE_INDEXES } from '../Constants';
import Toggle from 'react-toggle';

function TileCheckbox(props) {
    let { t } = useTranslation();

    let displayTile = props.displayTile || props.tile;
    return (
        <div className={props.className}>
            <img
                className="tile"
                name={props.tile}
                src={getTileImage(displayTile)}
                title={getTileAsText(t, displayTile)}
                alt={getTileAsText(t, displayTile)}
                onClick={props.onClick}
            />
            <span className="index">{props.showIndexes ? TILE_INDEXES[displayTile] : ""}</span>
            { props.checked === null ? null :
                <span className="tileCheckbox">
                    <label><Toggle
                        name={'cb' + props.tile}
                        value={props.tile}
                        checked={props.checked}
                        onChange={props.checkedFn} />
                    Pon!</label>
                </span>
            }
        </div>
    );
}

export default TileCheckbox;