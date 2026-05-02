export const VIEW_KEYS = {
  LANDING: 'landing',
  LOGIN: 'login',
  SIGNUP: 'signup',
  ONBOARDING: 'onboarding',
  HOME: 'home',
  PEOPLE: 'people',
  INBOX: 'inbox',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  EXPLORE: 'explore',
  HELP: 'help',
  COACHING: 'coaching',
  TERMS: 'terms',
  PRIVACY: 'privacy',
  UPGRADE: 'upgrade',
  ADMIN: 'admin'
} as const;

export type AppView = (typeof VIEW_KEYS)[keyof typeof VIEW_KEYS];
