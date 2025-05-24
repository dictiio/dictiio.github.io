export class Game {
	constructor() {
		this.world = new Game.World("#dd7272");
		this.cameraActive = false;
        this.active = false;
	}

	static World = class {
		constructor(bgColor) {
			this.bgColor = bgColor;
			this.player = new Game.Player(100, 670, 48, 48, 0, 0, 2, "default");
			this.platforms = [];
			this.milestones = [];
			this.vy = 0;
			this.generatePlatforms();
			this.trueDistance = 0;
			this.loadMilestones();
		}

		loadMilestones() {
			let lastY = 0;
			for (let i = 0; i < 20; i++) {
				lastY -= 1000;
				const level = i / 5;
				const distance = Math.abs(lastY / 10);
				let text;
				if (i % 5 === 0) {
					text = `${distance}m - Niveau ${level}`;
				} else {
					text = `${distance}m`;
				}
				this.milestones.push(
					new Game.Milestone(50, lastY, 200, 100, 0, 0, "white", text)
				);
			}
		}

		generatePlatforms() {
			// Generate game platforms
			let lastY = 600;
			let lastX = 640; // Start roughly in the middle

			for (let i = 0; i < 1000; i++) {
				const width = 80;

				// Controlled vertical gap (e.g. 60 to 100 pixels)
				let verticalGap;
				if (Math.random() < 0.5) {
					verticalGap = 100 + Math.random() * 100;
				} else {
					verticalGap = 0;
				}

				lastY -= verticalGap;

				let type = "normal";
				const absY = Math.abs(lastY);

				// Level 1: 0 - 5000
				if (absY < 5000) {
					type = "normal";
				}
				// Level 2: 5000 - 10000
				else if (absY < 10000) {
					let rand = Math.random();
					if (rand < 0.6) {
						type = "normal";
					} else if (rand < 0.8) {
						type = "moving";
					} else {
						type = "jumping";
					}
				}
				// Level 3: 10000 - 15000
				else if (absY < 15000) {
					type = "moving";
				}
				// Level 4: 15000 - 20000
				else if (absY < 20000) {
					let rand = Math.random();
					if (rand < 0.5) {
						type = "normal";
					} else if (rand < 0.7) {
						type = "moving";
					} else if (rand < 0.85) {
						type = "jumping";
					} else {
						type = "disappearing";
					}
				}
				// Level 5: 20000 - 25000
				else if (absY < 25000) {
					type = "jumping";
				}
				// Level 6: 25000 - 30000
				else if (absY < 30000) {
					let rand = Math.random();
					if (rand < 0.4) {
						type = "normal";
					} else if (rand < 0.7) {
						type = "moving";
					} else if (rand < 0.9) {
						type = "jumping";
					} else {
						type = "disappearing";
					}
				}
				// Level 7: 30000 - 35000
				else if (absY < 35000) {
					type = "moving";
				}
				// Level 8: 35000 - 40000
				else if (absY < 40000) {
					let rand = Math.random();
					if (rand < 0.3) {
						type = "normal";
					} else if (rand < 0.6) {
						type = "moving";
					} else if (rand < 0.8) {
						type = "jumping";
					} else {
						type = "disappearing";
					}
				}
				// Level 9: 40000 - 45000
				else if (absY < 45000) {
					type = "moving";
				}
				// Level 10: 45000 - 50000
				else if (absY < 50000) {
					let rand = Math.random();
					if (rand < 0.25) {
						type = "normal";
					} else if (rand < 0.5) {
						type = "moving";
					} else if (rand < 0.75) {
						type = "jumping";
					} else {
						type = "disappearing";
					}
				}
				// Beyond level 10: fallback
				else {
					type = "normal";
				}

				this.platforms.push(
					new Game.Platform(
						Math.random() * (1280 - width),
						lastY,
						width,
						20,
						0,
						0,
						type
					)
				);
			}
		}
	};

	static Platform = class {
		constructor(x, y, w, h, vx, vy, type = "normal") {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.vx = vx;
			this.vy = vy;
			this.type = type;
			if (this.type == "moving") {
				this.vx = 5;
				this.color = "#00ccf0";
			}
			if (this.type == "jumping") {
				this.color = "#3ef837";
			}
			if (this.type == "disappearing") {
				this.color = "#f0a500";
			}
			if (this.type == "normal") {
				this.color = "#000000";
			}
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;

			if (this.type == "moving") {
				if (this.x < 0 || this.x > 1280 - this.w) {
					this.vx *= -1;
				}
			}
		}
	};

	static Milestone = class {
		constructor(x, y, w, h, vx, vy, color, text) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.vx = vx;
			this.vy = vy;
			this.color = color;
			this.text = text;
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;
		}
	};

	static Player = class {
		constructor(x, y, w, h, vx, vy, gravity, skin) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.vx = vx;
			this.vy = vy;
			this.gravity = gravity; // Gravity value
			this.skin = skin;
			this.isJumping = false; // To track whether the player is already jumping
			this.floorY = 720;
			this.floorPlatform = null;
			this.trueDistance = 0;
			this.alive = true;
            this.flipped = false;
		}

		moveLeft() {
			this.x -= 15;
            this.flipped = true;
		}

		moveRight() {
			this.x += 15;
            this.flipped = false;
		}

		checkPlatforms(platforms) {
			let count = 0;
			this.floorPlatform = null;
			platforms.forEach((platform) => {
				if (
					this.x + this.w > platform.x &&
					this.x < platform.x + platform.w
				) {
					// on platform x axis
					if (this.y + this.h <= platform.y) {
						// If no floorPlatform yet, or this platform is higher
						if (
							this.floorPlatform === null ||
							platform.y < this.floorPlatform.y ||
							(this.floorPlatform.type === "normal" &&
								platform.type !== "normal" &&
								platform.y <= this.floorPlatform.y) // special overrides normal at same or higher
						) {
							this.floorY = platform.y;
							this.floorPlatform = platform;
						}
						count++;
					}
				}
			});

			if (count == 0) {
				this.floorY = 720;
			}
		}

		jump() {
			if (this.y + this.h >= this.floorY && this.alive) {
				// Check if player is on the ground
				this.vy = -40; // Jump velocity (negative because we want to go up)
				this.isJumping = true;
			}
		}

		update() {
			console.log(this.floorY);
			// Apply gravity
			if (this.isJumping || this.y < this.floorY) {
				this.vy += this.gravity; // Gradually pull the player down
			}
			this.prevY = this.y;
			this.y += this.vy;

			if (this.y + this.h > 720 && this.trueDistance > 100) {
				// or whatever your screen height is
				this.alive = false;
			}

			// If player hits the ground, stop downward movement and reset jumping
			if (this.y + this.h >= this.floorY) {
				this.y = this.floorY - this.h;
				this.vy = 0; // Stop downward velocity
				this.isJumping = false; // Player is no longer jumping
				if (this.floorPlatform) {
					if (this.floorPlatform.type == "jumping") {
						this.vy = -80;
					}
					if (this.floorPlatform.type == "moving") {
						this.x += this.floorPlatform.vx;
					}
				}
			}

			// Prevent the player from going out of bounds horizontally
			if (this.x < 0 - this.w) {
				this.x = 1280;
			} else if (this.x > 1280) {
				this.x = 0 - this.w;
			}

			// Prevent the player from going out of bounds vertically
			if (this.y + this.h > 720) {
				this.y = 720 - this.h;
			}

			this.trueDistance -= this.vy;
		}
	};

	update() {

		this.world.platforms.forEach((platform) => {
			platform.update();
		});

		// Remove platforms that are below the screen
		this.world.platforms = this.world.platforms.filter(
			(platform) => platform.y <= 720
		);

		this.world.player.checkPlatforms(this.world.platforms);
		this.world.player.update();

		// Camera follow logic: keep player at y = 300
		const cameraAnchor = 200;
		const cameraActivationY = 200; // Only start following after player passes this y

		this.world.vy = 0;
		if (!this.cameraActive && this.world.player.y < cameraActivationY) {
			this.cameraActive = true;
		}

		if (this.cameraActive) {
			let diff = this.world.player.y - cameraAnchor;
			const speedFactor = 0.1; // Tune this for smoothness
			const maxSpeed = 1000; // Maximum camera speed

			if (Math.abs(diff) > 10) {
				// Only move camera if outside deadzone
				this.world.vy = -(
					Math.sign(diff) *
					Math.min(Math.abs(diff) * speedFactor, maxSpeed)
				);

				// Optional: Only move up if player is near bottom (as in your original code)
				if (
					diff > 10 &&
					this.world.player.y < 710 - this.world.player.h &&
					this.world.player.alive
				) {
					this.world.vy = 0;
				}
			} else {
				this.world.vy = 0; // Stop moving if within deadzone
			}
		}

		// Move all platforms by vy
		this.world.platforms.forEach((platform) => {
			platform.y += this.world.vy;
		});

		this.world.milestones.forEach((milestone) => {
			milestone.y += this.world.vy;
		});

		this.world.trueDistance += this.world.vy;
		// Do NOT move the player by vy
		if (this.world.player.alive) {
			this.world.player.y += this.world.vy;
		}
	}

    pause() {
        this.active = false;
    }

    resume() {
        this.active = true;
    }
}
