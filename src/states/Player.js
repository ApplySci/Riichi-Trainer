export default class Player {
    constructor(props) {
        super(props);
        this.state = {
            discards: [],
            hand: [],
            melds: [],
            name: null,
            gameScore: 0,
            socket: null,
            totalScore: 0,
        }
    }
}