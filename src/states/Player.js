export default class Player {
    constructor() {
        this.discards = [];
        this.hand = [2,2,2,3,3,3,4,4,5,5];
        this.melds = [[1,1,1]];
        this.name = '';
        this.gameScore = 0;
        this.socket = null;
        this.totalScore = 0;
        this.voidedSuit = null;
        this.waits = [4,5];
    }
}