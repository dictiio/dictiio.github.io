document.getElementById("startButton").addEventListener("click", () => {
    guiManager.display("menu")
    soundManager.play("select")
})

document.querySelectorAll(".difficultyContainer button").forEach(btn => {
    btn.addEventListener("click", () => {
        game.start(btn.value)
        soundManager.play("select")
    })
})

document.getElementById("playAgainButton").addEventListener("click", () => {
    game.restart()
    soundManager.play("select")
})

document.getElementById("shopButton").addEventListener("click", () => {
    shopManager.openShop()
})

document.getElementById("menuButton").addEventListener("click", () => {
    shopManager.closeShop()
})

document.getElementById("endGame").addEventListener("click", () => {
    game.end()
    soundManager.play("select")
})