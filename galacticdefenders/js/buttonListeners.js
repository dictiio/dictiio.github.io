// Start button
document.getElementById("startButton").addEventListener("click", () => {
    guiManager.display("menu")
    soundManager.playBackgroundMusic("assets/sounds/bgmusic.m4a")
    soundManager.play("select")
})

// Each difficulty button
document.querySelectorAll(".difficultyContainer button").forEach(btn => {
    btn.addEventListener("click", () => {
        game.start(btn.value)
        soundManager.play("select")
    })
})

// Play again button
document.getElementById("playAgainButton").addEventListener("click", () => {
    game.restart()
    soundManager.play("select")
})

// Shop button
document.getElementById("shopButton").addEventListener("click", () => {
    shopManager.openShop()
})

// Menu button in shop GUI
document.getElementById("menuButton").addEventListener("click", () => {
    shopManager.closeShop()
})

// End game button
document.getElementById("endGame").addEventListener("click", () => {
    game.end()
    soundManager.play("select")
})

// Sound toggle button
const soundButton = document.getElementById("soundButton")
soundButton.onclick = () => {
    if(soundManager.audio){
        soundButton.style.backgroundImage = "url(assets/images/muted.png)"
        soundManager.mute()
    } else {
        soundButton.style.backgroundImage = "url(assets/images/speaker.png)"
        soundManager.unmute()
    }
}