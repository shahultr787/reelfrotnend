/**
 * CompleteProfile/StepLocation.jsx — Step 4
 *
 * Changes:
 *  ✅  FieldRow checkmarks on all three required fields
 *  ✅  Mobile: SimpleGrid 2-col on md+, single col on mobile
 *  ✅  Larger touch targets (44px height)
 */

import { Input, SimpleGrid } from "@chakra-ui/react";
import FieldRow from "./FieldRow";

export default function StepLocation({ form, errors, set, sx }) {
  const { input: inputStyle } = sx;

  return (
    <>
      <FieldRow
        label="Country"
        valid={form.country?.trim().length > 1}
        error={errors.country}
      >
        <Input
          placeholder="e.g. India"
          value={form.country}
          onChange={set("country")}
          sx={inputStyle}
          h={{ base: "44px", md: "46px" }}
        />
      </FieldRow>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FieldRow
          label="State / Province"
          valid={form.state?.trim().length > 1}
          error={errors.state}
          mb={0}
        >
          <Input
            placeholder="e.g. Kerala"
            value={form.state}
            onChange={set("state")}
            sx={inputStyle}
            h={{ base: "44px", md: "46px" }}
          />
        </FieldRow>

        <FieldRow
          label="City"
          valid={form.city?.trim().length > 1}
          error={errors.city}
          mb={0}
        >
          <Input
            placeholder="e.g. Kochi"
            value={form.city}
            onChange={set("city")}
            sx={inputStyle}
            h={{ base: "44px", md: "46px" }}
          />
        </FieldRow>
      </SimpleGrid>
    </>
  );
}