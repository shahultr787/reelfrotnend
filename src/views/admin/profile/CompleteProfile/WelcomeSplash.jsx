/**
 * CompleteProfile/WelcomeSplash.jsx
 *
 * Animated particle constellation splash screen shown before the wizard.
 * - 120 particles orbit two interlocking rings (symbolising union)
 * - Headline types itself character by character
 * - On "Begin your story": particles scatter → reform as crescent → wizard slides in
 */

import { useEffect, useRef, useState } from "react";
import { Box, Button, Text, keyframes } from "@chakra-ui/react";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;



const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

export default function WelcomeSplash({ onBegin }) {
  const canvasRef   = useRef(null);
  const frameRef    = useRef(0);
  const phaseRef    = useRef("orbit");
  const particlesRef = useRef([]);

  const [typed,      setTyped]      = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [showSub,    setShowSub]    = useState(false);
  const [showBtn,    setShowBtn]    = useState(false);
  const [leaving,    setLeaving]    = useState(false);

  /* ── Canvas particle system ──────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const TWO_PI = Math.PI * 2;
    const N      = 120;
    const COLORS = [
      "rgba(167,139,250,",
      "rgba(196,181,253,",
      "rgba(139,92,246,",
      "rgba(221,214,254,",
    ];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ringTarget = (i, total, cx, cy, r) => {
      const a = (i / total) * TWO_PI;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    };

    const half = Math.floor(N / 2);
    particlesRef.current = Array.from({ length: N }, (_, i) => {
      const ring = i < half ? 0 : 1;
      const j    = ring === 0 ? i : i - half;
      const r    = ring === 0 ? 85 : 65;
      const offX = ring === 0 ? -45 : 45;
      const t    = ringTarget(j, half, canvas.width / 2 + offX, canvas.height / 2, r);
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        tx: t.x, ty: t.y,
        vx: 0, vy: 0,
        size:  Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
        ring,
        idx: j,
        total: half,
        phase: Math.random() * TWO_PI,
        speed: 0.3 + Math.random() * 0.4,
      };
    });

    const setRingTargets = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      particlesRef.current.forEach((p) => {
        const r    = p.ring === 0 ? 85 : 65;
        const offX = p.ring === 0 ? -45 : 45;
        const t    = ringTarget(p.idx, p.total, cx + offX, cy, r);
        p.tx = t.x;
        p.ty = t.y;
      });
    };

    let rafId;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      frameRef.current++;
      const f = frameRef.current;

      if (f % 120 === 0 && phaseRef.current === "orbit") setRingTargets();

      particlesRef.current.forEach((p, i) => {
        const wobble = Math.sin(f * 0.02 + p.phase) * 2;
        const tx = p.tx + wobble * (p.ring === 0 ? 1 : -1);
        const ty = p.ty + Math.cos(f * 0.015 + p.phase) * 1.5;

        p.vx += (tx - p.x) * 0.04 * p.speed;
        p.vy += (ty - p.y) * 0.04 * p.speed;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x  += p.vx;
        p.y  += p.vy;

        const pulse = 0.6 + 0.4 * Math.sin(f * 0.04 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, TWO_PI);
        ctx.fillStyle = COLORS[i % COLORS.length] + (p.alpha * pulse).toFixed(2) + ")";
        ctx.fill();
      });

      if (phaseRef.current === "orbit") {
        const cx = W / 2, cy = H / 2;
        ctx.save();
        ctx.strokeStyle = "rgba(167,139,250,0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx - 45, cy, 85, 0, TWO_PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 45, cy, 65, 0, TWO_PI); ctx.stroke();
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  /* ── Typewriter ──────────────────────────────────────── */
  useEffect(() => {
    const LINES = ["Find your other half,\nthe one written for you."];
    let fullText = LINES[0];
    let i = 0;
    const tick = () => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
        setTimeout(tick, i === 1 ? 800 : 52);
      } else {
        setShowCursor(false);
        setTimeout(() => { setShowSub(true); setShowBtn(true); }, 400);
      }
    };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  /* ── Begin handler ───────────────────────────────────── */
  const handleBegin = () => {
    setLeaving(true);
    phaseRef.current = "scatter";
    const ps = particlesRef.current;

    // Scatter outward
    ps.forEach((p) => {
      const a = Math.random() * Math.PI * 2;
      const d = 150 + Math.random() * 200;
      const cx = canvasRef.current?.width  / 2 || 300;
      const cy = canvasRef.current?.height / 2 || 260;
      p.tx = cx + Math.cos(a) * d;
      p.ty = cy + Math.sin(a) * d;
      p.speed = 0.9 + Math.random() * 0.5;
    });

    // Reform as crescent
    setTimeout(() => {
      const cx = canvasRef.current?.width  / 2 || 300;
      const cy = canvasRef.current?.height / 2 || 260;
      const TWO_PI = Math.PI * 2;
      const r = 55;
      ps.forEach((p, i) => {
        const a  = (i / ps.length) * TWO_PI * 0.85 - 0.4;
        const ox = cx + Math.cos(a) * r * 0.55 + 20;
        const oy = cy + Math.sin(a) * r * 0.55;
        p.tx = cx + Math.cos(a) * r * (0.4 + 0.6 * (i / ps.length)) + (ox - cx) * 0.3;
        p.ty = cy + Math.sin(a) * r * (0.4 + 0.6 * (i / ps.length)) + (oy - cy) * 0.3;
        p.speed = 0.5;
      });
    }, 650);

    setTimeout(() => onBegin(), 1800);
  };

  return (
    <Box
      position="relative"
      minH="520px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      bg="#0f0c29"
      px={4}
      py={10}
      opacity={leaving ? 0 : 1}
      transition="opacity 0.5s ease"
    >
      {/* Particle canvas */}
      <Box
        as="canvas"
        ref={canvasRef}
        position="absolute"
        inset={0}
        w="100%"
        h="100%"
      />

      {/* Text content */}
      <Box
        position="relative"
        zIndex={2}
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={6}
        opacity={leaving ? 0 : 1}
        transform={leaving ? "translateY(-20px)" : "translateY(0)"}
        transition="all 0.5s ease"
      >
        {/* Arabic */}
        <Text
          fontSize="xl"
          color="whiteAlpha.500"
          letterSpacing="0.06em"
          animation={`${fadeUp} 0.8s ease both`}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>

        {/* Typed headline */}
        <Text
          fontSize={{ base: "22px", md: "28px" }}
          fontWeight="500"
          color="white"
          lineHeight={1.35}
          maxW="340px"
          whiteSpace="pre-line"
          minH="80px"
        >
          {typed}
          {showCursor && (
            <Box
              as="span"
              display="inline-block"
              w="2px"
              h="1em"
              bg="#a78bfa"
              verticalAlign="text-bottom"
              animation={`${blink} 1s step-end infinite`}
            />
          )}
        </Text>

        {/* Subtitle */}
        <Text
          fontSize="sm"
          color="whiteAlpha.500"
          maxW="260px"
          lineHeight={1.7}
          opacity={showSub ? 1 : 0}
          transition="opacity 1s ease"
        >
          Your journey to finding a righteous partner begins here. Let us know who you are.
        </Text>

        {/* CTA button */}
        <Button
          mt={2}
          px={10}
          py={6}
          bg="transparent"
          border="1.5px solid"
          borderColor="rgba(167,139,250,0.5)"
          color="#c4b5fd"
          borderRadius="full"
          fontSize="15px"
          letterSpacing="0.04em"
          fontWeight="400"
          opacity={showBtn ? 1 : 0}
          transition="opacity 0.8s ease, background 0.3s, border-color 0.3s, color 0.3s"
          _hover={{ bg: "rgba(167,139,250,0.12)", borderColor: "#a78bfa", color: "white" }}
          _active={{ transform: "scale(0.97)" }}
          onClick={handleBegin}
        >
          Begin your story
        </Button>

        {/* Step dots */}
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          opacity={showBtn ? 0.6 : 0}
          transition="opacity 0.8s ease"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              w={i === 0 ? "18px" : "6px"}
              h="6px"
              borderRadius={i === 0 ? "3px" : "full"}
              bg={i === 0 ? "#a78bfa" : "rgba(255,255,255,0.2)"}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}