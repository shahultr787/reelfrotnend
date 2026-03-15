/**
 * CompleteProfile/FieldRow.jsx
 *
 * Wrapper for a single form field. Shows a green animated checkmark
 * next to the label when the field has a valid value — instant feedback
 * that the user has completed this field without any error message.
 *
 * Props:
 *   label     — string (shown uppercase)
 *   optional  — bool (shows "— optional" badge)
 *   valid     — bool (controls checkmark visibility)
 *   error     — string | undefined
 *   children  — the input / PillPicker / etc.
 */

import { Box, Flex, Text, FormControl, FormErrorMessage } from "@chakra-ui/react";
import { keyframes } from "@chakra-ui/react";

const popIn = keyframes`
  0%   { transform: scale(0);   opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
`;

export default function FieldRow({ label, optional, valid, error, children, mb = 5 }) {
  return (
    <FormControl isInvalid={!!error} mb={mb}>
      <Flex align="center" gap={2} mb={2}>
        <Text
          fontSize="11px"
          fontWeight="700"
          color="rgba(196,181,253,0.85)"
          letterSpacing="0.6px"
          textTransform="uppercase"
        >
          {label}
        </Text>

        {optional && (
          <Text fontSize="10px" color="whiteAlpha.400" fontWeight="400">
            — optional
          </Text>
        )}

        {/* Green checkmark — pops in when field is valid */}
        {valid && (
          <Box
            w="16px"
            h="16px"
            borderRadius="full"
            bg="#10b981"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="9px"
            color="white"
            flexShrink={0}
            animation={`${popIn} 0.3s ease both`}
          >
            ✓
          </Box>
        )}
      </Flex>

      {children}

      {error && (
        <FormErrorMessage fontSize="12px" mt={1}>{error}</FormErrorMessage>
      )}
    </FormControl>
  );
}