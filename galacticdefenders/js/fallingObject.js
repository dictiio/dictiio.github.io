class FallingObject {
    constructor(xPos, yPos, velocity, word){
        this.xPos = xPos
        this.yPos = yPos
        this.velocity = velocity
        this.word = word
        this.offset = 50
        
        this.isBonus = false
        
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
                    this.laser = new Laser(spaceship.xPos, game.maxheight-10, this.xPos, this.yPos+(66*this.velocity*game.velocityMultiplier*bonusManager.rates.velocityMultiplier), this)
                    
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
            this.setPos(this.xPos, this.yPos+2*this.velocity*game.velocityMultiplier*bonusManager.rates.velocityMultiplier)
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

    delete(){
        this.div.remove()
        meteorManager.delete(this)
    }

    killAnim(){
        try{
            this.laser.delete()
        } catch(e){}
        game.addScore(this.word.length*10*bonusManager.rates.scoreMultiplier*perksManager.scoreMultiplier)
        this.div.style.backgroundImage = "url(assets/images/destroyedmeteor.png)"
        this.div.innerHTML = ""
        clearInterval(this.anim)
        setTimeout(() => {
            
            this.delete()
        }, 1000)
        
    }

}

class Bonus extends FallingObject {
    constructor(xPos, yPos, velocity, word, type){
        super(xPos, yPos, velocity, word)
        this.type = type
        this.isBonus = true
    }

    display(){
        this.div = document.createElement("div")
        const content = document.createTextNode(this.word)
        this.div.appendChild(content)
        this.div.classList.add("bonus")

        this.div.style.top = this.yPos-this.offset + "px"
        this.div.style.left = this.xPos-this.offset + "px"

        if(this.type == "random"){
            this.type = this.getRandomBonus()
        }
        console.log(this.type)


        switch(this.type){
            case "time":
                this.div.style.backgroundImage = "url(assets/images/clock.png)"
                break;
            case "score":
                this.div.style.backgroundImage = "url(assets/images/star.png)"
                break;
            case "bomb":
                this.div.style.backgroundImage = "url(assets/images/bomb.png)"
                break;
        }

        const gui = document.querySelector(".meteorContainer")
        gui.appendChild(this.div)
        this.fall()

    }

    getRandomBonus(){
        let bonuses = ["time", "score", "bomb"]
        let random = Math.floor(Math.random()*bonuses.length)
        return bonuses[random]
    }

    fall(){
        this.anim = setInterval(() => {
            this.setPos(this.xPos, this.yPos+2*this.velocity*game.velocityMultiplier*bonusManager.rates.velocityMultiplier)
            if(this.yPos >= game.maxheight){
                if(this.laser != "undefined"){
                    this.delete()
                }
                clearInterval(this.anim)
                
            }
            const array = [...document.querySelectorAll(".bonus")]
            if(!array.includes(this.div)){
                clearInterval(this.anim)
                return
            }
        }, 30)
    }

    activate(){
        bonusManager.activate(this.type)
    }

    delete(){
        this.div.remove()
        meteorManager.delete(this)
    }

    killAnim(){
        try{
            this.laser.delete()
        } catch(e){}
        game.addScore(this.word.length*10*bonusManager.rates.scoreMultiplier*perksManager.scoreMultiplier)
        this.div.style.backgroundImage = "url(assets/images/destroyedmeteor.png)"
        this.div.innerHTML = ""
        this.activate()
        clearInterval(this.anim)
        setTimeout(() => {
            
            this.delete()
        }, 1000)
        
    }

}