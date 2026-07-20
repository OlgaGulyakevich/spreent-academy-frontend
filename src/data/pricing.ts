// Pricing content: feature list + amounts (RUB / KZT).
// \u00A0 = non-breaking space — in data we use the escape, not the &nbsp; entity
// (an entity in a TS string would render as literal text). Keeps prices from
// breaking mid-number and prevents orphan words, same as the original markup.
export type PriceAmount = {
  current: string;
  old: string;
};

export const features: string[] = [
  'Lifetime access to\u00A0materials',
  'With feedback and\u00A0assignments',
  'Portfolio and resume review',
  'Start immediately or with a\u00A0group',
  '24% discount when paying in\u00A0full',
  'Certificate upon completion',
];

export const amounts: PriceAmount[] = [
  { current: '83\u00A0890\u00A0₽', old: '110\u00A0388\u00A0₽' },
  { current: '419\u00A0000\u00A0₸', old: '552\u00A0000\u00A0₸' },
];
