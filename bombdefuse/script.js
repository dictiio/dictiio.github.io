const audioButton = document.getElementById("audiobtn")

let gameState = "MENU";
let difficulty = "easy";
let timer;
let timerMax;
let timeToGuess;

let guess = "";
let numberToGuess;

let timerInstance;

let lobbyMusic = new sound("sounds/lobbymusic.mp3");
let defuseMusic = new sound("sounds/defusemusic.mp3");

function playSound(src){
    if(audioButton.value == "on"){
        const audio = new Audio(src);
        audio.play()
    }
}

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

function startGame(diff = "easy"){
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
    let damage = 0;
    if(difficulty == "easy"){
        damage = 3;
    } else if (difficulty == "medium"){
        damage = 5;
    } else if (difficulty == "hard"){
        damage = 7;
    }
    timer -= damage;
    if(timer <= 0){
        timer = 0;
    }
    timeLossAnim(damage);
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



function win(){
    timeToGuess = timerMax - timer - 1;
    gameState = "OVER";
    playSound("sounds/ding.mp3")
    highscores.register(difficulty, timeToGuess);
    document.getElementById("randomnumber").innerHTML =  numberToGuess.toString().padStart(3, "0");
    clearTimeout(timerInstance);
    defuseMusic.pause();
    
    setTimeout(displayLeaderboard, 3000)
}

let highscores = {
    easy: [], 
    medium: [], 
    hard: [],
    
    retrieve : function(){
        console.log("Retrieved local storage")
        if(localStorage.getItem("hseasy") == null) localStorage.setItem("hseasy", JSON.stringify([]))
        if(localStorage.getItem("hsmedium") == null) localStorage.setItem("hsmedium", JSON.stringify([]))
        if(localStorage.getItem("hshard") == null) localStorage.setItem("hshard", JSON.stringify([]))
        this.easy = JSON.parse(localStorage.getItem("hseasy"))
        this.medium = JSON.parse(localStorage.getItem("hsmedium"))
        this.hard = JSON.parse(localStorage.getItem("hshard"))
    },
    register : function(diff, time){
        if(this.hasOwnProperty(diff)){
            if(!(this[diff].includes(time))){
                this[diff].push(time)
                localStorage.setItem(`hs${diff}`, JSON.stringify(this[diff]))
            }
        } else {
            console.error("Time could not be registered.")
        }
        
    },
    reset : function(){
        this.easy = []
        this.medium = []
        this.hard = []
        console.log("Cleared local storage.")
        localStorage.clear();
    },

    saveAll : function(){
        localStorage.setItem("hseasy", JSON.stringify(this.easy))
        localStorage.setItem("hsmedium", JSON.stringify(this.medium))
        localStorage.setItem("hshard", JSON.stringify(this.hard))
    },

    getSorted : function(diff){
        let list;
        if(this[diff]){
            list = this[diff];

            const sortedList = list;
            sortedList.sort(function(a, b){return a-b})
            return sortedList;
        } else {
            console.error("Could not find difficulty.")
        }

        

    }
}

// highscores.reset();
highscores.retrieve()

async function timeLossAnim(time = 0){
    const lostTime = document.getElementById("losttime")

    const lostTimeChild = lostTime.cloneNode(true);
    lostTime.after(lostTimeChild);

    lostTimeChild.innerHTML = `-${time}s`

    for(let i = 0; i < 1; i += 0.1){
        lostTimeChild.style.opacity = 1-i;
        
        lostTimeChild.style.transform = `translateY(${i*30}px)`
        await promise(50)
    }
}

function displayLeaderboard(){
    
    document.getElementById("feedback").style.visibility = "hidden";
    document.getElementById("defusescreen").style.visibility = "hidden";
    document.getElementById("leaderboardscreen").style.visibility = "visible";

    document.getElementById("timetoguess").innerHTML = convertSecondsToTimerString(timeToGuess);
    document.getElementById("leaderboarddifficulty").innerHTML = difficulty;

    const sortedList = highscores.getSorted(`${difficulty}`);
    console.log("Sorted list of best times: " + sortedList)
    for(let i = 0; i < 3; i++){
        if(sortedList[i] == null){
            document.getElementById(`best${i+1}`).innerHTML = "None";
        } else {
            document.getElementById(`best${i+1}`).innerHTML = convertSecondsToTimerString(sortedList[i])
            if(timeToGuess == sortedList[i]){
                document.getElementById(`best${i+1}`).style.fontWeight = "bold";
                document.getElementById(`best${i+1}`).innerHTML = convertSecondsToTimerString(sortedList[i])
            }
            
        }
        
    }


}



document.getElementById("playagain").onclick = () => {resetGame();}

function promise(ms) { return new Promise(res => setTimeout(res, ms)); }

function lose(){
    document.getElementById("defusescreen").style.visibility = "hidden"
    document.getElementById("losescreen").style.visibility = "visible"
    document.getElementById("feedback").style.visibility = "hidden";

    defuseMusic.pause();

    playSound("sounds/alarm.mp3")

    document.getElementById("answer").innerHTML = numberToGuess;

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
    document.getElementById("best1").style.fontWeight = "normal";
    document.getElementById("best2").style.fontWeight = "normal";
    document.getElementById("best3").style.fontWeight = "normal";
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