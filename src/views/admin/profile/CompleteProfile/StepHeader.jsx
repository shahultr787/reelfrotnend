/**
 * CompleteProfile/StepHeader.jsx
 * Clean Modern Stepper UI
 */

import { Box, Flex, Text } from "@chakra-ui/react";
import { STEPS } from "./constants";

const STEP_META = [
  { icon: "👤", sub: "Tell us who you Are" },
  { icon: "🕌", sub: "Your Islamic background" },
  { icon: "🎓", sub: "Your education & work" },
  { icon: "📍", sub: "Where you call home" },
  { icon: "✨", sub: "Your story in your own words" },
];

function StepCircle({ index, currentStep }) {
  const done = index < currentStep;
  const active = index === currentStep;

  return (
    <Flex direction="column" align="center" position="relative">
      <Flex
        w="42px"
        h="42px"
        borderRadius="full"
        align="center"
        justify="center"
        fontWeight="700"
        fontSize="14px"
        transition="all .25s"
        bg={
          done
            ? "#10b981"
            : active
            ? "white"
            : "rgba(255,255,255,0.12)"
        }
        color={
          done
            ? "white"
            : active
            ? "#6d28d9"
            : "rgba(255,255,255,0.6)"
        }
        border={active ? "3px solid #c4b5fd" : "none"}
        boxShadow={active ? "0 0 0 4px rgba(255,255,255,0.15)" : "none"}
      >
        {done ? "✓" : index + 1}
      </Flex>
    </Flex>
  );
}

export default function StepHeader({ step }) {
  const meta = STEP_META[step];

  return (
    <Box
      bg="linear-gradient(135deg, #6d28d9, #8b5cf6)"
      px={{ base: 4, md: 8 }}
      py={{ base: 5, md: 6 }}
      borderBottom="1px solid rgba(255,255,255,0.1)"
    >
      {/* Stepper */}
      <Flex align="center" justify="space-between" mb={5}>
        {STEPS.map((_, i) => (
          <Flex key={i} align="center" flex="1">
            <StepCircle index={i} currentStep={step} />

            {i < STEPS.length - 1 && (
              <Box
                flex="1"
                h="2px"
                bg={
                  i < step
                    ? "#10b981"
                    : "rgba(255,255,255,0.15)"
                }
                mx="8px"
              />
            )}
          </Flex>
        ))}
      </Flex>

      {/* Step Title */}
      <Flex align="center" gap={2} mb={1}>
        <Text fontSize="20px">{meta.icon}</Text>

        <Text
          fontSize={{ base: "18px", md: "22px" }}
          fontWeight="700"
          color="white"
        >
          {STEPS[step].label}
        </Text>
      </Flex>

      {/* Subtitle */}
      <Text
        fontSize={{ base: "13px", md: "14px" }}
        color="rgba(255,255,255,0.8)"
      >
        {meta.sub}
      </Text>
    </Box>
  );
}