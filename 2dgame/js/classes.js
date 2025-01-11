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

		// render sprite

		this.sprite.draw(
			this.position.x,
			this.position.y,
			this.width,
			this.height,
			this.angle
		);

		// render shield
		if (game.shield) {
			ctx.beginPath();
			ctx.arc(
				this.position.x + this.width / 2,
				this.position.y + this.height / 2,
				this.width * 0.75,
				0,
				2 * Math.PI
			);
			ctx.strokeStyle = "lightblue";
			ctx.lineWidth = 5;
			ctx.stroke();
		}
	}
}

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

		this.img = new Image();

		// Load image based on type
		if (this.type == "coin") {
			this.img.src = "assets/images/coin.png";
		}

		if (this.type == "powerup") {
			this.img.src = "assets/images/powerup.png";
		}

		if (this.type == "rocket") {
			this.img.src = "assets/images/rocket.png";
		}

		// Ready once image has loaded
		this.img.onload = () => {
			this.ready = true;
		};
	}

	draw() {
		if (this.ready) {
			// Increase speed if type is a rocket
			if (this.type == "rocket") {
				this.position.x -= 2 * game.getSpeed();
			} else {
				this.position.x -= game.getSpeed();
			}

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
		type = "laser",
	}) {
		this.position = position;
		this.color = color;
		this.width = width;
		this.height = height;
		this.player = player;
		this.vertical = vertical;
		this.type = type;

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
		this.position.x -= game.getSpeed();

		// Vertical lasers
		if (this.vertical) {
			const offsetX = (this.width - laser.width) / 2;

			// Draw top laser
			ctx.drawImage(
				this.topImg,
				this.position.x + offsetX,
				this.position.y,
				laser.width,
				laser.height
			);

			// Draw bottom laser
			ctx.drawImage(
				this.bottomImg,
				this.position.x + offsetX,
				this.position.y + this.height - laser.height,
				laser.width,
				laser.height
			);

			// Check if player is alive and lasers are active
			if (this.player.canControl && game.laserEnabled) {
				// draw laser outer line
				ctx.fillStyle = "#ff6666";
				ctx.fillRect(
					this.position.x,
					this.position.y + laser.height,
					this.width,
					this.height - laser.height * 2
				);

				// draw laser inner line

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
			// Horizontal lasers
		} else {
			const offsetY = (this.height - laser.height) / 2;
			// Draw top laser
			ctx.drawImage(
				this.topImg,
				this.position.x,
				this.position.y + offsetY,
				laser.width,
				laser.height
			);

			// Draw bottom laser
			ctx.drawImage(
				this.bottomImg,
				this.position.x + this.width - laser.width,
				this.position.y + offsetY,
				laser.width,
				laser.height
			);

			// Check if player is alive and lasers are active
			if (this.player.canControl && game.laserEnabled) {
				// draw laser outer line
				ctx.fillStyle = "#ff6666";
				ctx.fillRect(
					this.position.x + laser.height,
					this.position.y,
					this.width - laser.height * 2,
					this.height
				);

				// draw laser inner line
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
