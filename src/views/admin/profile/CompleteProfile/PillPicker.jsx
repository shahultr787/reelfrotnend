/**
 * CompleteProfile/PillPicker.jsx
 *
 * Replaces <Select> dropdowns with tappable pill chips.
 * Much better on mobile — large touch targets, no native dropdown sheet.
 *
 * Props:
 *   options   — string[] or { value, label }[]
 *   value     — currently selected value (string)
 *   onChange  — (value: string) => void
 *   sx        — optional extra Flex sx
 */

import { Box, Flex, Text } from "@chakra-ui/react";

export default function PillPicker({ options, value, onChange, sx = {} }) {
  return (
    <Flex flexWrap="wrap" gap={2} sx={sx}>
      {options.map((opt) => {
        const val   = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const sel   = value === val;

        return (
          <Box
            key={val}
            as="button"
            type="button"
            onClick={() => onChange(sel ? "" : val)}
            px={{ base: 3, md: 4 }}
            py={{ base: "8px", md: "9px" }}
            borderRadius="full"
            border="1px solid"
            borderColor={sel ? "purple.400" : "whiteAlpha.200"}
            bg={sel ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.05)"}
            color={sel ? "purple.200" : "whiteAlpha.600"}
            fontSize={{ base: "13px", md: "14px" }}
            fontWeight={sel ? "500" : "400"}
            cursor="pointer"
            transition="all 0.18s"
            _hover={{
              borderColor: "purple.400",
              color:        "purple.200",
              bg:           "rgba(167,139,250,0.1)",
            }}
            _active={{ transform: "scale(0.96)" }}
            whiteSpace="nowrap"
            minH="36px"          /* minimum touch target */
          >
            {label}
          </Box>
        );
      })}
    </Flex>
  );
}