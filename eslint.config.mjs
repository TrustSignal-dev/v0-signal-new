import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      "app/docs/_motion.tsx",
      "components/landing/evidence-flow-marquee-section.tsx",
      "components/landing/hero-section.tsx",
      "components/landing/metrics-section.tsx",
      "components/landing/testimonials-section.tsx",
      "components/ui/sidebar.tsx",
    ],
  },
];

export default config;
