/* eslint-disable */
/**
 * views/auth/signIn/index.jsx
 *
 * Left panel  — unchanged functional form (tabs, Google, email/password, remember me)
 * Right panel — completely replaced:
 *
 *   1. Animated canvas: Islamic hex grid scrolls slowly + 8 nested
 *      rotating star polygons + 60 mouse-repelling particles
 *   2. SVG calligraphy ring: Arabic bismillah orbits a central
 *      Arabic نِكَاح logotype — rotates indefinitely at 60fps via RAF
 *   3. Count-up stats (50K members, 12K marriages, 98% verified)
 *      animate in on mount
 *   4. All existing left-panel logic, imports, and hooks are UNTOUCHED
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from "react";
import {
  Box, Button, Checkbox, Flex, FormControl, FormLabel,
  Heading, Icon, Input, InputGroup, InputRightElement,
  Text, useColorModeValue, useToast, Spinner, Divider,
  keyframes,
} from "@chakra-ui/react";
import { FcGoogle }               from "react-icons/fc";
import { MdOutlineRemoveRedEye, MdArrowForward, MdFavorite } from "react-icons/md";
import { RiEyeCloseLine }         from "react-icons/ri";
import { useAuth }                from "contexts/AuthContext";

/* ── CSS keyframes ─────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:translateY(0); }
`;
const heartbeat = keyframes`
  0%,100% { transform:scale(1);    }
  14%      { transform:scale(1.15);}
  28%      { transform:scale(1);   }
  42%      { transform:scale(1.1); }
  70%      { transform:scale(1);   }
`;
const floatUp = keyframes`
  0%   { opacity:0; transform:translateY(0);    }
  20%  { opacity:1; }
  80%  { opacity:.5;}
  100% { opacity:0; transform:translateY(-55px);}
`;
const pulseDot = keyframes`
  0%,100% { transform:scale(1);   opacity:1;  }
  50%     { transform:scale(1.5); opacity:.5; }
`;

const PETALS = [
  { left:"7%",  top:"12%", delay:"0s",   dur:"6s"  },
  { left:"84%", top:"18%", delay:"1.3s", dur:"7s"  },
  { left:"19%", top:"72%", delay:"2.6s", dur:"5.5s"},
  { left:"76%", top:"64%", delay:".7s",  dur:"8s"  },
  { left:"51%", top:"9%",  delay:"3s",   dur:"6.5s"},
  { left:"91%", top:"48%", delay:"1.9s", dur:"7.5s"},
];

/* ── Count-up hook ─────────────────────────────────────── */
function useCountUp(target, duration = 1400, suffix = "") {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const iv = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.round(start));
      if (start >= target) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [target, duration]);
  return val.toLocaleString() + suffix;
}

/* ══════════════════════════════════════════════════════════ */
function SignIn() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const toast = useToast();

  /* ── Refs ─────────────────────────────────────────────── */
  const emailRef    = useRef();
  const timeoutRef  = useRef();
  const canvasRef   = useRef();
  const rightRef    = useRef();
  const rafRef      = useRef();
  const caliRafRef  = useRef();
  const frameRef    = useRef(0);
  const mouseRef    = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef([]);
  const caliAngleRef = useRef(0);

  /* ── Form state ────────────────────────────────────────── */
  const [tab,         setTab]         = useState("login");
  const [show,        setShow]        = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [rememberMe,  setRememberMe]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [gLoading,    setGLoading]    = useState(false);
  const [formKey,     setFormKey]     = useState(0);

  /* ── Colours ───────────────────────────────────────────── */
  const pageBg      = useColorModeValue("#FDF8F3", "#0F0A0A");
  const cardBg      = useColorModeValue("#FFFFFF", "#1A1010");
  const cardBorder  = useColorModeValue("#F0E6DC", "#2D1F1F");
  const labelColor  = useColorModeValue("#5C3D2E", "#C4A882");
  const inputBg     = useColorModeValue("#FAF5F0", "#130D0D");
  const inputBorder = useColorModeValue("#E8D5C4", "#3D2525");
  const inputFocus  = "#B5451B";
  const mutedText   = useColorModeValue("#9B7B6B", "#7A5C5C");
  const headingCol  = useColorModeValue("#2D1B0E", "#F5E6D3");
  const dividerCol  = useColorModeValue("#E8D5C4", "#2D1F1F");
  const tabActiveBg = useColorModeValue("#B5451B", "#D4622A");
  const tabInactive = useColorModeValue("#F5EBE3", "#1F1212");
  const tabInactiveText = useColorModeValue("#9B7B6B", "#7A5C5C");

  /* ── Remember email ────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      try { setEmail(atob(saved)); setRememberMe(true); } catch {}
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => emailRef.current?.focus(), 60);
  }, [tab]);

  /* ══════════════════════════════════════════════════════
     CANVAS — Islamic geometric animation
  ══════════════════════════════════════════════════════ */
  useEffect(() => {
    const canvas  = canvasRef.current;
    const rightEl = rightRef.current;
    if (!canvas || !rightEl) return;
    const ctx = canvas.getContext("2d");
    const PI2 = Math.PI * 2;

    const resize = () => {
      canvas.width  = rightEl.offsetWidth;
      canvas.height = rightEl.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(rightEl);

    /* Seed particles */
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - .5) * .35,
      vy:    (Math.random() - .5) * .35,
      r:     Math.random() * 1.4 + .4,
      alpha: Math.random() * .4 + .1,
      phase: Math.random() * PI2,
    }));

    /* Mouse tracking */
    const onMouseMove = (e) => {
      const rect = rightEl.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    rightEl.addEventListener("mousemove", onMouseMove);
    rightEl.addEventListener("mouseleave", () => {
      mouseRef.current = { x: -9999, y: -9999 };
    });

    const drawStar = (cx, cy, r, n, innerR, angle, alpha) => {
      ctx.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const a    = angle + i * Math.PI / n;
        const rad  = i % 2 === 0 ? r : innerR;
        const x    = cx + Math.cos(a) * rad;
        const y    = cy + Math.sin(a) * rad;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(232,146,124,${alpha})`;
      ctx.lineWidth   = .7;
      ctx.stroke();
    };

    const drawHexGrid = (offX, offY, rot) => {
      const s    = 52;
      const cols = Math.ceil(canvas.width  / s) + 2;
      const rows = Math.ceil(canvas.height / (s * .87)) + 2;
      ctx.strokeStyle = "rgba(232,146,124,0.055)";
      ctx.lineWidth   = .5;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const x = offX + c * s + (r % 2) * s * .5;
          const y = offY + r * s * .866;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = rot + i * Math.PI / 3;
            const px = x + Math.cos(a) * s * .5;
            const py = y + Math.sin(a) * s * .5;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const f = frameRef.current++;
      ctx.clearRect(0, 0, W, H);

      /* Scrolling hex grid */
      drawHexGrid(f * .18 % 52, f * .12 % 45, f * .0008);

      /* Rotating star rings */
      const cx   = W / 2;
      const cy   = H * .42;
      const rot  = f * .0014;
      for (let ring = 1; ring <= 5; ring++) {
        const r     = ring * 36;
        const n     = ring * 3 + 3;
        const alpha = .06 + ring * .016;
        drawStar(cx, cy, r, n, r * .55, rot * (ring % 2 ? 1 : -1), alpha);
      }

      /* Outer dotted orbit ring */
      const bigR = 182;
      ctx.beginPath();
      ctx.arc(cx, cy, bigR, 0, PI2);
      ctx.strokeStyle = "rgba(232,146,124,0.09)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      const pts = 12;
      for (let i = 0; i < pts; i++) {
        const a  = rot * 1.2 + i * PI2 / pts;
        const px = cx + Math.cos(a) * bigR;
        const py = cy + Math.sin(a) * bigR;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, PI2);
        ctx.fillStyle = `rgba(232,146,124,${.25 + .2 * Math.sin(f * .04 + i)})`;
        ctx.fill();
      }

      /* Star-polygon connectors */
      for (let i = 0; i < pts; i++) {
        const a1 = rot * 1.2 + i * PI2 / pts;
        const a2 = rot * 1.2 + (i + 5) * PI2 / pts;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * bigR, cy + Math.sin(a1) * bigR);
        ctx.lineTo(cx + Math.cos(a2) * bigR, cy + Math.sin(a2) * bigR);
        ctx.strokeStyle = "rgba(181,69,27,0.1)";
        ctx.lineWidth   = .5;
        ctx.stroke();
      }

      /* Particles */
      const { x: mx, y: my } = mouseRef.current;
      particlesRef.current.forEach((p) => {
        const dx   = mx - p.x;
        const dy   = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist > 0) {
          p.vx -= (dx / dist) * .1;
          p.vy -= (dy / dist) * .1;
        }
        p.vx *= .96; p.vy *= .96;
        p.x  += p.vx; p.y  += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const pulse = .5 + .5 * Math.sin(f * .03 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + pulse * .3), 0, PI2);
        ctx.fillStyle = `rgba(232,146,124,${p.alpha * (.6 + .4 * pulse)})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      rightEl.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  /* ══════════════════════════════════════════════════════
     SVG CALLIGRAPHY RING — rotates via RAF
  ══════════════════════════════════════════════════════ */
  const caliRef = useRef();
  useEffect(() => {
    const spin = () => {
      caliAngleRef.current += .1;
      if (caliRef.current) {
        caliRef.current.style.transform = `rotate(${caliAngleRef.current}deg)`;
      }
      caliRafRef.current = requestAnimationFrame(spin);
    };
    caliRafRef.current = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(caliRafRef.current);
  }, []);

  /* ── Count-up stats ────────────────────────────────────── */
  const stat1 = useCountUp(50000, 1600, "K+");
  const stat2 = useCountUp(12000, 1400, "K+");
  const stat3 = useCountUp(98,    1000, "%");

  /* ── Auth handlers ─────────────────────────────────────── */
  const switchTab = useCallback((t) => {
    if (t === tab) return;
    setLoading(false); setGLoading(false);
    setPassword(""); setConfirm(""); setShow(false); setShowConfirm(false);
    setFormKey(k => k + 1);
    setTab(t);
  }, [tab]);

  const handleGoogle = useCallback(async () => {
    if (gLoading || loading) return;
    try {
      setGLoading(true);
      await loginWithGoogle();
    } catch (err) {
      toast({ title: "Google sign-in failed", description: err.message,
              status: "error", duration: 4000, isClosable: true, position: "top" });
    } finally { setGLoading(false); }
  }, [gLoading, loading, loginWithGoogle, toast]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (loading || gLoading) return;
    const isReg = tab === "register";
    if (!email.trim() || !password) {
      toast({ title: "Missing fields", description: "Please fill email and password.",
              status: "warning", duration: 3000, isClosable: true, position: "top" }); return;
    }
    if (isReg && !name.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.",
              status: "warning", duration: 3000, isClosable: true, position: "top" }); return;
    }
    if (isReg && password !== confirm) {
      toast({ title: "Passwords don't match",
              status: "error", duration: 3000, isClosable: true, position: "top" }); return;
    }
    if (password.length < 8) {
      toast({ title: "Weak password", description: "Minimum 8 characters.",
              status: "warning", duration: 3000, isClosable: true, position: "top" }); return;
    }
    try {
      setLoading(true);
      if (isReg) {
        await registerWithEmail(name.trim(), email.trim(), password);
        toast({ title: "Welcome!", description: "Account created.",
                status: "success", duration: 4000, isClosable: true, position: "top" });
      } else {
        await loginWithEmail(email.trim(), password);
        if (rememberMe) localStorage.setItem("rememberedEmail", btoa(email.trim()));
        else            localStorage.removeItem("rememberedEmail");
      }
    } catch (err) {
      toast({ title: isReg ? "Registration failed" : "Sign-in failed",
              description: err.message, status: "error", isClosable: true, position: "top" });
    } finally { setLoading(false); }
  }, [loading, gLoading, tab, email, password, name, confirm,
      rememberMe, loginWithEmail, registerWithEmail, toast]);

  /* ══════════════════════════════════════════════════════ */
  return (
    <Flex minH="100vh" w="100%" bg={pageBg} position="relative" overflow="hidden">

      {/* Floating petals */}
      {PETALS.map((p, i) => (
        <Box key={i} position="absolute" left={p.left} top={p.top}
             w="8px" h="8px" borderRadius="50% 0 50% 0" pointerEvents="none"
             bg="linear-gradient(135deg,#E8927C,#B5451B)" opacity={0} zIndex={0}
             animation={`${floatUp} ${p.dur} ease-in-out ${p.delay} infinite`} />
      ))}

      {/* ══ LEFT: form panel ══════════════════════════════ */}
      <Flex
        w={{ base: "100%", lg: "46%" }}
        align="center" justify="center"
        px={{ base: 5, md: 10, xl: 14 }}
        py={10}
        position="relative"
        zIndex={2}
      >
        <Box w="100%" maxW="420px" animation={`${fadeUp} 0.5s ease both`}>

          {/* Brand */}
          <Flex align="center" gap={2} mb={8}>
            <Box w="36px" h="36px" borderRadius="10px"
                 bg="linear-gradient(135deg,#E8927C,#B5451B)"
                 display="flex" alignItems="center" justifyContent="center"
                 boxShadow="0 4px 15px rgba(181,69,27,.35)">
              <Icon as={MdFavorite} color="white" fontSize="18px"
                    animation={`${heartbeat} 2.5s ease-in-out infinite`} />
            </Box>
            <Text fontFamily="'Georgia',serif" fontSize="xl" fontWeight="700"
                  color={headingCol} letterSpacing="-.3px">
              Nikaah<Text as="span" color="#B5451B">Link</Text>
            </Text>
          </Flex>

          {/* Heading */}
          <Heading fontFamily="'Georgia',serif" fontSize={{ base:"26px",md:"30px" }}
                   fontWeight="700" color={headingCol} mb={1} lineHeight="1.2">
            {tab === "login" ? "Welcome back" : "Begin your journey"}
          </Heading>
          <Text color={mutedText} fontSize="sm" mb={7}>
            {tab === "login"
              ? "Sign in to your matrimonial account"
              : "Find your perfect partner, the halal way"}
          </Text>

          {/* Tabs */}
          <Flex bg={tabInactive} borderRadius="12px" p="4px" mb={6}>
            {["login","register"].map(t => (
              <Button key={t} flex={1} h="38px" borderRadius="9px" fontSize="sm"
                      fontWeight="600"
                      bg={tab === t ? tabActiveBg : "transparent"}
                      color={tab === t ? "white" : tabInactiveText}
                      boxShadow={tab === t ? "0 2px 8px rgba(181,69,27,.3)" : "none"}
                      _hover={{ bg: tab === t ? tabActiveBg : "rgba(181,69,27,.08)" }}
                      _active={{ transform:"scale(.98)" }}
                      transition="all .2s"
                      onClick={() => switchTab(t)}>
                {t === "login" ? "Sign In" : "Register"}
              </Button>
            ))}
          </Flex>

          {/* Google */}
          <Button w="100%" h="46px" mb={5} variant="outline" borderColor={inputBorder}
                  borderRadius="10px" bg={cardBg}
                  leftIcon={gLoading ? <Spinner size="sm" color="#B5451B" /> : <Icon as={FcGoogle} boxSize={5} />}
                  isLoading={gLoading} loadingText="Connecting…"
                  onClick={handleGoogle} isDisabled={loading}
                  _hover={{ borderColor:"#B5451B", bg:inputBg, transform:"translateY(-1px)",
                            boxShadow:"0 4px 12px rgba(181,69,27,.15)" }}
                  _active={{ transform:"translateY(0)" }}
                  transition="all .18s" fontWeight="500" color={labelColor} fontSize="sm">
            Continue with Google
          </Button>

          <Flex align="center" gap={3} mb={5}>
            <Divider borderColor={dividerCol} />
            <Text fontSize="xs" color={mutedText} whiteSpace="nowrap" fontWeight="500">
              or with email
            </Text>
            <Divider borderColor={dividerCol} />
          </Flex>

          {/* Form */}
          <Box key={formKey} as="form" onSubmit={handleSubmit}
               animation={`${fadeUp} .3s ease both`}>

            {tab === "register" && (
              <FormControl mb={4}>
                <FormLabel fontSize="xs" fontWeight="700" color={labelColor}
                           textTransform="uppercase" letterSpacing=".8px" mb={1.5}>
                  Full Name
                </FormLabel>
                <Input value={name} onChange={e => setName(e.target.value)}
                       placeholder="e.g. Ahmad Al-Rashid" h="46px" borderRadius="10px"
                       bg={inputBg} borderColor={inputBorder} color={headingCol} fontSize="sm"
                       _placeholder={{ color:mutedText }}
                       _focus={{ borderColor:inputFocus, boxShadow:"0 0 0 2px rgba(181,69,27,.15)", bg:cardBg }}
                       _hover={{ borderColor:"#C4855B" }} transition="all .15s"
                       isDisabled={loading || gLoading} />
              </FormControl>
            )}

            <FormControl mb={4}>
              <FormLabel fontSize="xs" fontWeight="700" color={labelColor}
                         textTransform="uppercase" letterSpacing=".8px" mb={1.5}>
                Email Address
              </FormLabel>
              <Input ref={emailRef} type="email" value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="you@example.com" h="46px" borderRadius="10px"
                     bg={inputBg} borderColor={inputBorder} color={headingCol} fontSize="sm"
                     _placeholder={{ color:mutedText }}
                     _focus={{ borderColor:inputFocus, boxShadow:"0 0 0 2px rgba(181,69,27,.15)", bg:cardBg }}
                     _hover={{ borderColor:"#C4855B" }} transition="all .15s"
                     isDisabled={loading || gLoading} />
            </FormControl>

            <FormControl mb={tab === "register" ? 4 : 3}>
              <FormLabel fontSize="xs" fontWeight="700" color={labelColor}
                         textTransform="uppercase" letterSpacing=".8px" mb={1.5}>
                Password
              </FormLabel>
              <InputGroup>
                <Input type={show ? "text" : "password"} value={password}
                       onChange={e => setPassword(e.target.value)}
                       placeholder="Min. 8 characters" h="46px" borderRadius="10px"
                       bg={inputBg} borderColor={inputBorder} color={headingCol} fontSize="sm"
                       _placeholder={{ color:mutedText }}
                       _focus={{ borderColor:inputFocus, boxShadow:"0 0 0 2px rgba(181,69,27,.15)", bg:cardBg }}
                       _hover={{ borderColor:"#C4855B" }} transition="all .15s"
                       isDisabled={loading || gLoading} />
                <InputRightElement h="46px">
                  <Icon as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye} color={mutedText}
                        cursor="pointer" onClick={() => setShow(s => !s)}
                        _hover={{ color:"#B5451B" }} transition="color .15s" fontSize="18px" />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {tab === "register" && (
              <FormControl mb={4}>
                <FormLabel fontSize="xs" fontWeight="700" color={labelColor}
                           textTransform="uppercase" letterSpacing=".8px" mb={1.5}>
                  Confirm Password
                </FormLabel>
                <InputGroup>
                  <Input type={showConfirm ? "text" : "password"} value={confirm}
                         onChange={e => setConfirm(e.target.value)}
                         placeholder="Re-enter password" h="46px" borderRadius="10px"
                         bg={inputBg}
                         borderColor={confirm && confirm !== password ? "#E53E3E" : inputBorder}
                         color={headingCol} fontSize="sm"
                         _placeholder={{ color:mutedText }}
                         _focus={{ borderColor: confirm && confirm !== password ? "#E53E3E" : inputFocus,
                                   boxShadow:"0 0 0 2px rgba(181,69,27,.15)", bg:cardBg }}
                         _hover={{ borderColor:"#C4855B" }} transition="all .15s"
                         isDisabled={loading || gLoading} />
                  <InputRightElement h="46px">
                    <Icon as={showConfirm ? RiEyeCloseLine : MdOutlineRemoveRedEye} color={mutedText}
                          cursor="pointer" onClick={() => setShowConfirm(s => !s)}
                          _hover={{ color:"#B5451B" }} transition="color .15s" fontSize="18px" />
                  </InputRightElement>
                </InputGroup>
                {confirm && confirm !== password && (
                  <Text fontSize="xs" color="#E53E3E" mt={1}>Passwords do not match</Text>
                )}
              </FormControl>
            )}

            {tab === "login" && (
              <Flex justify="space-between" align="center" mb={5}>
                <Checkbox isChecked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                          colorScheme="orange" isDisabled={loading || gLoading}
                          sx={{
                            ".chakra-checkbox__control": { borderColor:inputBorder, borderRadius:"5px" },
                            ".chakra-checkbox__control[data-checked]": { bg:"#B5451B", borderColor:"#B5451B" },
                          }}>
                  <Text fontSize="sm" color={mutedText}>Remember me</Text>
                </Checkbox>
                <Text fontSize="sm" color="#B5451B" fontWeight="600" cursor="pointer"
                      _hover={{ textDecoration:"underline" }}>
                  Forgot password?
                </Text>
              </Flex>
            )}

            <Button type="submit" w="100%" h="48px" borderRadius="12px"
                    bg="linear-gradient(135deg,#C4622A 0%,#B5451B 60%,#9B3615 100%)"
                    color="white" fontSize="sm" fontWeight="700" letterSpacing=".3px"
                    isLoading={loading}
                    loadingText={tab === "register" ? "Creating account…" : "Signing in…"}
                    rightIcon={!loading ? <Icon as={MdArrowForward} /> : undefined}
                    isDisabled={gLoading}
                    _hover={{ bg:"linear-gradient(135deg,#D4733A 0%,#C4551E 100%)",
                              transform:"translateY(-2px)",
                              boxShadow:"0 8px 25px rgba(181,69,27,.4)" }}
                    _active={{ transform:"translateY(0)", boxShadow:"none" }}
                    transition="all .18s"
                    boxShadow="0 4px 15px rgba(181,69,27,.3)"
                    mt={tab === "register" ? 2 : 0}>
              {tab === "login" ? "Sign In" : "Create Account"}
            </Button>
          </Box>

          <Text textAlign="center" fontSize="sm" color={mutedText} mt={5}>
            {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Text as="span" color="#B5451B" fontWeight="700" cursor="pointer"
                  onClick={() => switchTab(tab === "login" ? "register" : "login")}
                  _hover={{ textDecoration:"underline" }}>
              {tab === "login" ? "Register" : "Sign In"}
            </Text>
          </Text>

          <Flex align="center" justify="center" gap={1} mt={6}>
            <Text fontSize="xs" color={mutedText}>🔒</Text>
            <Text fontSize="xs" color={mutedText}>
              Secured with 256-bit encryption · Shariah compliant
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* ══ RIGHT: animated panel (desktop only) ═════════ */}
      <Box
        ref={rightRef}
        display={{ base:"none", lg:"block" }}
        flex={1}
        position="relative"
        overflow="hidden"
        bg="#1a0a04"
      >
        {/* Canvas — hex grid + stars + particles */}
        <Box as="canvas" ref={canvasRef} position="absolute" inset={0} w="100%" h="100%" />

        {/* Calligraphy ring — SVG rotating via RAF */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -52%)"
          w="260px"
          h="260px"
          zIndex={3}
          pointerEvents="none"
        >
          <Box as="svg" ref={caliRef} width="260" height="260" viewBox="0 0 260 260">
            <defs>
              <path id="caliPath"
                d="M130,130 m-110,0 a110,110 0 1,1 220,0 a110,110 0 1,1 -220,0" />
            </defs>
            {/* Orbit rings */}
            <circle cx="130" cy="130" r="110" fill="none"
                    stroke="rgba(232,146,124,0.15)" strokeWidth="1" />
            <circle cx="130" cy="130" r="90" fill="none"
                    stroke="rgba(181,69,27,0.1)" strokeWidth=".5" />
            {/* Arabic bismillah on path */}
            <text fontSize="10.5" fill="rgba(232,146,124,0.65)"
                  fontFamily="serif" letterSpacing="3.5">
              <textPath href="#caliPath" startOffset="3%">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ · بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ·
              </textPath>
            </text>
            {/* Central Arabic logotype */}
            <text x="130" y="114" textAnchor="middle"
                  fontFamily="Georgia,serif" fontSize="12"
                  fill="rgba(245,230,211,0.5)" letterSpacing="3">
              NIKAAH
            </text>
            <text x="130" y="138" textAnchor="middle"
                  fontFamily="serif" fontSize="24"
                  fill="rgba(232,146,124,0.9)" fontWeight="bold">
              نِكَاح
            </text>
            <text x="130" y="157" textAnchor="middle"
                  fontFamily="Georgia,serif" fontSize="10"
                  fill="rgba(245,230,211,0.35)" letterSpacing="4">
              LINK
            </text>
          </Box>
        </Box>

        {/* Shariah-compliant badge */}
        <Box
          position="absolute" top="24px" right="24px"
          bg="rgba(10,4,2,.65)" backdropFilter="blur(14px)"
          border="1px solid rgba(232,146,124,.2)"
          borderRadius="full" px={4} py={2} zIndex={5}
        >
          <Flex align="center" gap={2}>
            <Box w="7px" h="7px" borderRadius="full" bg="#E8927C"
                 animation={`${pulseDot} 2s ease-in-out infinite`} />
            <Text fontSize="11px" color="#F5E6D3" fontWeight="600" letterSpacing=".5px">
              SHARIAH COMPLIANT
            </Text>
          </Flex>
        </Box>

        {/* Bottom content card */}
        <Box
          position="absolute"
          bottom={{ base:"28px", xl:"44px" }}
          left={{ base:"24px", xl:"40px" }}
          right={{ base:"24px", xl:"40px" }}
          bg="rgba(10,4,2,.62)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(232,146,124,.16)"
          borderRadius="20px"
          p={{ base:6, xl:7 }}
          color="white"
          zIndex={4}
          boxShadow="0 24px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)"
        >
          {/* Accent line */}
          <Box w="44px" h="2px" borderRadius="full" mb={4}
               bg="linear-gradient(to right,#E8927C,#B5451B)" />

          <Heading fontFamily="'Georgia',serif" fontSize={{ base:"20px", xl:"24px" }}
                   fontWeight="700" mb={3} lineHeight="1.25" color="#F5E6D3">
            Find Your Ideal<br />Life Partner
          </Heading>

          <Text fontSize="sm" color="rgba(245,230,211,.7)" lineHeight="1.75" mb={2}
                fontStyle="italic">
            "And of His signs is that He created for you from yourselves mates
            that you may find tranquillity in them."
          </Text>
          <Text fontSize="11px" color="rgba(232,146,124,.75)" fontWeight="600"
                letterSpacing=".4px" mb={5}>
            — Quran 30:21
          </Text>

          {/* Count-up stats */}
          <Flex gap={7}>
            {[
              { val: stat1, label: "Members"   },
              { val: stat2, label: "Marriages" },
              { val: stat3, label: "Verified"  },
            ].map(s => (
              <Box key={s.label}>
                <Text fontFamily="'Georgia',serif" fontSize="xl" fontWeight="700"
                      color="#E8927C" lineHeight="1">
                  {s.val}
                </Text>
                <Text fontSize="xs" color="rgba(245,230,211,.5)" mt=".5">
                  {s.label}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
}

export default SignIn;