// Falling object class
class FallingObject {
    constructor(xPos, yPos, velocity, word){
        this.xPos = xPos
        this.yPos = yPos
        this.velocity = velocity
        this.word = word
        this.offset = 50
        
        this.isBonus = false
        
    }
    // sets position based on its center
    setPos(x, y){
        this.xPos = x
        this.yPos = y
        this.div.style.top = this.yPos-this.offset + "px"
        this.div.style.left = this.xPos-this.offset + "px"
    }

    // throw laser from spaceship to falling object
    throwLaser(){
        if(!this.div.classList.contains("destroyed")){
            this.div.classList.add("destroyed")
            

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

// Meteor class
class Meteor extends FallingObject {

    // Displays meteor
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

    // Meteor fall animation
    fall(){
        this.anim = setInterval(() => {
            this.setPos(this.xPos, this.yPos+2*this.velocity*game.velocityMultiplier*bonusManager.rates.velocityMultiplier)
            if(this.yPos >= game.maxheight){
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

    // Delete meteor
    delete(){
        this.div.remove()
        meteorManager.delete(this)
    }

    // Meteor kill animation
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

// Bonus class
class Bonus extends FallingObject {
    constructor(xPos, yPos, velocity, word, type){
        super(xPos, yPos, velocity, word)
        this.type = type
        this.isBonus = true
    }

    // Displays bonus
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

        // change image based on type
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

    // Returns a random bonus meteor
    getRandomBonus(){
        let bonuses = ["time", "score", "bomb"]
        let random = Math.floor(Math.random()*bonuses.length)
        return bonuses[random]
    }

    // Bonus fall animation
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

    // Activate bonus type
    activate(){
        bonusManager.activate(this.type)
    }

    // Delete bonus
    delete(){
        this.div.remove()
        meteorManager.delete(this)
    }

    // Bonus kill animation
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