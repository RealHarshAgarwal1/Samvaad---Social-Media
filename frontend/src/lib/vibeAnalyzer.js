/**
 * Vibe Analyzer — lightweight client-side text sentiment classifier.
 *
 * Classifies text into one of four vibes:
 *   Aggressive · Wholesome · Sarcastic · Professional
 *
 * Uses weighted keyword/pattern matching with contextual boosters.
 */

const VIBE_KEYWORDS = {
  aggressive: {
    words: [
      'hate', 'angry', 'furious', 'destroy', 'kill', 'fight', 'rage', 'stupid',
      'idiot', 'shut up', 'trash', 'garbage', 'worst', 'terrible', 'awful',
      'disgusting', 'pathetic', 'loser', 'dumb', 'sick of', 'fed up', 'pissed',
      'annoyed', 'frustrated', 'toxic', 'ruthless', 'savage', 'brutal', 'smash',
      'crush', 'dominate', 'wreck', 'slam', 'roast', 'attack', 'blast', 'rant',
      'scream', 'yell', 'explode', 'burn', 'die', 'damn', 'hell', 'crap',
      'bloody', 'freaking', 'ridiculous', 'absurd', 'insane', 'mad', 'furious',
      'outraged', 'livid', 'hostile', 'vicious', 'violent', 'aggravated'
    ],
    patterns: [/!{2,}/g, /[A-Z]{3,}/g, /wtf/gi, /stfu/gi, /smh/gi],
    weight: 1.2,
  },

  wholesome: {
    words: [
      'love', 'happy', 'grateful', 'thankful', 'blessed', 'amazing', 'wonderful',
      'beautiful', 'kind', 'caring', 'sweet', 'adorable', 'precious', 'heartwarming',
      'inspire', 'inspired', 'inspiring', 'joy', 'joyful', 'peaceful', 'calm',
      'gentle', 'warm', 'hug', 'smile', 'sunshine', 'rainbow', 'dream', 'hope',
      'faith', 'family', 'friend', 'together', 'support', 'proud', 'celebrate',
      'appreciate', 'cherish', 'treasure', 'bless', 'pure', 'genuine', 'magic',
      'sparkle', 'glow', 'bloom', 'flourish', 'grow', 'heal', 'nurture',
      'comfort', 'cozy', 'delight', 'enchanting', 'lovely', 'magnificent',
      'fantastic', 'splendid', 'terrific', 'awesome', 'great', 'good vibes',
      'positivity', 'grateful', 'thankful', 'wholesome', 'heartfelt'
    ],
    patterns: [/❤|💕|💖|💗|💙|💜|🥰|😊|😍|🤗|✨|🌟|💫|🌈|🦋|🌸|🌻|💐/g, /:\)/g, /xoxo/gi],
    weight: 1.0,
  },

  sarcastic: {
    words: [
      'wow', 'sure', 'totally', 'obviously', 'clearly', 'brilliant', 'genius',
      'oh really', 'right', 'yeah right', 'as if', 'whatever', 'congrats',
      'bravo', 'slow clap', 'shocking', 'surprise', 'imagine', 'pretend',
      'supposedly', 'apparently', 'fun', 'great job', 'well done', 'perfect',
      'fantastic', 'wonderful', 'nice try', 'good luck', 'thanks a lot',
      'how nice', 'classy', 'impressive', 'remarkable', 'incredible',
      'unbelievable', 'no way', 'shocker', 'newsflash', 'plot twist',
      'big brain', 'galaxy brain', 'groundbreaking', 'revolutionary'
    ],
    patterns: [/🙄|😏|😒|💀|🤡|😂|🤣|lmao|lol|rofl/gi, /\.\.\./g, /"[^"]+"/g, /\bsuuure\b/gi, /\briiiight\b/gi, /\byeaaah\b/gi],
    weight: 1.1,
  },

  professional: {
    words: [
      'opportunity', 'experience', 'growth', 'leadership', 'innovation',
      'strategy', 'collaborate', 'synergy', 'milestone', 'achievement',
      'accomplish', 'deliver', 'execute', 'implement', 'optimize', 'streamline',
      'leverage', 'initiative', 'objective', 'stakeholder', 'metrics', 'kpi',
      'roi', 'revenue', 'productivity', 'efficiency', 'professional', 'career',
      'industry', 'market', 'business', 'enterprise', 'corporate', 'team',
      'project', 'deadline', 'workflow', 'process', 'framework', 'scalable',
      'sustainable', 'strategic', 'analytical', 'data-driven', 'results',
      'impact', 'value', 'portfolio', 'expertise', 'competency', 'mentor',
      'network', 'conference', 'summit', 'workshop', 'webinar', 'keynote',
      'thrilled', 'excited to announce', 'pleased to share', 'honored',
      'delighted', 'humbled', 'passionate about', 'committed to', 'dedicated'
    ],
    patterns: [/\b(?:Q[1-4]|FY\d{2,4})\b/gi, /\b\d+%\b/g, /#\w+/g],
    weight: 1.0,
  },
};

/**
 * Analyse a piece of text and return vibe scores.
 *
 * @param {string} text – the caption / post text to analyse
 * @returns {{ dominant: string|null, confidence: number, scores: Record<string, number> }}
 */
export function analyzeVibe(text) {
  if (!text || text.trim().length < 3) {
    return { dominant: null, confidence: 0, scores: {} };
  }

  const lower = text.toLowerCase();
  const scores = {};

  for (const [vibe, config] of Object.entries(VIBE_KEYWORDS)) {
    let score = 0;

    // Keyword matching
    for (const word of config.words) {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    // Pattern matching
    for (const pattern of config.patterns) {
      const patternCopy = new RegExp(pattern.source, pattern.flags);
      const matches = text.match(patternCopy);
      if (matches) {
        score += matches.length * 0.7;
      }
    }

    // Apply category weight
    score *= config.weight;
    scores[vibe] = Math.round(score * 100) / 100;
  }

  // Determine the dominant vibe
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    return { dominant: null, confidence: 0, scores };
  }

  const dominant = Object.entries(scores).find(([, s]) => s === maxScore)?.[0] || null;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(Math.round((maxScore / totalScore) * 100), 100) : 0;

  return { dominant, confidence, scores };
}

/**
 * Vibe display configuration — emoji, label, colours, description.
 */
export const VIBE_CONFIG = {
  aggressive: {
    emoji: '🔥',
    label: 'Aggressive',
    description: 'Your post has strong, fiery energy',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
    bgGlow: 'rgba(239, 68, 68, 0.15)',
    textColor: '#ef4444',
    particleColor: '#ef4444',
  },
  wholesome: {
    emoji: '💖',
    label: 'Wholesome',
    description: 'Spreading warmth and positivity',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6, #f9a8d4)',
    bgGlow: 'rgba(236, 72, 153, 0.15)',
    textColor: '#ec4899',
    particleColor: '#ec4899',
  },
  sarcastic: {
    emoji: '😏',
    label: 'Sarcastic',
    description: 'Dripping with witty undertones',
    gradient: 'linear-gradient(135deg, #f59e0b, #eab308, #d97706)',
    bgGlow: 'rgba(245, 158, 11, 0.15)',
    textColor: '#f59e0b',
    particleColor: '#f59e0b',
  },
  professional: {
    emoji: '💼',
    label: 'Professional',
    description: 'Polished and business-ready',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)',
    bgGlow: 'rgba(99, 102, 241, 0.15)',
    textColor: '#6366f1',
    particleColor: '#6366f1',
  },
};
