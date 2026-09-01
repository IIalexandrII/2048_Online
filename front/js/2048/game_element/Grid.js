import {Cell} from './Cell.js';



export class Grid {
   #GRID_SIZE = 4;
   #SELLS_NUM = this.#GRID_SIZE * this.#GRID_SIZE;
    constructor(gridElement){
        this.gridElement = gridElement;
        this.cells = [];
        for(let i = 0; i < this.#SELLS_NUM; i++){
            this.cells.push(
                new Cell(i % this.#GRID_SIZE, Math.floor(i / this.#GRID_SIZE))
            );
            gridElement.appendChild(this.cells[i].getHTMLElement());
        }
    }

   getCell(x,y){
      return this.cells[x + y * this.#GRID_SIZE];
   }

   getTiles(){
      let tiles = [];
      for(let cell of this.cells){
         if (cell.isOccupied()) tiles.push(cell.tile);
      }
      return tiles;
   }

   getRandomEmptyCell(){
      const emptyCells = this.cells.filter(cell => !cell.isOccupied());

      if(emptyCells.length == 0) return null; 
      const index = Math.floor(Math.random() * emptyCells.length);
      
      return emptyCells[index];
   }

   GroupColumn(){
      return this.cells.reduce((result,cell)=>{
         result[cell.x] = result[cell.x] || [];
         result[cell.x][cell.y] = cell;
         return result;
      },[])
   }

   GroupColumnReverse(){
      return this.GroupColumn().map(column => [...column].reverse());
   }
   
   GroupRow(){
      return this.cells.reduce((result,cell)=>{
         result[cell.y] = result[cell.y] || [];
         result[cell.y][cell.x] = cell;
         return result;
      },[])
   }

   GroupRowReverse(){
      return this.GroupRow().map(row => [...row].reverse());
   }
}