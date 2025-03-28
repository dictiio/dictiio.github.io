import {
	playerWidth,
	playerHeight,
	gameHeight,
	gameWidth,
} from "../settings.js";
import { keysDown } from "../main.js";
import { images } from "../main.js";
import { soundManager } from "../main.js";

class Player {
	constructor({
		position = { x: 624, y: gameHeight - 96 },
		skin,
		width = playerWidth,
		height = playerHeight,
		ctx,
		game,
	}) {
		this.position = position;
		this.skin = skin;
		this.width = width;
		this.height = height;
		this.currentLane = 1;
		this.highestLane = 1;
		this.ctx = ctx;
		this.vx = 0;
		this.safeTile = true;
		this.angle = -90;
		this.game = game;

		this.cooldown = 0;
	}

	// Draw player
	draw() {
		this.position.x += this.vx;
		// 38 up, 37 left, 40 down, 39 right
		if (Date.now() - this.cooldown > 150 && this.game.playable) {
			if (37 in keysDown || 65 in keysDown) {
				// Left
				if (this.position.x - playerWidth >= 0) {
					this.position.x -= playerWidth;
					this.cooldown = Date.now();
					this.angle = 180; // Face left
					soundManager.play("hop");
				}
			} else if (39 in keysDown || 68 in keysDown) {
				// Right
				if (this.position.x + this.width + playerWidth <= gameWidth) {
					this.position.x += playerWidth;

					this.cooldown = Date.now();
					this.angle = 0; // Face right
					soundManager.play("hop");
				}
			} else if (40 in keysDown || 83 in keysDown) {
				// Down
				if (
					this.position.y + this.height + playerHeight <=
					gameHeight
				) {
					this.position.y += playerHeight;
					this.addLane(-1);
					this.cooldown = Date.now();
					this.angle = 90; // Face down
					soundManager.play("hop");
				}
			} else if (38 in keysDown || 87 in keysDown) {
				// Up
				if (this.position.y - playerHeight >= 0) {
					this.position.y -= playerHeight;
					this.addLane(1);
					this.cooldown = Date.now();
					this.angle = 270; // Face up
					soundManager.play("hop");
				}
			}
		}

		// Check if player is out of bounds
		if (this.position.x + this.width <= 0 || this.position.x > gameWidth) {
			this.game.endGame();
			soundManager.play("fall");
		}
		if (this.position.y > gameHeight) {
			this.game.endGame();
			soundManager.play("fall");
		}

		this.ctx.fillStyle = "rgba(0,0,0, 0.5)";
		this.ctx.beginPath();
		this.ctx.arc(
			this.position.x + 24,
			this.position.y + 24,
			24,
			0,
			Math.PI * 2
		);
		this.ctx.fill();
		this.ctx.closePath();

		this.ctx.arc(this.position.x, this.position.y, 24, 0, 2 * Math.PI);
		// Rotate and draw image
		this.ctx.save();

		// Move origin to the image center
		this.ctx.translate(
			this.position.x + this.width / 2,
			this.position.y + this.height / 2
		);

		// Rotate the canvas
		this.ctx.rotate((this.angle * Math.PI) / 180);

		// Draw the image centered
		this.ctx.drawImage(
			this.skin,
			-this.width / 2,
			-this.height / 2,
			this.width,
			this.height
		);

		this.ctx.restore(); // Restore the canvas state

		if (this.game.powerups.shield) {
			this.ctx.drawImage(
				images.shield,
				this.position.x,
				this.position.y,
				48,
				48
			);
		}
	}

	// Add to lane count
	addLane(count) {
		this.currentLane += count;
		if (this.highestLane < this.currentLane) {
			this.highestLane = this.currentLane;
			document.getElementById("score").innerText = this.highestLane - 1;
		}
	}
}

export { Player };
