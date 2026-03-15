/**
 * CompleteProfile/StepBasicInfo.jsx — Step 1
 *
 * Changes:
 *  ✅  Gender: visual card picker (Male / Female) instead of <Select>
 *  ✅  Marital status: pill chips instead of <Select>
 *  ✅  Full name / DOB: green checkmark micro-animation via FieldRow
 *  ✅  Mobile: SimpleGrid replaced with single-column stack on small screens
 */

import { Box, Flex, Input, SimpleGrid, Text } from "@chakra-ui/react";
import { keyframes } from "@chakra-ui/react";
import FieldRow    from "./FieldRow";
import PillPicker  from "./PillPicker";
import { GENDERS, MARITAL_STATUS } from "./constants";

const popIn = keyframes`
  0%   { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
`;

function GenderCard({ value, icon, label, selected, onClick }) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      py={{ base: 4, md: 5 }}
      px={3}
      borderRadius="16px"
      border="1.5px solid"
      borderColor={selected ? "purple.400" : "whiteAlpha.200"}
      bg={selected ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.04)"}
      textAlign="center"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: "purple.400", bg: "rgba(167,139,250,0.1)" }}
      _active={{ transform: "scale(0.97)" }}
      animation={selected ? `${popIn} 0.2s ease` : undefined}
      w="100%"
    >
      <Text fontSize={{ base: "26px", md: "30px" }} mb={1} role="img" aria-label={label}>
        {icon}
      </Text>
      <Text
        fontSize={{ base: "13px", md: "14px" }}
        fontWeight={selected ? "600" : "400"}
        color={selected ? "purple.200" : "whiteAlpha.600"}
      >
        {label}
      </Text>
    </Box>
  );
}

export default function StepBasicInfo({ form, errors, set, setDirect, sx }) {
  const { input: inputStyle } = sx;

  return (
    <>
      {/* Full name */}
      <FieldRow
        label="Full Name"
        valid={form.full_name?.trim().length > 1}
        error={errors.full_name}
      >
        <Input
          placeholder="Your full name"
          value={form.full_name}
          onChange={set("full_name")}
          sx={inputStyle}
          h={{ base: "44px", md: "46px" }}
        />
      </FieldRow>

      {/* Date of birth */}
      <FieldRow
        label="Date of Birth"
        valid={!!form.date_of_birth}
        error={errors.date_of_birth}
      >
        <Input
          type="date"
          value={form.date_of_birth}
          onChange={set("date_of_birth")}
          sx={inputStyle}
          h={{ base: "44px", md: "46px" }}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
            .toISOString().split("T")[0]}
        />
      </FieldRow>

      {/* Gender — visual cards */}
      <FieldRow
        label="Gender"
        valid={!!form.gender}
        error={errors.gender}
      >
        <SimpleGrid columns={2} spacing={3}>
          <GenderCard
            value="Male" icon="👨" label="Male"
            selected={form.gender === "Male"}
            onClick={() => setDirect("gender", form.gender === "Male" ? "" : "Male")}
          />
          <GenderCard
            value="Female" icon="👩" label="Female"
            selected={form.gender === "Female"}
            onClick={() => setDirect("gender", form.gender === "Female" ? "" : "Female")}
          />
        </SimpleGrid>
      </FieldRow>

      {/* Marital status — pill chips */}
      <FieldRow
        label="Marital Status"
        valid={!!form.marital_status}
        error={errors.marital_status}
      >
        <PillPicker
          options={MARITAL_STATUS}
          value={form.marital_status}
          onChange={(v) => setDirect("marital_status", v)}
        />
      </FieldRow>

      {/* Height — optional text input */}
      <FieldRow
        label="Height (cm)"
        optional
        valid={form.height_cm > 0}
      >
        <Input
          type="number"
          placeholder="e.g. 170"
          value={form.height_cm}
          onChange={set("height_cm")}
          min={100}
          max={250}
          sx={inputStyle}
          h={{ base: "44px", md: "46px" }}
          w={{ base: "100%", md: "200px" }}
        />
      </FieldRow>
    </>
  );
}