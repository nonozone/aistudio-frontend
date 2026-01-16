
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-28 h-28'
  };

  const strokeColor = "#3E3636"; // 精细线条使用炭灰色
  const pinkBg = "#F8C8D8";
  const blueBg = "#AED9E0";
  const faceColor = "#FFFFFF";

  return (
    <div className={`${sizeClasses[size]} p-1 bg-[#EAE0D5]/30 rounded-[25%] shadow-sm overflow-hidden flex items-center justify-center`}>
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full">
        {/* Top Left: Pink + Paw */}
        <div style={{ backgroundColor: pinkBg }} className="rounded-[15%] flex items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" fill={strokeColor} className="opacity-80">
            <circle cx="12" cy="15" r="3" />
            <circle cx="7.5" cy="10" r="1.5" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="16.5" cy="10" r="1.5" />
          </svg>
        </div>
        
        {/* Top Right: Blue + Face */}
        <div style={{ backgroundColor: blueBg }} className="rounded-[15%] flex items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.2" className="opacity-80">
            <circle cx="12" cy="13" r="7.5" fill={faceColor} />
            <path d="M7 8l-1-3 3 1.5M17 8l1-3-3 1.5" fill={strokeColor} />
            <circle cx="9.5" cy="12" r="0.5" fill={strokeColor} />
            <circle cx="14.5" cy="12" r="0.5" fill={strokeColor} />
            <path d="M10.5 16c0.5 0.5 2.5 0.5 3 0" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom Left: Blue + Face */}
        <div style={{ backgroundColor: blueBg }} className="rounded-[15%] flex items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.2" className="opacity-80">
            <circle cx="12" cy="13" r="7.5" fill={faceColor} />
            <path d="M7 8l-1-3 3 1.5M17 8l1-3-3 1.5" fill={strokeColor} />
            <circle cx="9.5" cy="12" r="0.5" fill={strokeColor} />
            <circle cx="14.5" cy="12" r="0.5" fill={strokeColor} />
            <path d="M10.5 16c0.5 0.5 2.5 0.5 3 0" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom Right: Pink + Paw */}
        <div style={{ backgroundColor: pinkBg }} className="rounded-[15%] flex items-center justify-center p-0.5">
          <svg viewBox="0 0 24 24" fill={strokeColor} className="opacity-80">
            <circle cx="12" cy="15" r="3" />
            <circle cx="7.5" cy="10" r="1.5" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="16.5" cy="10" r="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Logo;
