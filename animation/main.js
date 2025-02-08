const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isMouseDown = false;
const particles = [];
const plants = [];
const clouds = [];

const gravity = 0.2; // Gravity effect
const wind = 0.2; // Horizontal wind effect

// flower images
const flowers = {
	flower1: new Image(),
	flower2: new Image(),
	flower3: new Image(),
};

flowers.flower1.src = "assets/images/flower1.png";
flowers.flower2.src = "assets/images/flower2.png";
flowers.flower3.src = "assets/images/flower3.png";

const game = {
	time: 0,
	dayCycle: 10000,
};

const guiManager = {
	current: "pregame",
	// Display menu and hide current.
	display: function (id) {
		document
			.querySelector(`.gameGui-${this.current}`)
			.classList.add("hidden");
		document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
		this.current = id;
		soundManager.play("click");
	},
};

// Sound Manager
const soundManager = {
	audio: true,
	file: "assets/sounds/",
	backgroundMusic: null,
	baseVolume: 1,
	lastCoinSound: 0,
	rainSound: null,

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
};

class Plant {
	constructor(x, y) {
		this.position = { x, y };
		this.size = 25;
		this.growthRate = 1;
		this.growing = true;
		this.lastCollisionTime = 0;
		this.hatchTime;

		// Generate a random flower image
		this.image = flowers[`flower${getRandomInteger(1, 3)}`];
	}

	// Grow plant
	grow() {
		if (this.growing && this.size < 50) {
			this.size += Math.random() * this.growthRate;
		}
		if (this.size >= 50 && this.growing) {
			this.growing = false;
			this.hatchTime = Date.now();
			soundManager.play("pop");
		}
	}

	// Draw plant
	draw() {
		// Check if still growing
		if (this.growing) {
			ctx.fillStyle = "#A27B5C"; // Color of the plant
			ctx.beginPath();
			ctx.arc(
				this.position.x,
				this.position.y - this.size / 2,
				this.size,
				0,
				Math.PI * 2
			); // Growing circle
			ctx.fill();
		} else {
			ctx.drawImage(
				this.image,
				this.position.x - this.size * 1.5,
				house.y + house.height - this.size * 3,
				this.size * 3,
				this.size * 3
			);
		}
	}
}

class Cloud {
	constructor(x, y, vx, vy, width, height, color = "white") {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.width = width;
		this.height = height;
		this.color = color;
	}

	draw() {
		ctx.save();

		this.x += this.vx;
		this.y += this.vy;

		// Add cloud shadow
		ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;

		ctx.fillStyle = this.color;

		// Overlapping circles
		ctx.beginPath();
		ctx.arc(
			this.x + this.width * 0.3,
			this.y + this.height * 0.6,
			this.height * 0.4,
			0,
			Math.PI * 2,
			false
		);
		ctx.arc(
			this.x + this.width * 0.6,
			this.y + this.height * 0.5,
			this.height * 0.5,
			0,
			Math.PI * 2,
			false
		);
		ctx.arc(
			this.x + this.width * 0.8,
			this.y + this.height * 0.6,
			this.height * 0.4,
			0,
			Math.PI * 2,
			false
		);
		ctx.arc(
			this.x + this.width * 0.5,
			this.y + this.height * 0.3,
			this.height * 0.4,
			0,
			Math.PI * 2,
			false
		);
		ctx.fill();

		ctx.restore();
	}
}

class Particle {
	constructor({
		position = { x: 100, y: 100 },
		velocity = { x: 0, y: 0 },
		radius = 25,
		color = "white",
		trail = {
			enabled: true,
			gap: 20,
			count: 8,
		},
	} = {}) {
		this.position = position;
		this.velocity = velocity;
		this.radius = radius;
		this.color = color;
		this.trail = trail;
	}

	draw() {
		this.velocity.y += gravity;
		this.velocity.x += wind * (Math.random() - 0.5); // Slight wind variation
		// update position
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		// trail effect
		if (this.trail.enabled) {
			for (let i = 0; i < this.trail.count; i++) {
				let time = i * 0.1;

				// Horizontal position prediction with wind
				let predictedX =
					this.position.x +
					this.velocity.x * time +
					0.5 * wind * time * time;

				// Vertical position prediction with gravity
				let predictedY =
					this.position.y +
					this.velocity.y * time +
					0.5 * gravity * time * time;

				ctx.fillStyle = this.color;
				ctx.globalAlpha = 1 - i / this.trail.count; // Fading effect

				// Draw the predicted trail dot
				ctx.beginPath();
				ctx.arc(predictedX, predictedY, this.radius, 0, 2 * Math.PI);
				ctx.fill();
			}
			ctx.globalAlpha = 1.0;
		}

		ctx.fillStyle = this.color;

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	// Check if particle is off screen
	isOffScreen() {
		return this.position.y > canvas.height;
	}
}

class House {
	constructor(x, y, width, height, ctx) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.ctx = ctx;
	}

	draw() {
		// Draw house body
		ctx.fillStyle = "#FFF2C7";
		ctx.fillRect(this.x, this.y, this.width, this.height);

		// Draw larger roof
		ctx.fillStyle = "#FF7171";
		ctx.beginPath();
		ctx.moveTo(this.x - this.width * 0.2, this.y);
		ctx.lineTo(this.x + this.width / 2, this.y - this.height / 2);
		ctx.lineTo(this.x + this.width * 1.2, this.y);
		ctx.closePath();
		ctx.fill();

		// Draw door
		ctx.fillStyle = "#C9A389";
		ctx.fillRect(
			this.x + this.width / 7,
			this.y + this.height / 3,
			this.width / 3,
			this.height / 1.5
		);

		// Draw windows
		ctx.clearRect(
			this.x + this.width * 0.57,
			this.y + this.height * 0.34,
			this.width * 0.35,
			this.height * 0.35
		);
	}
}

const house = new House(canvas.width * 0.6, canvas.height * 0.65, 250, 250);

// Returns a random integer
function getRandomInteger(min, max, zero = true) {
	let num = Math.floor(Math.random() * (max - min + 1)) + min;
	if (num == 0) {
		num += 1;
	}
	return num;
}

// Function to check if a raindrop (particle) collides with a plant
function checkCollision(particle, plant) {
	// Distance between the raindrop and the plant
	let dx = particle.position.x - plant.position.x;
	let dy = particle.position.y - (plant.position.y - plant.size / 2);
	let distance = Math.sqrt(dx * dx + dy * dy);
	return distance < particle.radius + plant.size;
}

// RAIN SOUND //
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// White noise
function generateWhiteNoise(duration = 5) {
	const bufferSize = audioContext.sampleRate * duration;
	const noiseBuffer = audioContext.createBuffer(
		1,
		bufferSize,
		audioContext.sampleRate
	);
	const output = noiseBuffer.getChannelData(0);

	for (let i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}

	return noiseBuffer;
}

// Function to play rain sound when particles are created
let rainSoundSource = null;
let rainSoundGain = null;

// Resume rain sound
function playRainSound() {
	if (rainSoundSource) {
		// sound is already playing
		return;
	}

	const noise = generateWhiteNoise(5); // White noise buffer

	rainSoundSource = audioContext.createBufferSource();
	rainSoundSource.buffer = noise;

	rainSoundGain = audioContext.createGain();
	rainSoundGain.gain.value = 0.025; // Lower volume
	rainSoundSource.connect(rainSoundGain);
	rainSoundGain.connect(audioContext.destination);

	rainSoundSource.loop = true;
	rainSoundSource.start();
}

// Pause rain sound
function stopRainSound() {
	if (rainSoundSource) {
		rainSoundSource.stop();
		rainSoundSource = null;
	}
}

// initialize canvas
function init() {
	soundManager.play("start");
	soundManager.playBackgroundMusic("assets/sounds/bgmusic.mp3", 0.05);
	guiManager.display("active");

	// mouse move event
	document.addEventListener("mousemove", (event) => {
		if (isMouseDown) {
			playRainSound();

			// generate random blue
			let randomBlue = Math.floor(Math.random() * 56) + 200;
			let color = `rgb(0, 127, ${randomBlue})`;

			for (let i = 0; i < 5; i++) {
				// Generate 5 raindrops at once
				particles.push(
					new Particle({
						position: {
							x: event.clientX + Math.random() * 50 - 25,
							y: event.clientY,
						},
						velocity: {
							x: Math.random() * 4 - 2,
							y: Math.random() * 5 + 2,
						},
						radius: Math.random() * 3 + 2,
						color: color,
						trail: { enabled: true, gap: 10, count: 8 },
					})
				);
			}
		}
	});

	// key down event
	document.addEventListener("keydown", (event) => {
		console.log(event);

		// SPACE => add plant
		if (event.code === "Space") {
			plants.push(
				new Plant(
					getRandomInteger(50, canvas.width - 50),
					house.y + house.height + 20
				)
			);
		}

		// ARROW LEFT => Move to left
		if (event.code === "ArrowLeft") {
			console.log("a");
			house.x -= 10;
			plants.forEach((plant) => {
				plant.position.x -= 10;
			});
		}

		// ARROW RIGHT => Move to right
		if (event.code === "ArrowRight") {
			console.log("a");
			house.x += 10;
			plants.forEach((plant) => {
				plant.position.x += 10;
			});
		}
	});

	// game loop
	loop();
}

function loop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// increment game time
	game.time += 1;

	function lerp(start, end, t) {
		return start + (end - start) * t;
	}
	// normalize game time (1 day cycle = X frames)
	let timeOfDay = (game.time % game.dayCycle) / game.dayCycle;

	// Color rangers for different parts of day
	let dayColor = { r: 135, g: 206, b: 235 };
	let eveningColor = { r: 255, g: 140, b: 50 };
	let nightColor = { r: 25, g: 25, b: 112 };
	let morningColor = { r: 255, g: 223, b: 100 };

	let startColor, endColor;

	if (timeOfDay < 0.25) {
		// Transition from morning to day
		startColor = morningColor;
		endColor = dayColor;
	} else if (timeOfDay < 0.5) {
		// Day
		startColor = dayColor;
		endColor = dayColor;
	} else if (timeOfDay < 0.75) {
		// Transition from day to evening
		startColor = dayColor;
		endColor = eveningColor;
	} else if (timeOfDay < 1) {
		// Evening
		startColor = eveningColor;
		endColor = nightColor;
	} else {
		// Transition from night to morning
		startColor = nightColor;
		endColor = morningColor;
	}

	let r = lerp(startColor.r, endColor.r, (timeOfDay % 0.25) / 0.25);
	let g = lerp(startColor.g, endColor.g, (timeOfDay % 0.25) / 0.25);
	let b = lerp(startColor.b, endColor.b, (timeOfDay % 0.25) / 0.25);

	// Background color
	ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw clouds
	if (game.time % 100 == 0) {
		let cloud = new Cloud(
			-200,
			getRandomInteger(50, 200),
			getRandomInteger(2, 4),
			0,
			getRandomInteger(150, 250),
			getRandomInteger(70, 100)
		);
		clouds.push(cloud);
	}

	// draw house
	house.draw();

	// Check rain particles collisions
	particles.forEach((particle) => {
		if (!particle.isOffScreen()) {
			particle.draw();

			if (particle.position.y > (canvas.height * 3) / 4) {
				// check for each plant
				plants.forEach((plant) => {
					if (plant.growing) {
						if (
							particle.position.y >=
								plant.position.y - plant.size &&
							particle.position.y <= plant.position.y + plant.size
						) {
							if (checkCollision(particle, plant)) {
								// cooldown
								if (plant.lastCollisionTime + 50 < Date.now()) {
									plant.grow();
									plant.lastCollisionTime = Date.now(); // Update last collision time
								}
							}
						}
					}
				});
			}
		}
	});

	// draw clouds
	clouds.forEach((cloud) => {
		cloud.draw();
	});

	// draw plants
	plants.forEach((plant) => {
		plant.draw();
	});

	// draw grass
	ctx.fillStyle = "#77B254";
	ctx.fillRect(
		0,
		house.y + house.height,
		canvas.width,
		canvas.height - house.y - house.height
	);

	requestAnimationFrame(loop);
}

// global listeners
document.addEventListener("keydown", (e) => {
	if (guiManager.current == "pregame") {
		guiManager.display("menu");
	}
});

document.addEventListener("mousedown", () => {
	isMouseDown = true;
});
document.addEventListener("mouseup", () => {
	isMouseDown = false;
	if (guiManager.current == "active") {
		stopRainSound();
	}
});
