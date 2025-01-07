const guiManager = {
	current: "start",
	// Afficher le menu et cacher le menu actuel
	display: function (id) {
		document
			.querySelector(`.gameGui-${this.current}`)
			.classList.add("hidden");
		document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
		this.current = id;
		console.log("Displaying " + id);

        if(id == "start"){
            game.drawIdleBackground();
        }
	},
};