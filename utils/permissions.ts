import { UserTier } from '../store';

export const TIER_CONFIG = {
  free: {
    name: 'Spark',
    price: 'Free',
    features: [
      '5 Elements Selection',
      '10 Healing Tracks (2 per element)',
      'Basic Photo Memory',
      'Time Corridor Access'
    ]
  },
  flow: {
    name: 'Flow',
    price: '$9.99/month',
    features: [
      'All Spark Features',
      '100+ Deep Immersion Library',
      'Ancient Wisdom Interpretations',
      'Energy Trend Analysis',
      'Priority Support'
    ]
  },
  resonance: {
    name: 'Resonance',
    price: '$29.99/month',
    features: [
      'All Flow Features',
      'AI Voice Diagnosis',
      'Personalized Healing Plans',
      'Live Group Sessions',
      'Lifetime Energy Report'
    ]
  }
};

export function canAccessFeature(userTier: UserTier, feature: string): boolean {
  const tierLevels = { free: 0, flow: 1, resonance: 2 };
  const featureRequirements: Record<string, number> = {
    'ai_diagnose': 2,      // Resonance only
    'music_library': 1,    // Flow+
    'wisdom_cards': 1,     // Flow+
    'trend_chart': 1       // Flow+
  };

  return tierLevels[userTier] >= (featureRequirements[feature] || 0);
}
