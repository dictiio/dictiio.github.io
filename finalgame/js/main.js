import { Controller } from "./structure/Controller.js";
import { Game } from "./structure/Game.js";
import { Display } from "./structure/Display.js";
import { Engine } from "./structure/Engine.js";

const controller = new Controller()
const game = new Game()
const display = new Display(document.getElementById("game"))

const render = () => {
    display.renderColor(game.world.bgColor)
    display.renderPlayer(game.world.player)
    display.render()
}

const update = () => {
    game.update()
}

const engine = new Engine(1000/30, update, render)
engine.start()

controller.handleKeyDownUp()