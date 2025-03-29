import { gameWidth, gameHeight } from "./settings.js";
import { Player } from "./classes/Player.js";
import { Lane } from "./classes/Lane.js";
import { Vehicle } from "./classes/Vehicle.js";
import { SceneManager } from "./sceneManager.js";
import { UserDataManager } from "./userData.js";
import { SoundManager } from "./SoundManager.js";
import { ShopManager } from "./ShopManager.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = gameWidth;
canvas.height = gameHeight;

// managers
export const userDataManager = new UserDataManager();
userDataManager.retrieve();
export const sceneManager = new SceneManager();
export const soundManager = new SoundManager();
export const shopManager = new ShopManager();

export const keysDown = [];

// images
export const images = {
	vehicles: {
		log: {
			left: new Image(),
			middle: new Image(),
			right: new Image(),
		},
		car: {
			one: new Image(),
			two: new Image(),
		},
	},
	collectables: {
		coin: new Image(),
		powerup: new Image(),
	},
	player: new Image(),
	shield: new Image(),
};

images.vehicles.log.left.src = "assets/images/vehicles/log/left_log.png";
images.vehicles.log.middle.src = "assets/images/vehicles/log/middle_log.png";
images.vehicles.log.right.src = "assets/images/vehicles/log/right_log.png";

images.vehicles.car.one.src = "assets/images/vehicles/car/car1.png";
images.vehicles.car.two.src = "assets/images/vehicles/car/car2.png";

images.player.src = "assets/images/player/chicken.png";

images.collectables.coin.src = "assets/images/collectables/coin.png";
images.collectables.powerup.src = "assets/images/collectables/powerup.png";

images.shield.src = "assets/images/player/shield.png";

// Powerups text colors and names
const powerups = {
	traffic: {
		innerColor: "#73BAE6",
		borderColor: "#55B5F0",
		name: "Traffic Jam ( 15s )",
	},
	shield: {
		innerColor: "#83f374",
		borderColor: "#20db4f",
		name: "Shield ( 15s )",
	},
	coins: {
		innerColor: "#EEDE8B",
		borderColor: "#E1CD69",
		name: "2x Coins ( 15s )",
	},
	cars: {
		innerColor: "#E66161",
		borderColor: "#DF4C4C",
		name: "No Cars",
	},
};

// game
const game = {
	player: null,
	lanes: [],
	currentLane: 0,
	coins: 0,
	active: false,
	playable: false,
	currentPowerup: null,
	lastPowerup: null,
	powerups: {
		traffic: false,
		shield: false,
		coins: false,
	},
	frameCount: 0,

	// Initialize the game object and set up the player, lanes, and power-ups
	init: function () {
		this.currentLane = 0;
		this.lanes = [];
		this.active = false;
		this.playable = false;
		this.frameCount = 0;
		this.lastPowerup = 0;
		this.currentPowerup = null;
		document.getElementById("score").innerText = "0";
		document.getElementById("highScore").innerText =
			"Top " + userDataManager.getUserData().info.highestDistance;
		this.resetPowerUps();
		this.coins = 0;
		document.getElementById("coins").innerText =
			userDataManager.getUserData().info.coins;
		document.getElementById("speed").innerText = "Speed 1";

        if(shopManager.shopItems.skins[
            shopManager.userDataManager.getUserData().info.activeSkin
        ] != null){
            images.player.src =
			shopManager.shopItems.skins[
				shopManager.userDataManager.getUserData().info.activeSkin
			].src;
        }
		
		this.player = new Player({ ctx: ctx, skin: images.player, game: this });

		this.generateLanes(10000);

		this.loop();
	},

	// Start the game by displaying the active scene and enabling player controls
	start: function () {
		sceneManager.display("active");
		soundManager.play("start");
		this.playable = true;
		this.player.skin.src =
			shopManager.shopItems.skins[
				shopManager.userDataManager.getUserData().info.activeSkin
			].src;
	},

	// Generate lanes for the game, ensuring variety and clustering
	generateLanes: function (n) {
		this.lanes.push(new Lane({ laneType: "grass", ctx: ctx, game: this }));
		this.lanes.push(new Lane({ laneType: "grass", ctx: ctx, game: this }));
		this.lanes.push(new Lane({ laneType: "grass", ctx: ctx, game: this }));

		const minClusterSize = 2; // Minimum consecutive lanes of the same type
		const maxClusterSize = 4; // Maximum consecutive lanes of the same type
		const laneTypes = ["grass", "road", "water"];

		let currentType = null;
		let clusterSize = 0;
		let lastType = null;

		for (let i = 0; i < n; i++) {
			// Start a new cluster if the current one is finished or too long
			if (clusterSize === 0 || clusterSize > maxClusterSize) {
				let newType;

				// Ensure variety by avoiding too many consecutive lanes of the same type
				do {
					newType =
						laneTypes[Math.floor(Math.random() * laneTypes.length)];
				} while (newType === lastType); // Prevent repeating clusters directly

				currentType = newType;

				// Randomize cluster size within min and max bounds
				clusterSize =
					Math.floor(
						Math.random() * (maxClusterSize - minClusterSize + 1)
					) + minClusterSize;

				lastType = currentType; // Store the last type to avoid direct repeats
			}

			// Add the current lane
			this.lanes.push(
				new Lane({ laneType: currentType, ctx: ctx, game: this })
			);

			clusterSize--; // Decrease the remaining lanes in the cluster
		}

		this.lanes.forEach((lane, index) => {
			lane.y = gameHeight - 48 * (index + 1);
		});
	},

	// Draw the game elements, including lanes and the player
	draw: function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (this.lanes[this.player.currentLane].y < canvas.height - 144) {
			this.player.position.y += 1;
			this.lanes.forEach((lane, index) => {
				lane.y += 1;
			});
		}

		this.lanes.forEach((lane, index) => {
			if (
				index >= this.currentLane - 20 &&
				index <= this.currentLane + 40
			) {
				lane.draw();
			}
		});

		if (document.getElementById("difficulty").checked && this.playable) {
			if (this.frameCount % 5 == 0) {
				this.lanes.forEach((lane, index) => {
					lane.y += 1;
				});
				this.player.position.y += 1;
			}
		}

		this.player.draw();
	},

	// Main game loop to update and render the game state
	loop: function () {
		this.active = true;
		this.player.vx = 0;
		this.player.safeTile = false;
		// Check collisions
		if (this.lanes[this.player.currentLane].vehicles != null) {
			this.lanes[this.player.currentLane].vehicles.forEach((vehicle) => {
				vehicle.checkCollision(this.player);
			});
		}

		if (this.lanes[this.player.currentLane].collectables != null) {
			this.lanes[this.player.currentLane].collectables.forEach(
				(collectable) => {
					collectable.checkCollision(this.player);
				}
			);
		}

		if (!this.player.safeTile) {
			let lane = this.lanes[this.player.currentLane];
			if (lane.laneType == "water") {
				this.endGame();
				soundManager.play("splash");
			}
		}

		if (this.player.currentLane - this.currentLane > 10) {
			this.currentLane = this.player.currentLane;
		}

		if (document.getElementById("difficulty").checked) {
			if (this.frameCount % 10 == 0) {
				if (this.powerups.traffic) {
					document.getElementById("speed").innerText =
						"Speed " +
						(0.5 + (this.player.highestLane * 10) / 20) / 2;
				} else {
					document.getElementById("speed").innerText =
						"Speed " + (0.5 + (this.player.highestLane * 10) / 20);
				}
			}
		}

		// Display lane
		this.draw();

		requestAnimationFrame(() => {
			if (this.active) {
				this.loop();
			}
		});

		this.frameCount++;
		if (this.frameCount - this.lastPowerup > 900) {
			if (this.currentPowerup != null) {
				this.resetPowerUps();
			}
		}
	},

	// End the game and display the final score
	endGame: function () {
		this.active = false;
		sceneManager.display("ended");
		document.getElementById("finalScore").innerText =
			"Final Score: " + (this.player.highestLane - 1);
		if (
			this.player.highestLane - 1 >
			userDataManager.getUserData().info.highestDistance
		) {
			userDataManager.setHighestDistance(this.player.highestLane - 1);
		}
	},

	// Pause or resume the game based on the current state
	pause: function () {
		if (sceneManager.current == "active") {
			this.active = false;
			sceneManager.display("pause");
		} else if (sceneManager.current == "pause") {
			game.active = true;
			sceneManager.display("active");
			game.loop();
		}
	},

	// Add coins to the player's total, applying power-up effects if active
	addCoin: function (amount) {
		if (this.powerups.coins) {
			amount *= 2;
		}
		soundManager.play("coin");
		userDataManager.addCoins(amount);
		document.getElementById("coins").innerText =
			userDataManager.getUserData().info.coins;
	},

	// Activate a random power-up and apply its effects
	activateRandomPowerUp: function () {
		const powerUpTypes = ["traffic", "coins", "shield", "cars"];
		const powerUp =
			powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

		if (powerUp == "cars") {
			for (let i = 0; i < 20; i++) {
				if (
					this.lanes[this.player.currentLane + i].laneType == "road"
				) {
					this.lanes[this.player.currentLane + i].vehicles = [];
				}
			}
		} else {
			this.resetPowerUps();
			this.currentPowerup = powerUp;
			this.powerups[powerUp] = true;
			this.lastPowerup = this.frameCount;
		}

		soundManager.play("powerup");

		this.displayPowerUp(powerUp);
	},

	// Display the active power-up on the screen
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

	// Reset all active power-ups
	resetPowerUps: function () {
		this.currentPowerup = null;
		this.powerups.traffic = false;
		this.powerups.shield = false;
		this.powerups.coins = false;
	},
};

// BUTTON LISTENERS

document.addEventListener("keydown", (e) => {
	keysDown[e.keyCode] = true;
	console.log(e.keyCode);
	if (e.keyCode == 27) {
		game.pause();
	}

	if (sceneManager.current == "premenu") {
		sceneManager.display("menu");
		soundManager.playBackgroundMusic("assets/sounds/bgmusic.mp3");
	}
});

document.getElementById("music").addEventListener("input", (e) => {
	const value = e.target.value;
	soundManager.backgroundMusic.volume = value / 100;
});

document.addEventListener("keyup", (e) => {
	delete keysDown[e.keyCode];
});

document.getElementById("start").addEventListener("click", (e) => {
	game.start();
});

document.getElementById("resume").addEventListener("click", (e) => {
	game.pause();
});

document.getElementById("playAgain").addEventListener("click", (e) => {
	game.init();
	sceneManager.display("menu");
});

document.getElementById("restart").addEventListener("click", (e) => {
	game.init();
	sceneManager.display("menu");
});

document.getElementById("instructions").addEventListener("click", (e) => {
	sceneManager.display("instructions");
});

document.getElementById("back").addEventListener("click", (e) => {
	sceneManager.display("menu");
});

document.getElementById("backButton").addEventListener("click", (e) => {
	sceneManager.display("menu");
});

document.getElementById("menuButton").addEventListener("click", (e) => {
	sceneManager.display("menu");
});

document.getElementById("shop").addEventListener("click", (e) => {
	shopManager.openShop();
});

document.getElementById("settings").addEventListener("click", (e) => {
	sceneManager.display("settings");
});

/* CANVAS RESIZE */

function resizeCanvas() {
	const aspectRatio = canvas.width / canvas.height;
	const windowRatio = window.innerWidth / window.innerHeight;

	let scale;

	if (windowRatio > aspectRatio) {
		// Window is wider → scale based on height
		scale = window.innerHeight / canvas.height;
	} else {
		// Window is taller → scale based on width
		scale = window.innerWidth / canvas.width;
	}

	canvas.style.width = `${canvas.width * scale}px`;
	canvas.style.height = `${canvas.height * scale}px`;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

game.init();
