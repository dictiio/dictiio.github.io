class SoundManager {
	constructor() {
		this.audio = true;
		this.file = "assets/sounds/";
		this.backgroundMusic = null;
		this.backgroundMusicVolume = 0.5;
		this.baseVolume = 1;
		this.lastCoinSound = 0;
	}

	// Play audio file.
	play(id, vol = 1) {
		if (this.audio) {
			const audio = new Audio(`${this.file}${id}.mp3`);
			const sliderVolume = document.getElementById("volume").value / 100; // Normalize to 0-1
			const finalVolume = Math.min(Math.max(vol * sliderVolume, 0), 1); // Clamp to 0-1
			audio.volume = finalVolume;
			audio.currentTime = 0;
			audio.play();
		}
	}

	// Mute all sounds.
	mute() {
		this.audio = false;
		if (this.backgroundMusic) {
			this.backgroundMusic.pause();
		}
	}

	// Unmute sounds.
	unmute() {
		this.audio = true;
		if (this.backgroundMusic) {
			this.backgroundMusic.play(this.baseVolume);
		}
	}

	// Play a background music track.
	playBackgroundMusic(src, vol = 1) {
		this.baseVolume = vol;

		if (this.backgroundMusic) {
			this.backgroundMusic.pause();
			this.backgroundMusic.currentTime = 0;
		}

		this.backgroundMusic = new Audio(src);
		this.backgroundMusic.volume = vol * 0.5 * this.backgroundMusicVolume;

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
	}

	// Stop current background music
	stopBackgroundMusic() {
		if (this.backgroundMusic) {
			this.backgroundMusic.pause();
		}
	}

	// Play a coin sound of random pitch.
	playCoinSound() {
		if (Date.now() - this.lastCoinSound > 100) {
			this.lastCoinSound = Date.now();
			const coinSound = new Audio("assets/sounds/coin.mp3");
			coinSound.volume = 0.3;
			coinSound.currentTime = 0; // Reset sound
			coinSound.playbackRate = 1 + (Math.random() * 0.4 - 0.2); // Small random pitch variation
			coinSound.play();
		}
	}
}

// Export the class so it can be imported in other files
export { SoundManager };
