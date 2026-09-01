import {Game} from './Game.js';


export class SinglGame extends Game{
    start(){
        this.create();
        this.setupInput();
    }

    // Overide method
    async play(eventKey){
        const move = await this.move(eventKey);
        if (!move) return;

        await this.createAndAppendTileRand();

        const gameStatus = this.checkGameOver();
        if (gameStatus == 1 || gameStatus == 2) return;

        this.setupInput();
    }

}