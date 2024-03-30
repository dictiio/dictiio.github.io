const inputBox = document.getElementById("input")

// Game Manager
const game = {
    // default game values
    phase: "waiting",
    difficulty: "easy",
    score: 0,
    maxheight: 750,
    maxwidth: 1200,
    damagePerHit: 10,
    velocityMultiplier: 1,
    velocityIncreaseRate: 0,
    spawningRate: 1,

    // starts the game, must input a difficulty
    start: function(difficulty = "easy"){
        this.difficulty = difficulty

        // sets different values depending on difficulty
        switch(difficulty){
            case "easy":
                this.spawningRate = 3
                this.velocityMultiplier = 1
                this.velocityIncreaseRate = 0
                break
            case "medium":
                this.spawningRate = 2
                this.velocityMultiplier = 1.5
                this.velocityIncreaseRate = 0.003
                break
            case "hard":
                this.spawningRate = 1.5
                this.velocityMultiplier = 2
                this.velocityIncreaseRate = 0.01
                break
        }

        // reset & prepare game
        spaceship.reset()
        perksManager.load()
        healthbar.setMaxHealth(100*perksManager.healthMultiplier)
        this.setPhase("active")
        guiManager.display("game")
        meteorManager.startSpawning(this.spawningRate)
        inputBox.select()
        spaceship.setSkin(userData.info.activeSkin)
        soundManager.playBackgroundMusic("assets/sounds/gamemusic.mp3", 0.5)
        
    },
    // damage the player
    damage: function(){
        soundManager.play("damage")
        healthbar.removeHealth(this.damagePerHit)
    },

    // ends the game
    end: function(){
        if(this.phase != "end"){
            let addedCoins = Math.floor(game.score/10)
            userDataManager.addCoins(addedCoins)

            document.getElementById("endScore").innerHTML = game.score
            document.getElementById("coinsGained").innerHTML = addedCoins

            this.setPhase("end")
            meteorManager.stopSpawning()
            guiManager.display("end")
            soundManager.playBackgroundMusic("assets/sounds/bgmusic.m4a")
        }
        
    },
    // sets phase
    setPhase: function(phase){
        this.phase = phase
    },
    // restarts game
    restart: function(){
        this.phase = "waiting"
        this.difficulty = "easy"
        this.setScore(0)
        this.damagePerHit = 10
        this.velocityMultiplier = 1
        this.velocityIncreaseRate = 0
        guiManager.display("menu")
        healthbar.reset()
        bonusManager.clear()

    },
    // sets player score
    setScore: function(score){
        this.score = score
        document.getElementById("score").innerHTML = this.score
    },

    // adds score
    addScore: function(score){
        this.setScore(this.score+=score)
    }
}

// Player Healthbar Manager
const healthbar = {
    maxHealth: 100,
    health: 100,
    bar: document.getElementById("healthbarInside"),

    // Sets percentage of healthbar inside.
    setPercent: function(percent){
        this.bar.style.width = percent + "%"
    },

    // Updates color of healthbar based on health remaining.
    updateColor: function(){
        let percent = this.health*100/this.maxHealth
        if(percent >= 0){
            this.bar.style.backgroundColor = "red"
        }
        if(percent >= 25){
            this.bar.style.backgroundColor = "orange"
        }
        if(percent >= 50){
            this.bar.style.backgroundColor = "yellow"
        }
        if(percent >= 75){
            this.bar.style.backgroundColor = "#40fc1a"
        }
        
        
    },

    // Sets health of player and updates healthbar
    setHealth: function(hp){
        this.health = hp
        if(this.health > this.maxHealth) this.health = this.maxHealth
        if(this.health <= 0) {
            this.health = 0
            game.end()
        }
        this.setPercent(this.health*100/this.maxHealth)
        document.getElementById("healthbarText").innerHTML = `HP: ${this.health}/${this.maxHealth}`
        this.updateColor()
    },

    // Sets max health of player and heals.
    setMaxHealth: function(hp){
        this.maxHealth = hp
        this.health = this.maxHealth
        this.setHealth(this.health)
    },

    // Adds health
    addHealth: function(hp){
        this.setHealth(this.health += hp)
    },

    // Removes health
    removeHealth: function(hp){
        this.setHealth(this.health -= hp)
    },

    // Resets healthbar
    reset: function(){
        this.health = this.maxHealth
        this.bar.style.backgroundColor = "#40fc1a"
        this.setPercent(100)
    }
}

// GUI Manager
const guiManager = {
    current: "premenu",
    // displays selected gui and hides current
    display: function(id){
        document.querySelector(`.gameGui.${this.current}`).classList.add("hidden")
        document.querySelector(`.gameGui.${id}`).classList.remove("hidden")
        this.current = id
    }
}

const spaceship = {
    xPos: 0,
    element: document.getElementById("spaceship"),
    xOffset: 50,

    // Move the spaceship on the X axis
    moveX: function(x){
        this.xPos = x;
        this.element.style.left = `${this.xPos-this.xOffset}px`;
    },

    // Resets spaceship to initial position.
    reset: function(){
        this.xPos = game.maxwidth/2
        this.moveX(this.xPos)
    },

    // Sets skin of spaceship
    setSkin: function(skin){
        this.element.style.backgroundImage = `url(${shopItems.skins[skin].src})`
    }
    
}

// Background Music
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    
    this.sound.setAttribute("controls", "none");
    this.sound.setAttribute("loop", "true");

    this.sound.setAttribute("muted", "true");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(volume = 1){
        this.sound.volume = volume;
        this.sound.play();
    }
    this.pause = function(){
        this.sound.pause();
    }
}

// Sound Manager
const soundManager = {
    audio: true,
    file: "assets/sounds/",
    backgroundMusic: null,

    // Play an audio file.
    play: function(id){
        const audio = new Audio(`${this.file}${id}.mp3`)
        audio.play()
    },

    // Mute all sounds
    mute: function(){
        this.audio = false
        this.backgroundMusic.pause()
    },

    // Unmute sounds
    unmute: function(){
        this.audio = true
        this.backgroundMusic.play()
    },

    // Plays a background music
    playBackgroundMusic : function(src, vol = 1){
        try {this.backgroundMusic.pause()} catch(e){}
        this.backgroundMusic = new sound(src)
        this.backgroundMusic.play(vol)
    }
}

// Meteor Manager
const meteorManager = {
    activeMeteors: [],
    velocityMin: 0.5,
    velocityMax: 1.5,
    spawning: null,

    // Spawns a random meteor, with a random word, velocity, and position.
    spawnRandomMeteor : function(){

        // Find random word, and repeat if already exists.
        let randomWord;
        do {
            randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        } while (this.getActiveWordList().includes(randomWord));

        // Sets random velocity
        let velocity = this.velocityMin + Math.random()*(this.velocityMax-this.velocityMin)

        // Sets random X position
        let randomX = Math.floor(Math.random()*game.maxwidth)

        if(randomX <= 75) randomX = 75
        if(randomX >= game.maxwidth - 75) randomX = game.maxwidth-75

        // Sets type of meteor and displays
        var meteor;
        let bonusChance = 0.05 * perksManager.bonusMultiplier
        if(Math.random() <= bonusChance){
            meteor = new Bonus(randomX, -50, velocity, randomWord, "random") 
        } else {
            meteor = new Meteor(randomX, -50, velocity, randomWord) 
        }
        meteor.display()

        game.velocityMultiplier += game.velocityIncreaseRate
        
        this.activeMeteors.push(meteor)
    },
    // Returns a list of active words.
    getActiveWordList : function(){
        return this.activeMeteors.map((meteor) => meteor.word.toLowerCase())
    },

    // Deletes meteor object
    delete: function(meteor){
        let index = this.activeMeteors.indexOf(meteor)
        if(index > -1){
            this.activeMeteors.splice(index, 1)

        } 
    },

    // Start spawning meteors loop
    startSpawning : function(speed){
        const manager = this
        this.spawning = setInterval(function(){
            manager.spawnRandomMeteor()
        }, speed*1000)
    },

    // Stop spawning meteors loop
    stopSpawning: function(){
        clearInterval(this.spawning)
        for(let i = this.activeMeteors.length; i >= 0, i--;){
            this.activeMeteors[i].delete()
        }
    }
}

// Perks Manager
const perksManager = {
    // Default perks values
    scoreMultiplier: 1,
    bonusMultiplier: 1,
    healthMultiplier: 1,

    // Retrieves and updates perks values
    load: function(){
        if(userData.info.activePerks.includes("scoremultiplier")){
            this.scoreMultiplier = 2
        }
        if(userData.info.activePerks.includes("bonusmultiplier")){
            this.bonusMultiplier = 2
        }
        if(userData.info.activePerks.includes("healthboost")){
            this.healthMultiplier = 1.5
        }
    }
}

perksManager.load()

// Bonus Manager
const bonusManager = {
    activeBonus,
    time: 1500,
    bar: document.getElementById("bonusbarInside"),
    text: document.getElementById("activeBonus"),
    rates: {
        velocityMultiplier: 1,
        scoreMultiplier: 1
    },

    // Activates bonus
    activate: function(bonus){
        this.clear()
        this.activeBonus = bonus
        switch(bonus){
            case "time":
                bonusManager.rates.velocityMultiplier = 0.5
                this.initializeBar()
                this.barAnim()
                break;
            case "score":
                bonusManager.rates.scoreMultiplier = 2
                this.initializeBar()
                this.barAnim()
                break;
            case "bomb":
                meteorManager.activeMeteors.forEach(meteor => {
                    if(!meteor.isBonus){
                        meteor.throwLaser()
                    }
                    
                })
                break;
        }
        

    },

    // Sets percent of bonus bar
    setPercent: function(percent){
        this.bar.style.width = percent + "%"
    },
    // Updates visual of bar
    initializeBar: function(){
        switch(this.activeBonus){
            case "time":
                this.bar.style.backgroundColor = "#6196A6"
                this.text.innerHTML = "Time (2x Slower)"
                break;
            case "score":
                this.bar.style.backgroundColor = "#F5DD61"
                this.text.innerHTML = "Score (2x More)"
                break;
        }
    },

    // Starts animation of bonus bar
    barAnim: function(){
        clearInterval(this.anim)
        this.time = 1500
        this.anim = setInterval(() =>{
            this.time--
            this.setPercent(this.time/1500*100)
            if(this.time <= 0){
                this.clear()
            }
        }, 10)
    },

    // Clears bonus bar
    clear: function(){
        clearInterval(this.anim)
        this.time = 1500
        this.text.innerHTML = "None"
        this.bar.style.width = "0%"
        bonusManager.rates.velocityMultiplier = 1
        bonusManager.rates.scoreMultiplier = 1
    }
    
}

let wrongcd = Date.now()

// Keydown listener
window.addEventListener("keydown", (e) => {
    if(e.key == "Enter"){
        if(game.phase == "active"){
            let value = inputBox.value.toLowerCase()
            if(meteorManager.getActiveWordList().includes(value)){
                let index = meteorManager.getActiveWordList().indexOf(value)
                let meteor = meteorManager.activeMeteors[index]

                spaceship.moveX(meteor.xPos)

                meteor.throwLaser()
            } else {
                if(Date.now() - wrongcd > 1000){
                    wrongcd = Date.now()
                    soundManager.play("wrong")
                }
                
            }
            inputBox.value = ""
        }
        

    }
}) 

// Updates container size based on screen width
function updateSize(){
    let height = window.innerHeight
    let width = window.innerWidth

    if(width > height){
        let gameWidth = width*0.6
        let transformFactor = gameWidth/1200
        document.querySelector(".container").style.transform = `scale(${transformFactor})`
    }
}

updateSize();
window.addEventListener("resize", updateSize);

