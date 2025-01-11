const guiManager = {
	current: "start",
	// Display selected GUI and hide current GUI.
	display: function (id) {
		document
			.querySelector(`.gameGui-${this.current}`)
			.classList.add("hidden");
		document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
		this.current = id;
		console.log("Displaying " + id);
        soundManager.play("click")

        // Draw background if needed
        if(id == "start"){
            game.drawIdleBackground();
        }
	},
};