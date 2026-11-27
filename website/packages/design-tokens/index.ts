/** Platform-neutral brand values. Keep DOM/CSS and React Native adapters separate. */
export const tokens = {
  color: { background: '#21151f', surface: '#30212d', surfaceRaised: '#3c2b35', ink: '#f6eddc', muted: '#c5b3b9', accent: '#d7a98a', line: '#69505c', dark: '#21151f' },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, section: 80 },
  radius: { small: 12, card: 24, pill: 999 },
  type: { body: 16, small: 13, label: 11, title: 48, display: 88 },
  motion: { quick: 180, reveal: 700, orbit: 28000, ease: [0.22, 1, 0.36, 1] },
  accessibility: { minimumTarget: 44 },
} as const;
