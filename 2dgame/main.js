const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;

const backgroundImage = drawBackground();

function drawBackground() {
	var background = new Image();
	background.src = "assets/background.png";

	return background;
}

backgroundImage.onload = function () {
	game.init();
};

const keysDown = {};

canvas.width = 1280;
canvas.height = 720;

class Sprite {
	constructor(imageSrc, frameWidth, frameHeight, totalFrames, frameSpeed) {
		this.image = new Image();
		this.image.src = imageSrc;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.totalFrames = totalFrames;
		this.frameSpeed = frameSpeed;

		// Internal state
		this.currentFrame = 0;
		this.frameCount = 0;
	}

	// Draw the current frame at a specified position
	draw(x, y, width, height, angle) {
		// Update the animation frame
		this.frameCount++;
		if (this.frameCount >= this.frameSpeed) {
			this.frameCount = 0; // Reset frame counter
			this.currentFrame = (this.currentFrame + 1) % this.totalFrames; // Loop through frames
		}

		// Draw the current frame
		const sourceX = this.currentFrame * this.frameWidth;

		ctx.save();
		ctx.translate(x + width / 2, y + height / 2);
		ctx.rotate(angle * (Math.PI / 180));

		ctx.drawImage(
			this.image,
			sourceX,
			0, // Source X and Y on the sprite sheet
			this.frameWidth,
			this.frameHeight, // Source frame width and height
			-width / 2,
			-height / 2, // Position on canvas
			width,
			height // Draw width and height
		);

		ctx.restore();
	}
}

class Player {
	constructor({
		position = { x: 200, y: 450 },
		color = "red",
		width = 48,
		height = 48,
		velocity = { x: 0, y: 0 },
		sprite,
		angle = 0,
	}) {
		this.position = position;
		this.color = color;
		this.width = width;
		this.height = height;
		this.velocity = velocity;
		this.sprite = sprite;
		this.canControl = true;
		this.angle = angle;
	}

	draw() {
		// update position
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		// render

		//ctx.fillStyle = this.color
		//ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

		this.sprite.draw(
			this.position.x,
			this.position.y,
			this.width,
			this.height,
			this.angle
		);
	}
}

const laser = {
	width: 40,
	height: 40,
	top: new Image(),
	bottom: new Image(),
	left: new Image(),
	right: new Image(),
	loadImages: function (callback) {
		const images = [
			"assets/toplaser.png",
			"assets/bottomlaser.png",
			"assets/leftlaser.png",
			"assets/rightlaser.png",
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

class Collectable {
	constructor({
		position = { x: 0, y: 0 },
		width = 32,
		height = 32,
		player,
		type = "coin",
	}) {
		this.position = position;
		this.width = width;
		this.height = height;
		this.player = player;
		this.type = type;

		if (this.type == "coin") {
			this.img = new Image();
			this.img.src = "assets/coin.png";
		}

		this.img.onload = () => {
			this.ready = true;
		};
	}

	draw() {
		if (this.ready) {
			this.position.x -= game.speed;
			ctx.drawImage(
				this.img,
				this.position.x,
				this.position.y,
				this.width,
				this.height
			);
		}
	}

	isOffScreen() {
		return this.position.x + this.width < 0; // Check if off-screen
	}
}

class Obstacle {
	constructor({
		position = { x: 0, y: 0 },
		color = "red",
		width = 20,
		height = 100,
		player,
		vertical = true,
	}) {
		this.position = position;
		this.color = color;
		this.width = width;
		this.height = height;
		this.player = player;
		this.vertical = vertical;

		if (this.vertical) {
			this.topImg = laser.top;
			this.bottomImg = laser.bottom;
		} else {
			this.topImg = laser.left;
			this.bottomImg = laser.right;
			this.width = height;
			this.height = width;
		}
	}

	draw() {
		this.position.x -= game.speed;

		if (this.vertical) {
			const offsetX = (this.width - laser.width) / 2;
			// draw top laser
			ctx.drawImage(
				this.topImg,
				this.position.x + offsetX,
				this.position.y,
				laser.width,
				laser.height
			);

			ctx.drawImage(
				this.bottomImg,
				this.position.x + offsetX,
				this.position.y + this.height - laser.height,
				laser.width,
				laser.height
			);

			if (this.player.canControl) {
				// draw laser
				ctx.fillStyle = "#ff6666";
				ctx.fillRect(
					this.position.x,
					this.position.y + laser.height,
					this.width,
					this.height - laser.height * 2
				);

				const innerWidth = this.width * 0.5; // Inner rectangle is 50% of the width
				const innerX = this.position.x + (this.width - innerWidth) / 2;

				ctx.fillStyle = "red";
				ctx.fillRect(
					innerX,
					this.position.y + laser.height,
					innerWidth,
					this.height - laser.height * 2
				);
			}
		} else {
			const offsetY = (this.height - laser.height) / 2;
			// draw top laser
			ctx.drawImage(
				this.topImg,
				this.position.x,
				this.position.y + offsetY,
				laser.width,
				laser.height
			);

			ctx.drawImage(
				this.bottomImg,
				this.position.x + this.width - laser.width,
				this.position.y + offsetY,
				laser.width,
				laser.height
			);

			if (this.player.canControl) {
				// draw laser
				ctx.fillStyle = "#ff6666";
				ctx.fillRect(
					this.position.x + laser.height,
					this.position.y,
					this.width - laser.height * 2,
					this.height
				);

				const innerHeight = this.height * 0.5; // Inner rectangle is 50% of the width
				const innerY =
					this.position.y + (this.height - innerHeight) / 2;

				ctx.fillStyle = "red";
				ctx.fillRect(
					this.position.x + laser.width,
					innerY,
					this.width - laser.width * 2,
					innerHeight
				);
			}
		}
	}

	isOffScreen() {
		return this.position.x + this.width < 0; // Check if off-screen
	}
}

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

let backgroundX = 0; // Starting x position of the background
const imageWidth = backgroundImage.width; // Image width (make sure it's twice the canvas width)
const canvasWidth = canvas.width;

function collision({ box1, box2 }) {
	return (
		box1.position.x <= box2.position.x + box2.width && // collides on right side
		box1.position.x + box1.width > box2.position.x && // collides on left side
		box1.position.y <= box2.position.y + box2.height && // collides on bottom
		box1.position.y + box1.height > box2.position.y
	);
}

const guiManager = {
	current: "pause",
	// Afficher le menu et cacher le menu actuel
	display: function (id) {
		document
			.querySelector(`.gameGui-${this.current}`)
			.classList.add("hidden");
		document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
		this.current = id;
		console.log("Displaying " + id);
	},
};

const game = {
	frameCount: 0,
	player: null,
	speed: 5,
	obstacles: [],
	coins: [],
	coinCount: 0,
	active: false,
	ended: true,
	distance: 0,
	animCount: 0,

	init: function () {
		this.frameCount = 0;
		this.active = true;
		this.ended = false;

		const playerSprite = new Sprite(
			"assets/skins/AquaDrake.png", // Path to sprite sheet
			64,
			64, // Frame width and height
			4, // Total frames
			10 // Frame speed
		);

		playerSprite.image.onload = () => {
			laser.loadImages(() => {
				console.log("All images loaded!");
				this.player = new Player({ sprite: playerSprite });
				this.loop();
				this.generateObstacle();
			});
		};
	},

	stop: function () {
		if (this.ended) return;

		this.active = false;
		this.ended = true;
		console.log("Game stopped");
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

		// draw floor
		ctx.fillStyle = "gray";
		ctx.fillRect(0, 620, canvas.width, 100);

		ctx.fillStyle = "#464a47";
		ctx.fillRect(0, 620, canvas.width, 20);

		ctx.strokeStyle = "black";
		ctx.beginPath();
		for (let x = 0; x < canvas.width; x += 25) {
			ctx.moveTo(x, 50);
			ctx.lineTo(x, 55);
		}
		ctx.stroke();

		//draw player
		this.player.draw();

		// draw obstacles
		this.obstacles.forEach((obstacle, index) => {
			obstacle.draw();
			if (obstacle.isOffScreen()) {
				this.obstacles.splice(index, 1); // Remove off-screen obstacle
				console.log("Deleting obstacle");
				this.generateObstacle();
				console.log(this.obstacles);
			}
			if (collision({ box1: this.player, box2: obstacle })) {
				console.log("collide");
				this.playDeathAnimation();
			}
		});

		// draw coins
		this.coins.forEach((coin, index) => {
			coin.draw();
			if (coin.isOffScreen()) {
				this.coins.splice(index, 1); // Remove off-screen obstacle
			}
			if (collision({ box1: this.player, box2: coin })) {
				this.coinCount += 1;
				this.coins.splice(index, 1);
			}
		});
	},

	loop: function () {
		this.draw();

		// bg

		backgroundX -= game.speed;

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
					this.player.velocity.x = -5;
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

		// distance
		this.distance += this.speed / 25;

		// TEMPORARYT FPS

		const currentFrameTime = performance.now();
		frameCount++;

		if (currentFrameTime - lastFrameTime >= 1000) {
			fps = frameCount;
			frameCount = 0;
			lastFrameTime = currentFrameTime;
		}

		// Example of displaying FPS
		drawFPS(fps);

		// generate obstacle
		if (this.frameCount % 120 == 0) {
		}

		if ((this.frameCount + 60) % 360 == 0) {
			console.log("Creating row");
			this.generateRandomCoinRow();
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

	generateObstacle: function () {
		console.log("Generating new obstacle");
		const width = 15; // Random width
		const height = Math.random() * 100 + 250; // Random height

		const angle = Math.random() * 45 - 22.5; // Random angle between -22.5° and 22.5°
		const vertical = Math.random() < 0.5; // Random boolean

		let y = vertical
			? Math.random() * (620 - height)
			: Math.random() * (620 - width);
		if (y <= 5) y += 5;

		this.obstacles.push(
			new Obstacle({
				position: { x: canvas.width, y: y },
				width: width,
				height: height,
				angle: angle,
				player: this.player,
				vertical: vertical,
			})
		);
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
};

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

function drawFPS(fps) {
	ctx.clearRect(0, 0, 100, 20); // Clear previous FPS display
	ctx.fillStyle = "black";
	ctx.font = "16px Arial";
	ctx.fillText(`FPS: ${fps}`, 10, 20);
}
