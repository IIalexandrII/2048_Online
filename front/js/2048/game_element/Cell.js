export class Cell {
    constructor(x,y){
        this.x = x;
        this.y = y;

        this.cell = document.createElement('div');
        this.cell.classList.add('cell');

        this.tile = null
    }

    getHTMLElement(){
        return this.cell;
    }

    linkTo(tile){
        tile.setCoord(this.x, this.y);
        this.tile = tile;
    }

    sumLinkTo(tile){
        tile.setCoord(this.x, this.y);
        this.tileForSum = tile;
    }

    unlinkTile(){
        this.tile = null;
    }
    
    unlinkTileForSum(){
        this.tileForSum = null;
    }

    isCanShear(newTile){
        return !this.isOccupied() || (!this.hasTileForSum() && this.tile.value == newTile.value);
    }

    hasTileForSum(){
        return this.tileForSum != null;
    }

    isOccupied(){
        return this.tile != null;
    }

    sum(){
        this.tile.setValue(this.tile.value + this.tileForSum.value);
        this.tileForSum.getHTMLElement().remove();
        this.unlinkTileForSum();
    }
    
}