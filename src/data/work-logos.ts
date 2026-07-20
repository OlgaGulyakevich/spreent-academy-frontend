// Company logos for the "Where Our Graduates Work" grid.
// Discriminated union: an item is EITHER a real logo (all fields) OR an empty
// grid spacer ({ empty: true }) — impossible mixes won't compile (CRITERIA-TS §4).
export type WorkLogo =
  | { empty: true }
  | {
      empty?: false;
      modifier: string; // work__logo-item--{modifier}
      icon: string; // src/icons/{icon}.svg
      label: string; // aria-label
      width: number;
      height: number;
    };

export const workLogos: WorkLogo[] = [
  { modifier: 'google', icon: 'google', label: 'Google', width: 95, height: 32 },
  { modifier: 'epam', icon: 'epam', label: 'EPAM', width: 94, height: 30 },
  { modifier: 'netflix', icon: 'netflix', label: 'Netflix', width: 122, height: 33 },
  { empty: true },
  { modifier: 'booking', icon: 'booking', label: 'Booking.com', width: 165, height: 28 },
  { modifier: 'rustore', icon: 'rustore', label: 'RuStore', width: 160, height: 41 },
  { modifier: 'mish', icon: 'mish', label: 'mish', width: 84, height: 32 },
  { modifier: 'chulakov', icon: 'chulakov', label: 'Chulakov', width: 140, height: 16 },
  { modifier: 'vcru', icon: 'vc', label: 'vc.ru', width: 48, height: 44 },
  { modifier: 'ibm', icon: 'ibm', label: 'IBM', width: 91, height: 34 },
];
