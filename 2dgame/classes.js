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

        if (this.type == "powerup") {
			this.img = new Image();
			this.img.src = "assets/powerup.png";
		}

		this.img.onload = () => {
			this.ready = true;
		};
	}

	draw() {
		if (this.ready) {
			this.position.x -= game.getSpeed();
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
		this.position.x -= game.getSpeed();

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

			if (this.player.canControl && game.laserEnabled) {
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

			if (this.player.canControl && game.laserEnabled) {
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
