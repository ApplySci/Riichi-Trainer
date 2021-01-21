import React from 'react';
import { Container } from 'reactstrap';
import Hand from '../components/Hand';

export default function Intro() {
    let hand = Array(38).fill(0);
    let pin = hand.slice();
    let sou = hand.slice();
    let man = hand.slice();
    let hon = hand.slice();
    for (let i=1; i < 10; i++) {
        man[i] = 1;
        pin[i+10] = 1;
        sou[i+20] = 1;
        if (i < 8) hon[i+30] = 1;
    }
    return (
        <Container>
            <ul className="azpslist">
                <li>A mahjong set is made up of three suits.</li>
                <li>Within each suit, there are nine different kinds of tile, numbered 1 to 9.</li>
                <li>Each tile has four exact copies.</li>
                <li>(Some rulesets - but not the one we're using today - also have honour tiles.)</li>
                <li>A winning hand is made up of a number of groups of three tiles, and an identical pair.</li>
                <li>The tiles within any single group must come from within the same suit.</li>
                <li>They can either form a sequence of three <i>consecutive</i> tiles (e.g. 123 or 567; but not 135 or 468)</li>
                <li>Or a triplet of identical tiles (e.g. 777)</li>
                <li>We will introduce these suits into the hand one at a time.</li>
            </ul>
            <h2>The dots (aka circles, pin)</h2>
            <Hand tiles={pin} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={pin} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={pin} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={pin} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <h2>The bams (aka bamboo, sou)</h2>
            <Hand tiles={sou} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={sou} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={sou} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={sou} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <h2>The cracks (aka characters, myriad, wan, man)</h2>
            <Hand tiles={man} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={man} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={man} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={man} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <h2>And the tiles we're not using today, the Honour tiles</h2>
            <h4>Four winds: East, South, West &amp; North; and three dragons: White, Green &amp; Red</h4>
            <Hand tiles={hon} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={hon} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={hon} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
            <Hand tiles={hon} lastDraw={-1} onTileClick={null} showIndexes={true} blind={false} />
        </Container>
    );
}
