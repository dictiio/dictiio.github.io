const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;

const keysDown = {};


const laser = {
	width: 40,
	height: 40,
	top: new Image(),
	bottom: new Image(),
	left: new Image(),
	right: new Image(),
	loadImages: function (callback) {
		const images = [
			"assets/images/toplaser.png",
			"assets/images/bottomlaser.png",
			"assets/images/leftlaser.png",
			"assets/images/rightlaser.png",
		];
		const imageElements = [this.top, this.bottom, this.left, this.right];
		let loadedCount = 0;

		images.forEach((src, index) => {
			imageElements[index].src = src;
			imageElements[index].onload = () => {
				loadedCount++;
				if (loadedCount === images.length) {
					// All images are loaded
					callback();
				}
			};

			imageElements[index].onerror = () => {
				console.error(`Failed to load image: ${src}`);
			};
		});
	},
};

let backgroundX = 0; // Starting x position of the background
const backgroundImage = new Image();
backgroundImage.src = "assets/images/background.png";

const imageWidth = 1280 * 2; // Image width (make sure it's twice the canvas width)
const canvasWidth = canvas.width;

function collision({ box1, box2 }) {
	return (
		box1.position.x <= box2.position.x + box2.width && // collides on right side
		box1.position.x + box1.width > box2.position.x && // collides on left side
		box1.position.y <= box2.position.y + box2.height && // collides on bottom
		box1.position.y + box1.height > box2.position.y
	);
}



function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const stats = {
    distance: {
        value: 0,
        name: "Distance",
    },
    coins: {
        value: 0,
        name: "Coins Earned",
    },
    highestDistance: { 
        value: 0,
        name: "Highest Distance",
    }
}

const game = {
	frameCount: 0,
	player: null,
	speed: 5,
    mutlipliers: {
        speed: 1,
        coins: 1,
        score: 1,
    },
    laserEnabled: true,
	obstacles: [],
	coins: [],
	coinCount: 0,
	active: false,
	ended: true,
	distance: 0,
	animCount: 0,
	powerup: null,
    currentPowerup: null,
    lastPowerup: 0,
    shield: false,

	init: function () {
		guiManager.display("active");

		this.frameCount = 0;
		this.active = true;
		this.ended = false;

        console.log(shopItems.skins[userData.info.activeSkin].src)
		const playerSprite = new Sprite(
            shopItems.skins[userData.info.activeSkin].src, // Path to sprite sheet
			64,
			64, // Frame width and height
			4, // Total frames
			10 // Frame speed
		);

		playerSprite.image.onload = () => {
			laser.loadImages(() => {
				console.log("All images loaded!");
				this.player = new Player({
					position: { x: 100, y: 500 },
					sprite: playerSprite,
				});
				this.loop();
				
			});
		};
	},

	stop: function () {
		if (this.ended) return;

		this.active = false;
		this.ended = true;

	},

	resume: function () {
		console.log("Resuming game");
		if (this.active) return;

		this.active = true;
		this.loop();

		guiManager.display("active");
	},

	pause: function () {
		console.log("Pausing game");
		if (!this.active) return;

		this.active = false;
		guiManager.display("pause");
	},

	draw: function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw the background image twice to create the endless effect
		ctx.drawImage(
			backgroundImage,
			backgroundX,
			-1,
			imageWidth,
			canvas.height
		);
		ctx.drawImage(
			backgroundImage,
			backgroundX + imageWidth,
			-1,
			imageWidth,
			canvas.height
		);

		this.drawFloor();
		// draw obstacles
		this.obstacles.forEach((obstacle, index) => {
			obstacle.draw();
			if (obstacle.isOffScreen()) {
				this.obstacles.splice(index, 1); // Remove off-screen obstacle
				console.log("Deleting obstacle");
				console.log(this.obstacles);
			}
			if (!this.shield && collision({ box1: this.player, box2: obstacle })) {
                // obstacle is a rocket
                if(obstacle.type == "rocket"){
                    this.playDeathAnimation();

                // obstacle is a laser
                } else if (obstacle.type === "laser") {
                    // check if laser is enabled
                    if (this.laserEnabled) {
                        this.playDeathAnimation();
                    }
                } else {
                    // Handle cases where the type is undefined or not recognized
                    console.warn("Unknown obstacle type or type is undefined:", obstacle.type);
                    // You can add additional handling here if needed
                }
			}
		});

		// draw coins
		this.coins.forEach((coin, index) => {
			coin.draw();
			if (coin.isOffScreen()) {
				this.coins.splice(index, 1); // Remove off-screen obstacle
			}
			if (collision({ box1: this.player, box2: coin })) {
				this.coinCount += 1 * this.mutlipliers.coins;
				this.coins.splice(index, 1);
			}
		});

		// draw powerup
		if (this.powerup != null && !this.ended) {
			this.powerup.draw();
            if (collision({ box1: this.player, box2: this.powerup })) {
                this.activateRandomPowerUp();
                this.powerup = null;
            } else if (this.powerup.isOffScreen()) {
				this.powerup = null;
			}
            
		}

		//draw player
		this.player.draw();
	},

	drawFloor: function () {
		// draw floor
		ctx.fillStyle = "gray";
		ctx.fillRect(0, 620, canvas.width, 100);

		ctx.fillStyle = "#464a47";
		ctx.fillRect(0, 620, canvas.width, 20);
	},

	drawIdleBackground: function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.drawImage(
			backgroundImage,
			0,
			0,
			imageWidth,
			canvas.height
		);


		this.drawFloor();
	},

    getSpeed: function() {
        return this.speed * this.mutlipliers.speed;
    },

	loop: function () {
		this.draw();

		// bg

		backgroundX -= this.getSpeed();
        backgroundX = Math.floor(backgroundX)

		if (backgroundX <= -imageWidth) {
			backgroundX = 0; // Reset to the starting position
		}

		if (this.player.canControl) {
            this.player.velocity.x = 0;

			this.player.velocity.y = 0;
			if (87 in keysDown) {
				// W up
				if (this.player.position.y > 0) {
					this.player.velocity.y = -5;
				}
			}
			if (83 in keysDown) {
				// S down
				if (this.player.position.y + this.player.height < 615) {
					this.player.velocity.y = 5;
				}
			}
			if (87 in keysDown && 83 in keysDown) {
				this.player.velocity.y = 0;
			}

			if (65 in keysDown) {
				// A left
				if (this.player.position.x > 0) {
					this.player.velocity.x = -8;
				}
			}
			if (68 in keysDown) {
				// D right
				if (this.player.position.x + this.player.width < canvas.width) {
					this.player.velocity.x = 5;
				}
			}
			if (65 in keysDown && 68 in keysDown) {
				this.player.velocity.x = 0;
			}
		} else {
			this.player.velocity.x = 0;
			if (this.player.position.y < 620 - this.player.height) {
				console.log("FALLING");
				this.player.velocity.y += 1; // Gravity effect
			} else {
				if (this.player.velocity.y > 0 && this.animCount < 10) {
					// Only reverse if moving downwards
					this.player.velocity.y = -this.player.velocity.y * 0.8; // Reverse and reduce the vertical velocity for rebound
					this.speed *= 0.8;
					this.animCount++;
					console.log("REBOUND");
				} else {
					this.player.velocity.y = 0; // Stop bouncing if moving upwards
				}
				this.player.position.y = 620 - this.player.height; // Ensure the player stays on the ground
			}
			if (this.animCount < 10) {
				this.player.angle += (10 - this.animCount) * 3; // Continue rotating if animCount is less than 5
			} else {
				this.speed = 0;
				this.player.angle = 90;
				this.draw();
				this.stop();
                this.displayStats();
			}
		}

		// frame count
		this.frameCount++;
		ctx.fillStyle = "white";
		ctx.font = "24px Courier New";
		ctx.fillText("Score: " + Math.round(this.distance), 10, 32);
		ctx.fillText("Frame: " + this.frameCount, 1000, 32);
		ctx.font = "24px Courier New";
		ctx.fillText("Coins: " + this.coinCount, 10, 64);

        if(this.currentPowerup != null){
            const percentage = Math.round(((1000-(this.frameCount - this.lastPowerup))/1000) * 1000) / 10
            ctx.fillText("Current Powerup: " + powerups[this.currentPowerup].name + " (" + percentage + "%)", 10, 96);
        }

		// distance
		this.distance += (this.speed / 25) * this.mutlipliers.score;


        // handle powerup
        function resetPowerups(){
            game.mutlipliers.speed = 1;
            game.shield = false;
            game.mutlipliers.coins = 1;
            game.mutlipliers.score = 1;
            game.laserEnabled = true;
            
        }

        resetPowerups()
        if(this.currentPowerup != null && this.lastPowerup != 0){
            if(this.frameCount - this.lastPowerup < 1000){
                
                const powerup = this.currentPowerup;
                switch(powerup){
                    case "speed":
                        this.mutlipliers.speed = 0.5;
                        break;
                    case "shield":
                        this.shield = true;
                        break;
                    case "coins":
                        this.mutlipliers.coins = 2;
                        break;
                    case "score":
                        this.mutlipliers.score = 2;
                        break;
                    case "laser":
                        this.laserEnabled = false;
                        break;
                }
            } else {
                this.currentPowerup = null;
            }
        }
        

		if (this.frameCount % 360 == 0) {
			console.log("Creating row");
			this.generateRandomCoinRow();
		}

        // generate powerups
        if(this.frameCount % 1500 == 0){
            if(this.powerup == null){
                this.generatePowerUp();
            }
        }

        if (this.frameCount % 150 == 0 && this.distance > 50) {
            this.generateObstacle();
        }

        // generate rockets
        if (this.frameCount % 400 == 0 && this.distance > 500) {
            this.generateRockets();
        }

        if(this.frameCount % 500 == 0){
            if(this.powerup == null){
                this.speed += 0.5;
            }
        }


		if (this.active) {
			requestAnimationFrame(() => {
				this.loop();
			});
		}
	},

	playDeathAnimation: function () {
		if (this.player.canControl) {
			this.player.canControl = false;
			this.speed *= 3;
		}
	},

	generateObstacle: function (xPos = canvas.width) {
		console.log("Generating new obstacle");
		const width = 15; // Random width
		const height = Math.random() * 200 + 250; // Random height

		const angle = Math.random() * 45 - 22.5; // Random angle between -22.5° and 22.5°
		const vertical = Math.random() < 0.5; // Random boolean

        const x = xPos;
		let y = vertical
			? Math.random() * (620 - height)
			: Math.random() * (620 - width);
		if (y <= 5) y += 5;
		if (y >= 615) y -= 5;

		this.obstacles.push(
			new Obstacle({
				position: { x: x, y: y },
				width: width,
				height: height,
				angle: angle,
				player: this.player,
				vertical: vertical,
			})
		);
	},

    generateRockets: function(){
        const rocketCount = Math.floor(Math.random() * 4) + 1;

        for(let i = 0; i < rocketCount; i++){
            this.obstacles.push(
                new Collectable({
                    position: { x: canvas.width, y: getRandomInteger(20, 580) },
                    width: 48,
                    height: 48,
                    player: this.player,
                    type: "rocket",
                })
            )
        }
    },

	generateCoinRow: function (startY, spacing, rows, columns) {
		for (let i = 0; i < columns; i++) {
			for (let j = 0; j < rows; j++) {
				this.coins.push(
					new Collectable({
						position: {
							x: canvas.width + j * spacing,
							y: startY + i * spacing,
						},
						width: 24,
						height: 24,
						player: this.player,
						type: "coin",
					})
				);
			}
		}
	},

	generateRandomCoinRow: function () {
		const spacing = 40;
		const rows = Math.ceil(Math.random() * 12);
		const columns = Math.ceil(Math.random() * 4);
		const startY =
			Math.random() * (620 - (24 * columns + spacing * (columns - 1)));
		this.generateCoinRow(startY, spacing, rows, columns);
	},

	generatePowerUp: function () {
		this.powerup = new Collectable({
			position: { x: canvas.width, y: getRandomInteger(80, 520) },
			width: 48,
			height: 48,
			player: this.player,
			type: "powerup",
		});
	},

	activateRandomPowerUp: function () {
        const powerUpTypes = ["speed", "shield", "coins", "score", "laser"];
        const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        this.currentPowerup = powerUp;
        this.lastPowerup = this.frameCount;
        console.log(this.lastPowerup)

        this.displayPowerUp(powerUp);
    },

    displayPowerUp: function(powerup){
        const powerupText = document.querySelector(".powerup");

        
        powerupText.style.left = 0;
        powerupText.style.backgroundColor = powerups[powerup].innerColor;
        powerupText.style.borderColor = powerups[powerup].borderColor;
        powerupText.textContent = "Power Up: " + powerups[powerup].name;

        setTimeout(() => {
            powerupText.style.left = "-100%";
        }, 3000)
    },

    displayStats: function(){

        guiManager.display("ended");
        // update stats
        stats.distance.value = Math.round(this.distance);
        stats.coins.value = this.coinCount;

        userDataManager.addCoins(this.coinCount)

        // high score
        if(this.distance > userData.info.highestDistance){
            userDataManager.setHighestDistance(Math.round(this.distance));
        }

        stats.highestDistance.value = userData.info.highestDistance;

        const statsElement = document.querySelector(".stats");
        statsElement.innerHTML = "";

        // title
        const title = document.createElement("li");
        title.textContent = "Your Stats";
        statsElement.appendChild(title);

        for(const stat in stats){
            const element = document.createElement("li");
            element.textContent = stats[stat].name + ": " + stats[stat].value;
            statsElement.appendChild(element);
        }

    },

    reset: function(){
        this.frameCount = 0;
        this.player = null;
        this.speed = 5;
        this.mutlipliers = {
            speed: 1,
            coins: 1,
            score: 1,
        };
        this.laserEnabled = true;
        this.obstacles = [];
        this.coins = [];
        this.coinCount = 0;
        this.active = false;
        this.ended = false;
        this.distance = 0;
        this.animCount = 0;
        this.powerup = null;
        this.currentPowerup = null;
        this.lastPowerup = 0;
        this.shield = false;

        guiManager.display("start")
    }

};

const powerups = {
    speed: {
        innerColor: "#73BAE6",
        borderColor: "#55B5F0",
        name: "2x Slow Down"
    },
    shield: {
        innerColor: "#83f374",
        borderColor: "#20db4f",
        name: "Shield"
    },
    coins: {
        innerColor: "#EEDE8B",
        borderColor: "#E1CD69",
        name: "2x Coins"
    },
    score: {
        innerColor: "#E47BF0",
        borderColor: "#D861E6",
        name: "2x Score"
    },
    laser: {
        innerColor: "#E66161",
        borderColor: "#DF4C4C",
        name: "No Lasers"
    }
}

document.addEventListener("keydown", (e) => {
	console.log(e.keyCode);
	keysDown[e.keyCode] = true;

	// Check for ESC Key
	if (e.keyCode == 27 && !game.ended) {
		if (game.active) {
			game.pause();
		} else {
			game.resume();
		}
	}
});

document.addEventListener("keyup", (e) => {
	delete keysDown[e.keyCode];
});

backgroundImage.onload = () => {
	game.drawIdleBackground();
};
