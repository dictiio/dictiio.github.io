const audioButton = document.getElementById("audiobtn")
function playSound(src){
    if(audioButton.value == "on"){
        const audio = new Audio(src);
        audio.play()
    }
}

let gameState = "MENU";
let difficulty = "easy";
let timer;
let timerMax;

let guess = "";
let numberToGuess;

let timerInstance;

let lobbyMusic = new sound("sounds/lobbymusic.mp3");
let defuseMusic = new sound("sounds/defusemusic.mp3");

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    
    this.sound.setAttribute("controls", "none");
    this.sound.setAttribute("loop", "true");

    this.sound.setAttribute("muted", "true");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.pause = function(){
        this.sound.pause();
    }
}

function startGame(diff){
    lobbyMusic.pause();
    difficulty = diff;
    document.getElementById("game").style.visibility = "visible"
    document.getElementById("bg").style.backgroundImage = "url('images/inside.gif')"
    document.getElementById("menu").style.visibility = "hidden"
    document.getElementById("defusescreen").style.visibility = "visible"
    document.querySelector(".difficultycontainer").style.visibility = "hidden";
    numberToGuess = Math.ceil(Math.random()*100);
    console.log("Correct number: " + numberToGuess)
    gameState = "ACTIVE";
    startGuessLoop();
    if(difficulty == "medium"){ // medium
        timerMax = 180;
    } else if (difficulty == "hard"){ // hard
        timerMax = 120;
    } else { // easy
        timerMax = 240;
    }
    timer = timerMax;
    refreshTimer()
    defuseMusic.play();

    
}



function refreshTimer(){
    timerInstance = setTimeout(refreshTimer, 1000);
    if(timer <= 0){
        timer = 0;
        lose()
        clearTimeout(timerInstance)
        
    }
    updateCounter();
    updateBarTimer();
    playSound("sounds/tick.mp3")
    timer--;
    
}

function updateCounter(){
    const timerDisplay = document.getElementById("timer");
    timerDisplay.innerHTML = convertSecondsToTimerString(timer);
}

function updateBarTimer(){
    const barTimerOver = document.getElementById("bartimerover")
    let percent = (timer/timerMax)*100;
    //console.log(percent);
    let i = 0;
    let j = 0;
    function frame(){
        setTimeout(function(){
            barTimerOver.style.width = (percent-j) + "%";
            //console.log(percent-j)
            i += 0.02
            j = i*(100/timerMax)
            if(i < 1){
                frame()
            }
        }, 20)
        
    }
    frame();
}

function convertSecondsToTimerString(seconds){
    let min = Math.floor(seconds/60);
    let sec = Math.floor(seconds % 60);
    let formattedTimer = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
    return formattedTimer;
}

function startGuessLoop(){
    if(gameState == "ACTIVE"){
        let randomNumber = Math.ceil(Math.random()*100);
        document.getElementById("randomnumber").innerHTML = randomNumber.toString().padStart(3, "0");
        setTimeout(startGuessLoop, 500);
    }
    
}

function damage(){
    if(difficulty == "easy"){
        timer -= 3;
    } else if (difficulty == "medium"){
        timer -= 5;
    } else if (difficulty == "hard"){
        timer -= 7;
    }
    if(timer <= 0){
        timer = 0;
    }
    updateCounter();

}


document.querySelectorAll(".difficultycontainer button").forEach(btn => {
    btn.addEventListener("click", function(){
        playSound("sounds/start.mp3");
        startGame(btn.id);
        
        

    })

    btn.addEventListener("mouseover", function(){
        playSound("sounds/hover.mp3");
    })
})

document.getElementById("start").onclick = () => {
    document.querySelector(".startcontainer").style.visibility = "hidden";
    document.querySelector(".difficultycontainer").style.visibility = "visible";
    lobbyMusic.play();
}


audioButton.onclick = function() {
    if(audioButton.value == "on"){
        audioButton.value = "off";
        document.querySelector("#audiobtn img").src = "icons/volume-xmark-solid.svg";
        defuseMusic.sound.volume = 0;
        lobbyMusic.sound.volume = 0;
    } else {
        audioButton.value = "on";
        document.querySelector("#audiobtn img").src = "icons/volume-high-solid.svg";
        defuseMusic.sound.volume = 1;
        lobbyMusic.sound.volume = 1;
    }
}

document.getElementById("howtoplaybtn").onclick = function(){
    document.querySelector(".howtoplay").style.visibility = "visible";
}

document.getElementById("exithowtoplay").onclick = function(){
    document.querySelector(".howtoplay").style.visibility = "hidden";
}

document.querySelectorAll(".numpad button").forEach(btn => {
    btn.addEventListener("click", function(){
        if(gameState == "ACTIVE"){
            if(btn.value == "delete"){
                guess = "";
                playSound("sounds/beep.mp3")
            } else if (btn.value == "enter"){
                verifyCode();
                guess = "";
            } else {
                guess += btn.value;
                playSound("sounds/beep.mp3")
            }
            document.getElementById("guessbox").innerHTML = guess;
            
            
        }
        
    })
})

function verifyCode(){
    const guessInt = parseInt(guess)
    if(guessInt == numberToGuess){
        sendFeedback("Code is valid. Bomb defused.")
        win();
    } else {
        if(guess == ""){
            sendFeedback("You must enter a number!")
            
        } else {
            damage();
            if(!(guessInt <= 100 && guessInt >= 1)) {
            sendFeedback("Number must be between 1 and 100!")
            } else if(guessInt > numberToGuess){
                sendFeedback("Lower than " + guessInt + "!")
            } else if(guessInt < numberToGuess){
                sendFeedback("Higher than " + guessInt + "!")
            }
        }
        playSound("sounds/wrong.mp3")
        
}
}

function sendFeedback(msg){
    document.getElementById("feedback").style.visibility = "visible";
    document.getElementById("feedback").innerHTML = msg;
}

let timeToGuess;

function win(){
    timeToGuess = timerMax - timer - 1;
    gameState = "OVER";
    playSound("sounds/ding.mp3")
    document.getElementById("randomnumber").innerHTML =  numberToGuess.toString().padStart(3, "0");
    clearTimeout(timerInstance);
    defuseMusic.pause();
    
    setTimeout(displayLeaderboard, 3000)
}



function displayLeaderboard(){
    
    document.getElementById("feedback").style.visibility = "hidden";
    document.getElementById("defusescreen").style.visibility = "hidden";
    document.getElementById("leaderboardscreen").style.visibility = "visible";

    document.getElementById("timetoguess").innerHTML = convertSecondsToTimerString(timeToGuess);
    document.getElementById("leaderboarddifficulty").innerHTML = difficulty;


}

document.getElementById("playagain").onclick = () => {resetGame();}

function promise(ms) { return new Promise(res => setTimeout(res, ms)); }

function lose(){
    document.getElementById("defusescreen").style.visibility = "hidden"
    document.getElementById("losescreen").style.visibility = "visible"
    document.getElementById("feedback").style.visibility = "hidden";

    defuseMusic.pause();

    playSound("sounds/alarm.mp3")

    console.log(document.getElementById("answer").innerHTML);

    const loseCountdown = document.getElementById("losecountdown");
    const screen = document.getElementById("screen");
    let i = 3;
    loseCountdown.innerHTML = 3;
    function countdown(){
        let count = setTimeout(function(){
            if(i <= 0){
                hideScreen();
                clearTimeout(count);
            }
            loseCountdown.innerHTML = i;
            if(i != 3) playSound("sounds/tick.mp3")
            i--;
            if(i >= 0){
                countdown()
            }
            
            
        }, 1000)
    }

    async function hideScreen(){
        for(let j = 0; j < 100; j++){
            screen.style.transform = `translateY(${j*10}px)`;
            await promise(3)
        }
        await promise(2000)
        explosionAnim()
    };

    async function explosionAnim(){
        const whiteoverlay = document.querySelector(".whiteoverlay")
        whiteoverlay.style.visibility = "visible";
        playSound("sounds/explosion.mp3")
        for(let i = 0; i < 1; i += 0.01){
            whiteoverlay.style.opacity = `${i}`
            await promise(2)
        }
        await promise(3000)
        resetGame();
        for(let i = 1; i > 0; i -= 0.01){
            whiteoverlay.style.opacity = `${i}`
            await promise(10)
        }
        whiteoverlay.style.visibility = "hidden";

    }

    setTimeout(countdown, 2000);
    
    
    
}

function resetGame(){
    gameState = "MENU";
    document.getElementById("menu").style.visibility = "visible"
    document.getElementById("bg").style.backgroundImage = "url('images/menu.gif')"
    document.getElementById("game").style.visibility = "hidden"
    document.getElementById("leaderboardscreen").style.visibility = "hidden";
    document.getElementById("losescreen").style.visibility = "hidden";
    document.getElementById("screen").style.transform = "translateY(0px)"
    document.getElementById("guessbox").innerHTML = "ENTER NUMBER";
    document.querySelector(".difficultycontainer").style.visibility = "visible";
    clearTimeout(timerInstance)
    lobbyMusic.play();
}

var keyEnabledArray = Array(222).fill(true);
document.addEventListener("keydown", async function(e) {
    if(keyEnabledArray[e.keyCode]) {
        keyEnabledArray[e.keyCode] = false;
        if(document.getElementById("defusescreen").style.visibility == "visible"){
            if(e.key === "Enter"){
                e.preventDefault()
                document.getElementById("btnent").click();
                document.getElementById("btnent").classList.add("active");
                await promise(100);
                document.getElementById("btnent").classList.remove("active");
                
            }
            if(isFinite(e.key)){
                e.preventDefault()
                document.getElementById(`btn${e.key}`).click()
                document.getElementById(`btn${e.key}`).classList.add("active");
                await promise(100);
                document.getElementById(`btn${e.key}`).classList.remove("active");
            }
            
            if(e.key === "Backspace"){
                e.preventDefault()
                document.getElementById("btndel").click();
                document.getElementById("btndel").classList.add("active");
                await promise(100);
                document.getElementById("btndel").classList.remove("active");
            }
        }
        
    }
})

document.addEventListener("keyup", function(e){
    keyEnabledArray[e.keyCode] = true;
})