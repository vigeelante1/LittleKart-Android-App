import type { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorToken } from '@/theme';
import { strings } from '@/strings';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export interface ProfileMenuItem {
  /** Last part of the route (/profile/<path>), as on littlekart.com. */
  path: string;
  label: string;
  icon: IconName;
  tone: { bg: ColorToken; fg: ColorToken };
}

const tone = (name: 'Green' | 'Blue' | 'Orange' | 'Violet' | 'Rose' | 'Teal' | 'Cyan' | 'Sky') => ({
  bg: `tone${name}Bg` as ColorToken,
  fg: `tone${name}` as ColorToken,
});

/** "Account" rows (littlekart.com profile page, same order, icons and colours). */
export const ACCOUNT_ITEMS: ProfileMenuItem[] = [
  { path: 'orders', label: strings.profile.orders, icon: 'shopping-bag', tone: tone('Green') },
  { path: 'saved-addresses', label: strings.profile.savedAddresses, icon: 'location-on', tone: tone('Blue') },
  { path: 'egift-cards', label: strings.profile.giftCards, icon: 'card-giftcard', tone: tone('Orange') },
  { path: 'refer-a-friend', label: strings.profile.refer, icon: 'group-add', tone: tone('Violet') },
  { path: 'account-privacy', label: strings.profile.privacy, icon: 'lock', tone: tone('Rose') },
  { path: 'help', label: strings.profile.help, icon: 'help-outline', tone: tone('Teal') },
];

/** "More" rows. Rate and Share act directly instead of opening a page. */
export const MORE_ITEMS: ProfileMenuItem[] = [
  { path: 'about-us', label: strings.profile.about, icon: 'info', tone: tone('Cyan') },
  { path: 'rate-app', label: strings.profile.rate, icon: 'star', tone: tone('Orange') },
  { path: 'share', label: strings.profile.share, icon: 'share', tone: tone('Sky') },
];

export function menuItem(path: string): ProfileMenuItem | undefined {
  return [...ACCOUNT_ITEMS, ...MORE_ITEMS].find((i) => i.path === path);
}

/** The live app's store and web links (used by "Rate the App" and "Share the App"). */
export const APP_LINKS = {
  android: 'https://play.google.com/store/apps/details?id=com.littlekart.shoppingcart&pcampaignid=web_share',
  ios: 'https://apps.apple.com/us/app/littlekart/id6757442090',
  web: 'https://littlekart.com',
} as const;
