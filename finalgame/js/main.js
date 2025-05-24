import { Controller } from "./structure/Controller.js";
import { Game } from "./structure/Game.js";
import { Display } from "./structure/Display.js";
import { Engine } from "./structure/Engine.js";

import { SceneManager } from "./sceneManager.js";
import { UserDataManager } from "./userData.js";
import { SoundManager } from "./SoundManager.js";
import { ShopManager } from "./ShopManager.js";

// managers
export const userDataManager = new UserDataManager();
userDataManager.retrieve();
export const sceneManager = new SceneManager();
export const soundManager = new SoundManager();
export const shopManager = new ShopManager();

const controller = new Controller()
const game = new Game()
const display = new Display(document.getElementById("game"))

const render = () => {
    display.renderColor(game.world.bgColor)
    display.renderPlayer(game.world.player)
    display.renderPlayerArrow(game.world.player)
    display.renderPlatforms(game.world.platforms)
    display.renderMilestones(game.world.milestones)
    display.render()
}

const update = () => {
    if(!game.active) return;

    if(controller.keys.left.isPressed) game.world.player.moveLeft()
    if(controller.keys.right.isPressed) game.world.player.moveRight()
    if(controller.keys.space.isPressed) game.world.player.jump()

    game.update()
}

const engine = new Engine(1000/75, update, render)
engine.start()

controller.handleKeyDownUp()

// Pregame
window.addEventListener("keydown", (e) => {
    if(sceneManager.current === "premenu"){
        sceneManager.display("menu")
        //soundManager.play("click", 2)
    } else if (sceneManager.current == "active" || sceneManager.current == "pause") {
        if (e.key === "Escape") {
            if(game.active){
                sceneManager.display("pause");
                game.active = false;
            } else {
                sceneManager.display("active");
                game.active = true;
            }
            //soundManager.play("click", 2);
        }
    }
})

document.getElementById("resume").addEventListener("click", () => {
    sceneManager.display("active");
    game.active = true;
    //soundManager.play("click", 2);
})

document.getElementById("start").addEventListener("click", () => {
    sceneManager.display("active");
    game.active = true;
    //soundManager.play("click", 2);
});

document.getElementById("shop").addEventListener("click", () => {
    sceneManager.display("shop");
    //soundManager.play("click", 2);
});

document.getElementById("menuButton").addEventListener("click", () => {
    sceneManager.display("menu");
    //soundManager.play("click", 2);
});

document.getElementById("back").addEventListener("click", () => {
    sceneManager.display("menu");
    //soundManager.play("click", 2);
});

document.getElementById("settings").addEventListener("click", () => {
    sceneManager.display("settings");
    //soundManager.play("click", 2);
});