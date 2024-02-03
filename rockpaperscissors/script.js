const playerButtons = document.querySelectorAll(".playeroptions button")
const computerButtons = document.querySelectorAll(".computeroptions button")

const game = {
    score: 0,
    health: 100,
    maxHealth: 100,
    playerPick: null,
    computerPick: null,
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
        document.getElementById("maxhealth").innerHTML = this.maxHealth;
    },
    setPick: function(num){
        this.playerPick = num
    },
    setRandomComputerPick: function(){
        this.computerPick = Math.floor(Math.random()*3)
    },
    playComputer: function(){
        this.setRandomComputerPick()
        console.log(this.computerPick)

        let btn = computerButtons[this.computerPick]
        btn.classList.add("godownanim")
        setTimeout(function(){
            btn.classList.remove("godownanim")
            btn.style.transform = "translateY(80px)"
            game.battle();
        }, 950) 
    },
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
    battle: function(){
        let outcome = this.getOutcome()
        let feedbackBox = document.getElementById("feedback");
        let feedback;

        switch(outcome){
            case "tie":
                feedback = "Tie!"
                this.addBattleHistory(this.playerPick, this.computerPick, "TIE")
                playSound("sounds/tie.mp3")
                computerButtons[this.computerPick].style.backgroundColor = "#b8b8b8"
                playerButtons[this.playerPick].style.backgroundColor = "#b8b8b8"
                break;
            case "loss":
                feedback = "Computer wins!"
                this.damage(10)
                this.addBattleHistory(this.playerPick, this.computerPick, "-10HP")
                playSound("sounds/lose.mp3")
                computerButtons[this.computerPick].style.backgroundColor = "#b8f1a7"
                playerButtons[this.playerPick].style.backgroundColor = "#f5b9b9"
                break;
            case "win":
                feedback = "You win!"
                this.addScore(100)
                this.addBattleHistory(this.playerPick, this.computerPick, "+100PTS")
                playSound("sounds/win.mp3")
                computerButtons[this.computerPick].style.backgroundColor = "#f5b9b9"
                playerButtons[this.playerPick].style.backgroundColor = "#b8f1a7"
                break;
        }
        feedbackBox.classList.remove("opacityfadeout")
        feedbackBox.innerHTML = feedback;
        setTimeout(function(){
            feedbackBox.classList.add("opacityfadeout")
        }, 50)
        
        setTimeout(this.resetPicks.bind(this), 1500)
    },
    addScore: function(score){
        this.score += score;
        document.getElementById("score").innerHTML = this.score;
    },
    damage: function(damage){
        this.health -= damage;
        document.getElementById("health").innerHTML = this.health;
        if(this.health <= 0){
            this.end();
        }
    },
    end: function(){
        gameGuiManager.display("end")
        
    },
    resetPicks: function(){
        computerButtons[this.computerPick].style.transform = "translateY(0px)"
        computerButtons[this.computerPick].style.backgroundColor = "#ffffff"
        playerButtons[this.playerPick].style.transform = "translateY(0px)"
        playerButtons[this.playerPick].style.backgroundColor = "#ffffff"
        playerButtons[this.playerPick].classList.add("unpicked");
        this.computerPick = null;
        this.playerPick = null;
    },
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
    end: function(){
        gameGuiManager.display("end")
        document.getElementById("battlesamount").innerHTML = document.querySelector(".log ol").childElementCount;
        document.getElementById("endscore").innerHTML = this.score;
    },
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
        guiManager.display("difficultymenu");
        var ol = document.querySelector(".log ol")
        while(ol.firstChild){
            ol.removeChild(ol.firstChild)
        }
        gameGuiManager.hide();
        document.querySelector(".gamegui-start h3").innerHTML = "3"
        
        
    }
}

const guiManager = {
    current: "menu",
    display: function(id){
        document.querySelector(`.${this.current}`).style.visibility = "hidden"
        document.querySelector(`.${id}`).style.visibility = "visible"
        this.current = id
    }
}

const gameGuiManager = {
    current: "start",
    display: function(id){
        
        console.log("CURRENT: " + this.current)
        console.log("NEW: " + id)
        document.querySelector(`.gamegui-${this.current}`).style.visibility = "hidden"
        document.querySelector(`.gamegui-${id}`).style.visibility = "visible"
        this.current = id;
    },
    hide: function(){
        document.querySelector(`.gamegui-${this.current}`).style.visibility = "hidden"
    }
}

function startCountdown(){
    const countdown = document.querySelector(".gamegui-start h3")
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

function numberToPick(num){
    if(num == 0) return "Rock"
    if(num == 1) return "Paper"
    if(num == 2) return "Scissors"
}

function playSound(src){
    var audio = new Audio(src)
    audio.play()
}

document.getElementById("menu-start").onclick = () => {
    guiManager.display("difficultymenu")
    
}

document.querySelectorAll(".playeroptions button").forEach(btn => {
    btn.onclick = function(){
        if(game.playerPick == null){
            playSound("sounds/pop.mp3")
            btn.classList.add("goupanim")
            setTimeout(function(){
                btn.classList.remove("goupanim")
                btn.style.transform = "translateY(-80px)"
                btn.classList.remove("unpicked");
            }, 950)
            
            game.setPick(btn.value)
            console.log(game.playerPick)

            game.playComputer();
        }   
        
    }
})

document.querySelectorAll(".difficulty button").forEach(btn => {
    btn.onclick = () => {
        game.start(btn.value)
        playSound("sounds/pop.mp3")
    }
})

document.querySelector(".log button").onclick = () => {
    playSound("sounds/pop.mp3")
    game.end();
}

document.getElementById("playagain").onclick = () => {
    playSound("sounds/pop.mp3")
    game.reset();
}
