const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");

const playerScoreElement = document.getElementById("player-score");
const computerScoreElement = document.getElementById("computer-score");
const restartButton = document.getElementById("restart-button");

const paddle = {
  width: 14,
  height: 100,
  speed: 7
};

const ball = {
  size: 14,
  speed: 6,
  x: canvas.width / 2,
  y: canvas.height / 2,
  velocityX: 6,
  velocityY: 4
};

const player = {
  x: 20,
  y: canvas.height / 2 - paddle.height / 2,
  score: 0
};

const computer = {
  x: canvas.width - 20 - paddle.width,
  y: canvas.height / 2 - paddle.height / 2,
  score: 0,
  speed: 4.5
};

const keys = {
  ArrowUp: false,
  ArrowDown: false
};

function drawRectangle(x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.closePath();
  context.fill();
}

function drawNet() {
  for (let y = 0; y < canvas.height; y += 24) {
    drawRectangle(
      canvas.width / 2 - 1,
      y,
      2,
      12,
      "rgba(255, 255, 255, 0.35)"
    );
  }
}

function draw() {
  drawRectangle(0, 0, canvas.width, canvas.height, "#071018");

  drawNet();

  drawRectangle(
    player.x,
    player.y,
    paddle.width,
    paddle.height,
    "#00e5ff"
  );

  drawRectangle(
    computer.x,
    computer.y,
    paddle.width,
    paddle.height,
    "#ff4d6d"
  );

  drawCircle(
    ball.x,
    ball.y,
    ball.size / 2,
    "#ffffff"
  );
}

function keepPaddleInsideCanvas(paddleObject) {
  if (paddleObject.y < 0) {
    paddleObject.y = 0;
  }

  if (paddleObject.y + paddle.height > canvas.height) {
    paddleObject.y = canvas.height - paddle.height;
  }
}

function updatePlayer() {
  if (keys.ArrowUp) {
    player.y -= paddle.speed;
  }

  if (keys.ArrowDown) {
    player.y += paddle.speed;
  }

  keepPaddleInsideCanvas(player);
}

function updateComputer() {
  const computerCenter = computer.y + paddle.height / 2;

  if (computerCenter < ball.y - 10) {
    computer.y += computer.speed;
  } else if (computerCenter > ball.y + 10) {
    computer.y -= computer.speed;
  }

  keepPaddleInsideCanvas(computer);
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  ball.velocityX = ball.speed * direction;
  ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * 4;
}

function updateScoreboard() {
  playerScoreElement.textContent = player.score;
  computerScoreElement.textContent = computer.score;
}

function checkPaddleCollision(paddleObject) {
  return (
    ball.x - ball.size / 2 < paddleObject.x + paddle.width &&
    ball.x + ball.size / 2 > paddleObject.x &&
    ball.y - ball.size / 2 < paddleObject.y + paddle.height &&
    ball.y + ball.size / 2 > paddleObject.y
  );
}

function updateBall() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Top and bottom wall collision.
  if (
    ball.y - ball.size / 2 <= 0 ||
    ball.y + ball.size / 2 >= canvas.height
  ) {
    ball.velocityY *= -1;
  }

  // Left paddle collision.
  if (checkPaddleCollision(player) && ball.velocityX < 0) {
    ball.x = player.x + paddle.width + ball.size / 2;
    ball.velocityX *= -1.05;

    const impactPoint =
      ball.y - (player.y + paddle.height / 2);

    ball.velocityY = impactPoint * 0.12;
  }

  // Right paddle collision.
  if (checkPaddleCollision(computer) && ball.velocityX > 0) {
    ball.x = computer.x - ball.size / 2;
    ball.velocityX *= -1.05;

    const impactPoint =
      ball.y - (computer.y + paddle.height / 2);

    ball.velocityY = impactPoint * 0.12;
  }

  // Ball leaves through the left side.
  if (ball.x < 0) {
    computer.score++;
    updateScoreboard();
    resetBall(1);
  }

  // Ball leaves through the right side.
  if (ball.x > canvas.width) {
    player.score++;
    updateScoreboard();
    resetBall(-1);
  }
}

function gameLoop() {
  updatePlayer();
  updateComputer();
  updateBall();
  draw();

  requestAnimationFrame(gameLoop);
}

function movePlayerWithMouse(event) {
  const canvasBounds = canvas.getBoundingClientRect();
  const mouseY = event.clientY - canvasBounds.top;
  const scaleY = canvas.height / canvasBounds.height;

  player.y = mouseY * scaleY - paddle.height / 2;
  keepPaddleInsideCanvas(player);
}

function restartGame() {
  player.score = 0;
  computer.score = 0;

  player.y = canvas.height / 2 - paddle.height / 2;
  computer.y = canvas.height / 2 - paddle.height / 2;

  updateScoreboard();
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

document.addEventListener("keydown", (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
    event.preventDefault();
  }
});

canvas.addEventListener("mousemove", movePlayerWithMouse);
restartButton.addEventListener("click", restartGame);

updateScoreboard();
resetBall(Math.random() > 0.5 ? 1 : -1);
gameLoop();
