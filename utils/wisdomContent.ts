import { ElementType } from '../store';

export interface WisdomContent {
  title: string;
  subtitle: string;
  preview: string;
  fullContent: string[];
}

export const WISDOM_CONTENT: Record<ElementType, WisdomContent> = {
  wood: {
    title: '木之智慧',
    subtitle: 'The Path of Growth',
    preview: 'Wood represents the Liver Meridian, embodying growth, flexibility, and the courage to reach upward like bamboo...',
    fullContent: [
      '🌲 Wood Element governs the Liver and Gallbladder meridians, associated with spring, dawn, and the color green.',
      '💚 Emotionally, Wood carries compassion, kindness, and the power of decision-making. When balanced, you feel motivated and clear-minded.',
      '⚠️ When blocked, Wood manifests as anger, frustration, or rigidity. Physical symptoms may include tension headaches, eye strain, and digestive issues.',
      '🧘 To harmonize Wood: Practice gentle stretching, spend time in nature, express emotions through journaling, and consume sour foods like lemon and vinegar.',
      '✨ Ancient wisdom says: "Bend like bamboo in the wind, yet remain rooted in your truth."'
    ]
  },
  fire: {
    title: '火之智慧',
    subtitle: 'The Path of Joy',
    preview: 'Fire represents the Heart Meridian, embodying passion, connection, and the warmth that transforms darkness into light...',
    fullContent: [
      '🔥 Fire Element governs the Heart and Small Intestine meridians, associated with summer, noon, and the color red.',
      '❤️ Emotionally, Fire carries joy, enthusiasm, and the capacity for deep connection. When balanced, you radiate warmth and authenticity.',
      '⚠️ When imbalanced, Fire manifests as anxiety, insomnia, or emotional volatility. Physical symptoms may include heart palpitations, excessive sweating, and restlessness.',
      '🧘 To harmonize Fire: Practice heart-opening meditation, cultivate meaningful relationships, laugh freely, and consume bitter foods like dark chocolate and green tea.',
      '✨ Ancient wisdom says: "The heart that knows joy can transform all suffering into light."'
    ]
  },
  earth: {
    title: '土之智慧',
    subtitle: 'The Path of Nourishment',
    preview: 'Earth represents the Spleen Meridian, embodying stability, nourishment, and the grounding force that centers all things...',
    fullContent: [
      '⛰️ Earth Element governs the Spleen and Stomach meridians, associated with late summer, afternoon, and the color yellow.',
      '💛 Emotionally, Earth carries empathy, stability, and the ability to nurture self and others. When balanced, you feel grounded and content.',
      '⚠️ When blocked, Earth manifests as worry, overthinking, or neediness. Physical symptoms may include digestive issues, fatigue, and weight fluctuations.',
      '🧘 To harmonize Earth: Practice gratitude rituals, eat mindfully, walk barefoot on natural ground, and consume sweet foods like sweet potato and dates.',
      '✨ Ancient wisdom says: "The mountain does not move, yet it supports all life upon its shoulders."'
    ]
  },
  metal: {
    title: '金之智慧',
    subtitle: 'The Path of Clarity',
    preview: 'Metal represents the Lung Meridian, embodying clarity, release, and the refinement that comes from letting go...',
    fullContent: [
      '⚡ Metal Element governs the Lung and Large Intestine meridians, associated with autumn, evening, and the color white.',
      '🤍 Emotionally, Metal carries clarity, precision, and the courage to release what no longer serves. When balanced, you breathe freely and think clearly.',
      '⚠️ When imbalanced, Metal manifests as grief, rigidity, or detachment. Physical symptoms may include respiratory issues, skin problems, and constipation.',
      '🧘 To harmonize Metal: Practice breathwork (pranayama), declutter your space, honor your boundaries, and consume pungent foods like ginger and garlic.',
      '✨ Ancient wisdom says: "Like gold refined by fire, release the impure to reveal your essential brilliance."'
    ]
  },
  water: {
    title: '水之智慧',
    subtitle: 'The Path of Flow',
    preview: 'Water represents the Kidney Meridian, embodying wisdom, adaptability, and the deep stillness from which all life springs...',
    fullContent: [
      '💧 Water Element governs the Kidney and Bladder meridians, associated with winter, night, and the color blue/black.',
      '💙 Emotionally, Water carries wisdom, willpower, and the ability to flow around obstacles. When balanced, you feel resourceful and resilient.',
      '⚠️ When blocked, Water manifests as fear, exhaustion, or rigidity. Physical symptoms may include lower back pain, bone issues, and urinary problems.',
      '🧘 To harmonize Water: Practice stillness meditation, rest deeply, honor your need for solitude, and consume salty foods like seaweed and miso.',
      '✨ Ancient wisdom says: "Water does not fight; it flows around all obstacles, yet shapes mountains over time."'
    ]
  }
};

// 获取指定元素的智慧内容
export function getWisdomForElement(element: ElementType): WisdomContent {
  return WISDOM_CONTENT[element];
}

// 获取智慧内容预览（前50字符）
export function getWisdomPreview(element: ElementType): string {
  const wisdom = WISDOM_CONTENT[element];
  return wisdom.preview.slice(0, 50) + '...';
}
