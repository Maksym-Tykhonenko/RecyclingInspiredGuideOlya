export const ROUTES = {
  Launch: 'Launch',
  Onboarding: 'Onboarding',
  Menu: 'Menu',
  Settings: 'Settings',

  ArticlesPaper: 'ArticlesPaper',
  QuizIntro: 'QuizIntro',

  MiniGameIntroNotChosenContainer: 'MiniGameIntroNotChosenContainer',
  MiniGamePlay: 'MiniGamePlay',

  PointsExchangeArticles: 'PointsExchangeArticles',
  AchievementsAllLocked: 'AchievementsAllLocked',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];