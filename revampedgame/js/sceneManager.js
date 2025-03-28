class SceneManager {
    constructor(){
        this.current = "menu"
    }

    display(id){
        document
            .querySelector(`.gameGui-${this.current}`)
            .classList.add("hidden");
        document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
        this.current = id;
        console.log("Displaying " + id);
    }

}

export { SceneManager }