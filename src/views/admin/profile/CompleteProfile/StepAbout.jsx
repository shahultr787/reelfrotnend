/**
 * CompleteProfile/StepAbout.jsx — Step 5
 *
 * Changes:
 *  ✅  FieldRow wrapping for consistent label style
 *  ✅  Richer summary grid — shows all filled fields, not just 6
 *  ✅  Character count changes color as user approaches 500
 *  ✅  Mobile: summary grid single-column on small screens
 */

import {
  Box, SimpleGrid, Text, Textarea, HStack, Badge,
} from "@chakra-ui/react";
import FieldRow from "./FieldRow";
import { ISLAMIC_VIEWS } from "./constants";

export default function StepAbout({ form, errors, set, sx }) {
  const { input: inputStyle } = sx;

  const charCount = form.about_me?.length || 0;
  const charColor = charCount > 450 ? "orange.300" : charCount > 490 ? "red.400" : "whiteAlpha.400";

  /* Build summary from every filled field */
  const summaryItems = [
    ["Name",      form.full_name],
    ["Gender",    form.gender],
    ["Marital",   form.marital_status],
    ["Country",   form.country],
    ["City",      form.city],
    ["Faith",     ISLAMIC_VIEWS.find(v => String(v.id) === String(form.islamic_view_id))?.label],
    ["Madhab",    form.madhab_id ? ISLAMIC_VIEWS.find(v => String(v.id) === String(form.madhab_id))?.label : undefined],
    ["Education", form.education],
    ["Profession",form.profession],
    ["Prayer",    form.prayer_frequency],
  ].filter(([, v]) => v);

  return (
    <>
      <FieldRow
        label="About Me"
        optional
        valid={charCount > 10}
        error={errors.about_me}
      >
        <Textarea
          placeholder="Write a few lines about yourself, your values, what you're looking for in a partner..."
          value={form.about_me}
          onChange={set("about_me")}
          rows={5}
          resize="vertical"
          maxLength={500}
          sx={inputStyle}
          fontSize={{ base: "14px", md: "14px" }}
          lineHeight="1.65"
        />
        <HStack justify="flex-end" mt={1}>
          <Text fontSize="11px" color={charColor}>
            {charCount} / 500
          </Text>
        </HStack>
      </FieldRow>

      {/* Profile summary */}
      {summaryItems.length > 0 && (
        <Box
          bg="rgba(167,139,250,0.07)"
          border="1px solid rgba(167,139,250,0.18)"
          borderRadius="16px"
          p={{ base: 4, md: 5 }}
        >
          <Text
            fontSize="10px"
            color="purple.300"
            fontWeight="700"
            letterSpacing="0.7px"
            mb={3}
          >
            PROFILE SUMMARY
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
            {summaryItems.map(([k, v]) => (
              <HStack key={k} spacing={2} align="flex-start">
                <Badge
                  colorScheme="purple"
                  fontSize="9px"
                  px={2}
                  py="3px"
                  borderRadius="full"
                  flexShrink={0}
                  mt="1px"
                >
                  {k}
                </Badge>
                <Text fontSize="13px" color="whiteAlpha.800" lineHeight="1.4">
                  {v}
                </Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </>
  );
}