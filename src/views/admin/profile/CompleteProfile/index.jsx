/**
 * CompleteProfile/index.jsx
 *
 * Changes vs previous version:
 *  ✅  Slide transition: steps slide left/right instead of just appearing
 *  ✅  Mobile layout: full-viewport on small screens, sticky footer nav,
 *      no horizontal overflow, px scales down on mobile
 *  ✅  Confetti burst: canvas overlay fires on successful submit
 *  ✅  Keyboard: Enter on text fields advances / submits
 */

import {
  Box, Button, Flex, Icon, Text, VStack, useToast, keyframes,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { useNavigate }    from "react-router-dom";
import { MdCheckCircle }  from "react-icons/md";

import { useAuth }             from "../../../../contexts/AuthContext";
import { apiFetch }            from "../../../../utils/apiFetch";
import { STEPS, INIT_FORM }    from "./constants";
import { validate, hasErrors } from "./validation";

import WelcomeSplash from "./WelcomeSplash";
import StepHeader    from "./StepHeader";
import StepBasicInfo from "./StepBasicInfo";
import StepReligion  from "./StepReligion";
import StepCareer    from "./StepCareer";
import StepLocation  from "./StepLocation";
import StepAbout     from "./StepAbout";

const slideInRight = keyframes`
  from { opacity:0; transform:translateX(40px); }
  to   { opacity:1; transform:translateX(0);    }
`;
const slideInLeft = keyframes`
  from { opacity:0; transform:translateX(-40px); }
  to   { opacity:1; transform:translateX(0);     }
`;

const SX = {
  input: {
    bg:           "whiteAlpha.100",
    border:       "1px solid",
    borderColor:  "whiteAlpha.200",
    color:        "white",
    borderRadius: "10px",
    _placeholder: { color: "whiteAlpha.300" },
    _hover:       { borderColor: "purple.400" },
    _focus:       {
      borderColor: "purple.400",
      boxShadow:   "0 0 0 2px rgba(167,139,250,0.2)",
      bg:          "rgba(255,255,255,0.08)",
    },
  },
  label: {
    color:      "whiteAlpha.800",
    fontSize:   "sm",
    fontWeight: "600",
  },
};

function fireConfetti(container) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:99;border-radius:inherit;";
  container.appendChild(canvas);
  canvas.width  = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const ctx = canvas.getContext("2d");
  const COLORS = ["#a78bfa","#f472b6","#34d399","#fbbf24","#60a5fa","#f87171"];
  const ps = Array.from({ length: 80 }, () => ({
    x:     canvas.width  * Math.random(),
    y:     canvas.height * 0.4 * Math.random(),
    vx:    (Math.random() - 0.5) * 4,
    vy:    -(Math.random() * 4 + 2),
    r:     Math.random() * 4 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 1,
    rot:   Math.random() * 360,
    rotV:  (Math.random() - 0.5) * 8,
  }));
  let alive = true;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ps.forEach(p => {
      p.vy += 0.12; p.x += p.vx; p.y += p.vy;
      p.rot += p.rotV; p.alpha = Math.max(0, p.alpha - 0.012);
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    });
    if (alive && ps.some(p => p.alpha > 0)) requestAnimationFrame(draw);
    else canvas.remove();
  };
  draw();
  setTimeout(() => { alive = false; }, 3000);
}

export default function CompleteProfile() {
  const [showSplash, setShowSplash] = useState(true);
  const [wizardIn,   setWizardIn]   = useState(false);
  const [step,       setStep]       = useState(0);
  const [dir,        setDir]        = useState(1);
  const [stepKey,    setStepKey]    = useState(0);
  const [form,       setForm]       = useState(INIT_FORM);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);

  const cardRef                  = useRef();
  const toast                    = useToast();
  const navigate                 = useNavigate();
  const { markProfileCompleted } = useAuth();

  const handleSplashDone = () => {
    setShowSplash(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setWizardIn(true)));
  };

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setDirect = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const goNext = () => {
    const errs = validate(step, form);
    if (hasErrors(errs)) { setErrors(errs); return; }
    setErrors({}); setDir(1);
    setStep(s => s + 1); setStepKey(k => k + 1);
  };

  const goBack = () => {
    setErrors({}); setDir(-1);
    setStep(s => s - 1); setStepKey(k => k + 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      if (step < STEPS.length - 1) goNext();
    }
  };

  const handleSubmit = async () => {
    const errs = validate(step, form);
    if (hasErrors(errs)) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        height_cm:       form.height_cm       ? Number(form.height_cm)       : undefined,
        islamic_view_id: form.islamic_view_id ? Number(form.islamic_view_id) : undefined,
        madhab_id:       form.madhab_id       ? Number(form.madhab_id)       : undefined,
        wears_hijab:     form.wears_hijab !== "" ? form.wears_hijab === "true" : undefined,
        has_beard:       form.has_beard  !== "" ? form.has_beard  === "true" : undefined,
      };
      await apiFetch("/api/profile", { method:"PUT", body:JSON.stringify(payload) });
      if (cardRef.current) fireConfetti(cardRef.current);
      markProfileCompleted();
      toast({ title:"Profile complete!", description:"Welcome! Your profile is ready.",
              status:"success", duration:3000, isClosable:true, position:"top" });
      setTimeout(() => navigate("/admin/default", { replace:true }), 1400);
    } catch (err) {
      toast({ title:"Failed to save", description:err.message||"Please try again.",
              status:"error", duration:4000, isClosable:true, position:"top" });
    } finally { setSaving(false); }
  };

  const stepProps = { form, errors, set, setDirect, sx: SX };

  const STEP_COMPONENTS = [
    <StepBasicInfo {...stepProps} />,
    <StepReligion  {...stepProps} />,
    <StepCareer    {...stepProps} />,
    <StepLocation  {...stepProps} />,
    <StepAbout     {...stepProps} />,
  ];

  if (showSplash) {
    return (
      <Flex minH="100vh" align="center" justify="center"
            bgGradient="linear(to-br, #0f0c29, #302b63, #24243e)">
        <Box w="full" maxW="680px" borderRadius="2xl" overflow="hidden">
          <WelcomeSplash onBegin={handleSplashDone} />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      minH="100vh"
      align={{ base:"flex-start", md:"center" }}
      justify="center"
      bgGradient="linear(to-br, #0f0c29, #302b63, #24243e)"
      px={{ base:0, md:4 }}
      py={{ base:0, md:10 }}
    >
      <Box
        ref={cardRef}
        w="full"
        maxW={{ base:"100%", md:"600px" }}
        minH={{ base:"100vh", md:"auto" }}
        bg="rgba(255,255,255,0.06)"
        backdropFilter="blur(18px)"
        borderRadius={{ base:0, md:"2xl" }}
        border={{ base:"none", md:"1px solid rgba(255,255,255,0.1)" }}
        boxShadow={{ base:"none", md:"0 25px 60px rgba(0,0,0,0.5)" }}
        overflow="hidden"
        position="relative"
        display="flex"
        flexDirection="column"
        opacity={wizardIn ? 1 : 0}
        transform={wizardIn ? "translateY(0)" : "translateY(40px)"}
        transition="opacity 0.6s ease, transform 0.6s ease"
      >
        <StepHeader step={step} />

        {/* Step body with slide animation */}
        <Box
          key={stepKey}
          flex={1}
          px={{ base:4, md:8 }}
          py={{ base:5, md:7 }}
          overflowY="auto"
          animation={`${dir >= 0 ? slideInRight : slideInLeft} 0.28s ease both`}
          onKeyDown={handleKeyDown}
        >
          <VStack spacing={{ base:4, md:5 }} align="stretch">
            {STEP_COMPONENTS[step]}
          </VStack>
        </Box>

        {/* Sticky footer nav on mobile */}
        <Flex
          px={{ base:4, md:8 }}
          pb={{ base:6, md:7 }}
          pt={{ base:4, md:5 }}
          justify="space-between"
          align="center"
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          bg={{ base:"rgba(15,12,41,0.95)", md:"transparent" }}
          backdropFilter={{ base:"blur(12px)", md:"none" }}
          position={{ base:"sticky", md:"relative" }}
          bottom={0}
          zIndex={10}
        >
          <Button
            variant="ghost"
            color="whiteAlpha.500"
            fontSize="sm"
            px={{ base:3, md:4 }}
            minW="72px"
            minH="44px"
            _hover={{ color:"white", bg:"whiteAlpha.100" }}
            onClick={goBack}
            isDisabled={step === 0}
          >
            ← Back
          </Button>

          <Text fontSize="12px" color="whiteAlpha.300">
            {step + 1} / {STEPS.length}
          </Text>

          {step < STEPS.length - 1 ? (
            <Button
              bgGradient="linear(to-r, purple.600, purple.400)"
              color="white"
              fontSize="sm"
              px={{ base:5, md:7 }}
              minH="44px"
              borderRadius="full"
              _hover={{
                bgGradient:"linear(to-r, purple.700, purple.500)",
                transform:"translateY(-1px)",
                boxShadow:"0 6px 20px rgba(139,92,246,0.4)",
              }}
              _active={{ transform:"translateY(0)" }}
              transition="all 0.2s"
              onClick={goNext}
            >
              Continue →
            </Button>
          ) : (
            <Button
              bgGradient="linear(to-r, green.500, teal.400)"
              color="white"
              fontSize="sm"
              px={{ base:5, md:7 }}
              minH="44px"
              borderRadius="full"
              _hover={{
                bgGradient:"linear(to-r, green.600, teal.500)",
                transform:"translateY(-1px)",
                boxShadow:"0 6px 20px rgba(16,185,129,0.35)",
              }}
              transition="all 0.2s"
              leftIcon={<Icon as={MdCheckCircle} />}
              isLoading={saving}
              loadingText="Saving..."
              onClick={handleSubmit}
            >
              Complete
            </Button>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}