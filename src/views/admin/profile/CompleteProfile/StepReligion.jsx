/**
 * CompleteProfile/StepReligion.jsx — Step 2
 *
 * Changes:
 *  ✅  All <Select> replaced with PillPicker chips
 *  ✅  wears_hijab / has_beard: visual toggle cards instead of radio buttons
 *  ✅  islamic_view + madhab: side-by-side pill columns on tablet+, stacked on mobile
 *  ✅  FieldRow checkmarks on every completed field
 */

import { Box,  SimpleGrid, Text } from "@chakra-ui/react";
import { keyframes } from "@chakra-ui/react";
import FieldRow   from "./FieldRow";
import PillPicker from "./PillPicker";
import {
  TONGUES, ISLAMIC_VIEWS, MADHABS, RELIGIOUS_LEVELS, PRAYER_FREQ,
} from "./constants";

const popIn = keyframes`
  0%   { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1);    opacity: 1; }
`;

function ToggleCard({ icon, label, selected, onClick }) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      py={4}
      px={3}
      borderRadius="14px"
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
      <Text fontSize="22px" mb="6px" role="img" aria-label={label}>{icon}</Text>
      <Text
        fontSize="13px"
        fontWeight={selected ? "600" : "400"}
        color={selected ? "purple.200" : "whiteAlpha.600"}
      >
        {label}
      </Text>
    </Box>
  );
}

export default function StepReligion({ form, set, setDirect, sx }) {
  return (
    <>
      {/* Mother tongue */}
      <FieldRow label="Mother Tongue" optional valid={!!form.mother_tongue}>
        <PillPicker
          options={TONGUES}
          value={form.mother_tongue}
          onChange={(v) => setDirect("mother_tongue", v)}
        />
      </FieldRow>

      {/* Islamic view + Madhab — side by side on md+, stacked on mobile */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={5}>
        <FieldRow label="Islamic View" optional valid={!!form.islamic_view_id} mb={0}>
          <PillPicker
            options={ISLAMIC_VIEWS.map(v => ({ value: String(v.id), label: v.label }))}
            value={String(form.islamic_view_id)}
            onChange={(v) => setDirect("islamic_view_id", v)}
          />
        </FieldRow>

        <FieldRow label="Madhab" optional valid={!!form.madhab_id} mb={0}>
          <PillPicker
            options={MADHABS.map(m => ({ value: String(m.id), label: m.label }))}
            value={String(form.madhab_id)}
            onChange={(v) => setDirect("madhab_id", v)}
          />
        </FieldRow>
      </SimpleGrid>

      {/* Religious level */}
      <FieldRow label="Religious Level" optional valid={!!form.religious_level}>
        <PillPicker
          options={RELIGIOUS_LEVELS}
          value={form.religious_level}
          onChange={(v) => setDirect("religious_level", v)}
        />
      </FieldRow>

      {/* Prayer frequency */}
      <FieldRow label="Prayer Frequency" optional valid={!!form.prayer_frequency}>
        <PillPicker
          options={PRAYER_FREQ}
          value={form.prayer_frequency}
          onChange={(v) => setDirect("prayer_frequency", v)}
        />
      </FieldRow>

      {/* Hijab toggle — Female only */}
      {form.gender === "Female" && (
        <FieldRow label="Do you wear Hijab?" optional valid={form.wears_hijab !== ""}>
          <SimpleGrid columns={2} spacing={3}>
            <ToggleCard icon="🧕" label="Yes"
              selected={form.wears_hijab === "true"}
              onClick={() => setDirect("wears_hijab", form.wears_hijab === "true" ? "" : "true")} />
            <ToggleCard icon="❌" label="No"
              selected={form.wears_hijab === "false"}
              onClick={() => setDirect("wears_hijab", form.wears_hijab === "false" ? "" : "false")} />
          </SimpleGrid>
        </FieldRow>
      )}

      {/* Beard toggle — Male only */}
      {form.gender === "Male" && (
        <FieldRow label="Do you have a beard?" optional valid={form.has_beard !== ""}>
          <SimpleGrid columns={2} spacing={3}>
            <ToggleCard icon="🧔" label="Yes"
              selected={form.has_beard === "true"}
              onClick={() => setDirect("has_beard", form.has_beard === "true" ? "" : "true")} />
            <ToggleCard icon="✂️" label="No"
              selected={form.has_beard === "false"}
              onClick={() => setDirect("has_beard", form.has_beard === "false" ? "" : "false")} />
          </SimpleGrid>
        </FieldRow>
      )}
    </>
  );
}