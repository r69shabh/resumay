import React from "react";

interface ResumayLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function ResumayLogo({ size = 32, className = "", showText = false }: ResumayLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        {/* ── SHEET 1: Bottom / Back Resume Sheet (tilted left -16°, offset left) ── */}
        <g transform="translate(14, 28) rotate(-16) translate(-14, -28)">
          <rect
            x="4"
            y="12"
            width="28"
            height="36"
            rx="4"
            className="fill-muted/60 stroke-foreground/40"
            strokeWidth="1.75"
          />
          {/* Tear perforation or binder holes */}
          <circle cx="11" cy="16" r="1.5" className="fill-foreground/30" />
          <circle cx="25" cy="16" r="1.5" className="fill-foreground/30" />
          {/* Resume layout lines */}
          <rect x="8" y="21" width="12" height="2" rx="1" className="fill-foreground/30" />
          <line x1="8" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
          <line x1="8" y1="30" x2="26" y2="30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
          <line x1="8" y1="34" x2="22" y2="34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
        </g>

        {/* ── SHEET 2: Middle Resume Sheet (tilted right +12°, offset right) ── */}
        <g transform="translate(36, 28) rotate(14) translate(-36, -28)">
          <rect
            x="22"
            y="11"
            width="28"
            height="36"
            rx="4"
            className="fill-background stroke-foreground/60"
            strokeWidth="1.75"
          />
          {/* Binder notch & lines */}
          <circle cx="29" cy="15" r="1.5" className="fill-foreground/50" />
          <circle cx="43" cy="15" r="1.5" className="fill-foreground/50" />
          <rect x="26" y="20" width="13" height="2.2" rx="1.1" className="fill-foreground/50" />
          <line x1="26" y1="25" x2="46" y2="25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
          <line x1="26" y1="29.5" x2="44" y2="29.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
          <line x1="26" y1="34" x2="40" y2="34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
        </g>

        {/* ── SHEET 3: Front Sheet (centered, upright, calendar wire-bound at top) ── */}
        <g transform="translate(28, 29) rotate(-2) translate(-28, -29)">
          {/* Front paper sheet */}
          <rect
            x="13"
            y="10"
            width="30"
            height="38"
            rx="4.5"
            className="fill-card stroke-foreground"
            strokeWidth="2"
          />

          {/* Top Calendar Binding Bar / Header strip */}
          <path
            d="M 13 15.5 Q 13 10 17.5 10 L 38.5 10 Q 43 10 43 15.5 L 43 17.5 L 13 17.5 Z"
            className="fill-foreground/10"
          />

          {/* Calendar Spiral / Twin Rings at Top */}
          {/* Ring 1 (Left) */}
          <rect
            x="18"
            y="6"
            width="3.5"
            height="7.5"
            rx="1.75"
            className="fill-foreground stroke-background"
            strokeWidth="1.2"
          />
          {/* Ring 2 (Center) */}
          <rect
            x="26.25"
            y="6"
            width="3.5"
            height="7.5"
            rx="1.75"
            className="fill-foreground stroke-background"
            strokeWidth="1.2"
          />
          {/* Ring 3 (Right) */}
          <rect
            x="34.5"
            y="6"
            width="3.5"
            height="7.5"
            rx="1.75"
            className="fill-foreground stroke-background"
            strokeWidth="1.2"
          />

          {/* Resume Header Elements inside front sheet */}
          {/* Candidate Name Bar */}
          <rect x="17.5" y="21.5" width="13" height="3" rx="1.5" className="fill-foreground" />
          {/* Subtitle / Role Tag */}
          <rect x="17.5" y="26.5" width="8" height="1.8" rx="0.9" className="fill-foreground/50" />

          {/* Clean Section Divider Rule */}
          <line
            x1="17.5"
            y1="31"
            x2="38.5"
            y2="31"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Resume Bullets with green ATS indicator dot */}
          <circle cx="19" cy="35" r="1" fill="#10b981" />
          <line x1="22.5" y1="35" x2="38" y2="35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />

          <circle cx="19" cy="39" r="1" className="fill-foreground/60" />
          <line x1="22.5" y1="39" x2="35" y2="39" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />

          <circle cx="19" cy="43" r="1" className="fill-foreground/60" />
          <line x1="22.5" y1="43" x2="31" y2="43" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        </g>
      </svg>

      {showText && (
        <span className="font-extrabold tracking-tight text-xl">resumay</span>
      )}
    </div>
  );
}
