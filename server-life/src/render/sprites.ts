import { GAME, RESOURCE_META } from "../data/constants";
import type { PacketType, ResourceKey } from "../data/constants";

type PacketSprite = {
  type: PacketType;
  heavy?: boolean;
};

type DispatcherSprite = {
  visualLane: number;
};

const packetResource: Record<PacketType, ResourceKey> = {
  WEB: "cpu",
  DATA: "ram",
  MEDIA: "bandwidth",
  UPLOAD: "storage",
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function colorWithAlpha(hex: string, alpha: number): string {
  const value = hex.slice(1);
  return `rgba(${Number.parseInt(value.slice(0, 2), 16)}, ${Number.parseInt(value.slice(2, 4), 16)}, ${Number.parseInt(value.slice(4, 6), 16)}, ${alpha})`;
}

function fitFont(
  context: CanvasRenderingContext2D,
  text: string,
  initialSize: number,
  maxWidth: number,
  bold = false,
): void {
  let fontSize = initialSize;
  const weight = bold ? "700 " : "";
  context.font = `${weight}${fontSize}px "DM Mono", monospace`;
  while (context.measureText(text).width > maxWidth && fontSize > 0.1) {
    fontSize *= 0.9;
    context.font = `${weight}${fontSize}px "DM Mono", monospace`;
  }
}

export function drawPacket(
  context: CanvasRenderingContext2D,
  packet: PacketSprite,
  x: number,
  y: number,
  size: number,
  opacity = 1,
): void {
  const color = RESOURCE_META[packetResource[packet.type]].color;
  const spriteScale = size / 46;
  const left = x - size / 2;
  const top = y - size / 2;

  context.save();
  context.globalAlpha = opacity;
  context.shadowColor = colorWithAlpha(color, 0.35);
  context.shadowBlur = 15 * spriteScale;
  context.fillStyle = colorWithAlpha("#081012", 0.87);
  context.strokeStyle = color;
  context.lineWidth = (packet.heavy ? 2 : 1) * spriteScale;
  roundedRect(context, left, top, size, size, size * 0.18);
  context.fill();
  context.stroke();
  context.shadowBlur = 0;

  const bracketLength = 6 * spriteScale;
  const bracketOffset = 3 * spriteScale;
  context.strokeStyle = color;
  context.lineWidth = 2 * spriteScale;
  context.beginPath();
  context.moveTo(left - bracketOffset, top + bracketLength);
  context.lineTo(left - bracketOffset, top - bracketOffset);
  context.lineTo(left + bracketLength, top - bracketOffset);
  context.moveTo(left + size - bracketLength, top + size + bracketOffset);
  context.lineTo(left + size + bracketOffset, top + size + bracketOffset);
  context.lineTo(left + size + bracketOffset, top + size - bracketLength);
  context.stroke();

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff";
  context.shadowColor = "rgba(0,0,0,.5)";
  context.shadowBlur = 2 * spriteScale;
  context.fillStyle = "#a7b8ba";
  fitFont(context, packet.heavy ? "HEAVY" : "REQUEST", size * 0.15, size * 0.82);
  context.fillText(packet.heavy ? "HEAVY" : "REQUEST", x, y - size * 0.28);
  fitFont(context, packet.type, size * 0.24, size * 0.82, true);
  context.fillStyle = color;
  context.fillText(packet.type, x, y);
  const credits = `+${GAME.credits[packet.type] + (packet.heavy ? 2 : 0)}`;
  fitFont(context, credits, size * 0.17, size * 0.82);
  context.fillStyle = "#778a8e";
  context.fillText(credits, x, y + size * 0.28);
  context.shadowBlur = 0;
  context.restore();
}

export function drawDispatcher(
  context: CanvasRenderingContext2D,
  dispatcher: DispatcherSprite,
  columnCenters: number[],
  centerY: number,
  size: number,
): void {
  const lane = Math.max(0, Math.min(columnCenters.length - 1, dispatcher.visualLane));
  const lower = Math.floor(lane);
  const upper = Math.ceil(lane);
  const progress = lane - lower;
  const x = columnCenters[lower] + (columnCenters[upper] - columnCenters[lower]) * progress;
  const spriteScale = size / 46;
  const left = x - size / 2;
  const top = centerY - size / 2;

  context.save();
  const glow = context.createRadialGradient(x, centerY + size * 0.42, 0, x, centerY + size * 0.42, size * 0.9);
  glow.addColorStop(0, "rgba(91,229,194,.36)");
  glow.addColorStop(1, "rgba(91,229,194,0)");
  context.fillStyle = glow;
  context.beginPath();
  context.ellipse(x, centerY + size * 0.43, size * 0.8, size * 0.25, 0, 0, Math.PI * 2);
  context.fill();

  context.shadowColor = "rgba(84,225,190,.3)";
  context.shadowBlur = 18 * spriteScale;
  const fill = context.createLinearGradient(left, top, left, top + size);
  fill.addColorStop(0, "#21393a");
  fill.addColorStop(1, "#0b1517");
  context.fillStyle = fill;
  context.strokeStyle = "#78e6ca";
  context.lineWidth = spriteScale;
  roundedRect(context, left, top, size, size, size * 0.18);
  context.fill();
  context.stroke();
  context.shadowBlur = 0;

  for (let index = 0; index < 3; index += 1) {
    const slotTop = top + size * (0.18 + index * 0.22);
    context.fillStyle = "#111f21";
    context.strokeStyle = "#42605f";
    context.fillRect(left + size * 0.13, slotTop, size * 0.74, size * 0.13);
    context.strokeRect(left + size * 0.13, slotTop, size * 0.74, size * 0.13);
    context.fillStyle = "#63e1c0";
    context.shadowColor = "#63e1c0";
    context.shadowBlur = 5 * spriteScale;
    context.fillRect(left + size * 0.2, slotTop + size * 0.04, size * 0.06, size * 0.06);
    context.shadowBlur = 0;
  }

  context.fillStyle = "#0b1819";
  roundedRect(context, x - size * 0.36, top + size * 1.03, size * 0.72, size * 0.17, size * 0.08);
  context.fill();
  context.fillStyle = "#67dfc0";
  context.font = `${size * 0.12}px "DM Mono", monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("SERVER", x, top + size * 1.115);
  context.restore();
}
