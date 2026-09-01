export class Tile {
    constructor(){
        this.tileElement = document.createElement('div');
        this.tileElement.classList.add('tile');
        
        let val = Math.random() > 0.5 ? 2 : 4;
        this.setValue(val);
    }

    getHTMLElement(){
        return this.tileElement;
    }

    setCoord(x, y){
        this.x = x;
        this.y = y;

        this.tileElement.style.setProperty('--x', x);
        this.tileElement.style.setProperty('--y', y);
    }

    setValue(value){
        this.value = value;
        this.tileElement.innerText = value;
        this.tileElement.style.setProperty('--bgColor', `${240+(30*Math.log2(value))}deg`); 
    }

    waitForSlideAnim(){
        return new Promise(resolve => {
            this.tileElement.addEventListener('transitionend', resolve, {once: true});
        });
    }

    waitForAnim(){
        return new Promise(resolve => {
            this.tileElement.addEventListener('animationend', resolve, {once: true});
        });
    }
}