// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timeLeft = 30;
let timerInterval;
let score = 0; // Add this line

// Wait for button click to start or reset the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeLeft = 30;
  score = 0; // Reset score
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score; // Display score

  // Clear any end-game message or confetti
  document.getElementById("game-container").innerHTML = "";

  // Disable start button until reset
  document.getElementById("start-btn").disabled = true;

  // Start the countdown timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
}

function createDrop() {
  const drop = document.createElement("div");

  // 25% chance to be a bad drop
  const isBad = Math.random() < 0.25;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Score logic
  drop.addEventListener("click", () => {
    if (!gameRunning) return;
    if (isBad) {
      score = Math.max(0, score - 1); // Prevent negative score
    } else {
      score++;
    }
    document.getElementById("score").textContent = score;
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}

// Winning and losing messages
const winningMessages = [
  "Amazing! You're a water-saving hero!",
  "Fantastic job! You caught so many good drops!",
  "Incredible! You really made a splash!",
  "Outstanding! Water champion!",
  "You nailed it! The world needs more players like you!"
];

const losingMessages = [
  "Keep trying! Practice makes perfect.",
  "Don't give up! Catch more good drops next time.",
  "Almost there! Give it another go.",
  "You can do it! Try again for a higher score.",
  "Not bad! Try again to beat your score."
];

function launchConfetti() {
  const colors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A', '#F5402C', '#159A48', '#F16061'];
  const container = document.getElementById("game-container");
  const confettiCount = 60;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * container.offsetWidth + 'px';
    confetti.style.top = '-20px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.animationDuration = (Math.random() * 0.7 + 1) + 's';
    container.appendChild(confetti);

    // Remove confetti after animation
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}

function resetGame() {
  // Stop timers and clear drops
  clearInterval(timerInterval);
  clearInterval(dropMaker);
  gameRunning = false;

  // Reset score and timer
  timeLeft = 30;
  score = 0;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;

  // Clear game area and messages
  document.getElementById("game-container").innerHTML = "";

  // Enable start button
  document.getElementById("start-btn").disabled = false;
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  let message = "";
  if (score >= 20) {
    // Pick a random winning message
    message = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    setTimeout(launchConfetti, 100); // Launch confetti after DOM update
  } else {
    // Pick a random losing message
    message = losingMessages[Math.floor(Math.random() * losingMessages.length)];
  }

  document.getElementById("game-container").innerHTML =
    `<div class="game-over">Game Over!<br><span style="font-size:24px;display:block;margin-top:20px;">${message}</span></div>`;

  // Enable start button only after reset
  document.getElementById("start-btn").disabled = true;
}
