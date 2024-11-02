// Tables de valeurs pour les paramètres non-numériques
const colors = [
  "white",
  "blue",
  "red",
  "pink",
  "orange",
  "green",
  "yellow",
  "purple",
  "cyan",
  "magenta",
  "lime",
  "brown",
  "gray",
];
const difficulty = ["easy", "medium", "hard", "impossible"];

// Objet de paramètres
const settings = {
  // Valeurs de chaque paramètre
  values: {
    computer: true,
    difficulty: 0,
    ballSpeed: 5,
    color: 0,
    paddleSize: 80,
    winningScore: 5,
    obstacle: true,
  },
  // Valeurs minimales pour chaque paramètre
  minValues: {
    difficulty: 0,
    ballSpeed: 1,
    color: 0,
    paddleSize: 40,
    winningScore: 1,
  },
  // Valeurs maximales pour chaque paramètre
  maxValues: {
    difficulty: difficulty.length - 1,
    ballSpeed: 10,
    color: colors.length - 1,
    paddleSize: 140,
    winningScore: 100,
  },

  // Variables pour les boutons de paramètres
  buttons: {
    toggle: document.querySelectorAll(".settingToggle"),
    selectArrowLeft: document.querySelectorAll(".settingSelectArrowLeft"),
    selectArrowRight: document.querySelectorAll(".settingSelectArrowRight"),
  },

  // Activer ou désactiver un paramètre
  toggle: function (setting) {
    // Vérifier si le paramètre est un boolean
    if (typeof this.values[setting] === "boolean") {
      if (this.values[setting]) {
        this.values[setting] = false;
        document
          .querySelector(`.settingValue-${setting}`)
          .classList.remove("settingActive");
      } else {
        this.values[setting] = true;
        document
          .querySelector(`.settingValue-${setting}`)
          .classList.add("settingActive");
      }
    } else {
      console.log("Could not find setting: " + setting);
    }
  },

  // Augmenter ou réduire un paramètre de 1
  incrementSetting: function (setting, positive) {
    if (typeof this.values[setting] === "number") {
      if (positive) {
        if (this.values[setting] < this.maxValues[setting]) {
          this.values[setting] += 1;
        }
      } else {
        if (this.values[setting] > this.minValues[setting]) {
          this.values[setting] -= 1;
        }
      }
    }
  },
};

// Actualiser le texte des paramètres (pour les paramètres non-numériques)
function updateTextSetting(textBox, setting) {
  switch (setting) {
    case "color":
      textBox.innerHTML = colors[settings.values[setting]];
      break;
    case "difficulty":
      textBox.innerHTML = difficulty[settings.values[setting]];
      break;
    default:
      textBox.innerHTML = settings.values[setting];
  }
}
