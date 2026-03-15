/**
 * drawingUtils.js
 * ─────────────────────────────────────────────────────────────────
 * Canvas renderer that produces frames IDENTICAL to ProfileCard.jsx
 * Used by useVideoRecorder to render each animation frame.
 *
 * All geometry, colours, layout and timing must stay in sync with
 * ProfileCard.jsx — change both files together.
 */

import { FIELD_CONFIG } from "../constants/reelConfig";

/* ═══════════════════════════════════════════════════
   POLYFILL
═══════════════════════════════════════════════════ */
export const initCanvasHelpers = () => {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      this.closePath();
      return this;
    };
  }
};

/* ═══════════════════════════════════════════════════
   ANIMATION HELPERS  (mirrors ProfileCard.jsx)
═══════════════════════════════════════════════════ */
const easeOut = (t) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

const lerp = (frame, f0, f1, v0, v1) => {
  const t = easeOut((frame - f0) / (f1 - f0));
  return v0 + t * (v1 - v0);
};

/* ═══════════════════════════════════════════════════
   BACKGROUND + GLOW
═══════════════════════════════════════════════════ */
export const drawBackground = (ctx, W, H, backgroundColor, frame) => {
  const c1 = backgroundColor?.colors?.[0] || "#1a0533";
  const c2 = backgroundColor?.colors?.[1] || "#a855f7";

  // Main gradient
  const bg = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, H);
  bg.addColorStop(0, c1);
  bg.addColorStop(1, c2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow at top centre
  const glow = ctx.createRadialGradient(W / 2, H * 0.28, 0, W / 2, H * 0.28, W * 0.65);
  glow.addColorStop(0, "rgba(168,85,247,0.45)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Gold shimmer bar at top
  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0,   "rgba(255,213,90,0)");
  bar.addColorStop(0.3, "rgba(255,213,90,0.9)");
  bar.addColorStop(0.5, "#fbbf24");
  bar.addColorStop(0.7, "rgba(255,213,90,0.9)");
  bar.addColorStop(1,   "rgba(255,213,90,0)");
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, W, 3);
};

/* ═══════════════════════════════════════════════════
   MANDALA RINGS  (centred on cx, cy)
═══════════════════════════════════════════════════ */
const drawRing = (ctx, cx, cy, r, petals, angle, color, opacity) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + angle;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

export const drawMandala = (ctx, W, frame) => {
  const cx = W / 2;
  const cy = 260;
  const f = frame || 0;
  const toRad = (deg) => (deg * Math.PI) / 180;

  drawRing(ctx, cx, cy, 115, 12,  toRad(f * 0.4),  "rgba(255,210,80,0.5)",   0.38);
  drawRing(ctx, cx, cy, 140, 18,  toRad(-f * 0.3), "rgba(200,140,255,0.5)",  0.28);
  drawRing(ctx, cx, cy, 170, 24,  toRad(f * 0.2),  "rgba(255,255,255,0.35)", 0.2);
  drawRing(ctx, cx, cy, 198, 8,   toRad(f * 0.6),  "rgba(255,210,80,0.5)",   0.22);
};

/* ═══════════════════════════════════════════════════
   SPARKLES
═══════════════════════════════════════════════════ */
const SPARKLE_DEFS = [
  { x: 60,  y: 90,  size: 7,  phase: 0  },
  { x: 650, y: 110, size: 5,  phase: 15 },
  { x: 100, y: 600, size: 6,  phase: 30 },
  { x: 620, y: 560, size: 8,  phase: 10 },
  { x: 360, y: 45,  size: 5,  phase: 22 },
  { x: 55,  y: 340, size: 6,  phase: 42 },
  { x: 660, y: 320, size: 5,  phase: 5  },
  { x: 680, y: 70,  size: 4,  phase: 50 },
];

export const drawSparkles = (ctx, frame) => {
  SPARKLE_DEFS.forEach(({ x, y, size, phase }) => {
    const t = Math.abs(Math.sin(((frame + phase) / 60) * Math.PI));
    const sc = 0.4 + t * 0.6;
    ctx.save();
    ctx.globalAlpha = t;
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = "rgba(255,228,90,0.95)";
    ctx.beginPath();
    const pts = [
      [0, -size], [size * 0.3, -size * 0.3], [size, 0],
      [size * 0.3, size * 0.3], [0, size], [-size * 0.3, size * 0.3],
      [-size, 0], [-size * 0.3, -size * 0.3],
    ];
    ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
};

/* ═══════════════════════════════════════════════════
   PROFILE PHOTO  (animated ring border)
═══════════════════════════════════════════════════ */
export const drawProfilePhoto = (ctx, W, photoImg, frame) => {
  const cx = W / 2;
  const cy = 260;
  const R = 78; // inner photo radius

  const photoScale = lerp(frame, 0, 22, 0.6, 1);
  const photoOp   = lerp(frame, 0, 18, 0,   1);

  ctx.save();
  ctx.globalAlpha = photoOp;
  ctx.translate(cx, cy);
  ctx.scale(photoScale, photoScale);
  ctx.translate(-cx, -cy);

  // Conic-like glow (approximated with arc strokes)
  const colors = ["#fbbf24", "#a855f7", "#ec4899"];
  colors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, R + 12, (i / 3) * Math.PI * 2, ((i + 1) / 3) * Math.PI * 2);
    ctx.strokeStyle = c;
    ctx.lineWidth = 8;
    ctx.globalAlpha = photoOp * 0.6;
    ctx.stroke();
  });

  // White border
  ctx.beginPath();
  ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.globalAlpha = photoOp;
  ctx.stroke();

  // Clip & draw photo
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  if (photoImg) {
    ctx.drawImage(photoImg, cx - R, cy - R, R * 2, R * 2);
  } else {
    ctx.fillStyle = "linear-gradient(135deg,#6b21a8,#a855f7)";
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  }

  ctx.restore();
};

/* ═══════════════════════════════════════════════════
   NAME + DIVIDER + AGE
═══════════════════════════════════════════════════ */
export const drawNameSection = (ctx, W, info, frame) => {
  const headerOp = lerp(frame, 18, 40, 0, 1);
  const headerY  = lerp(frame, 18, 42, 28, 0);
  const divW     = lerp(frame, 42, 72, 0, 200);

  ctx.save();
  ctx.globalAlpha = headerOp;
  ctx.translate(0, headerY);

  // Brand tag
  ctx.font = "600 22px Arial";
  ctx.fillStyle = "rgba(255,213,90,0.8)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("✦ MATRIMONIAL PROFILE ✦", W / 2, 360);

  // Name - gold gradient (approximate with solid)
  ctx.font = "bold 72px Georgia, serif";
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "rgba(251,191,36,0.4)";
  ctx.shadowBlur = 14;
  ctx.textAlign = "center";
  ctx.fillText(info.name || "", W / 2, 440);

  // Animated divider
  const dx = (W - divW) / 2;
  const divGrad = ctx.createLinearGradient(dx, 0, dx + divW, 0);
  divGrad.addColorStop(0,   "rgba(255,213,90,0)");
  divGrad.addColorStop(0.3, "#fbbf24");
  divGrad.addColorStop(0.5, "#ffffff");
  divGrad.addColorStop(0.7, "#fbbf24");
  divGrad.addColorStop(1,   "rgba(255,213,90,0)");
  ctx.fillStyle = divGrad;
  ctx.shadowBlur = 0;
  ctx.fillRect(dx, 455, divW, 2);

  // Age
  if (info.age) {
    ctx.font = "26px Georgia, serif";
    ctx.fillStyle = "rgba(255,228,140,0.9)";
    ctx.shadowBlur = 0;
    ctx.fillText(`${info.age} YEARS`, W / 2, 490);
  }

  ctx.restore();
};

/* ═══════════════════════════════════════════════════
   INFO CARDS GRID
═══════════════════════════════════════════════════ */
export const drawInfoCards = (ctx, W, info, frame) => {
  const fields = FIELD_CONFIG.filter(
    (item) => info[item.field] && info[item.field].toString().trim() !== ""
  ).map((item) => ({ ...item, value: info[item.field] }));

  const cardW = 300;
  const cardH = 72;
  const leftX  = 40;
  const rightX = W - 340;
  const startY = 510;
  const rowH   = cardH + 12;

  fields.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const delay = 55 + row * 12;

    const slideY = lerp(frame, delay, delay + 28, 55, 0);
    const op     = lerp(frame, delay, delay + 22, 0,  1);

    const x = col === 0 ? leftX : rightX;
    const y = startY + row * rowH + slideY;

    ctx.save();
    ctx.globalAlpha = op;

    // Card glass background
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 14);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "rgba(255,213,90,0.38)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 14);
    ctx.stroke();

    // Label
    ctx.font = "22px Arial";
    ctx.fillStyle = "rgba(255,213,90,0.9)";
    ctx.textAlign = "left";
    ctx.fillText(`${item.icon} ${item.label.toUpperCase()}`, x + 14, y + 24);

    // Value
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillStyle = "white";
    ctx.fillText(item.value.toString(), x + 14, y + 54);

    ctx.restore();
  });

  // Return how many rows were drawn so caller can position "about"
  return Math.ceil(fields.length / 2);
};

/* ═══════════════════════════════════════════════════
   ABOUT SECTION
═══════════════════════════════════════════════════ */
export const drawAbout = (ctx, W, info, frame, rowsDrawn) => {
  if (!info.about) return;

  const op     = lerp(frame, 115, 132, 0, 1);
  const slideY = lerp(frame, 115, 132, 28, 0);

  const cardH = 72;
  const rowH  = cardH + 12;
  const startY = 510;
  const y = startY + rowsDrawn * rowH + 18 + slideY;

  const shortAbout =
    info.about.length > 120
      ? info.about.substring(0, 120) + "…"
      : info.about;

  ctx.save();
  ctx.globalAlpha = op;

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(40, y, W - 80, 108, 14);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,213,90,0.3)";
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.roundRect(40, y, W - 80, 108, 14);
  ctx.stroke();

  ctx.font = "600 22px Arial";
  ctx.fillStyle = "rgba(255,213,90,0.85)";
  ctx.letterSpacing = "2px";
  ctx.fillText("✦ ABOUT ME", 55, y + 28);

  ctx.font = "24px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.letterSpacing = "0";
  ctx.fillText(shortAbout, 55, y + 58, W - 120);

  ctx.restore();
};

/* ═══════════════════════════════════════════════════
   CTA FOOTER
═══════════════════════════════════════════════════ */
export const drawFooter = (ctx, W, H, frame) => {
  const ctaOp = lerp(frame, 130, 155, 0, 1);
  const pulse  = 1 + Math.sin((frame / 40) * Math.PI) * 0.025;

  ctx.save();
  ctx.globalAlpha = ctaOp;

  // Scale pulse from bottom centre
  ctx.translate(W / 2, H - 42);
  ctx.scale(pulse, pulse);
  ctx.translate(-W / 2, -(H - 42));

  // Dark glass bg
  const footerGrad = ctx.createLinearGradient(0, H - 84, 0, H);
  footerGrad.addColorStop(0, "rgba(100,10,160,0.92)");
  footerGrad.addColorStop(1, "rgba(60,0,100,0.96)");
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, H - 84, W, 84);

  // Gold top border
  const borderGrad = ctx.createLinearGradient(0, 0, W, 0);
  borderGrad.addColorStop(0,   "transparent");
  borderGrad.addColorStop(0.3, "rgba(255,213,90,0.35)");
  borderGrad.addColorStop(0.7, "rgba(255,213,90,0.35)");
  borderGrad.addColorStop(1,   "transparent");
  ctx.fillStyle = borderGrad;
  ctx.fillRect(0, H - 84, W, 1);

  // Text
  ctx.font = "bold 34px Georgia, serif";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(251,191,36,0.3)";
  ctx.shadowBlur = 8;
  ctx.fillText("❤️  Share & Follow for More  ❤️", W / 2, H - 30);

  ctx.restore();
};

/* ═══════════════════════════════════════════════════
   MASTER DRAW FRAME  (called by useVideoRecorder)
═══════════════════════════════════════════════════ */
export const drawFrame = (ctx, W, H, info, photoImg, frame) => {
  ctx.clearRect(0, 0, W, H);

  drawBackground(ctx, W, H, info.backgroundColor, frame);
  drawMandala(ctx, W, frame);
  drawSparkles(ctx, frame);
  drawProfilePhoto(ctx, W, photoImg, frame);
  drawNameSection(ctx, W, info, frame);
  const rowsDrawn = drawInfoCards(ctx, W, info, frame);
  drawAbout(ctx, W, info, frame, rowsDrawn);
  drawFooter(ctx, W, H, frame);
};
