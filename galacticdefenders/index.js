const inputBox = document.getElementById("input")

const game = {
    phase: "waiting",
    difficulty: "easy",
    score: 0,
    maxheight: 750,
    maxwidth: 1200,
    damagePerHit: 10,
    velocityMultiplier: 1,
    spawningRate: 1,
    start: function(difficulty){
        this.difficulty = difficulty
        switch(difficulty){
            case "easy":
                this.spawningRate = 2
                this.velocityMultiplier = 1
                break
            case "medium":
                this.spawningRate = 1.5
                this.velocityMultiplier = 1.5
                break
            case "hard":
                this.spawningRate = 1
                this.velocityMultiplier = 2
                break
        }
        spaceship.reset()
        healthbar.setMaxHealth(100)
        this.setPhase("active")
        guiManager.display("game")
        meteorManager.startSpawning(this.spawningRate)
        inputBox.select()
        
    },
    damage: function(){
        soundManager.play("damage")
        healthbar.removeHealth(this.damagePerHit)
    },
    end: function(){
        if(this.phase != "end"){
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
        this.score = 0
        this.damagePerHit = 10
        this.velocityMultiplier = 1
        guiManager.display("menu")
        healthbar.reset()

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
        }, 1)
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

class FallingObject {
    constructor(xPos, yPos, velocity, word){
        this.xPos = xPos
        this.yPos = yPos
        this.velocity = velocity*game.velocityMultiplier
        this.word = word
        this.offset = 50
        var anim;
        

        this.display()
    }

    setPos(x, y){
        this.xPos = x
        this.yPos = y
        this.div.style.top = this.yPos-this.offset + "px"
        this.div.style.left = this.xPos-this.offset + "px"
    }

    throwLaser(){
        if(!this.div.classList.contains("destroyed")){
            this.div.classList.add("destroyed")
            console.log(game.maxheight-10-this.yPos)
            

            if(game.maxheight-10-this.yPos < 50){
                this.killAnim()
                soundManager.play("shoot")
            } else {
                setTimeout(() => {
                    soundManager.play("shoot")
                    this.laser = new Laser(spaceship.xPos, game.maxheight-10, this.xPos, this.yPos+(50*this.velocity), this)
                    
                }, 1000)
                
            }
        }
        
        
    }

}

class Meteor extends FallingObject {

    display(){
        this.div = document.createElement("div")
        const content = document.createTextNode(this.word)
        this.div.appendChild(content)
        this.div.classList.add("meteor")

        this.div.style.top = this.yPos-this.offset + "px"
        this.div.style.left = this.xPos-this.offset + "px"



        const gui = document.querySelector(".meteorContainer")
        gui.appendChild(this.div)
        this.fall()

    }

    fall(){
        this.anim = setInterval(() => {
            this.setPos(this.xPos, this.yPos+2*this.velocity)
            if(this.yPos >= game.maxheight){
                console.log("a")
                if(this.laser != "undefined"){
                    this.delete()
                    if(!this.div.classList.contains("destroyed")){
                        game.damage()
                    }
                    
                }
                clearInterval(this.anim)
                
            }
            const array = [...document.querySelectorAll(".meteor")]
            if(!array.includes(this.div)){
                clearInterval(this.anim)
                return
            }
        }, 30)
    }

    killAnim(){
        try{
            this.laser.delete()
        } catch(e){}
        game.addScore(this.word.length*10)
        this.div.style.backgroundImage = "url(assets/images/destroyedmeteor.png)"
        this.div.innerHTML = ""
        clearInterval(this.anim)
        setTimeout(() => {
            
            this.delete()
        }, 1000)
        
    }

    delete(){
        this.div.remove()
        meteorManager.delete(this)
    }

}

class Bonus extends FallingObject {
    constructor(xPos, yPos, velocity, word, type){
        super(xPos)
        super(yPos)
        super(velocity)
        super(word)
        this.type = type
    }

    display(){
        this.div = document.createElement("div")
        const content = document.createTextNode(this.word)
        this.div.appendChild(content)
        this.div.classList.add("bonus")

        this.div.style.top = this.yPos-this.offset + "px"
        this.div.style.left = this.xPos-this.offset + "px"



        const gui = document.querySelector(".meteorContainer")
        gui.appendChild(this.div)
        this.fall()

    }

}

const meteorManager = {
    activeMeteors: [],
    velocityMin: 0.5,
    velocityMax: 1.5,
    spawning: null,
    spawnRandomMeteor : function(){
        let randomWord = wordList[Math.floor(Math.random()*wordList.length)]
        let velocity = this.velocityMin + Math.random()*(this.velocityMax-this.velocityMin)
        let randomX = Math.floor(Math.random()*game.maxwidth)

        if(randomX <= 75) randomX = 75
        if(randomX >= game.maxwidth - 75) randomX = game.maxwidth-75

        const meteor = new Meteor(randomX, -50, velocity, randomWord) 
        this.activeMeteors.push(meteor)
        console.log(meteor.word)

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

document.getElementById("startButton").addEventListener("click", () => {
    guiManager.display("menu")
    soundManager.play("select")
})

document.querySelectorAll(".difficultyContainer button").forEach(btn => {
    btn.addEventListener("click", () => {
        game.start(btn.value)
        soundManager.play("select")
    })
})

document.getElementById("playAgainButton").addEventListener("click", () => {
    game.restart()
    soundManager.play("select")
})


