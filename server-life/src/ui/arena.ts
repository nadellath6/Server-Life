import { GAME, RESOURCE_META } from "../data/constants";
import type { ResourceKey } from "../data/constants";
import { createFixedTimestep } from "../engine/loop";
import { createEraSchedule } from "../engine/schedule";
import { createGameState, stepGame } from "../engine/state";
import type { GameInput, GameState } from "../engine/state";
import { displayPercentage } from "../engine/resources";
import { drawArena } from "../render/arenaCanvas";
import { loadEconomyState } from "../storage/localStorage";
import { getActiveProfile } from "../engine/auth";
import { loadProfileLog } from "../storage/profile";
import { ERAS } from "../data/eras";
import { incidentWarning, nextIncidentName } from "../engine/incidents";
import { laneFromTap } from "../engine/tutorial";

function barsMarkup(state: GameState): string {
  return (Object.keys(RESOURCE_META) as ResourceKey[])
    .map((key) => {
      const value = state.bars[key];
      const zone = state.overloaded[key] ? "overload" : state.zones[key];
      const zoneLabel = state.overloaded[key]
        ? `OVERLOAD ${Math.max(0, GAME.overload.durationSeconds - state.overload[key]).toFixed(1)}s`
        : zone.toUpperCase();
      const warning = state.overloaded[key]
        ? `<small class="resource__warning">[OVERLOAD ${GAME.overload.durationSeconds.toFixed(1)}s: Turunkan ke &lt;${GAME.overload.clearBelow}%!]</small>`
        : "";
      return `<div class="resource resource--${zone}"><div class="resource__label"><span>${RESOURCE_META[key].label} <em>${zoneLabel}</em></span><strong>${displayPercentage(value)}%</strong></div><div class="resource__track"><span style="width:${value}%;background:${RESOURCE_META[key].color}"></span></div>${warning}</div>`;
    })
    .join("");
}

function panelMarkup(state: GameState): string {
  const era = ERAS[state.era];
  const quota = (["WEB", "DATA", "MEDIA", "UPLOAD"] as const)
    .map((type) => `<b>${type[0]} ${state.quotas[type]}/${era.subQuota[type]}</b>`)
    .join("");
  const warning = incidentWarning(state.era, state.time);
  const warningName = nextIncidentName(state.era, state.time);
  const incident = state.incident.definition;
  const incidentText = incident && state.time >= incident.start
    ? "SEDANG BERLANGSUNG"
    : warning !== null
      ? `Next Event: ${warningName ?? incident?.name ?? ""} dalam ${Math.ceil(warning)} dtk`
      : "Tidak ada event";
  const heavyText = state.heavyRecoverySeconds > 0
    ? `HEAVY debuff: ${state.heavyRecoverySeconds.toFixed(1)}s`
    : "HEAVY debuff: siap";
  const auto = state.autoscaling.bandwidth;
  const autoText = state.ownedNodes.autoscaling
    ? `Autoscaling: ${auto.state === "active" ? `aktif ${auto.seconds.toFixed(1)}s` : auto.state === "booting" ? "booting" : auto.state === "cooldown" ? `jeda ${auto.seconds.toFixed(1)}s` : "siap"}`
    : "Autoscaling: tidak terpasang";
  const temperature = state.era === 3
    ? `<div class="temperature-meter"><div><span>TEMPERATURE</span><strong>${state.temperature.value.toFixed(1)} C</strong></div><div class="resource__track"><span style="width:${Math.min(100, state.temperature.value)}%;background:${state.temperature.throttling ? "#ff6b6b" : state.temperature.warning ? "#ffb84d" : "#5ee0be"}"></span></div><small>${GAME.temperature.warning} C warning · ${GAME.temperature.throttling} C thermal throttling · ${GAME.temperature.gameOver} C Game Over</small></div>`
    : "";
  const encryption = state.era === 3 && state.encryption > 0
    ? `<small class="resource__warning">ENCRYPTION ${state.encryption.toFixed(1)}%</small>`
    : "";
  const k4 = state.era === 3 ? `<b class="rule-badge ${state.zones.cpu !== "normal" ? "on" : ""}">K4</b>` : "";
  const cloudText = state.ownedNodes["backup-cloud"]
    ? `Backup Cloud: ${state.backupCloudCooldownSeconds > 0 ? `jeda ${state.backupCloudCooldownSeconds.toFixed(1)}s` : "siap"}`
    : "Backup Cloud: tidak terpasang";
  return `<div class="panel-title">RESOURCE LOAD <i>LIVE</i></div>${barsMarkup(state)}${encryption}
    ${temperature}
    <div class="incident-banner">${incidentText}</div><div class="heavy-status">${heavyText}</div>
    <div class="rule-badges"><b class="${state.zones.ram !== "normal" ? "on" : ""}">K1</b><b class="${state.zones.bandwidth !== "normal" ? "on" : ""}">K2</b><b class="${state.zones.storage !== "normal" ? "on" : ""}">K3</b>${k4}</div>
    <div class="sla-meter"><div><span>SLA STABILITY</span><strong>${displayPercentage(state.sla)}%</strong></div><div class="resource__track"><span style="width:${state.sla}%;background:#5ee0be"></span></div><small>Game Over &lt; ${GAME.sla.gameOverBelow}%</small></div>
    <div class="telemetry-grid"><span><small>QUOTA ${state.quotas.WEB + state.quotas.DATA + state.quotas.MEDIA + state.quotas.UPLOAD}/${era.packetCount}</small><b class="quota-badges">${quota}</b></span><span><small>CREDITS</small><b>${state.credits}</b></span></div><small class="node-readiness">${autoText}<br>${cloudText}</small>`;
}

export function Arena(root: HTMLElement, onExit: () => void, onEnd: (state: GameState) => void, era: 1 | 2 | 3 = 1, sessionId?: string): () => void {
  const economy = loadEconomyState();
  const profile = getActiveProfile();
  const session = profile && sessionId
    ? loadProfileLog(profile).sessions.find((candidate) => candidate.sessionId === sessionId)
    : undefined;
  const formIndex = session?.formIndex ?? 0;
  const stateRef = { current: createGameState(createEraSchedule(era, formIndex), { era, ownedNodes: economy.ownedNodes }) };
  let input: GameInput = { move: 0 };
  let lastTime = performance.now();
  let panelElapsed = 0;
  const speed = Number(new URLSearchParams(window.location.search).get("speed") ?? "1");
  let paused = false;
  let countdown = 0;
  let countdownElapsed = 0;
  const loop = createFixedTimestep((delta) => {
    if (paused || countdown > 0) return;
    for (let index = 0; index < Math.max(1, speed); index += 1) {
      stateRef.current = stepGame(stateRef.current, input, delta);
    }
    input = { move: 0 };
  });

  root.innerHTML = `<main class="app-shell"><div class="noise"></div><section class="game-screen arena-screen">
    <header class="game-header"><div class="brand"><span class="brand__mark"><span></span><span></span><span></span></span><span class="brand__text">SERVER LIFE: <b>RUN TO ENTERPRISE</b></span></div><div class="mission-title"><span>ERA 0${era} · ${era === 1 ? "STARTUP" : era === 2 ? "TUMBUH" : "ENTERPRISE"}</span><b>SERVER ARENA</b></div><div class="game-timer"><small>TIME</small><b data-time>0</b></div><button class="pause-button" data-pause>Jeda / Panduan</button><button class="exit-button" data-exit>EXIT</button></header>
    <div class="game-layout"><aside class="panel telemetry" data-telemetry></aside><section class="runner"><canvas class="arena-canvas" data-canvas aria-label="Era 1 arena"></canvas><div class="touch-controls"><button data-move="-1">LEFT</button><button data-move="1">RIGHT</button></div></section><aside class="panel console"><div class="panel-title">DIAGNOSTIC LOG <i>LIVE</i></div><div data-log><p class="log-line">00:00 SYSTEM &nbsp; Era 1 ready.</p></div></aside></div>
  </section><div class="pause-overlay" data-pause-overlay hidden><div class="pause-card"><span class="briefing-step">SIMULATION PAUSED</span><h2 data-pause-title>Dijeda</h2><p>Kontrol: A/D atau panah. Hijau normal, kuning waspada, merah kritis. Overload berakhir setelah beban turun di bawah 95%.</p><button class="primary-button" data-resume>Lanjutkan</button></div></div></main>`;

  const canvas = root.querySelector<HTMLCanvasElement>("[data-canvas]");
  const runner = root.querySelector<HTMLElement>(".runner");
  const telemetry = root.querySelector<HTMLElement>("[data-telemetry]");
  const timer = root.querySelector<HTMLElement>("[data-time]");
  const log = root.querySelector<HTMLElement>("[data-log]");
  if (!canvas || !runner || !telemetry || !timer || !log) throw new Error("Arena surface failed to initialize.");

  const move = (direction: -1 | 1) => { input = { move: direction }; };
  const pauseButton = root.querySelector<HTMLButtonElement>("[data-pause]");
  const pauseOverlay = root.querySelector<HTMLElement>("[data-pause-overlay]");
  const pauseTitle = root.querySelector<HTMLElement>("[data-pause-title]");
  const setPaused = (value: boolean) => {
    paused = value;
    if (pauseOverlay) pauseOverlay.hidden = !value;
    if (value) drawArena(canvas, { ...stateRef.current, paused: true });
  };
  const resume = () => {
    if (!paused) return;
    countdown = 3;
    countdownElapsed = 0;
    if (pauseOverlay) pauseOverlay.hidden = false;
    if (pauseTitle) pauseTitle.textContent = "3";
    paused = false;
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
    if (event.key.toLowerCase() === "p" || event.key === "Escape") setPaused(!paused);
  };
  const onCanvasClick = (event: MouseEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const target = laneFromTap(event.clientX, bounds.left, bounds.width);
    const delta = target - stateRef.current.dispatcher.lane;
    if (delta) move(delta < 0 ? -1 : 1);
  };
  const keyButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-move]")];
  const buttonHandlers = keyButtons.map((button) => {
    const handler = () => move(Number(button.dataset.move) as -1 | 1);
    button.addEventListener("click", handler);
    return handler;
  });
  root.querySelector("[data-exit]")?.addEventListener("click", onExit);
  pauseButton?.addEventListener("click", () => setPaused(!paused));
  root.querySelector("[data-resume]")?.addEventListener("click", resume);
  canvas.addEventListener("click", onCanvasClick);
  window.addEventListener("keydown", onKey);
  const onVisibility = () => { if (document.hidden) setPaused(true); };
  document.addEventListener("visibilitychange", onVisibility);

  telemetry.innerHTML = panelMarkup(stateRef.current);
  const resizeObserver = new ResizeObserver(() => drawArena(canvas, stateRef.current));
  resizeObserver.observe(runner);
  let frame = 0;
  const render = (now: number) => {
    const elapsed = Math.min(GAME.maxAccumulatedDeltaSeconds, (now - lastTime) / 1000);
    lastTime = now;
    if (countdown > 0) {
      countdownElapsed += elapsed;
      if (countdownElapsed >= 1) {
        countdown -= 1;
        countdownElapsed = 0;
        if (countdown === 0) {
          if (pauseOverlay) pauseOverlay.hidden = true;
        } else if (pauseTitle) pauseTitle.textContent = countdown.toString();
      }
    } else {
      loop.advance(elapsed);
    }
    drawArena(canvas, { ...stateRef.current, paused: paused || countdown > 0 });
    panelElapsed += elapsed * 1000;
    if (panelElapsed >= GAME.panelUpdateMilliseconds) {
      panelElapsed = 0;
      telemetry.innerHTML = panelMarkup(stateRef.current);
      timer.textContent = Math.floor(stateRef.current.time).toString();
      stateRef.current.events.forEach((event) => {
        const line = document.createElement("p");
        line.className = "log-line";
        line.textContent = `${Math.floor(stateRef.current.time).toString().padStart(2, "0")}:00 ${event.message}`;
        log.prepend(line);
      });
      while (log.children.length > 8) log.lastElementChild?.remove();
    }
    if (stateRef.current.result !== "active") {
      onEnd(stateRef.current);
      return;
    }
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    window.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("click", onCanvasClick);
    keyButtons.forEach((button, index) => button.removeEventListener("click", buttonHandlers[index]));
  };
}
