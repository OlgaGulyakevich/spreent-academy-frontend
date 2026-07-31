// Pricing content: feature list + amounts (CHF / EUR — Switzerland / EU markets).
// \u00A0 = non-breaking space — in data we use the escape, not the &nbsp; entity
// (an entity in a TS string would render as literal text). Keeps prices from
// breaking mid-number and prevents orphan words, same as the original markup.
export type PriceAmount = {
  current: string;
  old: string;
};

export const features: string[] = [
  "Lifetime access to\u00A0materials",
  "With feedback and\u00A0assignments",
  "Portfolio and resume review",
  "Start immediately or with a\u00A0group",
  "24% discount when paying in\u00A0full",
  "Certificate upon completion",
];

export const amounts: PriceAmount[] = [
  { current: "1\u00A0490\u00A0CHF", old: "1\u00A0960\u00A0CHF" }, // Switzerland, -24%
  { current: "1\u00A0390\u00A0€", old: "1\u00A0830\u00A0€" }, // EU, -24%
];
