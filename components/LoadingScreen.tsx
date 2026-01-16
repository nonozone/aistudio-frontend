
import React from 'react';
import { Language } from '../types';

interface LoadingScreenProps {
  lang: Language;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ lang }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in">
      <div className="w-24 h-24 mb-10 relative">
        <div className="absolute inset-0 border-t-8 border-[#AED9E0] rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
      </div>
      <div className="space-y-4">
        <h3 className="text-4xl font-black text-[#3E3636]">
          {lang === Language.ZH ? '正在变魔法...' : 'Creating Magic...'}
        </h3>
        <p className="text-xl text-[#8C8379] font-bold">
          {lang === Language.ZH 
            ? '请稍等，大作马上出炉！' 
            : 'Your masterpiece is almost ready!'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
