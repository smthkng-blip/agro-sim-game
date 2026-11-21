import React from 'react';
import type { CropId } from '../sim/types';

interface Props {
  cropId: CropId;
  size?: number;
}

export const CropIcon: React.FC<Props> = ({ cropId, size = 22 }) => {
  switch (cropId) {
    case 'rubber_tree':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="10.5" y="13" width="3" height="9" rx="1" fill="#8c6d53" />
          <circle cx="12" cy="9" r="6" fill="#15803d" />
          <circle cx="9" cy="10" r="4" fill="#22c55e" />
          <circle cx="15" cy="10" r="4" fill="#16a34a" />
          <rect x="13" y="16" width="3" height="3" rx="0.7" fill="#f8fafc" />
        </svg>
      );
    case 'oil_palm':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="10.5" y="11" width="3" height="11" rx="1" fill="#854d0e" />
          <path d="M12 11 Q5 4 2 9 M12 11 Q19 4 22 9 M12 11 Q7 2 12 2 M12 11 Q17 2 20 5" stroke="#16a34a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="13" r="2.2" fill="#f97316" />
          <circle cx="14" cy="13" r="2.2" fill="#ea580c" />
        </svg>
      );
    case 'paddy_rice':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <ellipse cx="12" cy="19.5" rx="8" ry="2.5" fill="#38bdf8" opacity="0.55" />
          <path d="M8 19 Q7 11 5 6 M12 19 Q12 10 13 5 M16 19 Q17 11 19 6" stroke="#84cc16" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="5.5" cy="6.5" rx="1.5" ry="3" transform="rotate(-20 5.5 6.5)" fill="#facc15" />
          <ellipse cx="13" cy="5.5" rx="1.5" ry="3" fill="#facc15" />
          <ellipse cx="18.5" cy="6.5" rx="1.5" ry="3" transform="rotate(20 18.5 6.5)" fill="#facc15" />
        </svg>
      );
    case 'tomato':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="14" r="7" fill="#ef4444" />
          <circle cx="9.5" cy="11.5" r="2" fill="#fca5a5" opacity="0.7" />
          <path d="M12 7 L9 4 M12 7 L15 4 M12 7 L12 3" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'sweet_corn':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="4.2" ry="8" fill="#facc15" />
          <path d="M8 19 Q5 14 8 9 M16 19 Q19 14 16 9" stroke="#22c55e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'soybean':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 15 Q12 20 19 9 Q13 6 5 15 Z" fill="#84cc16" />
          <circle cx="9.5" cy="13.5" r="1.8" fill="#d9f99d" />
          <circle cx="13" cy="11.5" r="1.8" fill="#d9f99d" />
          <circle cx="16" cy="9.5" r="1.5" fill="#d9f99d" />
        </svg>
      );
    case 'spinach':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <ellipse cx="9" cy="12" rx="5" ry="7" transform="rotate(-22 9 12)" fill="#15803d" />
          <ellipse cx="15" cy="12" rx="5" ry="7" transform="rotate(22 15 12)" fill="#22c55e" />
          <path d="M12 19 L12 9" stroke="#86efac" strokeWidth="1.5" />
        </svg>
      );
    case 'strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20 C7 17 5 11 8 8 C10 6.5 14 6.5 16 8 C19 11 17 17 12 20 Z" fill="#f43f5e" />
          <path d="M8 8 L12 5 L16 8" fill="#22c55e" />
          <circle cx="10" cy="12" r="0.8" fill="#fef08a" />
          <circle cx="14" cy="12" r="0.8" fill="#fef08a" />
          <circle cx="12" cy="15.5" r="0.8" fill="#fef08a" />
        </svg>
      );
    case 'blueberry':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="14" r="4.5" fill="#2563eb" />
          <circle cx="15" cy="14" r="4.5" fill="#3b82f6" />
          <circle cx="12" cy="10" r="4.5" fill="#1d4ed8" />
          <circle cx="10.8" cy="8.5" r="1.2" fill="#93c5fd" />
        </svg>
      );
    case 'potato':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <ellipse cx="12" cy="13" rx="7.5" ry="5.5" transform="rotate(-14 12 13)" fill="#c28546" />
          <circle cx="9" cy="12" r="1" fill="#78350f" />
          <circle cx="15" cy="14" r="1" fill="#78350f" />
        </svg>
      );
    case 'sunflower':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="#facc15" />
          <circle cx="12" cy="12" r="4.3" fill="#713f12" />
        </svg>
      );
    case 'winter_wheat':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21 L12 4" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="9" cy="9" rx="2" ry="3.5" transform="rotate(-30 9 9)" fill="#fbbf24" />
          <ellipse cx="15" cy="9" rx="2" ry="3.5" transform="rotate(30 15 9)" fill="#fbbf24" />
          <ellipse cx="9" cy="14" rx="2" ry="3.5" transform="rotate(-30 9 14)" fill="#f59e0b" />
          <ellipse cx="15" cy="14" rx="2" ry="3.5" transform="rotate(30 15 14)" fill="#f59e0b" />
        </svg>
      );
  }
};
