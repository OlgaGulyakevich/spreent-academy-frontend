// Header navigation links (repeated markup → data-driven)
export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
};

export const navLinks: NavLink[] = [
  { label: "About", href: "/", active: true },
  { label: "Courses", href: "/" },
  { label: "Corporate Training", href: "/" },
];
