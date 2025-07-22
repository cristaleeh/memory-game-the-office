const cards = document.querySelectorAll('.card');
const popup = document.getElementById('popup');
const resultText = document.getElementById('game-result');
const button = document.getElementById('button'); 

const muteButton = document.getElementById('muteButton');
const bgAudio = document.getElementById('background-audio');
let resultElement = document.getElementById('game-result');
let timerElement = document.getElementById('timer');
const playAgainButton = document.getElementById('play-again');

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let timer;
let matchCount = 0;
let timeLeft = 40; // Single source of truth
let gameStarted = false;

if (button) {
  button.addEventListener('click',() => {
    localStorage.setItem('playMusic', 'true');
  });
}

if (muteButton && bgAudio) {
  muteButton.addEventListener('click', () => {
    bgAudio.muted = !bgAudio.muted;
    muteButton.textContent = bgAudio.muted ? '🔇 Unmute' : '🔊 Mute';
  });
}

window.addEventListener('load', () => {
  if (localStorage.getItem('playMusic') === 'true') {
    if (bgAudio) {
      bgAudio.volume = 0.3;
      bgAudio.play().catch((err) => {
        console.warn('Autoplay failure:', err);
      });
    }
    localStorage.removeItem('playMusic');
  }
});

function flipCard() {
    if (!gameStarted) {
    startTimer();       // Start timer on first click
    gameStarted = true; // Prevent future calls
  }
  if (lockBoard || this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  hasFlippedCard = false;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchCount++;

  if (matchCount === 8) endGame(true);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
    lockBoard = false;
  }, 1000);
}

function resetBoard() {
  [hasFlippedCard, firstCard, secondCard] = [false, null, null];
}

function shuffle() {
  cards.forEach(card => {
    let randomPos = Math.floor(Math.random() * 16);
    card.style.order = randomPos;
  });
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 40;
  timerElement.textContent = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function endGame(won) {
  lockBoard = true;
  stopTimer();
  resultText.textContent = won ? "🎉 You Win!" : "⏰ Time's up — You Lose!";
  popup.classList.remove('hidden');
  cards.forEach(card => card.removeEventListener('click', flipCard));
}

function resetGame() {
  stopTimer();
  popup.classList.add('hidden');
  matchCount = 0;
  gameStarted = false;
  resultElement.textContent = "";
  timerElement.textContent = 'Time: 40s';

  cards.forEach(card => {
    card.classList.remove('flip');
    card.addEventListener('click', flipCard);
  });

  shuffle();
  resetBoard();
}

// Initial Setup
shuffle();
cards.forEach(card => card.addEventListener('click', flipCard));

// Play Again Button
playAgainButton.addEventListener('click', resetGame);