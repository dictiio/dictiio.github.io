// Laser class
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

    // Display laser
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

    // Laser animation
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

    // Sets position of laser based on its center
    setPos(x, y){
        this.x = x
        this.y = y
        this.div.style.left = x-this.offset + "px"
        this.div.style.top = y-this.offset + "px"
    }

    // Deletes laser
    delete(){
        this.div.remove()
    }
}