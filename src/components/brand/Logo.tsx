/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NEW LOOK PHARMA — Logo Officiel Structure Mère & Réseau
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'color' | 'monochrome' | 'white';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'color',
}) => {
  const sizeMap = {
    sm: { dimension: 36, textClass: 'text-sm' },
    md: { dimension: 48, textClass: 'text-base' },
    lg: { dimension: 64, textClass: 'text-lg' },
    xl: { dimension: 96, textClass: 'text-2xl' },
  };

  const { dimension } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Circular Emblem */}
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="nlp-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B3B60" />
            <stop offset="100%" stopColor="#041B33" />
          </linearGradient>
          <linearGradient id="nlp-green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="nlp-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Ring with deep cobalt blue */}
        <circle cx="100" cy="100" r="95" stroke="#0B3B60" strokeWidth="9" fill="#FFFFFF" />
        <circle cx="100" cy="100" r="88" stroke="#E2E8F0" strokeWidth="1.5" />

        {/* Top Arc Ribbon: STRUCTURE MÈRE */}
        <path
          id="text-path-top"
          d="M 30,100 A 70,70 0 0,1 170,100"
          fill="none"
        />
        <text
          fontSize="13"
          fontWeight="800"
          fill="#0B3B60"
          letterSpacing="2.5"
          textAnchor="middle"
        >
          <textPath href="#text-path-top" startOffset="50%">
            STRUCTURE MÈRE
          </textPath>
        </text>

        {/* Central Medical Cross in Vibrant Emerald Green */}
        <g transform="translate(100,95) scale(0.68)">
          <path
            d="M -15,-45 L 15,-45 L 15,-15 L 45,-15 L 45,15 L 15,15 L 15,45 L -15,45 L -15,15 L -45,15 L -45,-15 L -15,-15 Z"
            fill="url(#nlp-green-gradient)"
            stroke="#047857"
            strokeWidth="3"
            rx="4"
          />
          {/* Subtle inner cross highlight */}
          <path
            d="M -11,-41 L 11,-41 L 11,-11 L 41,-11 L 41,11 L 11,11 L 11,41 L -11,41 L -11,11 L -41,11 L -41,-11 L -11,-11 Z"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        </g>

        {/* Interconnected Molecular Orbit rings */}
        <ellipse
          cx="100"
          cy="95"
          rx="52"
          ry="22"
          transform="rotate(-25 100 95)"
          stroke="#0284C7"
          strokeWidth="3"
          strokeDasharray="4 2"
          fill="none"
          opacity="0.85"
        />
        <ellipse
          cx="100"
          cy="95"
          rx="52"
          ry="22"
          transform="rotate(25 100 95)"
          stroke="#10B981"
          strokeWidth="3"
          fill="none"
          opacity="0.85"
        />

        {/* Stylized Modern "NL" Monogram */}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontSize="36"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fill="#0B3B60"
          letterSpacing="-1"
          filter="url(#glow)"
        >
          N²
        </text>

        {/* Bottom Banner Ribbon: NEW LOOK PHARMA */}
        <rect
          x="22"
          y="136"
          width="156"
          height="28"
          rx="6"
          fill="url(#nlp-blue-gradient)"
          stroke="#0284C7"
          strokeWidth="1.5"
        />
        <text
          x="100"
          y="155"
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fill="#FFFFFF"
          letterSpacing="1.2"
        >
          NEW LOOK
        </text>
        <text
          x="100"
          y="178"
          textAnchor="middle"
          fontSize="8.5"
          fontStyle="italic"
          fontWeight="600"
          fill="#0B3B60"
        >
          — PHARMA —
        </text>
        <text
          x="100"
          y="190"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="#059669"
        >
          Votre santé, notre priorité
        </text>
      </svg>

      {/* Brand Wordmark Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 text-lg leading-none">
              NEW LOOK
            </span>
            <span className="font-extrabold tracking-tight text-emerald-600 text-lg leading-none">
              PHARMA
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-1 leading-none">
            Réseau Multi-Établissements RDC
          </span>
        </div>
      )}
    </div>
  );
};
