(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const startButton = document.getElementById("start-button");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const stateEl = document.getElementById("game-state");
  const soundButton = document.getElementById("sound-toggle");
  const submitButton = document.getElementById("submit-score");
  const submitStatus = document.getElementById("submit-status");
  const nameInput = document.getElementById("player-name");
  const leaderboardEl = document.getElementById("leaderboard");
  const rankingNote = document.getElementById("ranking-note");
  const monetization = document.getElementById("monetization");
  const pixKeyEl = document.getElementById("pix-key");
  const copyPixButton = document.getElementById("copy-pix");
  const pixStatus = document.getElementById("pix-status");

  // Cadastre a chave PIX aqui antes de publicar a monetização.
  const PIX_KEY = "";

  const CELLS = 24;
  const CELL = canvas.width / CELLS;
  const STORAGE_KEY = "snake-hybrid-best-v1";
  let snake, food, direction, nextDirection, score, best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  let running = false, paused = false, gameOver = false, phaseTransition = false, phase = 1, timer = null, soundOn = true;
  let audioContext = null, lastScore = 0, touchStart = null;

  bestEl.textContent = formatScore(best);
  draw();

  function formatScore(value) { return String(value).padStart(3, "0"); }
  function randomFood() {
    let point;
    do { point = { x: Math.floor(Math.random() * CELLS), y: Math.floor(Math.random() * CELLS) }; }
    while (snake.some(part => part.x === point.x && part.y === point.y));
    return point;
  }
  function reset() {
    snake = [{x:11,y:12},{x:10,y:12},{x:9,y:12},{x:8,y:12}];
    direction = {x:1,y:0}; nextDirection = {x:1,y:0};
    score = 0; phase = 1; phaseTransition = false; scoreEl.textContent = formatScore(score);
    food = randomFood(); gameOver = false; paused = false;
    lastScore = 0; submitButton.disabled = true;
    submitStatus.textContent = "Faça uma partida para enviar sua pontuação.";
    draw();
  }
  function start() {
    if (phaseTransition) {
      phaseTransition = false;
      overlay.classList.add("hidden");
      monetization.classList.add("hidden");
      running = true; paused = false; stateEl.textContent = "EM JOGO";
      schedule();
      return;
    }
    if (gameOver || !snake) reset();
    monetization.classList.add("hidden");
    overlay.classList.add("hidden");
    running = true; paused = false; stateEl.textContent = "EM JOGO";
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!running || paused) return;
    timer = setTimeout(tick, Math.max(65, 145 - Math.floor(score / 5) * 7));
  }
  function tick() {
    if (!running || paused) return;
    direction = nextDirection;
    const head = {x:snake[0].x + direction.x, y:snake[0].y + direction.y};
    const eating = head.x === food.x && head.y === food.y;
    const body = eating ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.x >= CELLS || head.y < 0 || head.y >= CELLS ||
        body.some(part => part.x === head.x && part.y === head.y)) {
      endGame(); return;
    }
    snake.unshift(head);
    if (eating) {
      score += 1; scoreEl.textContent = formatScore(score); sound("eat");
      food = randomFood();
      if (score > best) {
        best = score; localStorage.setItem(STORAGE_KEY, String(best));
        bestEl.textContent = formatScore(best);
      }
      if (score % 10 === 0) {
        phase = Math.floor(score / 10) + 1;
        showPhaseTransition();
        draw();
        return;
      }
    } else snake.pop();
    draw(); schedule();
  }
  function endGame() {
    running = false; gameOver = true; clearTimeout(timer); stateEl.textContent = "FIM DE JOGO";
    sound("over");
    overlayTitle.textContent = "Fim de jogo!";
    overlayText.textContent = `Você fez ${score} ponto${score === 1 ? "" : "s"}. Tente bater seu recorde!`;
    startButton.textContent = "JOGAR NOVAMENTE →";
    overlay.classList.remove("hidden");
    monetization.classList.remove("hidden");
    lastScore = score;
    if (score > 0) {
      submitButton.disabled = false;
      submitStatus.textContent = "Boa! Informe seu nome e envie sua pontuação.";
    }
  }

  function showPhaseTransition() {
    running = false; phaseTransition = true; clearTimeout(timer);
    stateEl.textContent = "FASE CONCLUÍDA";
    sound("eat");
    overlayTitle.textContent = "Fase concluída!";
    overlayText.textContent = `Você chegou à fase ${phase}. Prepare-se para o próximo desafio!`;
    startButton.textContent = "CONTINUAR →";
    monetization.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }
  function pause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) {
      clearTimeout(timer); stateEl.textContent = "PAUSADO";
      overlayTitle.textContent = "Pausa";
      overlayText.textContent = "Respire. Sua partida está esperando.";
      startButton.textContent = "CONTINUAR →";
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden"); stateEl.textContent = "EM JOGO"; schedule();
    }
  }
  function setDirection(dir) {
    const map = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const candidate = map[dir]; if (!candidate) return;
    if (candidate.x === -direction.x && candidate.y === -direction.y) return;
    nextDirection = candidate;
    if (!running && !gameOver) start();
  }
  function draw() {
    ctx.fillStyle = "#b5c99a"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "rgba(39,60,39,.08)"; ctx.lineWidth = 1;
    for (let i=0;i<=CELLS;i++) {
      ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(canvas.width,i*CELL); ctx.stroke();
    }
    if (food) {
      ctx.fillStyle = "#263d28"; ctx.fillRect(food.x*CELL+4,food.y*CELL+4,CELL-8,CELL-8);
      ctx.fillStyle = "#5b7b48"; ctx.fillRect(food.x*CELL+7,food.y*CELL+7,5,5);
    }
    if (snake) snake.forEach((part,index) => {
      const pad = index === 0 ? 2 : 3;
      ctx.fillStyle = index === 0 ? "#1e3521" : "#304d30";
      ctx.fillRect(part.x*CELL+pad,part.y*CELL+pad,CELL-pad*2,CELL-pad*2);
      if (index === 0) {
        ctx.fillStyle = "#b5c99a";
        if (direction.x !== 0) {
          ctx.fillRect(part.x*CELL+(direction.x>0?CELL-7:4),part.y*CELL+6,2,2);
          ctx.fillRect(part.x*CELL+(direction.x>0?CELL-7:4),part.y*CELL+14,2,2);
        } else {
          ctx.fillRect(part.x*CELL+6,part.y*CELL+(direction.y>0?CELL-7:4),2,2);
          ctx.fillRect(part.x*CELL+14,part.y*CELL+(direction.y>0?CELL-7:4),2,2);
        }
      }
    });
  }
  function sound(type) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime;
      const notes = type === "eat" ? [620,880] : type === "over" ? [330,220,150] : [440];
      notes.forEach((freq,i) => {
        const osc = audioContext.createOscillator(), gain = audioContext.createGain();
        osc.type = "square"; osc.frequency.value = freq;
        gain.gain.setValueAtTime(.045,now+i*.09);
        gain.gain.exponentialRampToValueAtTime(.001,now+i*.09+.075);
        osc.connect(gain); gain.connect(audioContext.destination);
        osc.start(now+i*.09); osc.stop(now+i*.09+.08);
      });
    } catch (_) { /* áudio opcional */ }
  }
  async function loadLeaderboard() {
    rankingNote.textContent = "Buscando pontuações...";
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) throw new Error("API indisponível");
      const data = await response.json();
      leaderboardEl.replaceChildren();
      if (!data.scores?.length) {
        leaderboardEl.innerHTML = '<li class="ranking-empty">Ainda não há pontuações. Seja o primeiro!</li>';
      } else {
        data.scores.forEach((entry,index) => {
          const li = document.createElement("li");
          const rank = document.createElement("span"); rank.className="rank-number"; rank.textContent=String(index+1).padStart(2,"0");
          const name = document.createElement("span"); name.className="rank-name"; name.textContent=entry.name;
          const points = document.createElement("strong"); points.className="rank-score"; points.textContent=entry.score;
          li.append(rank,name,points); leaderboardEl.append(li);
        });
      }
      rankingNote.textContent = "Ranking global atualizado.";
    } catch (_) {
      leaderboardEl.innerHTML = '<li class="ranking-empty">Ranking online ainda não configurado.</li>';
      rankingNote.textContent = "Configure o banco D1 seguindo o README para ativar o ranking.";
    }
  }
  async function submitScore() {
    const name = nameInput.value.trim().replace(/\s+/g," ").slice(0,16);
    if (!name || !lastScore) { submitStatus.textContent = "Digite um nome válido."; return; }
    submitButton.disabled = true; submitStatus.textContent = "Enviando pontuação...";
    try {
      const response = await fetch("/api/scores", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,score:lastScore})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar.");
      submitStatus.textContent = "Pontuação enviada ao ranking! ✦";
      loadLeaderboard();
    } catch (error) {
      submitStatus.textContent = "Não foi possível enviar. Verifique se o ranking está configurado.";
      submitButton.disabled = false;
    }
  }

  document.addEventListener("keydown", event => {
    const keys = {ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"};
    if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); }
    if (event.code === "Space") { event.preventDefault(); if (running) pause(); }
    if (event.key === "Enter" && !running) start();
  });
  document.querySelectorAll(".dir").forEach(button => {
    button.addEventListener("pointerdown", event => { event.preventDefault(); setDirection(button.dataset.dir); });
  });
  canvas.addEventListener("pointerdown", event => { touchStart = {x:event.clientX,y:event.clientY}; });
  canvas.addEventListener("pointerup", event => {
    if (!touchStart) return;
    const dx=event.clientX-touchStart.x, dy=event.clientY-touchStart.y;
    if (Math.max(Math.abs(dx),Math.abs(dy))>18) setDirection(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up"));
    touchStart=null;
  });
  startButton.addEventListener("click", () => { if (paused) pause(); else start(); });
  soundButton.addEventListener("click", () => {
    soundOn=!soundOn; soundButton.setAttribute("aria-pressed",String(soundOn));
    soundButton.innerHTML = soundOn ? '♫ <span>SOM ON</span>' : '♫ <span>SOM OFF</span>';
    if (soundOn) sound("tap");
  });
  submitButton.addEventListener("click", submitScore);
  if (PIX_KEY.trim()) {
    pixKeyEl.textContent = PIX_KEY.trim();
    copyPixButton.disabled = false;
    pixStatus.textContent = "Copie a chave e faça o pagamento pelo aplicativo do seu banco.";
  }
  copyPixButton.addEventListener("click", async () => {
    if (!PIX_KEY.trim()) return;
    try {
      await navigator.clipboard.writeText(PIX_KEY.trim());
      pixStatus.textContent = "Chave PIX copiada! Obrigado por apoiar o projeto. ❤️";
    } catch (_) {
      pixStatus.textContent = "Não foi possível copiar automaticamente. Selecione e copie a chave acima.";
    }
  });
  document.getElementById("refresh-ranking").addEventListener("click",loadLeaderboard);
  loadLeaderboard();
  reset();
})();
