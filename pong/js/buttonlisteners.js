const startButton = document.getElementById("startButton");
const settingsButton = document.getElementById("settingsButton");
const controlsButton = document.getElementById("controlsButton");

// Bouton pour commencer la partie
startButton.onclick = () => {
  guiManager.display("active");
  soundManager.playBackgroundMusic("assets/sounds/bgmusic.mp3", 0.75);
  game.init();
};

// Bouton
document.querySelectorAll(".backToMenuButton").forEach((btn) => {
  btn.addEventListener("click", () => {
    guiManager.display("menu");
    soundManager.play("select");
  });
});

// Bouton pour ouvrir le menu de paramètres
settingsButton.onclick = () => {
  guiManager.display("settings");
  soundManager.play("select");
};

// Bouton pour ouvrir le menu de contrôles
controlsButton.addEventListener("click", () => {
  guiManager.display("controls");
  soundManager.play("select");
});

// Boutons de paramètres
settings.buttons.selectArrowLeft.forEach((btn) => {
  btn.addEventListener("click", () => {
    let parentSetting = btn.parentElement;
    let setting = parentSetting.getAttribute("data-setting");
    soundManager.play("click");

    settings.incrementSetting(setting, false);

    const textBox = parentSetting.children[1];
    updateTextSetting(textBox, setting);
  });
});

settings.buttons.selectArrowRight.forEach((btn) => {
  btn.addEventListener("click", () => {
    let parentSetting = btn.parentElement;
    let setting = parentSetting.getAttribute("data-setting");
    soundManager.play("click");

    settings.incrementSetting(setting, true);

    const textBox = parentSetting.children[1];
    updateTextSetting(textBox, setting);
  });
});

settings.buttons.toggle.forEach((btn) => {
  btn.addEventListener("click", () => {
    let setting = btn.getAttribute("data-setting");
    settings.toggle(setting);
    soundManager.play("click");
  });
});

document.getElementById("endMenu").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  guiManager.display("menu");
  soundManager.play("select");
});
