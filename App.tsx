
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import { AppState, StyleType, GeneratedImage, UserProfile, Language } from './types';
import { STYLE_OPTIONS, CREDIT_RULES } from './constants';
import LoadingScreen from './components/LoadingScreen';
import { generateArtisticContent, AIProvider } from './services/aiService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.EN); // 默认英文，适应海外
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [user, setUser] = useState<UserProfile>({
    id: 'meow_' + Math.random().toString(36).substr(2, 9),
    email: '',
    credits: CREDIT_RULES.INITIAL,
    history: [],
    transactions: [{ id: 'tx_init', type: 'signup', amount: 5, description: 'Init', timestamp: Date.now() }],
    inviteCode: 'MEO-' + Math.random().toString(36).substr(2, 5).toUpperCase()
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(StyleType.WOOD);
  const [generatedResults, setGeneratedResults] = useState<GeneratedImage[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('meow2_v8_lang');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user || user);
      setLang(parsed.lang || Language.EN);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('meow2_v8_lang', JSON.stringify({ user, lang }));
  }, [user, lang]);

  const toggleLanguage = () => setLang(prev => prev === Language.ZH ? Language.EN : Language.ZH);

  const t = {
    heroTitle: lang === Language.ZH ? '让爱宠跃然于' : 'Artistic Souls,',
    heroTitleAccent: lang === Language.ZH ? '材质的呼吸' : 'Materialized.',
    heroSub: lang === Language.ZH 
      ? '超越单纯的照片变换。我们通过 AI 捕捉每一只猫咪独有的神态特征，将其重构为具有真实物理质感的艺术典藏。' 
      : 'Capture the essence. Our AI reimagines your feline companion into museum-grade physical textures. Crafted for true connoisseurs.',
    btnStart: lang === Language.ZH ? '上传照片 · 开启艺术之旅' : 'Upload · Start Art Journey',
    changePhoto: lang === Language.ZH ? '更换参考照片' : 'Change Source',
    chooseStyle: lang === Language.ZH ? '选择创作媒材' : 'Choose Medium',
    btnGen: lang === Language.ZH ? '开始创作 (1 能量)' : 'Craft Artwork (1 Credit)',
    resultTitle: lang === Language.ZH ? '馆藏' : 'Edition',
    btnDownload: lang === Language.ZH ? '下载原图' : 'Save Original',
    btnSaveStory: lang === Language.ZH ? '保存为 Story' : 'Save for Story',
    btnCompare: lang === Language.ZH ? '长按对比原图' : 'Hold to Compare',
    btnSave: lang === Language.ZH ? '存入画廊' : 'Add to Collection',
    btnBack: lang === Language.ZH ? '← 创作下一件' : '← New Piece',
    profileTitle: lang === Language.ZH ? '私人收藏馆' : 'Private Collection',
    inviteTitle: lang === Language.ZH ? '获取免费能量' : 'Refer a Friend',
    inviteSub: lang === Language.ZH ? '分享你的专属码，双方各得 5 能量' : 'Give 5 credits, Get 5. The art of sharing.',
    energy: lang === Language.ZH ? '剩余能量' : 'CREDITS',
    pricingTitle: lang === Language.ZH ? '能量补给站' : 'Energy Lab',
    pricingSub: lang === Language.ZH ? '为下一次灵感储备能量' : 'Fuel your next masterpiece'
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAppState(AppState.UPLOADING);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (user.credits < 1) {
      setAppState(AppState.PRICING);
      return;
    }
    setAppState(AppState.GENERATING);
    try {
      const result = await generateArtisticContent(selectedImage!, selectedStyle, AIProvider.GEMINI);
      const styleMeta = STYLE_OPTIONS.find(s => s.id === selectedStyle);
      const newImages: GeneratedImage[] = result.imageUrls.map((url, i) => ({
        id: `gen_${Date.now()}_${i}`,
        url,
        style: lang === Language.ZH ? styleMeta?.label.zh! : styleMeta?.label.en!,
        styleId: selectedStyle,
        timestamp: Date.now()
      }));
      setGeneratedResults(newImages);
      setUser(prev => ({
        ...prev,
        credits: prev.credits - 1,
        history: [...newImages, ...prev.history],
      }));
      setAppState(AppState.RESULT);
    } catch (e) {
      setAppState(AppState.UPLOADING);
    }
  };

  // 模拟保存为 Instagram Story 格式
  const handleSaveStory = () => {
    alert(lang === Language.ZH ? '正在生成 9:16 艺术卡片...' : 'Generating 9:16 Art Card...');
    window.open(generatedResults[0].url);
  };

  const resetApp = () => {
    setSelectedImage(null);
    setShowOriginal(false);
    setAppState(AppState.LANDING);
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 text-[#3E3636] selection:bg-[#AED9E0]/30 selection:text-[#3E3636]">
      <Header 
        credits={user.credits}
        lang={lang}
        onLanguageToggle={toggleLanguage}
        onNavClick={(target) => {
          if (target === 'home') resetApp();
          else if (target === 'profile') setAppState(AppState.PROFILE);
          else if (target === 'pricing') setAppState(AppState.PRICING);
        }} 
        onTryNow={() => {
          if (appState !== AppState.LANDING) resetApp();
          fileInputRef.current?.click();
        }}
      />

      <main className="flex-grow">
        {appState === AppState.LANDING && (
          <section className="relative overflow-hidden pt-20 pb-40">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <div className="inline-block bg-[#3E3636]/5 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.4em] text-[#3E3636] uppercase mb-12">
                Meow Squared Laboratory
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-light mb-12 tracking-tight leading-[0.85]">
                {t.heroTitle}<br />
                <span className="font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-[#3E3636] to-[#AED9E0] pb-6">{t.heroTitleAccent}</span>
              </h1>
              <p className="text-lg md:text-xl text-[#8C8379] max-w-2xl mx-auto mb-20 leading-relaxed font-light">{t.heroSub}</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-16 py-7 bg-[#3E3636] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-700"
              >
                {t.btnStart}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </section>
        )}

        {appState === AppState.UPLOADING && selectedImage && (
          <section className="max-w-6xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="bg-white rounded-[4rem] border border-[#EAE0D5] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
                <div className="lg:w-1/2 bg-[#FDFCFB] p-12 lg:p-20 text-center border-b lg:border-b-0 lg:border-r border-[#EAE0D5] flex flex-col justify-center">
                   <div className="aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white mb-10 group relative">
                      <img src={selectedImage} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                   </div>
                   <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black text-[#8C8379] tracking-[0.3em] uppercase hover:text-[#3E3636] transition-colors">{t.changePhoto}</button>
                </div>
                <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-between">
                   <div className="space-y-14">
                     <h2 className="text-4xl font-light tracking-tighter">{t.chooseStyle}</h2>
                     <div className="grid grid-cols-1 gap-4">
                        {STYLE_OPTIONS.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => setSelectedStyle(s.id)} 
                            className={`p-10 rounded-[2.5rem] border transition-all duration-700 text-left flex justify-between items-center group relative overflow-hidden ${selectedStyle === s.id ? 'bg-[#3E3636] text-white border-[#3E3636] shadow-2xl -translate-y-1' : 'bg-white border-[#EAE0D5] hover:border-[#AED9E0]'}`}
                          >
                             <div className="relative z-10">
                               <p className="font-bold text-xl mb-1 tracking-tight">{lang === Language.ZH ? s.label.zh : s.label.en}</p>
                               <p className={`text-[11px] font-light ${selectedStyle === s.id ? 'opacity-60' : 'text-[#8C8379]'}`}>{lang === Language.ZH ? s.description.zh : s.description.en}</p>
                             </div>
                             {selectedStyle === s.id && <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10 blur-2xl"></div>}
                          </button>
                        ))}
                     </div>
                   </div>
                   <button onClick={handleGenerate} className="w-full mt-20 py-7 bg-[#3E3636] text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:shadow-2xl transition-all shadow-xl active:scale-95">
                     {t.btnGen}
                   </button>
                </div>
             </div>
          </section>
        )}

        {appState === AppState.GENERATING && <LoadingScreen lang={lang} />}

        {appState === AppState.RESULT && generatedResults.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 py-24 text-center animate-in zoom-in-95 duration-1000">
             <div className="bg-white p-10 md:p-20 rounded-[5rem] border border-[#EAE0D5] shadow-2xl mb-16 relative overflow-hidden">
                <div className="relative aspect-square max-w-lg mx-auto rounded-[3.5rem] overflow-hidden shadow-2xl mb-12 group cursor-none"
                     onMouseDown={() => setShowOriginal(true)}
                     onMouseUp={() => setShowOriginal(false)}
                     onMouseLeave={() => setShowOriginal(false)}
                     onTouchStart={() => setShowOriginal(true)}
                     onTouchEnd={() => setShowOriginal(false)}>
                   <img src={showOriginal ? selectedImage! : generatedResults[0].url} className="w-full h-full object-cover transition-all duration-700" />
                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/30 backdrop-blur-xl px-10 py-5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] border border-white/20">
                        {t.btnCompare}
                      </div>
                   </div>
                </div>
                <div className="space-y-4 mb-16">
                  <span className="text-[10px] font-black tracking-[0.5em] text-[#AED9E0] uppercase">Collection No.0824</span>
                  <h2 className="text-4xl font-light tracking-tight">《{generatedResults[0].style}》</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   <button onClick={() => window.open(generatedResults[0].url)} className="px-8 py-5 border border-[#EAE0D5] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">{t.btnDownload}</button>
                   <button onClick={handleSaveStory} className="px-8 py-5 border border-[#3E3636] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#3E3636] hover:text-white transition-all">{t.btnSaveStory}</button>
                   <button onClick={() => setAppState(AppState.PROFILE)} className="px-8 py-5 bg-[#3E3636] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all sm:col-span-2 lg:col-span-1">{t.btnSave}</button>
                </div>
             </div>
             <button onClick={resetApp} className="text-[10px] font-black text-[#8C8379] uppercase tracking-[0.3em] hover:text-[#3E3636] transition-colors">{t.btnBack}</button>
          </section>
        )}

        {appState === AppState.PROFILE && (
          <section className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in duration-1000">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                <div className="lg:col-span-1 space-y-10">
                   <div className="bg-white p-14 rounded-[4rem] border border-[#EAE0D5] text-center sticky top-32 shadow-sm">
                      <div className="w-24 h-24 bg-[#FDFCFB] rounded-[2.5rem] mx-auto mb-10 border border-[#EAE0D5] flex items-center justify-center font-bold text-2xl text-[#3E3636]">
                        {user.id.slice(-2).toUpperCase()}
                      </div>
                      <h3 className="text-xl font-bold mb-3 tracking-tight">Collector #{user.id.slice(-4)}</h3>
                      <p className="text-[10px] font-black text-[#8C8379] uppercase tracking-[0.2em] mb-12">{t.energy}: {user.credits.toFixed(0)}</p>
                      <button onClick={() => setAppState(AppState.PRICING)} className="w-full py-6 bg-[#AED9E0] text-[#3E3636] font-black rounded-[2rem] uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl transition-all">RECHARGE</button>
                   </div>

                   <div className="bg-[#3E3636] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                      <h4 className="text-xs font-black mb-6 uppercase tracking-[0.3em] text-[#AED9E0]">{t.inviteTitle}</h4>
                      <p className="text-[11px] opacity-60 mb-10 leading-relaxed font-light">{t.inviteSub}</p>
                      <div className="bg-white/5 p-6 rounded-3xl flex items-center justify-between border border-white/10 group cursor-pointer" onClick={() => navigator.clipboard.writeText(user.inviteCode)}>
                        <span className="font-mono text-xl tracking-tighter">{user.inviteCode}</span>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#AED9E0] group-hover:scale-110 transition-transform">COPY</button>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-3">
                   <div className="bg-white p-12 md:p-20 rounded-[5rem] border border-[#EAE0D5] shadow-sm min-h-[600px]">
                      <h4 className="text-4xl font-light mb-16 tracking-tighter">{t.profileTitle}</h4>
                      {user.history.length === 0 ? (
                        <div className="py-32 text-center space-y-10 opacity-30">
                           <div className="w-32 h-32 bg-[#FDFCFB] rounded-full mx-auto flex items-center justify-center border border-[#EAE0D5]">
                              <span className="text-5xl">✧</span>
                           </div>
                           <p className="text-[11px] font-black uppercase tracking-[0.4em]">Curate your first edition</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                          {user.history.map(img => (
                            <div key={img.id} className="group aspect-square rounded-[2.5rem] overflow-hidden border border-[#EAE0D5] relative shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-3">
                              <img src={img.url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                 <button onClick={() => window.open(img.url)} className="px-8 py-4 bg-white rounded-full text-[#3E3636] font-black text-[9px] uppercase tracking-widest scale-75 group-hover:scale-100 transition-all">Inspect</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </section>
        )}
      </main>

      <footer className="py-24 border-t border-[#EAE0D5] bg-[#FDFCFB]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-14">
           <div className="text-center md:text-left space-y-2">
              <span className="text-3xl font-bold tracking-tighter text-[#3E3636]">MEOW SQUARED</span>
              <p className="text-[10px] font-black text-[#8C8379] uppercase tracking-[0.5em] opacity-40">The Future of Feline Artistry</p>
           </div>
           <div className="flex gap-12 text-[10px] font-black text-[#8C8379] uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-[#3E3636] transition-colors">Lab Terms</a>
              <a href="#" className="hover:text-[#3E3636] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#3E3636] transition-colors">Instagram</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
