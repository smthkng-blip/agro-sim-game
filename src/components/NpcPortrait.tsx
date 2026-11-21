import React from 'react';
import type { NpcId } from '../sim/types';

interface Props {
  npcId: NpcId;
  size?: number;
  animated?: boolean;
}

export const NpcPortrait: React.FC<Props> = ({ npcId, size = 64, animated = false }) => {
  const cls = animated ? 'npc-portrait-svg animated' : 'npc-portrait-svg';

  switch (npcId) {
    case 'dr_mali':
      return (
        <svg className={cls} width={size} height={size} viewBox="0 0 72 72" aria-label="Dr. Mali">
          <defs>
            <linearGradient id="maliBg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="maliSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3c9ad" />
              <stop offset="100%" stopColor="#dfa482" />
            </linearGradient>
          </defs>
          <rect width="72" height="72" rx="16" fill="url(#maliBg2)" />
          <circle cx="56" cy="14" r="14" fill="rgba(255,255,255,0.08)" />
          {/* Lab coat & emerald scarf */}
          <path d="M12 72 C15 53, 24 49, 36 49 C48 49, 57 53, 60 72 Z" fill="#f8fafc" />
          <path d="M28 50 L36 64 L44 50" fill="#10b981" />
          <path d="M23 51 L29 66 M49 51 L43 66" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Back hair */}
          <ellipse cx="36" cy="31" rx="17" ry="16" fill="#1e293b" />
          {/* Neck & Head */}
          <rect x="31" y="42" width="10" height="9" rx="4" fill="#d89d7b" />
          <ellipse cx="36" cy="32" rx="12.5" ry="13.5" fill="url(#maliSkin)" />
          {/* Layered front hair */}
          <path d="M22 29 Q27 16 39 18 Q48 19 50 30 Q43 22 35 23 Q27 24 22 29 Z" fill="#0f172a" />
          {/* Eyes with catchlights */}
          <g className="npc-eyes">
            <circle cx="30" cy="32" r="2.1" fill="#0f172a" />
            <circle cx="42" cy="32" r="2.1" fill="#0f172a" />
            <circle cx="29.3" cy="31.3" r="0.7" fill="#ffffff" />
            <circle cx="41.3" cy="31.3" r="0.7" fill="#ffffff" />
          </g>
          {/* Glasses */}
          <rect x="25" y="28.5" width="9.5" height="7" rx="2.5" fill="rgba(255,255,255,0.12)" stroke="#1e293b" strokeWidth="1.6" />
          <rect x="37.5" y="28.5" width="9.5" height="7" rx="2.5" fill="rgba(255,255,255,0.12)" stroke="#1e293b" strokeWidth="1.6" />
          <line x1="34.5" y1="32" x2="37.5" y2="32" stroke="#1e293b" strokeWidth="1.6" />
          {/* Warm blush & smile */}
          <circle cx="27" cy="36" r="2.2" fill="#fb7185" opacity="0.32" />
          <circle cx="45" cy="36" r="2.2" fill="#fb7185" opacity="0.32" />
          <path d="M32 39 Q36 42 40 39" fill="none" stroke="#883923" strokeWidth="1.6" strokeLinecap="round" />
          {/* Botanical leaf badge */}
          <ellipse cx="50" cy="59" rx="4.5" ry="2.4" transform="rotate(-30 50 59)" fill="#22c55e" />
        </svg>
      );
    case 'uncle_somchai':
      return (
        <svg className={cls} width={size} height={size} viewBox="0 0 72 72" aria-label="Uncle Somchai">
          <defs>
            <linearGradient id="somBg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect width="72" height="72" rx="16" fill="url(#somBg2)" />
          {/* Linen shirt & plantation vest */}
          <path d="M11 72 C14 53, 24 49, 36 49 C48 49, 58 53, 61 72 Z" fill="#fef3c7" />
          <path d="M20 51 L29 72 L13 72 Z" fill="#78350f" />
          <path d="M52 51 L43 72 L59 72 Z" fill="#78350f" />
          <rect x="31" y="42" width="10" height="9" rx="4" fill="#c78757" />
          <ellipse cx="36" cy="33" rx="12.5" ry="13" fill="#df9e6e" />
          {/* Woven Straw Plantation Hat */}
          <ellipse cx="36" cy="22" rx="24" ry="5.5" fill="#f59e0b" />
          <path d="M20 22 Q36 5 52 22 Z" fill="#fbbf24" />
          <rect x="21" y="19.5" width="30" height="3" rx="1" fill="#991b1b" />
          {/* Eyes */}
          <g className="npc-eyes">
            <circle cx="30.5" cy="32" r="2" fill="#1c1917" />
            <circle cx="41.5" cy="32" r="2" fill="#1c1917" />
            <circle cx="29.9" cy="31.3" r="0.7" fill="#ffffff" />
            <circle cx="40.9" cy="31.3" r="0.7" fill="#ffffff" />
          </g>
          {/* Mustache & grin */}
          <path d="M28 38 Q36 34 44 38" stroke="#44403c" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M32 41 Q36 43.5 40 41" stroke="#7c2d12" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'nadia':
      return (
        <svg className={cls} width={size} height={size} viewBox="0 0 72 72" aria-label="Nadia">
          <defs>
            <linearGradient id="nadiaBg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect width="72" height="72" rx="16" fill="url(#nadiaBg2)" />
          {/* Merchant tunic & golden scarf */}
          <path d="M12 72 C15 53, 24 49, 36 49 C48 49, 57 53, 60 72 Z" fill="#0d9488" />
          <path d="M22 50 Q36 60 50 50 L47 59 Q36 66 25 59 Z" fill="#fbbf24" />
          <ellipse cx="36" cy="32" rx="16.5" ry="15.5" fill="#3b0764" />
          <rect x="31" y="42" width="10" height="9" rx="4" fill="#c98e68" />
          <ellipse cx="36" cy="33" rx="12" ry="13" fill="#e4ad87" />
          {/* Crimson headscarf */}
          <path d="M20 28 Q36 13 52 28 Q45 21 36 22 Q27 21 20 28 Z" fill="#f43f5e" />
          {/* Eyes */}
          <g className="npc-eyes">
            <circle cx="30.5" cy="32.5" r="2.1" fill="#1c1917" />
            <circle cx="41.5" cy="32.5" r="2.1" fill="#1c1917" />
            <circle cx="29.8" cy="31.8" r="0.7" fill="#ffffff" />
            <circle cx="40.8" cy="31.8" r="0.7" fill="#ffffff" />
          </g>
          <circle cx="27" cy="36" r="2" fill="#fb7185" opacity="0.38" />
          <circle cx="45" cy="36" r="2" fill="#fb7185" opacity="0.38" />
          <path d="M31 39 Q36 43 41 39" stroke="#883923" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Gold hoop earrings */}
          <circle cx="22.5" cy="37" r="2.6" fill="none" stroke="#fde047" strokeWidth="1.5" />
          <circle cx="49.5" cy="37" r="2.6" fill="none" stroke="#fde047" strokeWidth="1.5" />
        </svg>
      );
    case 'master_ken':
      return (
        <svg className={cls} width={size} height={size} viewBox="0 0 72 72" aria-label="Master Ken">
          <defs>
            <linearGradient id="kenBg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <rect width="72" height="72" rx="16" fill="url(#kenBg2)" />
          {/* Work shirt & leather apron */}
          <path d="M12 72 C15 53, 24 49, 36 49 C48 49, 57 53, 60 72 Z" fill="#cbd5e1" />
          <rect x="23" y="51" width="26" height="21" rx="3" fill="#92400e" />
          <rect x="28" y="58" width="16" height="8" rx="2" fill="#78350f" />
          <rect x="31" y="42" width="10" height="9" rx="4" fill="#d3a382" />
          <ellipse cx="36" cy="33" rx="12.5" ry="13" fill="#e9bc9d" />
          {/* Hair & headband */}
          <path d="M22 29 Q36 14 50 29 Z" fill="#475569" />
          <rect x="22" y="23.5" width="28" height="4" rx="2" fill="#f59e0b" />
          <g className="npc-eyes">
            <circle cx="30.5" cy="32.5" r="2" fill="#0f172a" />
            <circle cx="41.5" cy="32.5" r="2" fill="#0f172a" />
            <circle cx="29.9" cy="31.8" r="0.7" fill="#ffffff" />
            <circle cx="40.9" cy="31.8" r="0.7" fill="#ffffff" />
          </g>
          {/* Beard & hearty grin */}
          <path d="M25 37 Q36 49 47 37 Q42 42 36 42 Q30 42 25 37 Z" fill="#64748b" />
          <path d="M31 39 Q36 42 41 39" stroke="#fef3c7" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'auntie_lin':
      return (
        <svg className={cls} width={size} height={size} viewBox="0 0 72 72" aria-label="Auntie Lin">
          <defs>
            <linearGradient id="linBg2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <rect width="72" height="72" rx="16" fill="url(#linBg2)" />
          {/* Chef jacket & rose apron */}
          <path d="M12 72 C15 53, 24 49, 36 49 C48 49, 57 53, 60 72 Z" fill="#fff7ed" />
          <path d="M25 52 L47 52 L49 72 L23 72 Z" fill="#fb7185" />
          {/* Hair bun & soft hair */}
          <circle cx="36" cy="15" r="7" fill="#292524" />
          <path d="M29 18 Q36 14 43 18" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <rect x="31" y="42" width="10" height="9" rx="4" fill="#dfae8e" />
          <ellipse cx="36" cy="33" rx="12.5" ry="13" fill="#f5ccb0" />
          <path d="M22 29 Q36 16 50 29 Q43 22 36 23 Q29 22 22 29 Z" fill="#292524" />
          <g className="npc-eyes">
            <circle cx="30.5" cy="32.5" r="2.1" fill="#1c1917" />
            <circle cx="41.5" cy="32.5" r="2.1" fill="#1c1917" />
            <circle cx="29.8" cy="31.8" r="0.7" fill="#ffffff" />
            <circle cx="40.8" cy="31.8" r="0.7" fill="#ffffff" />
          </g>
          <circle cx="26.5" cy="36" r="2.5" fill="#fda4af" opacity="0.65" />
          <circle cx="45.5" cy="36" r="2.5" fill="#fda4af" opacity="0.65" />
          <path d="M30.5 39 Q36 43.5 41.5 39" stroke="#9f1239" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
};
