// The home header changes colour with the time of day (littlekart.com, DECISIONS D-40).
// Hours are the phone's local time. Values copied from the site's code.

export type HeaderIcon = 'sunrise' | 'sunny' | 'evening' | 'night';

export interface HeaderTheme {
  /** Linear gradient at 135°, as [color, position] stops. */
  gradient: readonly (readonly [string, number])[];
  /** Small white "stars" drawn over the night gradient: [x%, y%, radius, alpha, glow colour]. */
  stars?: readonly (readonly [number, number, number, number, string])[];
  borderColor: string;
  /** Text and icon colour. */
  accent: string;
  searchBorder: string;
  searchShadow: string;
  searchText: string;
  searchPlaceholder: string;
  /** The search pill is translucent at night and #f7f7f7 otherwise. */
  searchFill: string;
  searchOutline: string;
  /** Search and mic icon colours. */
  searchIcon: string;
  micIcon: string;
  icon: HeaderIcon;
  night: boolean;
}

const day = { searchFill: '#f7f7f7', searchOutline: '#e1e1e1', searchIcon: '#222831', micIcon: '#444444', night: false } as const;

const morning: HeaderTheme = {
  ...day,
  gradient: [['#fff2d7', 0], ['#ffd9a8', 0.52], ['#ffc78f', 1]],
  borderColor: 'rgba(245, 158, 11, 0.24)',
  accent: '#8a4b12',
  searchBorder: 'rgba(245, 158, 11, 0.28)',
  searchShadow: '0px 10px 24px rgba(245, 158, 11, 0.15)',
  searchText: '#7c4a12',
  searchPlaceholder: '#b07a3a',
  icon: 'sunrise',
};

const afternoon: HeaderTheme = {
  ...day,
  gradient: [['#e8f6ff', 0], ['#cfeeff', 0.5], ['#bde3ff', 1]],
  borderColor: 'rgba(59, 130, 246, 0.22)',
  accent: '#114a7a',
  searchBorder: 'rgba(59, 130, 246, 0.26)',
  searchShadow: '0px 10px 24px rgba(59, 130, 246, 0.14)',
  searchText: '#114a7a',
  searchPlaceholder: '#4f7ca1',
  icon: 'sunny',
};

const evening: HeaderTheme = {
  ...day,
  gradient: [['#ffe5cf', 0], ['#ffd0be', 0.45], ['#edd8ff', 1]],
  borderColor: 'rgba(168, 85, 247, 0.2)',
  accent: '#6f3b94',
  searchBorder: 'rgba(168, 85, 247, 0.24)',
  searchShadow: '0px 10px 24px rgba(168, 85, 247, 0.14)',
  searchText: '#6f3b94',
  searchPlaceholder: '#9160b0',
  icon: 'evening',
};

const night: HeaderTheme = {
  gradient: [['#314a7d', 0], ['#3f63a5', 0.48], ['#5b7fc1', 1]],
  stars: [
    [12, 18, 2, 0.45, 'rgb(255, 245, 190)'],
    [28, 38, 1.5, 0.38, 'rgb(255, 255, 255)'],
    [74, 24, 1.5, 0.32, 'rgb(255, 255, 255)'],
    [88, 58, 1, 0.28, 'rgb(255, 255, 255)'],
  ],
  borderColor: 'rgba(219, 234, 254, 0.34)',
  accent: '#f8fbff',
  searchBorder: 'rgba(255, 255, 255, 0.46)',
  searchShadow: '0px 12px 28px rgba(30, 64, 175, 0.22)',
  searchText: '#f5f7fa',
  searchPlaceholder: '#edf4ff',
  searchFill: 'rgba(255, 255, 255, 0.14)',
  searchOutline: 'rgba(255, 255, 255, 0.46)',
  searchIcon: '#f5f7fa',
  micIcon: '#f5f7fa',
  icon: 'night',
  night: true,
};

/** 6–12 morning, 12–16 afternoon, 16–19 evening, otherwise night. */
export function headerThemeFor(hour: number): HeaderTheme {
  if (hour >= 6 && hour < 12) return morning;
  if (hour >= 12 && hour < 16) return afternoon;
  if (hour >= 16 && hour < 19) return evening;
  return night;
}

export type GreetingKey = 'morning' | 'afternoon' | 'evening' | 'lateNight';

/** The greeting uses different hours from the colours: 5–12, 12–17, 17–21, otherwise "Late-night delivery". */
export function greetingFor(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'lateNight';
}
