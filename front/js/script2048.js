import {SinglGame} from './2048/SinglGame.js';
import {Multiplayer} from './2048/Multiplayer.js';

const gameField = document.getElementById('game_field');
gameField.style.display = 'none';

document.getElementById('singleplayerBTN').addEventListener('click',(e)=>{
    const game = new SinglGame(gameField);
    game.start();
    displayGame();
});

document.getElementById('multiplayerBTN').addEventListener('click', async (e)=>{
    //Create game and connect to server
    const game = new Multiplayer(gameField);
    const conResult = await game.connect();

    // Return if connection failed
    if (!conResult) {
        alert('Не удалось подключиться к серверу');
        return;
    }

    // Hide first menu options and show multiplayer game options
    document.getElementById('singleplayerBTN').style.display = 'none';
    document.getElementById('multiplayerBTN').style.display  = 'none';
    
    const joinGameBTN = document.getElementById('joinGameBTN');
    const createGameBTN = document.getElementById('createGameBTN');
    const joinCode = document.getElementById('joinCode');
    joinGameBTN.style.display = 'block';
    createGameBTN.style.display = 'block';
    document.getElementsByClassName('join')[0].style.display = 'flex';

    // ================= Start game listeners =================
    // Create 
    createGameBTN.addEventListener('click', async (e)=>{
        const code = await game.hostGame();
        const codeElem = document.getElementById("code");
        codeElem.style.display = 'flex';
        codeElem.innerText = code;

        displayGame();
    });

    // Join
    joinGameBTN.addEventListener('click', async (e)=>{
        const code = joinCode.value;
        if(!code) {
            alert('Введите код игры для присоединения');
            return;
        }

        let status = await game.joinGame(code);
        switch(status){
            case 404:
                alert('Игра не найдена');
                return;
            case 409:
                alert('Игра заполнена');
                return;
            default:
                break;
        }
        displayGame();

    });

});



function displayGame(){
    document.getElementsByClassName('choise_menu')[0].style.display = 'none';
    gameField.style.display = 'grid';
}