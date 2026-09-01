import {Game} from './Game.js';
import {Grid} from './game_element/Grid.js';
import {Tile} from './game_element/Tile.js';


// TODO: Create step multiplayer game
//       Host goes first.
//       When one player moves, the second waits for that turn to be completed and 
//       a tile to be generated, after which they can take their own turn.

export class Multiplayer extends Game{
    #connection = null;
    #isMyStep = false;
    #apiURL = 'http://localhost:5179'
    #gameCode = '';
    #conneted = false;
    #oponentJoined = false;


    constructor(gameField, apiURL = null) {
        super(gameField);

        if (apiURL) this.#apiURL = apiURL;
        
        this.#connection = new window.signalR.HubConnectionBuilder()
            .withUrl(`${this.#apiURL}/gamehub`)
            .withAutomaticReconnect()
            .build();
        
        //------------------------------------------------------------------------------
        // EVENTS from server
        this.#connection.on('PlayerJoined', async () => { // Recipient: HOST || Host create game field and send to oponent
            console.log('Opponent connected');
            this.create();
            let response = await this.syncGameField();
            if(!response) return;
            this.setupInput();
        });

        this.#connection.on('GameFieldSynced', (tiles) => {// Recipient: OPONENT || Oponent get game field
            console.log("Host send game field", tiles);
            this.grid = new Grid(this.gameField);
            for(let i=0; i<tiles.length; i++){
                let tileObject = new Tile();
                tileObject.setValue(tiles[i].value);
                this.grid.getCell(tiles[i].x, tiles[i].y).linkTo(tileObject);
                this.gameField.appendChild(tileObject.getHTMLElement());
            }
        });

        this.#connection.on("invokeMove", async (Move)=>{//Recipient: BOTH ||  Oponent send move
            console.log("Oponent send move", `move:${Move}`);

            await this.move(Move.eventKey);

            let tile = new Tile();
            tile.setCoord(Move.x, Move.y);
            tile.setValue(Move.value);
            this.grid.getCell(Move.x, Move.y).linkTo(tile);
            this.gameField.appendChild(tile.getHTMLElement());

            const gameStatus = this.checkGameOver();
            if (gameStatus == 1 || gameStatus == 2) return; //TODO check game rule

            this.#isMyStep = true;
            this.setupInput();
        });

        this.#connection.on('OpponentDisconnected', () => {// Oponent disconnect
            alert('opponent disconnected');
        });
        //------------------------------------------------------------------------------
    }

    // Overide method (Current plauer step)
    // Attention: first need to call connect() method
    async play(eventKey){
        if (!this.#conneted) throw new Error('Not connected, call connect() method first');
        if (!this.#isMyStep) {console.warn('Not my step'); return;}

        const move = await this.move(eventKey);
        if (!move) return;

        let newTile = await this.createAndAppendTileRand();
        
        console.log("send to server");

        this.#connection.invoke('Move', {
            code: this.#gameCode, 
            eventKey: eventKey, 
            x: newTile.x, 
            y: newTile.y, 
            value: newTile.value
        });
        
        const gameStatus = this.checkGameOver();
        if (gameStatus == 1 || gameStatus == 2) return;

    }

    // Method for create connection for game controls
    // Boolean: true - success, false - fail
    async connect() {
         try {
            await this.#connection.start();
            console.log('Connected, connectionId:', this.#connection.connectionId);
            this.#conneted = true;
            return true;
        } catch (err) {
            console.error('Connetion failed:', err);
            return false;
        }
    }

    // If current player is host 
    // Attention: first need to call connect() method
    async hostGame() {
        if (!this.#conneted) throw new Error('Not connected, call connect() method first');

        this.#gameCode = await this.#connection.invoke('CreateGame');
        this.#isMyStep = true; 
        return this.#gameCode; 
    }

    // If current player is guest
    // Attention: first need to call connect() method
    async joinGame(code) {
        if (!this.#conneted) throw new Error('Not connected, call connect() method first');

        const response = await this.#connection.invoke('JoinGame', code);
        if (!response.success) {
            console.error(`Failed to join game: ${response.statusCode} ${response.errorMessage}`);
            return response.statusCode;
        }
        this.#gameCode = code;
        this.#isMyStep = false; 
        return response.statusCode;
    }
    
    // Method for sync game field
    // Boolean: true - success, false - fail
    async syncGameField() {
        let tiles = this.grid.getTiles().map(tile => {
            return {
                X: tile.x,
                Y: tile.y,
                Value: tile.value
            }
        });
        const response = await this.#connection.invoke('SyncGameField', {
            code: this.#gameCode,
            tiles: tiles
        });

        if (!response.success) {
            console.error('Failed to sync game field:', response.statusCode, response.errorMessage);
            return false;
        }

        return true;
    }
}