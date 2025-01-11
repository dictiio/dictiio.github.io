const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Background image variables
let backgroundX = 0; // Starting x position of the background
const backgroundImage = new Image();
backgroundImage.src = "assets/images/background.png";
const imageWidth = 1280 * 2; // Image width (make sure it's twice the canvas width)
const canvasWidth = canvas.width;

const keysDown = {};

// Sound Manager
const soundManager = {
	audio: true,
	file: "assets/sounds/",
	backgroundMusic: null,
	baseVolume: 1,
	lastCoinSound: 0,

	// Play audio file.
	play: function (id, vol = 1) {
		if (this.audio) {
			const audio = new Audio(`${this.file}${id}.mp3`);
			audio.volume = vol * 0.7;
			audio.currentTime = 0;
			audio.play();
		}
	},

	// Mute all sounds.
	mute: function () {
		this.audio = false;
		this.backgroundMusic.pause();
	},

	// Unmute sounds.
	unmute: function () {
		this.audio = true;
		this.backgroundMusic.play(this.baseVolume);
	},

	// Play a background music track.
	playBackgroundMusic: function (src, vol = 1) {
		this.baseVolume = vol;

		if (this.backgroundMusic) {
			this.backgroundMusic.pause();
			this.backgroundMusic.currentTime = 0;
		}

		this.backgroundMusic = new Audio(src);
		this.backgroundMusic.volume = vol;

		this.backgroundMusic.addEventListener("ended", () => {
			this.backgroundMusic.currentTime = 0;
			this.backgroundMusic
				.play()
				.catch((e) =>
					console.error("Background music playback failed:", e)
				);
		});

		this.backgroundMusic
			.play()
			.catch((e) =>
				console.error("Background music playback failed:", e)
			);
	},

	// Stop current background music
	stopBackgroundMusic: function () {
		this.backgroundMusic.pause();
	},

	// Play a coin sound of random pitch.
	playCoinSound: function () {
		if (Date.now() - this.lastCoinSound > 100) {
			this.lastCoinSound = Date.now();
			const coinSound = new Audio("assets/sounds/coin.mp3");
			coinSound.volume = 0.5;
			coinSound.currentTime = 0; // Reset sound
			coinSound.playbackRate = 1 + (Math.random() * 0.4 - 0.2); // Small random pitch variation
			coinSound.play();
		}
	},

	// Play a flap sound of random pitch.
	playFlapSound: function () {
		const flapSound = new Audio("assets/sounds/flap.mp3");
		flapSound.volume = 0.3;
		flapSound.currentTime = 0; // Reset sound
		flapSound.playbackRate = 1 + (Math.random() * 0.4 - 0.2); // Small random pitch variation
		flapSound.play();
	},
};

// Laser obstacles parameters (image and dimensions)
const laser = {
	width: 40,
	height: 40,
	top: new Image(),
	bottom: new Image(),
	left: new Image(),
	right: new Image(),
	loadImages: function (callback) {
		// Image urls
		const images = [
			"assets/images/toplaser.png",
			"assets/images/bottomlaser.png",
			"assets/images/leftlaser.png",
			"assets/images/rightlaser.png",
		];
		const imageElements = [this.top, this.bottom, this.left, this.right];
		let loadedCount = 0;

		// Load all images
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

// Check collision between two boxes.
function collision({ box1, box2 }) {
	return (
		box1.position.x <= box2.position.x + box2.width && // collides on right side
		box1.position.x + box1.width > box2.position.x && // collides on left side
		box1.position.y <= box2.position.y + box2.height && // collides on bottom
		box1.position.y + box1.height > box2.position.y
	);
}

// Return a random integer between two values.
function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// End screen stats values
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
	},
};

// Powerups text colors and names
const powerups = {
	speed: {
		innerColor: "#73BAE6",
		borderColor: "#55B5F0",
		name: "2x Slow Down",
	},
	shield: {
		innerColor: "#83f374",
		borderColor: "#20db4f",
		name: "Shield",
	},
	coins: {
		innerColor: "#EEDE8B",
		borderColor: "#E1CD69",
		name: "2x Coins",
	},
	score: {
		innerColor: "#E47BF0",
		borderColor: "#D861E6",
		name: "2x Score",
	},
	laser: {
		innerColor: "#E66161",
		borderColor: "#DF4C4C",
		name: "No Lasers",
	},
};

// Game object
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

	// Initialize game.
	init: function () {
		guiManager.display("active");

		this.frameCount = 0;
		this.active = true;
		this.ended = false;
		soundManager.play("start");
		soundManager.playBackgroundMusic("assets/sounds/bgmusic.mp3", 0.1);

		// Load player skin
		const playerSprite = new Sprite(
			shopItems.skins[userData.info.activeSkin].src, // Path to sprite sheet
			64,
			64, // Frame width and height
			4, // Total frames
			10 // Frame speed
		);

		// Detect when sprite is loaded then create player object
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

	// Stop the game
	stop: function () {
		if (this.ended) return;

		this.active = false;
		this.ended = true;
	},

	// Resume the game
	resume: function () {
		console.log("Resuming game");
		if (this.active) return;

		this.active = true;
		this.loop();

		guiManager.display("active");
	},

	// Pause the game
	pause: function () {
		console.log("Pausing game");
		if (!this.active) return;

		this.active = false;
		guiManager.display("pause");
	},

	// Draw all game objects.
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

		// Draw floor
		this.drawFloor();

		// draw obstacles and check for collisions
		this.obstacles.forEach((obstacle, index) => {
			obstacle.draw();
			if (obstacle.isOffScreen()) {
				this.obstacles.splice(index, 1); // Remove off-screen obstacle
				console.log("Deleting obstacle");
				console.log(this.obstacles);
			}
			if (
				!this.shield &&
				collision({ box1: this.player, box2: obstacle })
			) {
				// obstacle is a rocket
				if (obstacle.type == "rocket") {
					this.playDeathAnimation();

					// obstacle is a laser
				} else if (obstacle.type === "laser") {
					// check if laser is enabled
					if (this.laserEnabled) {
						this.playDeathAnimation();
					}
				} else {
					console.warn(
						"Unknown obstacle type or type is undefined:",
						obstacle.type
					);
				}
			}
		});

		// Draw coins and check for collisions
		this.coins.forEach((coin, index) => {
			coin.draw();
			if (coin.isOffScreen()) {
				this.coins.splice(index, 1); // Remove off-screen obstacle
			}
			if (collision({ box1: this.player, box2: coin })) {
				this.coinCount += 1 * this.mutlipliers.coins;
				soundManager.playCoinSound();
				this.coins.splice(index, 1);
			}
		});

		// Draw powerup and check for collisions
		if (this.powerup != null && !this.ended) {
			this.powerup.draw();
			if (collision({ box1: this.player, box2: this.powerup })) {
				this.activateRandomPowerUp();
				this.powerup = null;
			} else if (this.powerup.isOffScreen()) {
				this.powerup = null;
			}
		}

		// Draw player
		this.player.draw();
	},

	// Draw floor
	drawFloor: function () {
		ctx.fillStyle = "gray";
		ctx.fillRect(0, 620, canvas.width, 100);

		ctx.fillStyle = "#464a47";
		ctx.fillRect(0, 620, canvas.width, 20);
	},

	// Draw idle background with no movement and floor (menu)
	drawIdleBackground: function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.drawImage(backgroundImage, 0, 0, imageWidth, canvas.height);

		this.drawFloor();
	},

	// Return game speed with multipliers
	getSpeed: function () {
		return this.speed * this.mutlipliers.speed;
	},

	// Game loop
	loop: function () {
		this.draw(); // Draw all game objects

		// bHandle background movement
		backgroundX -= this.getSpeed();
		backgroundX = Math.floor(backgroundX);

		if (backgroundX <= -imageWidth) {
			backgroundX = 0; // Reset to the starting position
		}

		// Check if player is alive
		if (this.player.canControl) {
			this.player.velocity.x = 0; // Reset x velocity

			this.player.velocity.y = 0; // Reset y velocity

			// Check keys pressed and move player
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
				// If both W and S keys are pressed, stop moving
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
				// If both A and D keys are pressed, stop moving
				this.player.velocity.x = 0;
			}

			// If player is not alive (Death animation)
		} else {
			this.player.velocity.x = 0; // Reset velocity
			if (this.player.position.y < 620 - this.player.height) {
				this.player.velocity.y += 1; // Gravity effect
			} else {
				if (this.player.velocity.y > 0 && this.animCount < 10) {
					// Only reverse if moving downwards
					this.player.velocity.y = -this.player.velocity.y * 0.8; // Reverse and reduce the vertical velocity for rebound
					this.speed *= 0.8;
					this.animCount++;
					soundManager.play("bodyfall", 0.4);
					console.log("REBOUND");
				} else {
					this.player.velocity.y = 0; // Stop bouncing if moving upwards
				}
				this.player.position.y = 620 - this.player.height; // Ensure the player stays on the ground
			}
			if (this.animCount < 10) {
				this.player.angle += (10 - this.animCount) * 3; // Continue rotating if animCount is less than 5
			} else {
				// Stop animation after 10 bounces
				this.speed = 0;
				soundManager.play("crash");
				this.draw();
				this.stop();
				this.displayStats();
			}
		}

		this.frameCount++; // Update frame count
		this.distance += (this.speed / 25) * this.mutlipliers.score; // Update distance

		// Draw GUI (Score, Coins and Active Power up)
		ctx.fillStyle = "white";
		ctx.font = "24px Courier New";
		ctx.fillText("Score: " + Math.round(this.distance), 10, 32);
		ctx.fillText("Coins: " + this.coinCount, 10, 64);

		if (this.currentPowerup != null) {
			const percentage =
				Math.round(
					((1000 - (this.frameCount - this.lastPowerup)) / 1000) *
						1000
				) / 10;
			ctx.fillText(
				"Current Powerup: " +
					powerups[this.currentPowerup].name +
					" (" +
					percentage +
					"%)",
				10,
				96
			);
		}

		// Handle powerup

		// Reset all power up values
		function resetPowerups() {
			game.mutlipliers.speed = 1;
			game.shield = false;
			game.mutlipliers.coins = 1;
			game.mutlipliers.score = 1;
			game.laserEnabled = true;
		}

		resetPowerups();

		// Check if powerup is active
		if (this.currentPowerup != null && this.lastPowerup != 0) {
			// Check if powerup is still active
			if (this.frameCount - this.lastPowerup < 1000) {
				const powerup = this.currentPowerup;
				switch (powerup) {
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

		// Play flap sound every 75 frames
		if (this.frameCount % 75 == 0) {
			soundManager.playFlapSound();
		}

		// Create random coin row every 360 frames
		if (this.frameCount % 360 == 0) {
			console.log("Creating row");
			this.generateRandomCoinRow();
		}

		// Generate a powerup box every 1500 frames
		if (this.frameCount % 1500 == 0) {
			if (this.powerup == null) {
				this.generatePowerUp();
			}
		}

		// Generate obstacles every 200 frames, the amount of frames decreasing as speed increases (minimum 50 distance)
		if (
			this.frameCount % (200 - this.speed * 10) == 0 &&
			this.distance > 50 &&
			this.player.canControl
		) {
			this.generateObstacle();
		}

		// Generate rockets every 400 frames (must be at least 500 distance)
		if (this.frameCount % 400 == 0 && this.distance > 500) {
			this.generateRockets();
		}

		// Increase speed by 0.5 every 500 frames
		if (this.frameCount % 500 == 0) {
			if (this.powerup == null) {
				this.speed += 0.5;
			}
		}

		// Check if game is active and continue loop
		if (this.active) {
			requestAnimationFrame(() => {
				this.loop();
			});
		}
	},

	// Play death animation
	playDeathAnimation: function () {
		if (this.player.canControl) {
			soundManager.play("laser");
			soundManager.stopBackgroundMusic();
			this.player.canControl = false;
			this.speed *= 3;
		}
	},

	// Generate a new obstacle
	generateObstacle: function (xPos = canvas.width) {
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

	// Generate random rockets
	generateRockets: function () {
		const rocketCount = Math.floor(Math.random() * 4) + 1;

		for (let i = 0; i < rocketCount; i++) {
			soundManager.play("missile", 0.5);
			this.obstacles.push(
				new Collectable({
					position: { x: canvas.width, y: getRandomInteger(20, 580) },
					width: 48,
					height: 48,
					player: this.player,
					type: "rocket",
				})
			);
		}
	},

	// Generate a row of coins with set parameters
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

	// Generate a random row of coins
	generateRandomCoinRow: function () {
		const spacing = 40;
		const rows = Math.ceil(Math.random() * 12);
		const columns = Math.ceil(Math.random() * 4);
		const startY =
			Math.random() * (620 - (24 * columns + spacing * (columns - 1)));
		this.generateCoinRow(startY, spacing, rows, columns);
	},

	// Generate a powerup box
	generatePowerUp: function () {
		this.powerup = new Collectable({
			position: { x: canvas.width, y: getRandomInteger(80, 520) },
			width: 48,
			height: 48,
			player: this.player,
			type: "powerup",
		});
	},

	// Activate a random powerup
	activateRandomPowerUp: function () {
		const powerUpTypes = ["speed", "shield", "coins", "score", "laser"];
		const powerUp =
			powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

		this.currentPowerup = powerUp;
		this.lastPowerup = this.frameCount;
		console.log(this.lastPowerup);

		soundManager.play("powerup");

		this.displayPowerUp(powerUp);
	},

	// Display powerup text
	displayPowerUp: function (powerup) {
		const powerupText = document.querySelector(".powerup");

		powerupText.style.left = 0;
		powerupText.style.backgroundColor = powerups[powerup].innerColor;
		powerupText.style.borderColor = powerups[powerup].borderColor;
		powerupText.textContent = "Power Up: " + powerups[powerup].name;

		setTimeout(() => {
			powerupText.style.left = "-100%";
		}, 3000);
	},

	// Display end screen stats
	displayStats: function () {
		guiManager.display("ended");

		// Game stats final update
		stats.distance.value = Math.round(this.distance);
		stats.coins.value = this.coinCount;

		// add coins to user data
		userDataManager.addCoins(this.coinCount);

		// Check for high score
		if (this.distance > userData.info.highestDistance) {
			userDataManager.setHighestDistance(Math.round(this.distance));
		}

		stats.highestDistance.value = userData.info.highestDistance;
		const statsElement = document.querySelector(".stats");
		statsElement.innerHTML = "";

		// title
		const title = document.createElement("li");
		title.textContent = "Your Stats";
		statsElement.appendChild(title);

		// Create stat element for every stat
		for (const stat in stats) {
			const element = document.createElement("li");
			element.textContent = stats[stat].name + ": " + stats[stat].value;
			statsElement.appendChild(element);
		}
	},

	// Reset all game parameters and display start screen
	reset: function () {
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

		guiManager.display("start");
	},
};



// Check keys pressed
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

// Check keys released
document.addEventListener("keyup", (e) => {
	delete keysDown[e.keyCode];
});

// Draw idle background when image loads
backgroundImage.onload = () => {
	game.drawIdleBackground();
};
