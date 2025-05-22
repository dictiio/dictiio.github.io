export class Game {
    constructor(){
        this.world = new Game.World("#dd7272")
        this.cameraActive = false
    }

    static World = class {
        constructor(bgColor) {
            this.bgColor = bgColor
            this.player = new Game.Player(100, 670, 50, 50, 0, 0, 2, "#000000")
            this.platforms = []
            this.vy = 0
            this.generatePlatforms()
            
        }

        generatePlatforms(){
            let lastY = 600;
            let lastX = 640; // Start roughly in the middle
        
            for(let i = 0; i < 1000; i++){
                const width = Math.random() * 100 + 80;
        
                // Controlled horizontal movement
                const maxHorizontalStep = 500;
                let deltaX = (Math.random() - 0.5) * maxHorizontalStep;
                let newX = lastX + deltaX;
        
                // Clamp newX within screen bounds
                newX = Math.max(0, Math.min(1280 - width, newX));
        
                // Controlled vertical gap (e.g. 60 to 100 pixels)
                const verticalGap = 60 + Math.random() * 40;
                lastY -= verticalGap;
        
                this.platforms.push(
                    new Game.Platform(
                        newX,
                        lastY,
                        width,
                        20,
                        0,
                        0,
                        "black"
                    )
                );
        
                lastX = newX; // Update for next platform
            }
        }

    }

    static Platform = class {
        constructor(x, y, w, h, vx, vy, color){
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
        }

        update(){
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    static Player = class {
        constructor(x, y, w, h, vx, vy, gravity, color) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.vx = vx;
            this.vy = vy;
            this.gravity = gravity; // Gravity value
            this.color = color;
            this.isJumping = false; // To track whether the player is already jumping
            this.floorY = 720;
            this.trueDistance = 0;
        }
    
        moveLeft(){
            this.x -= 10;
        }
    
        moveRight(){
            this.x += 10;
        }

        checkPlatforms(platforms){
            let count = 0;
            platforms.forEach(platform => {
                if(this.x+this.w > platform.x && this.x < platform.x+platform.w){ // on platform x axis
                    if(this.y+this.h <= platform.y){
                        this.floorY = platform.y
                        count++
                    }
                    
                }
            })

            if(count == 0){
                this.floorY = 720
            }
        }
    
        jump(){
            if (this.y + this.h >= this.floorY) { // Check if player is on the ground
                this.vy = -40; // Jump velocity (negative because we want to go up)
                this.isJumping = true;
            }
        }
    
        update(){
            // Apply gravity
            if (this.isJumping || this.y < this.floorY) {
                this.vy += this.gravity; // Gradually pull the player down
            }
    
            this.y += this.vy;
            
            
    
            // If player hits the ground, stop downward movement and reset jumping
            if (this.y + this.h >= this.floorY) {
                this.y = this.floorY - this.h;
                this.vy = 0; // Stop downward velocity
                this.isJumping = false; // Player is no longer jumping
            }
    
            // Prevent the player from going out of bounds horizontally
            if (this.x < 0 - this.w) {
                this.x = 1280;
            } else if (this.x > 1280) {
                this.x = 0 - this.w;
            }
    
            // Prevent the player from going out of bounds vertically
            if (this.y < 0) {
                this.y = 0;
            } else if (this.y + this.h > 720) {
                this.y = 720 - this.h;
            }

            console.log(this.trueDistance)
            this.trueDistance -= this.vy
        }
    }
    

    update() {
        this.world.platforms.forEach(platform => {
            platform.update();
        });

        // Remove platforms that are below the screen
        this.world.platforms = this.world.platforms.filter(platform => platform.y <= 720);

        this.world.player.checkPlatforms(this.world.platforms);
        this.world.player.update();

        // Camera follow logic: keep player at y = 300
        const cameraAnchor = 500;
        const cameraActivationY = 200; // Only start following after player passes this y

        this.world.vy = 0;
        if (!this.cameraActive && this.world.player.floorY < cameraActivationY) {
            this.cameraActive = true;
        }

        if (this.cameraActive) {
            let diff = this.world.player.floorY - cameraAnchor;
            if (diff < -10) {
                this.world.vy = 10; // Move world down
            } else if (diff > 10) {
                this.world.vy = -10; // Move world up
            } else  {
                this.world.vy = 0; // Stop moving
            }
        }


        // Move all platforms by vy
        this.world.platforms.forEach(platform => {
            platform.y += this.world.vy;
        });

        this.world.player.y += this.world.vy; // Apply camera movement to player

        // Do NOT move the player by vy
        }

}