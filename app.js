const diffs = {
  easy: 10,
  medium: 50,
  hard: 100,
  insane: 1000,
};

let state = {
  target: null,
  guesses: [],
  startTime: null,
  elapsed: 0,
  difficulty: 'easy',
};

const $ = (id) => document.getElementById(id);

function randInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

function startGame() {
  state.difficulty = $('difficulty').value;
  const max = diffs[state.difficulty];
  state.target = randInt(max);
  state.guesses = [];
  state.startTime = Date.now();
  $('game').classList.remove('hidden');
  $('win').classList.add('hidden');
  $('hint').textContent = `Guess a number between 1 and ${max}`;
  $('guessCount').textContent = '0';
  $('time').textContent = '0.0';
  $('guessesList').innerHTML = '';
  $('guessInput').value = '';
  $('guessInput').focus();
}

function endGame() {
  state.elapsed = (Date.now() - state.startTime) / 1000;
  $('winSummary').textContent = `You guessed the number ${state.target} in ${state.guesses.length} guesses and ${state.elapsed.toFixed(2)}s.`;
  $('playerName').value = '';
  $('win').classList.remove('hidden');
}

function submitGuess() {
  const v = Number($('guessInput').value);
  if (!v || v <= 0) return;
  state.guesses.push(v);
  $('guessCount').textContent = String(state.guesses.length);
  const max = diffs[state.difficulty];
  const row = document.createElement('div');
  row.textContent = `#${state.guesses.length}: ${v}`;
  $('guessesList').appendChild(row);

  if (v === state.target) {
    $('hint').textContent = 'Correct!';
    endGame();
    updateTimer();
    renderLeaderboard();
    return;
  }

  if (v < state.target) $('hint').textContent = 'Higher';
  else $('hint').textContent = 'Lower';
}

function updateTimer() {
  if (!state.startTime) return;
  const t = (Date.now() - state.startTime) / 1000;
  $('time').textContent = t.toFixed(1);
  if ($('win').classList.contains('hidden')) requestAnimationFrame(updateTimer);
}

async function loadLeaderboard() {
  try {
    const res = await fetch('leaderboard.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    return data;
  } catch (e) {
    return [];
  }
}

function renderLeaderboardList(list) {
  if (!list || !list.length) return '<div class="note">No scores yet.</div>';
  const rows = list.slice(0, 20).map((r, idx) => {
    return `<div class="leaderboard-list row"><div>${idx+1}. ${escapeHtml(r.name)} — ${escapeHtml(r.difficulty)}</div><div>${Number(r.time).toFixed(2)}s</div><div>${r.guesses}</div></div>`;
  }).join('');
  return rows;
}

function escapeHtml(s){return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]))}

async function renderLeaderboard(){
  const list = await loadLeaderboard();
  // sort by time then guesses
  list.sort((a,b)=>{ if (a.time!==b.time) return a.time-b.time; return a.guesses-b.guesses; });
  $('leaderboardContainer').innerHTML = renderLeaderboardList(list);
}

function prepareSubmitPayload() {
  const name = $('playerName').value.trim() || 'Anonymous';
  const payload = {
    name,
    difficulty: state.difficulty,
    time: Number(state.elapsed.toFixed(3)),
    guesses: state.guesses.length,
    date: new Date().toISOString(),
  };
  // show JSON so user can copy and run script
  const text = `Prepared score JSON (copy to use with submit script):\n\n${JSON.stringify(payload, null, 2)}`;
  alert(text);
}

document.addEventListener('DOMContentLoaded', () => {
  $('startBtn').addEventListener('click', () => { startGame(); updateTimer(); });
  $('guessBtn').addEventListener('click', submitGuess);
  $('guessInput').addEventListener('keydown', (e)=>{ if (e.key === 'Enter') submitGuess(); });
  $('playAgain').addEventListener('click', () => { $('win').classList.add('hidden'); startGame(); });
  $('submitScoreBtn').addEventListener('click', prepareSubmitPayload);
  renderLeaderboard();
});
