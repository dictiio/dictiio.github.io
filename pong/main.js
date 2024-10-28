const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const keysDown = {};
const BORDER = 30;

const firstScore = document.getElementById("firstScore");
const secondScore = document.getElementById("secondScore");

canvas.width = 1280;
canvas.height = 720;

class Paddle {
  constructor(x, y, width, height, isPlayer, keys, game) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isPlayer = isPlayer;
    this.keys = keys;
    this.game = game;
    if(!this.isPlayer){
        this.errorMargin = 20;
        this.maxSpeed = 10;
        this.smoothingFactor = 0.2;
    }
  }

  draw() {
    if (this.isPlayer) {
      if (this.keys.up in keysDown) {
        this.y -= 10;
        if (this.y < BORDER) {
          this.y = BORDER;
        }
      }

      //s
      if (this.keys.down in keysDown) {
        this.y += 10;
        if (this.y > canvas.height - this.height - BORDER) {
          this.y = canvas.height - this.height - BORDER;
        }
      }
    } else {
      // Player is a computer
        this.frameCounter++;

      if (this.game.ball.x > canvas.width / 2) {
        let padY = this.y + this.height / 2;
        let ballY = this.game.ball.y;

        let diff = Math.abs(ballY - padY);

            let centeredY = this.y + this.height / 2;
            if(diff > this.errorMargin){
                if(Math.random() < 0.5){
                    let speed = Math.min(diff * this.smoothingFactor, this.maxSpeed)
                    console.log(speed)
                    if (padY < ballY) {
                        this.y += speed; // Move paddle down
                        if (this.game.ball.y < centeredY) {
                            this.y = this.game.ball.y - this.height / 2;
                        }
                    } else if (padY > ballY) {
                        this.y -= speed; // Move paddle up
                        
                        if (this.game.ball.y > centeredY) {
                            this.y = this.game.ball.y - this.height / 2;
                        }
                    }
                
            }
            
        }

        if (this.y < BORDER) {
            this.y = BORDER;
        } else if (this.y > canvas.height - this.height - BORDER) {
            this.y = canvas.height - this.height - BORDER;
        }
      }
    }

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  add() {}
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

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();

    let firstPaddle = this.game.firstPaddle;
    let secondPaddle = this.game.secondPaddle;

    const checkCollision = (paddle) => {
      const isHittingHorizontal =
        this.x > paddle.x - this.r && this.x < paddle.x + paddle.width + this.r;

      // Check vertical alignment with player
      if (isHittingHorizontal) {
        // Hitting the top side
        if (this.y < paddle.y && this.y > paddle.y - this.r) {
          return "switch"; // Hitting the top side
        }
        // Hitting the bottom side
        else if (
          this.y <= paddle.y + paddle.height &&
          this.y > paddle.y + paddle.height - this.r
        ) {
          return "switch"; // Ball is above the bottom edge
        }
        // Hitting the sides with increased hitbox
        else if (
          this.y >= paddle.y + 5 &&
          this.y <= paddle.y + paddle.height -5
        ) {
          return "normal"; // Ball is within the player's vertical bounds with larger hitbox
        }
      }

      return null; // No collision
    };

    if (!this.collided) {
      if (
        checkCollision(secondPaddle) == "normal" ||
        checkCollision(firstPaddle) == "normal"
      ) {
        this.xSpeed = -this.xSpeed;
        this.collided = true;
      }
      if (
        checkCollision(secondPaddle) == "switch" ||
        checkCollision(firstPaddle) == "switch"
      ) {
        this.xSpeed = -this.xSpeed;
        this.ySpeed = -this.ySpeed;
        this.collided = true;
      }

      
    }

    if (
      checkCollision(secondPaddle) == null &&
      checkCollision(firstPaddle) == null
    ) {
      this.collided = false;
    }

    if (this.y < this.r || this.y > canvas.height - this.r) {
      this.ySpeed = -this.ySpeed;
      
    }

    // check player's side, computer won
    if (this.x < 0 - this.r) {
      game.setWinner("computer");
    }

    // check computer's side, player won
    if (this.x > canvas.width + this.r) {
      game.setWinner("player");
    }

    if (this.canMove) {
      this.x += this.xSpeed;
      this.y += this.ySpeed;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  reset() {
    this.setPosition(canvas.width / 2, canvas.height / 2);
    if (Math.random() < 0.5) {
      this.xSpeed = -this.xSpeed;
      
    }
    
    this.canMove = false;
    setTimeout(() => {
      this.canMove = true;
    }, 2000);
  }
}

const guiManager = {
  current: "menu",
  // displays selected gui and hides current
  display: function (id) {
    document.querySelector(`.gameGui-${this.current}`).classList.add("hidden");
    document.querySelector(`.gameGui-${id}`).classList.remove("hidden");
    this.current = id;
  },
};

const startButton = document.getElementById("startButton");
const menuButton = document.getElementById("menuButton");
const settingsButton = document.getElementById("settingsButton")

startButton.onclick = () => {
  guiManager.display("active");
  game.init();
  console.log(settings.values.computer)
};

menuButton.onclick = () => {
    guiManager.display("menu")
}

settingsButton.onclick = () => {
    guiManager.display("settings")
}

const game = {
  firstPaddle: null,
  secondPaddle: null,
  ball: null,
  started: false,
  scores: {
    firstPaddle: 0,
    secondPaddle: 0,
  },

  init: function () {
    this.started = true;
    this.ball = new Ball(300, 300, 10, -4, 4, game);
    this.firstPaddle = new Paddle(
      50,
      canvas.height / 2,
      20,
      80,
      true,
      { up: 87, down: 83 },
      game
    );
    this.secondPaddle = new Paddle(
      canvas.width - 50 - 20,
      canvas.height / 2,
      20,
      80,
      // COMPUTER MODE
      !settings.values.computer,
      { up: 38, down: 40 },
      game
    );

    this.ball.reset();
    this.update();
  },

  draw: function () {
    this.firstPaddle.draw();
    this.secondPaddle.draw();
    this.ball.draw();
  },

  update: function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw mid line
    ctx.beginPath();
    ctx.setLineDash([15, 20]);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "white";
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    this.draw();

    requestAnimationFrame(() => {
      this.update();
    });
  },

  setWinner: function (winner) {
    const winnerText = document.getElementById("winner");
    if (winner == "player") {
      winnerText.innerHTML = "Player won";
      this.addScore(1, 1);
    } else if (winner == "computer") {
      winnerText.innerHTML = "Computer won";
      this.addScore(2, 1);
    }
    winnerText.style.visibility = "visible";

    // reset ball
    this.ball.reset();

    setTimeout(() => {
      winnerText.style.visibility = "hidden";
    }, 2000);
  },

  addScore: function (paddle, count) {
    if (paddle == 1) {
      this.scores.firstPaddle += count;
      firstScore.innerHTML = this.scores.firstPaddle;
    } else if (paddle == 2) {
      this.scores.secondPaddle += count;
      secondScore.innerHTML = this.scores.secondPaddle;
    }
  },
};

addEventListener("keydown", function (e) {
  keysDown[e.keyCode] = true;
});

addEventListener("keyup", function (e) {
  delete keysDown[e.keyCode];
});

//game.init()

// settings

const settings = {
    values: {
        computer: true
    },
    buttons: {
        toggle: document.querySelectorAll(".settingToggle")
    },

    toggle: function(setting){

        // Check if value exists and is a boolean
        if(typeof this.values[setting] === "boolean"){
            if (this.values[setting]) {
                this.values[setting] = false;
                document.querySelector(`.settingValue-${setting}`).classList.remove("settingActive");
                
            } else {
                this.values[setting] = true;
                document.querySelector(`.settingValue-${setting}`).classList.add("settingActive");
            }
        } else {
            console.log("Could not find setting: " + setting)
        }
    }
    
}

settings.buttons.toggle.forEach(btn => {
    btn.addEventListener("click", () => {
        console.log("a")
        let setting = btn.getAttribute("data-setting");
        settings.toggle(setting)
    })
})

