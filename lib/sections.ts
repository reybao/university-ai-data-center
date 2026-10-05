export const sections = [
  { slug: "ic-memo", label: "Decision", number: "01", question: "What should the investment committee approve now?" },
  { slug: "demand", label: "Demand", number: "02", question: "Does demand support a 25 MW facility?" },
  { slug: "strategy", label: "Strategy", number: "03", question: "Build, rent, or phase a hybrid model?" },
  { slug: "location", label: "Location", number: "04", question: "Why this country and which region should be tested?" },
  { slug: "architecture", label: "Physical Design", number: "05", question: "What must shortlisted sites physically support?" },
  { slug: "economics", label: "Economics", number: "06", question: "What does the ten-year investment case cost?" },
  { slug: "scenario-lab", label: "Scenarios", number: "07", question: "Which assumptions can change the recommendation?" },
  { slug: "evidence", label: "Evidence", number: "08", question: "What is verified, assumed, calculated, or still unknown?" },
] as const;
