const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const keysDown = {};
const BORDER = 0;

// Textes de score
const firstScore = document.getElementById("firstScore");
const secondScore = document.getElementById("secondScore");

canvas.width = 1280;
canvas.height = 720;

// Classe de la raquette
class Paddle {
  constructor(x, y, width, height, type, keys, game) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.keys = keys;
    this.game = game;

    // Définir le niveau de difficulté de l'ordinateur, indice de niveau.
    if (this.type == "computer") {
      this.errorMargin = settings.values.paddleSize / 4;
      let difficulty = settings.values.difficulty;
      if (difficulty == 0) {
        this.skill = 0.5;
      }
      if (difficulty == 1) {
        this.skill = 0.7;
      }
      if (difficulty == 2) {
        this.skill = 0.9;
      }
      if (difficulty == 3) {
        this.skill = 1;
      }
    }

    // Direction de l'obstacle (applicable seulement aux obstacles)
    this.direction = "down";
  }

  // Dessiner la raquette
  draw() {
    // Actualisation pour joueurs.
    if (this.type == "player") {
      // Vérifier la touche du haut
      if (this.keys.up in keysDown) {
        this.y -= 10;
        if (this.y < BORDER) {
          this.y = BORDER;
        }
      }

      // Vérifier la touche du bas
      if (this.keys.down in keysDown) {
        this.y += 10;
        if (this.y > canvas.height - this.height - BORDER) {
          this.y = canvas.height - this.height - BORDER;
        }
      }

      // Actualisation pour ordinateur.
    } else if (this.type == "computer") {
      let padY = this.y + this.height / 2;
      let ballY = this.game.ball.y;

      let diff = Math.abs(ballY - padY);

      let centeredY = this.y + this.height / 2;
      if (diff > this.errorMargin) {
        // Vérifier avec indice de niveau de l'ordinateur.
        if (Math.random() < this.skill) {
          if (padY < ballY) {
            this.y += 10;
            if (this.game.ball.y < centeredY) {
              this.y = this.game.ball.y - this.height / 2;
            }
          } else if (padY > ballY) {
            this.y -= 10;

            if (this.game.ball.y > centeredY) {
              this.y = this.game.ball.y - this.height / 2;
            }
          }
        }

        // Limites de bordure que l'ordinateur ne peut pas dépasser
        if (this.y < BORDER) {
          this.y = BORDER;
        } else if (this.y > canvas.height - this.height - BORDER) {
          this.y = canvas.height - this.height - BORDER;
        }
      }

      // Actualisation pour obstacles.
    } else if (this.type == "obstacle") {
      if (this.type == "obstacle") {
        // Vérifier si la balle est en mouvement.
        if (game.ball.canMove) {
          // Bouger l'obstacle vers le bas.
          if (this.direction === "down") {
            this.y += 5;
            // Si l'obstacle atteint le bas du canvas, changer la direction
            if (this.y >= canvas.height - this.height) {
              this.direction = "up";
            }
          }
          // Bouger l'obstacle vers le haut.
          else if (this.direction === "up") {
            this.y -= 5;
            // Si l'obstacle atteint le haut du canvas, changer la direction
            if (this.y <= 0) {
              this.direction = "down";
            }
          }
        }
      }
    }

    // Remplissage de la raquette
    ctx.beginPath();
    ctx.fillStyle = colors[settings.values.color];
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Ball {
  constructor(x, y, r, xSpeed, ySpeed, game) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.game = game;
    this.canMove = true;
  }

  // Actualisation de la balle.
  draw() {
    ctx.beginPath();
    ctx.fillStyle = colors[settings.values.color];
    ctx.lineWidth = 1;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    ctx.fill();

    // Raquettes
    let firstPaddle = this.game.firstPaddle;
    let secondPaddle = this.game.secondPaddle;
    let obstacle = this.game.obstacle;

    // Vérification des collisions avec raquettes
    const checkCollision = (paddle) => {
      if (paddle == null) return false;
      if (this.canMove) {
        if (
          this.x > paddle.x - this.r &&
          this.x < paddle.x + paddle.width + this.r
        ) {
          if (this.y >= paddle.y && this.y <= paddle.y + paddle.height) {
            return true;
          }
        }
      }

      return false;
    };

    // Gestion de la collision.
    if (!this.collided) {
      if (
        checkCollision(secondPaddle) ||
        checkCollision(firstPaddle) ||
        checkCollision(obstacle)
      ) {
        this.xSpeed += this.xSpeed >= 0 ? 0.25 : -0.25;
        this.ySpeed += this.ySpeed >= 0 ? 0.25 : -0.25;
        this.xSpeed = -this.xSpeed;
        this.ySpeed = this.ySpeed;
        this.collided = true;
        console.log([this.xSpeed, this.ySpeed]);
        soundManager.play("hit");
      }
    }

    if (
      checkCollision(secondPaddle) == false &&
      checkCollision(firstPaddle) == false &&
      checkCollision(obstacle) == false
    ) {
      this.collided = false;
    }

    // Touche les bordures de haut.
    if (this.y < this.r || this.y > canvas.height - this.r) {
      this.ySpeed = -this.ySpeed;
      soundManager.play("hit");
    }

    // Vérifier le côté joueur, faire gagner l'ordinateur
    if (this.x < 0 - this.r) {
      game.setWinner("computer");
    }

    // Vérifier le côté ordinateur, faire gagner le joueur.
    if (this.x > canvas.width + this.r) {
      game.setWinner("player");
    }

    if (this.canMove) {
      this.x += this.xSpeed;
      this.y += this.ySpeed;
    }
  }

  // Définir position
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Réinitialiser la vitesse, la position de la balle.
  reset() {
    this.setPosition(canvas.width / 2, canvas.height / 2);
    this.xSpeed = settings.values.ballSpeed;
    this.ySpeed = settings.values.ballSpeed;
    if (Math.random() < 0.5) {
      this.xSpeed = -this.xSpeed;
    }
    if (Math.random() < 0.5) {
      this.ySpeed = -this.ySpeed;
    }

    this.canMove = false;
    setTimeout(() => {
      this.canMove = true;
    }, 2000);
  }
}

// Gestion des menus
const guiManager = {
  current: "menu",
  // Afficher le menu et cacher le menu actuel
  display: function (id) {
    document.querySelector(`.gameGui-${this.current}`).classList.add("hidden");
    document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
    this.current = id;
  },
};

// Objet de la partie
const game = {
  firstPaddle: null,
  secondPaddle: null,
  obstacle: null,
  paddleNames: {
    first: "Player",
    second: "Computer",
  },
  ball: null,
  started: false,
  scores: {
    firstPaddle: 0,
    secondPaddle: 0,
  },
  winningScore: 5,
  loop: null,

  // Initialiser la partie
  init: function () {
    this.started = true;
    this.winningScore = settings.values.winningScore;
    soundManager.play("start");

    // Actualiser les noms des joueurs
    if (settings.values.computer) {
      this.paddleNames.first = "Player";
      this.paddleNames.second = "Computer";
    } else {
      this.paddleNames.first = "Player 1";
      this.paddleNames.second = "Player 2";
    }

    // Création de la balle
    this.ball = new Ball(
      300,
      300,
      10,
      -settings.values.ballSpeed,
      settings.values.ballSpeed,
      game
    );

    // Création des raquettes
    this.firstPaddle = new Paddle(
      50,
      canvas.height / 2,
      10,
      settings.values.paddleSize,
      "player",
      { up: 87, down: 83 },
      game
    );
    this.secondPaddle = new Paddle(
      canvas.width - 50 - 20,
      canvas.height / 2,
      10,
      settings.values.paddleSize,

      // Mode ordinateur
      settings.values.computer ? "computer" : "player",

      { up: 38, down: 40 },
      game
    );

    // Création de l'obstacle si besoin
    if (settings.values.obstacle) {
      this.obstacle = new Paddle(
        canvas.width / 2 - 5,
        0,
        10,
        settings.values.paddleSize * 2,
        "obstacle",
        null,
        game
      );
    }

    this.ball.reset();
    this.update();
  },

  // Dessiner les éléments du jeu
  draw: function () {
    this.firstPaddle.draw();
    this.secondPaddle.draw();
    if (this.obstacle !== null) {
      this.obstacle.draw();
    }
    this.ball.draw();
  },

  // Actualisation du jeu. Boucle.
  update: function () {
    if (!game.started) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner la ligne du milieu.
    ctx.beginPath();
    ctx.setLineDash([15, 20]);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    this.draw();

    this.loop = requestAnimationFrame(() => {
      this.update();
    });
  },

  // Définir le joueur qui a marqué un point.
  setWinner: function (winner) {
    const winnerText = document.getElementById("winner");
    if (winner == "player") {
      winnerText.innerHTML = `${game.paddleNames.first} scored`;
      this.addScore(1, 1);
    } else if (winner == "computer") {
      winnerText.innerHTML = `${game.paddleNames.second} scored`;
      this.addScore(2, 1);
    }
    soundManager.play("score");
    winnerText.style.visibility = "visible";

    // Réinitialiser la position de la balle
    this.ball.reset();

    setTimeout(() => {
      winnerText.style.visibility = "hidden";
    }, 2000);
  },

  // Ajouter des points à un joueur
  addScore: function (paddle, count) {
    if (paddle == 1) {
      this.scores.firstPaddle += count;
      firstScore.innerHTML = this.scores.firstPaddle;
    } else if (paddle == 2) {
      this.scores.secondPaddle += count;
      secondScore.innerHTML = this.scores.secondPaddle;
    }

    // Vérifier le gagnant
    if (this.scores.firstPaddle >= this.winningScore) {
      this.setGameWinner("player");
    }
    if (this.scores.secondPaddle >= this.winningScore) {
      this.setGameWinner("computer");
    }
  },

  // Définir le gagnant de la partie et actualiser le texte
  setGameWinner: function (winner) {
    guiManager.display("end");
    cancelAnimationFrame(this.loop);
    this.started = false;
    const endWinnerText = document.getElementById("endWinner");
    const finalScoreText = document.getElementById("finalScore");
    if (winner == "player") {
      endWinnerText.innerHTML = `${game.paddleNames.first} won the game!`;
    } else if (winner == "computer") {
      endWinnerText.innerHTML = `${game.paddleNames.second} won the game!`;
    }

    finalScoreText.innerHTML = `Final Score: ${game.scores.firstPaddle} to ${game.scores.secondPaddle}`;
    this.resetScores();
  },

  // Réinitialiser les scores
  resetScores: function () {
    this.scores.firstPaddle = 0;
    this.scores.secondPaddle = 0;
    firstScore.innerHTML = this.scores.firstPaddle;
    secondScore.innerHTML = this.scores.secondPaddle;
  },
};

// Touches appuyées
addEventListener("keydown", function (e) {
  keysDown[e.keyCode] = true;
});

addEventListener("keyup", function (e) {
  delete keysDown[e.keyCode];
});

// Manager de sons
const soundManager = {
  audio: true,
  file: "assets/sounds/",
  backgroundMusic: null,
  baseVolume: 1,

  // Jouer un fichier audio.
  play: function (id) {
    if (this.audio) {
      const audio = new Audio(`${this.file}${id}.mp3`);
      audio.currentTime = 0;
      audio.play();
    }
  },

  // Activer mode sourdine
  mute: function () {
    this.audio = false;
    this.backgroundMusic.pause();
  },

  // Désactiver mode sourtine
  unmute: function () {
    this.audio = true;
    this.backgroundMusic.play(this.baseVolume);
  },

  // Jouer une musique d'arrière-plan
  playBackgroundMusic: function (src, vol = 1) {
    this.baseVolume = vol;

    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }

    this.backgroundMusic = new Audio(src);
    this.backgroundMusic.volume = vol;

    this.backgroundMusic.addEventListener("ended", () => {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic
        .play()
        .catch((e) => console.error("Background music playback failed:", e));
    });

    this.backgroundMusic
      .play()
      .catch((e) => console.error("Background music playback failed:", e));
  },
};
