/**
 * CompleteProfile/constants.js
 * All static option lists in one place.
 * To add/remove options, only edit this file.
 */

export const STEPS = [
  { label: "Basic Info" },
  { label: "Religion"   },
  { label: "Career"     },
  { label: "Location"   },
  { label: "About Me"   },
];

export const GENDERS        = ["Male", "Female"];
export const MARITAL_STATUS = ["Single", "Divorced", "Widowed"];

export const TONGUES = [
  "Arabic", "Urdu", "English", "Malayalam",
  "Hindi", "Tamil", "Bengali", "Turkish", "Other",
];

export const ISLAMIC_VIEWS = [
  { id: 1, label: "Sunni"  },
  { id: 2, label: "Shia"   },
  { id: 3, label: "Salafi" },
  { id: 4, label: "Sufi"   },
  { id: 5, label: "Other"  },
];

export const MADHABS = [
  { id: 1, label: "Hanafi"   },
  { id: 2, label: "Maliki"   },
  { id: 3, label: "Shafi'i"  },
  { id: 4, label: "Hanbali"  },
  { id: 5, label: "N/A"      },
];

export const RELIGIOUS_LEVELS = [
  "Very Religious",
  "Practicing",
  "Moderately Religious",
  "Cultural Muslim",
];

export const PRAYER_FREQ = [
  "Five times daily",
  "Most prayers",
  "Friday prayers",
  "Occasionally",
  "Rarely",
];

export const EDUCATIONS = [
  "High School", "Diploma", "Bachelor's",
  "Master's", "PhD", "Islamic Studies", "Other",
];

export const INCOMES = [
  "< $10,000", "$10,000–$30,000", "$30,000–$60,000",
  "$60,000–$100,000", "> $100,000", "Prefer not to say",
];

export const INIT_FORM = {
  full_name:        "",
  date_of_birth:    "",
  gender:           "",
  marital_status:   "",
  height_cm:        "",
  mother_tongue:    "",
  islamic_view_id:  "",
  madhab_id:        "",
  religious_level:  "",
  prayer_frequency: "",
  wears_hijab:      "",
  has_beard:        "",
  education:        "",
  profession:       "",
  annual_income:    "",
  country:          "",
  state:            "",
  city:             "",
  about_me:         "",
};
