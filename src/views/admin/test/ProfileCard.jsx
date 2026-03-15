/**
 * ProfileCard.jsx
 * ─────────────────────────────────────────────────────────────────
 * Single source-of-truth renderer used in:
 *   1. MatrimonialInfoForm → "Preview" tab  (scale ~0.44 inside phone mock)
 *   2. MatrimonialReelGenerator → canvas-preview stage
 *   3. Video frame renderer (via html2canvas or direct DOM capture)
 *
 * Props
 * ─────
 *  info          – form data object
 *  previewUrl    – base64 / object-URL of the profile photo
 *  frame         – current animation frame (0 = static / full-visible)
 *  totalFrames   – total frames in video (default 240 = 8 s @ 30 fps)
 *  scale         – CSS scale applied to the 720×1280 card (default 1)
 */

import React, { useMemo } from "react";
import { FIELD_CONFIG } from "./constants/reelConfig";

/* ─── timing helpers ──────────────────────────────────────────── */
const easeOut = (t) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

const lerp = (frame, [f0, f1], [v0, v1]) => {
  const t = easeOut((frame - f0) / (f1 - f0));
  return v0 + t * (v1 - v0);
};

/* Static means frame is undefined / 0 → show everything fully visible */
const tv = (frame, isStatic, f0, f1, v0, v1) =>
  isStatic ? v1 : lerp(frame, [f0, f1], [v0, v1]);

/* ─── Sparkle SVG ─────────────────────────────────────────────── */
const Sparkle = ({ x, y, size, phase, frame, isStatic }) => {
  const t = isStatic ? 0.8 : Math.sin(((frame + phase) / 60) * Math.PI);
  return (
    <g
      transform={`translate(${x},${y}) scale(${0.4 + Math.abs(t) * 0.6})`}
      opacity={Math.abs(t)}
    >
      <polygon
        points={`0,${-size} ${size * 0.3},${-size * 0.3} ${size},0 ${size * 0.3},${size * 0.3} 0,${size} ${-size * 0.3},${size * 0.3} ${-size},0 ${-size * 0.3},${-size * 0.3}`}
        fill="rgba(255,228,90,0.95)"
      />
    </g>
  );
};

/* ─── Mandala ring ────────────────────────────────────────────── */
const Ring = ({ r, petals, frame, isStatic, speed, color, opacity }) => {
  const angle = isStatic ? 0 : (frame * speed * Math.PI) / 180;
  const pts = Array.from({ length: petals }, (_, i) => {
    const a = (i / petals) * Math.PI * 2 + angle;
    return `${r * Math.cos(a)},${r * Math.sin(a)}`;
  }).join(" ");
  return (
    <polygon
      points={pts}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={opacity}
    />
  );
};

/* ─── Info card ───────────────────────────────────────────────── */
const Card = ({ icon, label, value, delay, frame, isStatic }) => {
  const slideY = tv(frame, isStatic, delay, delay + 28, 55, 0);
  const op = tv(frame, isStatic, delay, delay + 22, 0, 1);
  return (
    <div
      style={{
        transform: `translateY(${slideY}px)`,
        opacity: op,
        background:
          "linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,213,90,0.38)",
        borderRadius: 14,
        padding: "11px 14px",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(255,213,90,0.9)",
          fontFamily: "Georgia, serif",
        }}
      >
        {icon} {label}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "Georgia, serif",
          lineHeight: 1.25,
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                 */
/* ═══════════════════════════════════════════════════════════════ */
const ProfileCard = ({
  info = {},
  previewUrl,
  frame,
  totalFrames = 240,
  scale = 1,
}) => {
  const isStatic = frame === undefined || frame === null;
  const f = isStatic ? totalFrames : frame;

  /* gradient colours */
  const c1 = info.backgroundColor?.colors?.[0] || "#1a0533";
  const c2 = info.backgroundColor?.colors?.[1] || "#a855f7";

  /* animations */
  const photoScale = tv(f, isStatic, 0, 22, 0.6, 1);
  const photoOp = tv(f, isStatic, 0, 18, 0, 1);
  const headerOp = tv(f, isStatic, 18, 40, 0, 1);
  const headerY = tv(f, isStatic, 18, 42, 28, 0);
  const divW = tv(f, isStatic, 42, 72, 0, 200);
  const ctaOp = tv(f, isStatic, 130, 155, 0, 1);
  const pulse = 1 + Math.sin((f / 40) * Math.PI) * 0.025;

  /* field cards with staggered delays */
  const cards = useMemo(() => {
    const fields = FIELD_CONFIG.filter(
      (item) =>
        info[item.field] && info[item.field].toString().trim() !== ""
    );
    return fields.map((item, i) => ({
      ...item,
      value: info[item.field],
      delay: 55 + Math.floor(i / 2) * 12,
    }));
  }, [info]);

  const sparkles = [
    { x: 60,  y: 90,  size: 7,  phase: 0  },
    { x: 650, y: 110, size: 5,  phase: 15 },
    { x: 100, y: 600, size: 6,  phase: 30 },
    { x: 620, y: 560, size: 8,  phase: 10 },
    { x: 360, y: 45,  size: 5,  phase: 22 },
    { x: 55,  y: 340, size: 6,  phase: 42 },
    { x: 660, y: 320, size: 5,  phase: 5  },
    { x: 680, y: 70,  size: 4,  phase: 50 },
  ];

  return (
    /* Outer wrapper: scales the 720×1280 card for preview */
    <div
      style={{
        width: 720,
        height: 1280,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Georgia, 'Times New Roman', serif",
        background: `linear-gradient(160deg, ${c1} 0%, ${c2} 100%)`,
        flexShrink: 0,
      }}
    >
      {/* ── SVG decorative layer ──────────────────────────────── */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 720 1280"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* radial glow */}
        <defs>
          <radialGradient id="pcglow" cx="50%" cy="30%" r="55%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.5)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="360" cy="310" rx="380" ry="340" fill="url(#pcglow)" />

        {/* mandala rings centred on photo */}
        <g transform="translate(360,260)">
          <Ring r={115} petals={12} frame={f} isStatic={isStatic} speed={0.4}  color="rgba(255,210,80,0.5)"   opacity={0.38} />
          <Ring r={140} petals={18} frame={f} isStatic={isStatic} speed={-0.3} color="rgba(200,140,255,0.5)"  opacity={0.28} />
          <Ring r={170} petals={24} frame={f} isStatic={isStatic} speed={0.2}  color="rgba(255,255,255,0.35)" opacity={0.2}  />
          <Ring r={198} petals={8}  frame={f} isStatic={isStatic} speed={0.6}  color="rgba(255,210,80,0.5)"   opacity={0.22} />
        </g>

        {/* sparkles */}
        {sparkles.map((s, i) => (
          <Sparkle key={i} {...s} frame={f} isStatic={isStatic} />
        ))}

        {/* bottom arch */}
        <ellipse cx="360" cy="1350" rx="420" ry="190" fill="none"
          stroke="rgba(255,213,90,0.18)" strokeWidth="1.5" />
        <ellipse cx="360" cy="1375" rx="350" ry="175" fill="none"
          stroke="rgba(255,213,90,0.1)" strokeWidth="1" />
      </svg>

      {/* ── gold shimmer top bar ──────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg,transparent,rgba(255,213,90,0.9),#fbbf24,rgba(255,213,90,0.9),transparent)",
      }} />

      {/* ── content column ───────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "36px 36px 96px",
        boxSizing: "border-box",
        overflowY: "hidden",
      }}>

        {/* brand tag */}
        <div style={{
          fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "rgba(255,213,90,0.75)", marginBottom: 18,
          opacity: photoOp,
        }}>
          ✦ Matrimonial Profile ✦
        </div>

        {/* photo + ring */}
        <div style={{
          position: "relative",
          transform: `scale(${photoScale})`,
          opacity: photoOp,
          marginBottom: 18,
          flexShrink: 0,
        }}>
          {/* conic glow blur */}
          <div style={{
            position: "absolute", inset: -7, borderRadius: "50%",
            background: "conic-gradient(from 0deg,#fbbf24,#a855f7,#ec4899,#fbbf24)",
            filter: "blur(7px)", opacity: 0.75,
          }} />
          {/* ring border */}
          <div style={{
            position: "relative",
            width: 156, height: 156, borderRadius: "50%",
            padding: 4,
            background: "linear-gradient(135deg,#fbbf24,#a855f7,#ec4899)",
          }}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="profile"
                style={{
                  width: "100%", height: "100%",
                  borderRadius: "50%", objectFit: "cover",
                  border: "3px solid #fff",
                  display: "block",
                }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(135deg,#6b21a8,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 56, border: "3px solid #fff",
              }}>👤</div>
            )}
          </div>
        </div>

        {/* name + divider + age */}
        <div style={{
          textAlign: "center",
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          marginBottom: 6,
          flexShrink: 0,
        }}>
          <h1 style={{
            fontSize: 40, margin: 0, fontWeight: 700, letterSpacing: 1,
            background: "linear-gradient(90deg,#fef9c3,#fbbf24,#fff,#fbbf24,#fef9c3)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", lineHeight: 1.1,
          }}>
            {info.name || "Your Name"}
          </h1>

          {/* animated divider */}
          <div style={{
            height: 2, width: divW, margin: "9px auto 7px",
            background: "linear-gradient(90deg,transparent,#fbbf24,#fff,#fbbf24,transparent)",
            borderRadius: 2,
          }} />

          {info.age && (
            <p style={{
              margin: 0, fontSize: 15, color: "rgba(255,228,140,0.9)",
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              {info.age} Years
            </p>
          )}
        </div>

        {/* info cards grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, width: "100%", marginTop: 14,
        }}>
          {cards.map((c) => (
            <Card key={c.field} {...c} frame={f} isStatic={isStatic} />
          ))}
        </div>

        {/* about */}
        {info.about && (
          <div style={{
            opacity: tv(f, isStatic, 115, 132, 0, 1),
            transform: `translateY(${tv(f, isStatic, 115, 132, 28, 0)}px)`,
            marginTop: 12, width: "100%",
            background: "linear-gradient(135deg,rgba(255,255,255,0.13),rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,213,90,0.3)",
            borderRadius: 14, padding: "12px 16px",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(255,213,90,0.85)", marginBottom: 5,
            }}>
              ✦ About Me
            </div>
            <p style={{
              margin: 0, fontSize: 13, color: "rgba(255,255,255,0.9)",
              lineHeight: 1.55,
            }}>
              {info.about.length > 120
                ? info.about.substring(0, 120) + "…"
                : info.about}
            </p>
          </div>
        )}
      </div>

      {/* ── CTA footer ───────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 84,
        background: "linear-gradient(135deg,rgba(100,10,160,0.92),rgba(60,0,100,0.96))",
        borderTop: "1px solid rgba(255,213,90,0.35)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12,
        opacity: ctaOp,
        transform: `scale(${pulse})`,
      }}>
        <span style={{ fontSize: 20 }}>❤️</span>
        <span style={{
          fontSize: 19, fontWeight: 700, letterSpacing: 1,
          background: "linear-gradient(90deg,#fef9c3,#fbbf24,#fff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Share &amp; Follow for More
        </span>
        <span style={{ fontSize: 20 }}>❤️</span>
      </div>
    </div>
  );
};

export default ProfileCard;
