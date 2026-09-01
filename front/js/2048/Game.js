import {Grid} from './game_element/Grid.js';
import {Tile} from './game_element/Tile.js';

// This class is base for all games.
// Does not contain the game implementation method, need to override metod play
// use this logic:
//      Move (It is necessary to verify that the movement has occurred.)
//      Create new tile
//      Check game over
//      Update input listener
// To initialize the logic, you need to call the setupInput() method.
export class Game {
    constructor(gameField){
        this.gameField = gameField;
    }

    // Method for creating a grid and placing two tiles on it
    create(){
        this.grid = new Grid(this.gameField);
        for(let i = 0; i < 2; i++){
            let tile = new Tile();
            this.grid.getRandomEmptyCell().linkTo(tile);
            this.gameField.appendChild(tile.getHTMLElement());
        }
    }

    // Main method, called on a key press event
    async play(eventKey){ /* Need to implement */ }

    //=========================================================================
    // Working with an event listener

    setupInput() {
        this.handleKeydown = async (event) => { await this.play(event.key); };
        window.addEventListener('keydown', this.handleKeydown, {once: true});
    }

    delInput() {
        window.removeEventListener('keydown', this.handleKeydown);
    }

    //=========================================================================
    // Gameplay methods

    // Method for move tiles using keyboard 
    // boolean: true - move, false - not move
    async move(key){
        switch(key){
            case 'ArrowUp':
                if (!this.canMove(this.grid.GroupColumn())) {
                    this.setupInput();
                    return false;
                }
                await this.slideTiles(this.grid.GroupColumn());
                break;

            case 'ArrowDown':
                if (!this.canMove(this.grid.GroupColumnReverse())) {
                    this.setupInput();
                    return false;
                }
                await this.slideTiles(this.grid.GroupColumnReverse());
                break;

            case 'ArrowLeft':
                if (!this.canMove(this.grid.GroupRow())) {
                    this.setupInput();
                    return false;
                }
                await this.slideTiles(this.grid.GroupRow());
                break;

            case 'ArrowRight':
                if (!this.canMove(this.grid.GroupRowReverse())) {
                    this.setupInput();
                    return false;
                }
                await this.slideTiles(this.grid.GroupRowReverse());
                break;

            default:
                this.setupInput();
                return false;
        }
        return true;
    }

    // Method for create new tile in random cell and append to grid
    // Tile - new tile appended to grid
    async createAndAppendTileRand(){
        const newTile = new Tile();
        this.grid.getRandomEmptyCell().linkTo(newTile);
        this.gameField.appendChild(newTile.getHTMLElement());
        await newTile.waitForAnim();
        return newTile;
    }

    // Method for create new tile in cell and append to grid (void)
    // Throw error if cell is occupied
    async createAndAppendTile(indexCell){
        if (this.grid.cells[indexCell].isOccupied()) throw new Error('Cell is occupied');

        const newTile = new Tile();
        this.grid.cells[indexCell].linkTo(newTile);
        this.gameField.appendChild(newTile.getHTMLElement());
        await newTile.waitForAnim();
    }

    //Method for check game over 
    //Int: 1 - Game Over (lose), 2 - Game Over (win), 0 - Game not over
    checkGameOver(){
        if(!this.canMove(this.grid.GroupColumn()) && 
           !this.canMove(this.grid.GroupColumnReverse()) && 
           !this.canMove(this.grid.GroupRow()) && 
           !this.canMove(this.grid.GroupRowReverse())){

            alert('Game Over, you lose :(');
            return 1;
        }

        for(let cell of this.grid.cells){
            if (cell.isOccupied() && cell.tile.value == 2048) {
                alert('Game Over, you win! :)');
                return 2;
            }
        }

        return 0;
    }

    //Method for check can move tiles 
    //boolean: true - can move, false - can not move
    canMove(groupedCells){
        return groupedCells.some(group => {
            return group.some((cell, index) => {
                if (index === 0) return false;
                if (!cell.isOccupied()) return false;
                return group[index-1].isCanShear(cell.tile);
            })
        });
    }

    //=========================================================================
    // Iner method for move tiles
    async slideTiles(groupedCells){
        const promeses = [];

        for(let column of groupedCells){// slide tile in groups loop
            for(let i = 1; i < column.length; i++){// slide tile in once group loop
                if (!column[i].isOccupied()){continue;}
                
                let targetCell;
                let j = i-1;

                while(j >= 0 && column[j].isCanShear(column[i].tile)){
                    targetCell = column[j];
                    j--;
                }
                if (targetCell == null) continue;   
                
                promeses.push(column[i].tile.waitForSlideAnim());
                
                if(!targetCell.isOccupied()){
                    targetCell.linkTo(column[i].tile);
                }else{
                    targetCell.sumLinkTo(column[i].tile);
                }
                
                column[i].unlinkTile();
            }
        }

        await Promise.all(promeses);

        for(let cell of this.grid.cells){// sum tiles in grid loop
            if (cell.hasTileForSum()) cell.sum();
        }
    }

}