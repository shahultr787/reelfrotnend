/**
 * CompleteProfile/StepCareer.jsx — Step 3
 *
 * Changes:
 *  ✅  Education: pill chips (was <Select>)
 *  ✅  Annual income: pill chips (was <Select>)
 *  ✅  FieldRow checkmarks on completed fields
 */

import { Input } from "@chakra-ui/react";
import FieldRow   from "./FieldRow";
import PillPicker from "./PillPicker";
import { EDUCATIONS, INCOMES } from "./constants";

export default function StepCareer({ form, errors, set, setDirect, sx }) {
  const { input: inputStyle } = sx;

  return (
    <>
      {/* Education — pill chips */}
      <FieldRow
        label="Education"
        valid={!!form.education}
        error={errors.education}
      >
        <PillPicker
          options={EDUCATIONS}
          value={form.education}
          onChange={(v) => setDirect("education", v)}
        />
      </FieldRow>

      {/* Profession — text input */}
      <FieldRow
        label="Profession"
        optional
        valid={form.profession?.trim().length > 1}
      >
        <Input
          placeholder="e.g. Software Engineer"
          value={form.profession}
          onChange={set("profession")}
          sx={inputStyle}
          h={{ base: "44px", md: "46px" }}
        />
      </FieldRow>

      {/* Annual income — pill chips */}
      <FieldRow label="Annual Income" optional valid={!!form.annual_income}>
        <PillPicker
          options={INCOMES}
          value={form.annual_income}
          onChange={(v) => setDirect("annual_income", v)}
        />
      </FieldRow>
    </>
  );
}