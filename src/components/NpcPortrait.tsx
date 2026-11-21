import React from 'react';
import type { NpcId } from '../sim/types';

interface Props {
  npcId: NpcId;
  size?: number;
}

export const NpcPortrait: React.FC<Props> = ({ npcId, size = 64 }) => {
  switch (npcId) {
    case 'dr_mali':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Dr. Mali">
          <defs>
            <linearGradient id="maliBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#maliBg)" />
          {/* Lab coat */}
          <path d="M12 64 C14 48, 22 44, 32 44 C42 44, 50 48, 52 64 Z" fill="#f8fafc" />
          <path d="M26 45 L32 56 L38 45" fill="#10b981" />
          {/* Hair & Head */}
          <circle cx="32" cy="27" r="14" fill="#1e293b" />
          <circle cx="32" cy="29" r="11" fill="#e6b89c" />
          {/* Glasses */}
          <rect x="22" y="25" width="8" height="6" rx="2" fill="none" stroke="#0f172a" strokeWidth="1.6" />
          <rect x="34" y="25" width="8" height="6" rx="2" fill="none" stroke="#0f172a" strokeWidth="1.6" />
          <line x1="30" y1="28" x2="34" y2="28" stroke="#0f172a" strokeWidth="1.6" />
          <circle cx="26" cy="28" r="1.4" fill="#0f172a" />
          <circle cx="38" cy="28" r="1.4" fill="#0f172a" />
          {/* Smile */}
          <path d="M28 34 Q32 37 36 34" fill="none" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
          {/* Leaf pin */}
          <ellipse cx="44" cy="52" rx="4" ry="2.2" transform="rotate(-30 44 52)" fill="#22c55e" />
        </svg>
      );
    case 'uncle_somchai':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Uncle Somchai">
          <defs>
            <linearGradient id="somBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#somBg)" />
          {/* Shirt & vest */}
          <path d="M10 64 C13 48, 22 44, 32 44 C42 44, 51 48, 54 64 Z" fill="#fef3c7" />
          <path d="M18 46 L26 64 L12 64 Z" fill="#78350f" />
          <path d="M46 46 L38 64 L52 64 Z" fill="#78350f" />
          {/* Face */}
          <circle cx="32" cy="30" r="11" fill="#d99b6c" />
          {/* Straw Plantation Hat */}
          <ellipse cx="32" cy="20" rx="20" ry="5" fill="#f59e0b" />
          <path d="M19 20 Q32 6 45 20 Z" fill="#fbbf24" />
          <rect x="20" y="18" width="24" height="2.5" fill="#991b1b" />
          {/* Eyes & Mustache */}
          <circle cx="27" cy="29" r="1.5" fill="#1c1917" />
          <circle cx="37" cy="29" r="1.5" fill="#1c1917" />
          <path d="M26 34 Q32 31 38 34" stroke="#44403c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M29 36 Q32 38 35 36" stroke="#7c2d12" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'nadia':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Nadia">
          <defs>
            <linearGradient id="nadiaBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#nadiaBg)" />
          {/* Merchant scarf & tunic */}
          <path d="M12 64 C15 47, 22 44, 32 44 C42 44, 49 47, 52 64 Z" fill="#0d9488" />
          <path d="M20 45 Q32 54 44 45 L41 53 Q32 59 23 53 Z" fill="#fbbf24" />
          {/* Hair & Headscarf */}
          <circle cx="32" cy="28" r="14" fill="#3b0764" />
          <circle cx="32" cy="30" r="11" fill="#dba27b" />
          <path d="M18 25 Q32 13 46 25" fill="#f43f5e" />
          <circle cx="27" cy="29" r="1.5" fill="#1c1917" />
          <circle cx="37" cy="29" r="1.5" fill="#1c1917" />
          <path d="M27 34 Q32 38 37 34" stroke="#7c2d12" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Gold earrings */}
          <circle cx="20" cy="33" r="2" fill="#fde047" />
          <circle cx="44" cy="33" r="2" fill="#fde047" />
        </svg>
      );
    case 'master_ken':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Master Ken">
          <defs>
            <linearGradient id="kenBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#kenBg)" />
          {/* Carpenter apron */}
          <path d="M11 64 C14 47, 22 44, 32 44 C42 44, 50 47, 53 64 Z" fill="#cbd5e1" />
          <rect x="21" y="46" width="22" height="18" rx="3" fill="#92400e" />
          {/* Head & headband */}
          <circle cx="32" cy="29" r="11.5" fill="#e2b494" />
          <path d="M20 26 Q32 14 44 26 Z" fill="#475569" />
          <rect x="20" y="21" width="24" height="3.5" rx="1.5" fill="#f59e0b" />
          <circle cx="27" cy="29" r="1.5" fill="#0f172a" />
          <circle cx="37" cy="29" r="1.5" fill="#0f172a" />
          {/* Beard & grin */}
          <path d="M23 34 Q32 43 41 34" fill="#64748b" />
          <path d="M28 35 Q32 37 36 35" stroke="#fef3c7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'auntie_lin':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Auntie Lin">
          <defs>
            <linearGradient id="linBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#linBg)" />
          {/* Chef jacket & apron */}
          <path d="M12 64 C15 47, 22 44, 32 44 C42 44, 49 47, 52 64 Z" fill="#fff7ed" />
          <path d="M23 47 L41 47 L43 64 L21 64 Z" fill="#fb7185" />
          {/* Hair bun & face */}
          <circle cx="32" cy="14" r="6" fill="#292524" />
          <circle cx="32" cy="29" r="11.5" fill="#f1c6a7" />
          <path d="M20 26 Q32 16 44 26" fill="#292524" />
          {/* Cheerful eyes & blush */}
          <circle cx="27" cy="29" r="1.5" fill="#1c1917" />
          <circle cx="37" cy="29" r="1.5" fill="#1c1917" />
          <circle cx="24" cy="32" r="2" fill="#fda4af" opacity="0.65" />
          <circle cx="40" cy="32" r="2" fill="#fda4af" opacity="0.65" />
          <path d="M27 34 Q32 38 37 34" stroke="#9f1239" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
  }
};
