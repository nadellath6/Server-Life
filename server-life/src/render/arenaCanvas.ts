import { GAME } from "../data/constants";
import type { PacketType } from "../data/constants";
import { drawDispatcher, drawPacket } from "./sprites";

type RenderPacket = {
  type: PacketType;
  lane: number;
  y: number;
  spawned?: boolean;
  missed?: boolean;
  caught?: boolean;
  caughtAge?: number;
  heavy?: boolean;
};

type RenderState = {
  packets: RenderPacket[];
  dispatcher: { visualLane: number };
  toasts?: { message: string; seconds: number }[];
  paused?: boolean;
};

function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
): void {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#081416");
  gradient.addColorStop(1, "#081012");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(83,218,187,.045)";
  context.lineWidth = Math.max(1, scale);
  const grid = Math.max(28 * scale, height / 10);
  for (let y = grid; y < height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  for (let x = grid; x < width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
}

export function drawArena(canvas: HTMLCanvasElement, state: RenderState): void {
  const bounds = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const scale = Math.min(width / 900, height / 520);
  const spriteSize = Math.max(56, Math.min(110, Math.min(width * 0.09, height * 0.11)));
  drawBackground(context, width, height, scale);
  if (state.paused) return;

  context.strokeStyle = "rgba(101,229,196,.55)";
  context.lineWidth = Math.max(1, scale);
  context.setLineDash([6 * scale, 6 * scale]);
  context.beginPath();
  context.moveTo(0, height * 0.85);
  context.lineTo(width, height * 0.85);
  context.stroke();
  context.setLineDash([]);

  context.save();
  context.beginPath();
  context.rect(0, 0, width, height);
  context.clip();
  state.packets.forEach((packet) => {
    if (packet.spawned === false || packet.y <= 0) return;
    const catchProgress = packet.y / GAME.catchYMax;
    const y = height * packet.y;
    const opacity = packet.caught
      ? Math.max(0, 1 - (packet.caughtAge ?? 0) / GAME.caughtFlashSeconds)
      : packet.missed && catchProgress > 1
        ? Math.max(0, 1 - (catchProgress - 1) / GAME.missedFadeSeconds)
        : 1;
    drawPacket(
      context,
      packet,
      width * GAME.laneX[packet.lane],
      y,
      spriteSize,
      opacity,
    );
  });
  context.restore();

  drawDispatcher(
    context,
    state.dispatcher,
    GAME.laneX.map((position) => width * position),
    height * 0.85,
    spriteSize,
  );
  const toasts = state.toasts ?? [];
  toasts.forEach((toast, index) => {
    const alpha = Math.min(1, toast.seconds / GAME.toastDurationSeconds);
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = "rgba(10, 28, 31, .92)";
    context.strokeStyle = "#ffb84d";
    context.lineWidth = Math.max(1, scale);
    const top = 14 + index * 36;
    context.beginPath();
    context.roundRect(width / 2 - width * 0.32, top, width * 0.64, 26, 6);
    context.fill();
    context.stroke();
    context.fillStyle = "#f4fbf7";
    context.font = `bold ${Math.max(10, 12 * scale)}px "DM Mono", monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(toast.message, width / 2, top + 13, width * 0.58);
    context.restore();
  });
}
