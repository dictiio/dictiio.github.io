import { soundManager } from "./main.js";

class SceneManager {
	constructor() {
		this.current = "premenu";
	}

	// Display menu and hide current.
	display(id) {
		document
			.querySelector(`.gameGui-${this.current}`)
			.classList.add("hidden");
		document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
		this.current = id;
		soundManager.play("click", 2);
		console.log("Displaying " + id);
	}
}

export { SceneManager };
