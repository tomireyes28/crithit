export interface PlatformDefinition {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
  iconName: string;
}

export const COMMON_PLATFORMS: PlatformDefinition[] = [
  { id: 'pc', name: 'PC (Windows / Linux / Mac)', slug: 'pc', abbreviation: 'PC', iconName: 'monitor' },
  { id: 'ps5', name: 'PlayStation 5', slug: 'ps5', abbreviation: 'PS5', iconName: 'playstation' },
  { id: 'ps4', name: 'PlayStation 4', slug: 'ps4', abbreviation: 'PS4', iconName: 'playstation' },
  { id: 'xbox-series', name: 'Xbox Series X/S', slug: 'xbox-series', abbreviation: 'XSX', iconName: 'xbox' },
  { id: 'xbox-one', name: 'Xbox One', slug: 'xbox-one', abbreviation: 'XONE', iconName: 'xbox' },
  { id: 'switch', name: 'Nintendo Switch', slug: 'nintendo-switch', abbreviation: 'NSW', iconName: 'gamepad' },
  { id: 'steam-deck', name: 'Steam Deck', slug: 'steam-deck', abbreviation: 'DECK', iconName: 'handheld' },
  { id: 'retro', name: 'Retro / Clásico', slug: 'retro', abbreviation: 'RETRO', iconName: 'disc' },
  { id: 'mobile', name: 'iOS / Android', slug: 'mobile', abbreviation: 'MOB', iconName: 'smartphone' },
];

export function findPlatformBySlug(slug: string): PlatformDefinition | undefined {
  return COMMON_PLATFORMS.find((p) => p.slug === slug);
}
