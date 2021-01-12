import { removeRandomItem } from "./Utils";
import { convertHandToTileIndexArray } from "./HandConversions";

/**
 * Generates a random hand of the right size
 * @param {TileCounts} remainingTiles The number of each tile in the wall.
 */
export function generateHand(remainingTiles, handSize) {
    let availableTiles = remainingTiles.slice();
    let tilePool = convertHandToTileIndexArray(availableTiles);

    if (tilePool.length < handSize) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    let hand = Array(38).fill(0);

    for (let i = 0; i < handSize; i++) {
        let tile = removeRandomItem(tilePool);
        hand[tile]++;
        availableTiles[tile]--;
    }

    return {
        hand,
        availableTiles,
        tilePool
    };
}

/**
 * Adds a number of tiles to the given hand.
 * @param {TileCounts} remainingTiles The number of each tile in the wall.
 * @param {TileCounts} hand The number of each tile in the player's hand.
 * @param {number} tilesToFill How many tiles to add.
 */
export function fillHand(remainingTiles, hand, tilesToFill) {
    let availableTiles = remainingTiles.slice();
    let tilePool = convertHandToTileIndexArray(availableTiles);

    if (tilePool.length < tilesToFill) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    for (let i = 0; i < tilesToFill; i++) {
        let tile = removeRandomItem(tilePool);
        hand[tile]++;
        availableTiles[tile]--;
    }

    return {
        hand,
        availableTiles,
        tilePool
    };
}