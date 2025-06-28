// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timeLeft = 30;
let timerInterval;
let score = 0; // Add this line

const difficulties = {
  easy:   { time: 45, winScore: 15, dropInterval: 1500, badChance: 0.15, dropSpeed: 5, dropSize: 70, badPenalty: 1 },
  normal: { time: 30, winScore: 20, dropInterval: 1000, badChance: 0.20, dropSpeed: 4, dropSize: 60, badPenalty: 1 },
  hard:   { time: 25, winScore: 20, dropInterval: 600,  badChance: 0.25, dropSpeed: 3, dropSize: 50, badPenalty: 2 }
};

// Wait for button click to start or reset the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

// Carousel logic for difficulty selection
const difficultyNames = ["Easy", "Normal", "Hard"];
const difficultyKeys = ["easy", "normal", "hard"];
let currentDifficultyIndex = 1; // Default to Normal

function updateWinCondition() {
  const selectedKey = difficultyKeys[currentDifficultyIndex];
  const settings = difficulties[selectedKey];
  document.getElementById("win-condition").textContent =
    `Collect ${settings.winScore} drops in ${settings.time} seconds`;
}

// Update the label and win condition together
function updateDifficultyLabel() {
  document.getElementById("difficulty-label").textContent = difficultyNames[currentDifficultyIndex];
  updateWinCondition();

  // Update the remaining time display
  const selectedKey = difficultyKeys[currentDifficultyIndex];
  const settings = difficulties[selectedKey];
  document.getElementById("time").textContent = settings.time;
}
document.getElementById("carousel-left").addEventListener("click", () => {
  currentDifficultyIndex = (currentDifficultyIndex + difficultyNames.length - 1) % difficultyNames.length;
  updateDifficultyLabel();
});
document.getElementById("carousel-right").addEventListener("click", () => {
  currentDifficultyIndex = (currentDifficultyIndex + 1) % difficultyNames.length;
  updateDifficultyLabel();
});
updateDifficultyLabel();

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  const selectedKey = difficultyKeys[currentDifficultyIndex];
  const settings = difficulties[selectedKey];

  timeLeft = settings.time;
  score = 0;
  milestonesShown = [false, false, false]; // Reset milestones
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;
  document.getElementById("game-container").innerHTML = "";
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

  clearInterval(dropMaker);
  dropMaker = setInterval(() => createDrop(settings), settings.dropInterval);
}

// Update createDrop to accept settings
function createDrop(settings = difficulties["normal"]) {
  const drop = document.createElement("div");
  const isBad = Math.random() < settings.badChance;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";
  const size = settings.dropSize * (Math.random() * 0.8 + 0.5);
  drop.style.width = drop.style.height = `${size}px`;
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - settings.dropSize);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = settings.dropSpeed + "s";
  document.getElementById("game-container").appendChild(drop);

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    // Play sound effect
    if (isBad) {
      const badSound = document.getElementById("bad-drop-sound");
      if (badSound) {
        badSound.currentTime = 0;
        badSound.play();
      }
      score = Math.max(0, score - settings.badPenalty);
    } else {
      const goodSound = document.getElementById("good-drop-sound");
      if (goodSound) {
        goodSound.currentTime = 0;
        goodSound.play();
      }
      score++;
    }
    document.getElementById("score").textContent = score;

    // Milestone logic
    const selectedKey = difficultyKeys[currentDifficultyIndex];
    const winScore = difficulties[selectedKey].winScore;
    const milestones = [
      Math.ceil(winScore * 0.25),
      Math.ceil(winScore * 0.5),
      Math.ceil(winScore * 0.75)
    ];
    milestones.forEach((milestone, idx) => {
      if (score === milestone && !milestonesShown[idx]) {
        showMilestoneMessage(idx);
        milestonesShown[idx] = true;
      }
    });

    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}

// Milestone messages for 25%, 50%, 75%
const milestoneMessages = [
  [
    "Great start! Keep going!",
    "Nice! You're on your way!",
    "Good job! Stay focused!"
  ],
  [
    "Halfway there! Awesome!",
    "50% done! Keep it up!",
    "You're making a splash!"
  ],
  [
    "Just a bit more! Almost there!",
    "75% reached! Finish strong!",
    "So close! Don't stop now!"
  ]
];

// Track which milestones have been shown
let milestonesShown = [false, false, false];

// Show milestone message at the top of the game area
function showMilestoneMessage(level) {
  // Remove any existing milestone message
  let oldMsg = document.getElementById("milestone-message");
  if (oldMsg) oldMsg.remove();

  const msg = document.createElement("div");
  msg.id = "milestone-message";
  msg.className = "milestone-message";
  // Pick a random message for this milestone
  msg.textContent = milestoneMessages[level][Math.floor(Math.random() * milestoneMessages[level].length)];
  document.getElementById("game-container").prepend(msg);

  // Fade in
  setTimeout(() => { msg.style.opacity = 1; }, 10);

  // Fade out after 2.5 seconds, then remove
  setTimeout(() => {
    msg.style.opacity = 0;
    setTimeout(() => { msg.remove(); }, 600);
  }, 2500);
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

  // Reset score and timer to current difficulty's settings
  const selectedKey = difficultyKeys[currentDifficultyIndex];
  const settings = difficulties[selectedKey];
  timeLeft = settings.time;
  score = 0;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;

  // Clear game area and messages
  document.getElementById("game-container").innerHTML = "";

  // Enable start button
  document.getElementById("start-btn").disabled = false;
}

// Update endGame to use winScore for selected difficulty
function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  const selectedKey = difficultyKeys[currentDifficultyIndex];
  const settings = difficulties[selectedKey];

  let message = "";
  if (score >= settings.winScore) {
    message = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    setTimeout(launchConfetti, 100);

    // Play victory sound
    const victorySound = document.getElementById("victory-sound");
    if (victorySound) {
      victorySound.currentTime = 0;
      victorySound.play();
    }
  } else {
    message = losingMessages[Math.floor(Math.random() * losingMessages.length)];
  }

  document.getElementById("game-container").innerHTML =
    `<div class="game-over">Game Over!<br><span style="font-size:24px;display:block;margin-top:20px;">${message}</span></div>`;

  document.getElementById("start-btn").disabled = true;
}
