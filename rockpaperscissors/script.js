// player and computer buttons
const playerButtons = document.querySelectorAll(".playerOptions button")
const computerButtons = document.querySelectorAll(".computerOptions button")


// Game Manager, & properties
const game = {
    score: 0,
    health: 100,
    maxHealth: 100,
    playerPick: null,
    computerPick: null,
    streak: 0,
    // start game
    start: function(difficulty = "easy"){
        guiManager.display("game")
        gameGuiManager.display("start")
        if(difficulty == "easy") this.maxHealth = 100 
        if(difficulty == "medium") this.maxHealth = 70 
        if(difficulty == "hard") this.maxHealth = 50 
        this.health = this.maxHealth
        startCountdown()
        document.getElementById("score").innerHTML = this.score;
        document.getElementById("health").innerHTML = this.health;
        document.getElementById("maxHealth").innerHTML = this.maxHealth;
        streakbar.setMultiplier(0)
    },
    // set player pick
    setPick: function(num){
        this.playerPick = num
    },
    // set a random pick for computer
    setRandomComputerPick: function(){
        this.computerPick = Math.floor(Math.random()*3)
    },
    // play animation for computer, and start battle
    playComputer: function(){
        this.setRandomComputerPick()
        let btn = computerButtons[this.computerPick]
        btn.classList.add("goDownAnim")
        setTimeout(function(){
            btn.classList.remove("goDownAnim")
            btn.style.transform = "translateY(80px)"
            game.battle();
        }, 950) 
    },
    // returns win, tie, or loss depending on game picks
    getOutcome: function(){
        if(this.playerPick == this.computerPick) {
            return "tie";
        } else if (
            (this.playerPick == 0 && this.computerPick == 2) ||
            (this.playerPick == 1 && this.computerPick == 0) ||
            (this.playerPick == 2 && this.computerPick == 1)
        ) {
            return "win";
        } else {
            return "loss";
        }
    },
    // gets outcome and manages animations and values
    battle: function(){
        let outcome = this.getOutcome()
        let feedbackBox = document.getElementById("feedback");
        let feedback;

        switch(outcome){
            case "tie":
                feedback = "Tie!"
                this.addBattleHistory(this.playerPick, this.computerPick, "TIE")
                playSound("sounds/tie.mp3")

                // changes buttons color
                computerButtons[this.computerPick].style.backgroundColor = "#b8b8b8"
                playerButtons[this.playerPick].style.backgroundColor = "#b8b8b8"
                break;
            case "loss":
                feedback = "Computer wins!"
                this.streak = 0;
                streakbar.setMultiplier(this.streak)
                this.damage(10)
                this.addBattleHistory(this.playerPick, this.computerPick, "-10HP")
                playSound("sounds/lose.mp3")

                // changes buttons color
                computerButtons[this.computerPick].style.backgroundColor = "#b8f1a7"
                playerButtons[this.playerPick].style.backgroundColor = "#f5b9b9"
                break;
            case "win":
                feedback = "You win!"
                
                this.streak++;
                streakbar.setMultiplier(this.streak)
                let scoreToAdd = 100*streakbar.multiplier;
                if(scoreToAdd < 100) scoreToAdd = 100;
                this.addScore(scoreToAdd)
                this.addBattleHistory(this.playerPick, this.computerPick, `+${scoreToAdd}PTS`)
                playSound("sounds/win.mp3")

                // changes buttons color
                computerButtons[this.computerPick].style.backgroundColor = "#f5b9b9"
                playerButtons[this.playerPick].style.backgroundColor = "#b8f1a7"
                break;
        }
        feedbackBox.classList.remove("opacityFadeout")
        feedbackBox.innerHTML = feedback;
        setTimeout(function(){
            feedbackBox.classList.add("opacityFadeout")
        }, 50)
        
        setTimeout(this.resetPicks.bind(this), 1500)
    },
    // adds score and updates text
    addScore: function(score){
        this.score += score;
        document.getElementById("score").innerHTML = this.score;
    },
    // damages player and updates text
    damage: function(damage){
        this.health -= damage;
        document.getElementById("health").innerHTML = this.health;
        if(this.health <= 0){
            this.end();
        }
    },
    // resets all option buttons and pick variables
    resetPicks: function(){
        computerButtons[this.computerPick].style.transform = "translateY(0px)"
        computerButtons[this.computerPick].style.backgroundColor = "#ffffff"
        playerButtons[this.playerPick].style.transform = "translateY(0px)"
        playerButtons[this.playerPick].style.backgroundColor = "#ffffff"
        playerButtons[this.playerPick].classList.add("unpicked");
        this.computerPick = null;
        this.playerPick = null;
    },
    // adds battle to log and updates text
    addBattleHistory: function(player, computer, score){
        var ol = document.querySelector(".log ol")
        var li = document.createElement("li")

        var span1 = document.createElement("span")
        span1.textContent = `${numberToPick(player)} vs. ${numberToPick(computer)}`
        span1.classList.add("versus")
        li.appendChild(span1)

        var span2 = document.createElement("span")
        span2.textContent = `${score}`
        span2.classList.add("score")
        li.appendChild(span2)

        ol.insertBefore(li, ol.firstChild)
    },
    // ends game, displays end screen and updates text
    end: function(){
        gameGuiManager.display("end")
        document.getElementById("battlesAmount").innerHTML = document.querySelector(".log ol").childElementCount;
        document.getElementById("endScore").innerHTML = this.score;
    },
    // resets all game buttons and values to original position/value
    reset: function(){
        playerButtons.forEach((btn => {
            btn.style.transform = "translateY(0px)"
            btn.style.backgroundColor = "#ffffff"
            btn.classList.add("unpicked")

        }))
        computerButtons.forEach((btn => {
            btn.style.transform = "translateY(0px)"
            btn.style.backgroundColor = "#ffffff"

        }))
        this.score = 0;
        this.health = 100;
        this.playerPick = null;
        this.computerPick = null;
        guiManager.display("difficultyMenu");
        var ol = document.querySelector(".log ol")
        while(ol.firstChild){
            ol.removeChild(ol.firstChild)
        }
        gameGuiManager.hide();
        document.querySelector(".gameGui-start h3").innerHTML = "3"
        
        
    }
}

// GUI Manager
const guiManager = {
    current: "menu",
    // displays selected gui and hides current
    display: function(id){
        document.querySelector(`.${this.current}`).style.visibility = "hidden"
        document.querySelector(`.${id}`).style.visibility = "visible"
        this.current = id
    }
}

// Game GUI Manager (inside the game screen)
const gameGuiManager = {
    current: "start",
    // displays selected game gui and hides current
    display: function(id){
        document.querySelector(`.gameGui-${this.current}`).style.visibility = "hidden"
        document.querySelector(`.gameGui-${id}`).style.visibility = "visible"
        this.current = id;
    },
    // hides current game gui
    hide: function(){
        document.querySelector(`.gameGui-${this.current}`).style.visibility = "hidden"
    }
}

// Streakbar & Multiplier Manager
const streakbar = {
    multiplier: 0,
    bar: document.querySelector(".streakbar"),
    multiplierText: document.getElementById("multiplier"),
    // changes width of bar (with a max of 92%)
    setPercent: function(fr){
        let fraction = fr/100*92
        if(fraction > 92) fraction = 92;
        this.bar.style.width = fraction + "%"
    },
    // sets the multiplier value and updates width of bar
    setMultiplier: function(value){
        
        this.multiplier = value;
        if(this.multiplier <= 0) this.multiplier = 0;
        this.multiplierText.innerHTML = "x" + this.multiplier
        this.setPercent(this.multiplier*10)
    },
    // resets the bar and multiplier value to original value
    reset: function(){
        this.multiplier = 0;
        this.setMultiplier(this.multiplier)
    }
}

// start countdown
function startCountdown(){
    const countdown = document.querySelector(".gameGui-start h3")
    var i = 3;
    const timer = setInterval(function(){
        if(i <= 0){
            clearInterval(timer);
            gameGuiManager.display("main")
            playSound("sounds/explosion.mp3")
        } else {playSound("sounds/tick.mp3")}
        countdown.innerHTML = i;
        i--;

    }, 1000)
}

// Converts number to pick (text)
function numberToPick(num){
    if(num == 0) return "Rock"
    if(num == 1) return "Paper"
    if(num == 2) return "Scissors"
}

// plays sound
function playSound(src){
    var audio = new Audio(src)
    audio.play()
}

// Menu start button on click event
document.getElementById("menu-start").onclick = () => {
    guiManager.display("difficultyMenu")
    
}

// Player options pick buttons on click event
document.querySelectorAll(".playerOptions button").forEach(btn => {
    btn.onclick = function(){
        if(game.playerPick == null){
            playSound("sounds/pop.mp3")
            btn.classList.add("goUpAnim")
            setTimeout(function(){
                btn.classList.remove("goUpAnim")
                btn.style.transform = "translateY(-80px)"
                btn.classList.remove("unpicked");
            }, 950)
            game.setPick(btn.value)
            game.playComputer();
        }   
        
    }
})

// Difficulty pick buttons on click event
document.querySelectorAll(".difficulty button").forEach(btn => {
    btn.onclick = () => {
        game.start(btn.value)
        playSound("sounds/pop.mp3")
    }
})

// End game button on click event
document.querySelector(".log button").onclick = () => {
    playSound("sounds/pop.mp3")
    game.end();
}

// Play again button on click event
document.getElementById("playAgain").onclick = () => {
    playSound("sounds/pop.mp3")
    game.reset();
}
