/**
 * CompleteProfile/validation.js
 * Pure functions — no React, no side effects.
 * Easy to unit test independently.
 */

export const validate = (step, form) => {
  const errs = {};

  if (step === 0) {
    if (!form.full_name?.trim())
      errs.full_name = "Full name is required.";

    if (!form.date_of_birth)
      errs.date_of_birth = "Date of birth is required.";

    // Must be at least 18 years old
    if (form.date_of_birth) {
      const age = getAge(form.date_of_birth);
      if (age < 18)
        errs.date_of_birth = "You must be at least 18 years old.";
    }

    if (!form.gender)
      errs.gender = "Gender is required.";

    if (!form.marital_status)
      errs.marital_status = "Marital status is required.";
  }

  if (step === 2) {
    if (!form.education)
      errs.education = "Education is required.";
  }

  if (step === 3) {
    if (!form.country?.trim())  errs.country = "Country is required.";
    if (!form.state?.trim())    errs.state   = "State is required.";
    if (!form.city?.trim())     errs.city    = "City is required.";
  }

  if (step === 4) {
    if (form.about_me?.length > 500)
      errs.about_me = "About me must be 500 characters or less.";
  }

  return errs;
};

const getAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const hasErrors = (errs) => Object.keys(errs).length > 0;
