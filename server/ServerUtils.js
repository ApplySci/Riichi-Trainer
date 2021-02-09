
/**
 * Calculates how many tiles away from a complete standard hand the given hand is.
 * @param {TileCounts} handToCheck The hand to calculate the shanten of.
 */
export function calculateStandardShanten(handToCheck, minimumShanten_ = -2) {
    hand = convertRedFives(handToCheck);

    // Initialize variables
    hasGivenMinimum = true;
    minimumShanten = minimumShanten_;
    completeSets = 0;
    pair = 0;
    partialSets = 0;
    bestShanten = 8;

    if (minimumShanten_ === -2) {
        hasGivenMinimum = false;
        minimumShanten = -1;
    }

    // Loop through hand, removing all pair candidates and checking their shanten
    for (let i = 1; i < hand.length; i++) {
        if (hand[i] >= 2) {
            pair++;
            hand[i] -= 2;
            removeCompletedSets(1);
            hand[i] += 2;
            pair--;
        }
    }

    // Check shanten when there's nothing used as a pair
    removeCompletedSets(1);

    return bestShanten;
}


/**
 * Removes all possible combinations of complete sets from the hand and recursively checks the shanten of each.
 * @param {TileIndex} i The current tile index to check from.
 */
function removeCompletedSets(i) {
    if (bestShanten <= minimumShanten) return;
    // Skip to the next tile that exists in the hand.
    for (; i < hand.length && hand[i] === 0; i++) { }

    if (i >= hand.length) {
        // We've gone through the whole hand, now check for partial sets.
        removePotentialSets(1);
        return;
    }

    // Pung
    if (hand[i] >= 3) {
        completeSets++;
        hand[i] -= 3;
        removeCompletedSets(i);
        hand[i] += 3;
        completeSets--;
    }

    // Chow
    if (i < 30 && hand[i + 1] !== 0 && hand[i + 2] !== 0) {
        completeSets++;
        hand[i]--; hand[i + 1]--; hand[i + 2]--;
        removeCompletedSets(i);
        hand[i]++; hand[i + 1]++; hand[i + 2]++;
        completeSets--;
    }

    // Check all alternative hand configurations
    removeCompletedSets(i + 1);
}


/**
 * Removes all possible combinations of pseudo sets from the hand and recursively checks the shanten of each.
 * @param {TileIndex} i The current tile index to check from.
 */
function removePotentialSets(i) {
    if (bestShanten <= minimumShanten) return;

    // If we've given a minimum shanten, we can break off early in some cases
    // For example, if we know the hand wants to be tenpai, we know the hand must have 3 complete sets
    if (hasGivenMinimum && completeSets < 3 - minimumShanten) return;

    // Skip to the next tile that exists in the hand
    for (; i < hand.length && hand[i] === 0; i++) { }

    if (i >= hand.length) {
        // We've checked everything. See if this shanten is better than the current best.
        let currentShanten = 8 - (completeSets * 2) - partialSets - pair;
        if (currentShanten < bestShanten) {
            bestShanten = currentShanten;
        }
        return;
    }

    // A standard hand will only ever have four groups plus a pair.
    if (completeSets + partialSets < 4) {
        // Pair
        if (hand[i] === 2) {
            partialSets++;
            hand[i] -= 2;
            removePotentialSets(i);
            hand[i] += 2;
            partialSets--;
        }

        // Edge or Side wait protorun
        if (i < 30 && hand[i + 1] !== 0) {
            partialSets++;
            hand[i]--; hand[i + 1]--;
            removePotentialSets(i);
            hand[i]++; hand[i + 1]++;
            partialSets--;
        }

        // Closed wait protorun
        if (i < 30 && i % 10 <= 8 && hand[i + 2] !== 0) {
            partialSets++;
            hand[i]--; hand[i + 2]--;
            removePotentialSets(i);
            hand[i]++; hand[i + 2]++;
            partialSets--;
        }
    }

    // Check all alternative hand configurations
    removePotentialSets(i + 1);
}


/**
 * Removes a random item from an array and returns it.
 * @param {any[]} array An array of items.
 * @returns {any} The removed item.
 */
export function removeRandomItem(array) {
    return array.splice(randomInt(array.length), 1)[0];
}

/**
 * Converts a hand array into an array of tile indexes.
 * @param {TileCounts} hand An array containing the number of each tile present in the hand.
 * @returns {TileIndex[]} An array of tile indexes.
 */
export function convertHandToTileIndexArray(hand) {
    let result = [];

    for (let i = 0; i < hand.length; i++) {
        for (let j = 0; j < hand[i]; j++) {
            result.push(i);
        }
    }

    return result;
}