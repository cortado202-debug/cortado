import React from 'react';

interface CoffeeBeanConfig {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  color: string;
  variant: 1 | 2;
  blur?: string;
}

const BEANS_DATA: CoffeeBeanConfig[] = [
  { id: 1, size: 16, left: 4, duration: 18, delay: 0, color: '#6F4E37', variant: 1 },
  { id: 2, size: 14, left: 15, duration: 24, delay: 2, color: '#523621', variant: 2 },
  { id: 3, size: 18, left: 26, duration: 20, delay: 1, color: '#4A2E1B', variant: 1 },
  { id: 4, size: 13, left: 38, duration: 25, delay: 5, color: '#6F4E37', variant: 2 },
  { id: 5, size: 17, left: 50, duration: 19, delay: 0.5, color: '#5A3B24', variant: 1 },
  { id: 6, size: 15, left: 63, duration: 22, delay: 3, color: '#6F4E37', variant: 2 },
  { id: 7, size: 19, left: 75, duration: 21, delay: 1.5, color: '#4A2E1B', variant: 1 },
  { id: 8, size: 14, left: 88, duration: 26, delay: 6, color: '#523621', variant: 2 },
  { id: 9, size: 16, left: 20, duration: 23, delay: 8, color: '#6F4E37', variant: 1 },
  { id: 10, size: 15, left: 58, duration: 20, delay: 10, color: '#4A2E1B', variant: 2 },
  { id: 11, size: 18, left: 34, duration: 27, delay: 4, color: '#523621', variant: 1 },
  { id: 12, size: 15, left: 82, duration: 22, delay: 7, color: '#6F4E37', variant: 2 },
];

export const FloatingBeans: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Ambient Wavy Green/White Emerald Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00A859]/10 filter blur-3xl animate-pulse-glow" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-[#E6F6ED]/60 filter blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] rounded-full bg-[#00A859]/8 filter blur-3xl animate-pulse-glow" style={{ animationDelay: '8s' }} />

      {/* Floating Coffee Beans */}
      <div className="absolute inset-0 opacity-50">
        {BEANS_DATA.map((bean) => (
          <div
            key={bean.id}
            style={{
              position: 'absolute',
              left: `${bean.left}%`,
              width: `${bean.size}px`,
              height: `${bean.size * 1.3}px`,
              animationDuration: `${bean.duration}s`,
              animationDelay: `${bean.delay}s`,
            }}
            className={`flex items-center justify-center ${
              bean.variant === 1 ? 'bean-float-1' : 'bean-float-2'
            }`}
          >
            {/* Detailed Brown Coffee Bean Vector SVG */}
            <svg
              viewBox="0 0 100 130"
              className={`w-full h-full drop-shadow-md filter ${bean.blur || ''}`}
              style={{ color: bean.color }}
              fill="currentColor"
            >
              {/* Outer Bean Body */}
              <path d="M50 5 C82 5, 96 35, 96 65 C96 95, 82 125, 50 125 C18 125, 4 95, 4 65 C4 35, 18 5, 50 5 Z" />
              {/* Inner S-Curve Groove Line */}
              <path
                d="M50 15 Q22 65 50 115 S78 65 50 15"
                fill="none"
                stroke="#FFF8F0"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

