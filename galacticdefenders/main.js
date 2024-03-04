const inputBox = document.getElementById("input")

const game = {
    phase: "waiting",
    difficulty: "easy",
    score: 0,
    maxheight: 750,
    maxwidth: 1200,
    damagePerHit: 10,
    velocityMultiplier: 1,
    velocityIncreaseRate: 0,
    spawningRate: 1,
    start: function(difficulty){
        this.difficulty = difficulty
        switch(difficulty){
            case "easy":
                this.spawningRate = 2
                this.velocityMultiplier = 1
                this.velocityIncreaseRate = 0
                break
            case "medium":
                this.spawningRate = 1.5
                this.velocityMultiplier = 1.5
                this.velocityIncreaseRate = 0.003
                break
            case "hard":
                this.spawningRate = 1
                this.velocityMultiplier = 2
                this.velocityIncreaseRate = 0.01
                break
        }
        spaceship.reset()
        healthbar.setMaxHealth(100)
        this.setPhase("active")
        guiManager.display("game")
        meteorManager.startSpawning(this.spawningRate)
        inputBox.select()
        spaceship.setSkin(userData.info.activeSkin)
        
    },
    damage: function(){
        soundManager.play("damage")
        healthbar.removeHealth(this.damagePerHit)
    },
    end: function(){
        if(this.phase != "end"){
            let addedCoins = Math.floor(game.score/10)
            userDataManager.addCoins(addedCoins)

            document.getElementById("endScore").innerHTML = game.score
            document.getElementById("coinsGained").innerHTML = addedCoins

            this.setPhase("end")
            meteorManager.stopSpawning()
            guiManager.display("end")
        }
        
    },
    setPhase: function(phase){
        this.phase = phase
    },
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
    setScore: function(score){
        this.score = score
        document.getElementById("score").innerHTML = this.score
    },
    addScore: function(score){
        this.setScore(this.score+=score)
    }
}

const healthbar = {
    maxHealth: 100,
    health: 100,
    bar: document.getElementById("healthbarInside"),
    setPercent: function(percent){
        this.bar.style.width = percent + "%"
    },
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
    setMaxHealth: function(hp){
        this.maxHealth = hp
        this.health = this.maxHealth
        this.setHealth(this.health)
    },
    addHealth: function(hp){
        this.setHealth(this.health += hp)
    },
    removeHealth: function(hp){
        this.setHealth(this.health -= hp)
    },
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
    moveX: function(x){
        this.xPos = x;
        this.element.style.left = `${this.xPos-this.xOffset}px`;
    },
    reset: function(){
        this.xPos = game.maxwidth/2
        this.moveX(this.xPos)
    },
    setSkin: function(skin){
        this.element.style.backgroundImage = `url(assets/images/skins/${skin}.png)`
    }
    
}

const soundManager = {
    file: "assets/sounds/",
    play: function(id){
        const audio = new Audio(`${this.file}${id}.mp3`)
        audio.play()
    }
}

class Laser {
    constructor(x1, y1, x2, y2, target){
        this.x1 = x1
        this.y1 = y1
        
        this.x2 = x2
        this.y2 = y2

        this.target = target

        this.offset = 40

        this.x = x1
        this.y = y1
        
        this.display()
    }

    display(){
        if(this.y1-this.y2 < 150){
            this.target.killAnim()
        } else {
            this.div = document.createElement("div")
            this.div.classList.add("laser")

            this.div.style.top = this.y1-this.offset + "px"
            this.div.style.left = this.x1-this.offset + "px"

            const gui = document.querySelector(".gameGui.game")
            gui.appendChild(this.div)
            this.anim()
        }
        

    }

    anim(){

        const laser = this;
    

        function getDist(x1, y1, x2, y2){
            let x = x2-x1
            let y = y2-y1
            return Math.sqrt(x**2 + y**2)

        } 

        function getStep(x1, y1, x2, y2){
            const totalTime = getDist(x1, y1, x2, y2)/750

            
            const deltaX = x2-x1
            const deltaY = y2-y1

            const stepX = deltaX / totalTime / 1000
            const stepY = deltaY / totalTime / 1000

            return {x: stepX, y: stepY}


        }

        let steps = getStep(this.x1, this.y1, this.x2, this.y2)

        let i = 0;
        const animation = setInterval(() => {
            i++
            laser.setPos(laser.x+steps.x*5, laser.y+steps.y*5)
            laser.div.style.rotate = i*3 + "deg"
            if(getDist(laser.x, laser.y, laser.target.xPos, laser.target.yPos) <= 50){
                laser.target.killAnim()
                clearInterval(animation)
            }
            if(laser.y < laser.target.yPos){
                laser.target.killAnim()
                clearInterval(animation)
            }
        }, 1)

        // safety
        setTimeout(() => {
            if(laser.target.div.innerHTML != ""){
                laser.target.killAnim()
                this.delete()
                clearInterval(animation)
            }
            
        }, 2000)
    }

    setPos(x, y){
        this.x = x
        this.y = y
        this.div.style.left = x-this.offset + "px"
        this.div.style.top = y-this.offset + "px"
    }

    delete(){
        this.div.remove()
    }
}

const meteorManager = {
    activeMeteors: [],
    velocityMin: 0.5,
    velocityMax: 1.5,
    spawning: null,
    spawnRandomMeteor : function(){
        let randomWord;
        do {
            randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        } while (this.getActiveWordList().includes(randomWord));
        
        let velocity = this.velocityMin + Math.random()*(this.velocityMax-this.velocityMin)
        let randomX = Math.floor(Math.random()*game.maxwidth)

        if(randomX <= 75) randomX = 75
        if(randomX >= game.maxwidth - 75) randomX = game.maxwidth-75

        var meteor;
        if(Math.random() >= 0.95){
            meteor = new Bonus(randomX, -50, velocity, randomWord, "random") 
        } else {
            meteor = new Meteor(randomX, -50, velocity, randomWord) 
        }
        meteor.display()

        game.velocityMultiplier += game.velocityIncreaseRate
        
        this.activeMeteors.push(meteor)
    },
    getActiveWordList : function(){
        return this.activeMeteors.map((meteor) => meteor.word)
    },
    delete: function(meteor){
        let index = this.activeMeteors.indexOf(meteor)
        if(index > -1){
            this.activeMeteors.splice(index, 1)

        } 
    },
    startSpawning : function(speed){
        const manager = this
        this.spawning = setInterval(function(){
            manager.spawnRandomMeteor()
        }, speed*1000)
    },
    stopSpawning: function(){
        clearInterval(this.spawning)
        for(let i = this.activeMeteors.length; i >= 0, i--;){
            this.activeMeteors[i].delete()
        }
    }
}

const bonusManager = {
    activeBonus,
    time: 1500,
    bar: document.getElementById("bonusbarInside"),
    text: document.getElementById("activeBonus"),
    rates: {
        velocityMultiplier: 1,
        scoreMultiplier: 1
    },
    activate: function(bonus){
        this.clear()
        this.activeBonus = bonus
        switch(bonus){
            case "time":
                bonusManager.rates.velocityMultiplier = 0.5
                break;
            case "score":
                bonusManager.rates.scoreMultiplier = 2
                break;
        }
        this.initializeBar()
        this.barAnim()

    },
    setPercent: function(percent){
        this.bar.style.width = percent + "%"
    },
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
    clear: function(){
        clearInterval(this.anim)
        this.time = 1500
        this.text.innerHTML = "None"
        bonusManager.rates.velocityMultiplier = 1
        bonusManager.rates.scoreMultiplier = 1
    }
    
}

//game.start()
let wrongcd = Date.now()

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
