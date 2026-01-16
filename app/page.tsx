
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { AppState, StyleType, GeneratedImage, UserProfile, PetProfile, Language } from '@/lib/types';
import { STYLE_OPTIONS, CREDIT_RULES } from '@/lib/constants';
import LoadingScreen from '@/components/LoadingScreen';
import { generateWithGemini } from '@/lib/gemini';

// 演示模式的 fallback 图片（木雕风格示例）
const MOCK_RESULT_URL = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000&auto=format&fit=crop";

export default function Home() {
  const [lang, setLang] = useState<Language>(Language.ZH);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [user, setUser] = useState<UserProfile>({
    id: 'meow_' + Math.random().toString(36).substr(2, 9),
    email: '',
    credits: CREDIT_RULES.INITIAL,
    isPremium: false,
    isAdmin: true,
    history: [],
    transactions: [{ id: 'tx_init', type: 'signup', amount: 5, description: '新用户礼包', timestamp: Date.now() }],
    pets: [],
    inviteCode: 'MEO-' + Math.random().toString(36).substr(2, 5).toUpperCase()
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(StyleType.WOOD);
  const [generatedResults, setGeneratedResults] = useState<GeneratedImage[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [profileTab, setProfileTab] = useState<'art' | 'pets' | 'invite' | 'wallet'>('art');
  
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [newPet, setNewPet] = useState<Partial<PetProfile>>({ name: '', breed: '', features: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('meow_squared_v11');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser({ ...parsed.user, pets: parsed.user?.pets || [] });
      setLang(parsed.lang || Language.ZH);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('meow_squared_v11', JSON.stringify({ user, lang }));
  }, [user, lang]);

  const toggleLanguage = () => setLang(prev => prev === Language.ZH ? Language.EN : Language.ZH);

  const t = {
    heroTitle: lang === Language.ZH ? '把你的猫' : 'Your Cat,',
    heroTitleAccent: lang === Language.ZH ? '变成艺术品' : 'Meow Squared.',
    heroSub: lang === Language.ZH 
      ? '只需一张照片，让猫咪变身超酷的艺术形态。我们不仅提供 AI 灵感，更支持将这份爱转化为手工彩绘的实物艺术。' 
      : 'Beyond filters. We reimagine your cat and offer premium hand-painted wooden sculptures as a permanent keepsake.',
    btnStart: lang === Language.ZH ? '上传照片 · 开启重构' : 'Upload · Start',
    changePhoto: lang === Language.ZH ? '更换参考图' : 'Change Image',
    chooseStyle: lang === Language.ZH ? '选择重构媒介' : 'Choose Medium',
    btnGen: lang === Language.ZH ? '开始变魔法' : 'Create Magic',
    btnDownload: lang === Language.ZH ? '保存画作' : 'Save Art',
    btnShareCard: lang === Language.ZH ? '生成分享海报' : 'Viral Poster',
    btnBack: lang === Language.ZH ? '返回实验室' : 'Back to Lab',
    
    physicalTitle: lang === Language.ZH ? '定制“田字格”实物套装' : '"Tian" Grid Physical Set',
    physicalSub: lang === Language.ZH ? '标准化造型 + 匠人手工彩绘。4枚/8枚一组，赠送专属实木收藏盒。' : 'Standard forms + artisan painting. Set of 4/8 with premium box.',
    physicalBtn: lang === Language.ZH ? '预约定制顾问' : 'Chat with Artisan',

    discoverTitle: lang === Language.ZH ? '灵感广场' : 'Discovery',
    discoverSub: lang === Language.ZH ? '看看全球藏家的重构杰作' : 'Masterpieces from global collectors',
    trySame: lang === Language.ZH ? '同款风格' : 'Try Style',

    profileTitle: lang === Language.ZH ? '我的藏馆' : 'My Hub',
    tabArt: lang === Language.ZH ? '艺术历史' : 'History',
    tabPets: lang === Language.ZH ? '喵喵护照' : 'Passport',
    tabInvite: lang === Language.ZH ? '能量中心' : 'Credits',
    tabWallet: lang === Language.ZH ? '明细' : 'Wallet',
    addPetBtn: lang === Language.ZH ? '+ 建立档案' : '+ New Passport',
    petName: lang === Language.ZH ? '猫咪名字' : 'Cat Name',
    petBreed: lang === Language.ZH ? '品种' : 'Breed',
    petFeatures: lang === Language.ZH ? '彩绘参考特征 (如毛色分布)' : 'Painting reference features',
    savePet: lang === Language.ZH ? '完成护照' : 'Save Passport',
    
    inviteCodeLabel: lang === Language.ZH ? '我的邀请码' : 'Invite Code',
    creditsBalance: lang === Language.ZH ? '可用点数' : 'Credits',
    makePublic: lang === Language.ZH ? '公开画廊' : 'Public',
    posterTitle: lang === Language.ZH ? '喵的二次方 · 灵感重构' : 'Meow Squared Reconstructed',
    posterSlogan: lang === Language.ZH ? 'AI灵感生成 + 匠人手工彩绘' : 'AI Inspiration + Artisan Painting'
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
      const imageUrls = await generateWithGemini(selectedImage!, selectedStyle);
      finalizeGeneration(imageUrls);
    } catch (e) {
      console.warn("API 调用失败或未配置，进入演示模式");
      setTimeout(() => {
        finalizeGeneration([MOCK_RESULT_URL]);
      }, 3000);
    }
  };

  const finalizeGeneration = (imageUrls: string[]) => {
    const styleMeta = STYLE_OPTIONS.find(s => s.id === selectedStyle);
    const newImages: GeneratedImage[] = imageUrls.map((url, i) => ({
      id: `gen_${Date.now()}_${i}`,
      url,
      originalUrl: selectedImage!,
      style: lang === Language.ZH ? styleMeta?.label.zh! : styleMeta?.label.en!,
      styleId: selectedStyle,
      timestamp: Date.now(),
      likes: Math.floor(Math.random() * 50) + 10
    }));
    
    setGeneratedResults(newImages);
    setUser(prev => ({
      ...prev,
      credits: prev.credits - 1,
      history: [...newImages, ...prev.history],
      transactions: [{ id: `tx_${Date.now()}`, type: 'generation', amount: -1, description: `生成: ${newImages[0].style}`, timestamp: Date.now() }, ...prev.transactions]
    }));
    setAppState(AppState.RESULT);
  };

  const handleAddPet = () => {
    if (!newPet.name) {
      alert(lang === Language.ZH ? '请输入猫咪名字' : 'Please enter cat name');
      return;
    }
    const pet: PetProfile = {
      id: 'pet_' + Date.now(),
      name: newPet.name || '',
      breed: newPet.breed || '',
      age: '',
      features: newPet.features || '',
      photos: []
    };
    setUser(prev => ({ ...prev, pets: [...prev.pets, pet] }));
    setNewPet({ name: '', breed: '', features: '' });
    setIsAddingPet(false);
  };

  const resetApp = () => {
    setSelectedImage(null);
    setAppState(AppState.LANDING);
  };

  // 辅助函数：获取主宠物名字
  const getPetName = () => user.pets[0]?.name || (lang === Language.ZH ? '神秘喵' : 'Mystery Cat');

  return (
    <div className="min-h-screen flex flex-col pt-20 md:pt-24 text-[#3E3636] bg-[#FDFCFB]">
      <Header 
        credits={user.credits}
        lang={lang}
        onLanguageToggle={toggleLanguage}
        onNavClick={(target) => {
          if (target === 'home') resetApp();
          else if (target === 'profile') setAppState(AppState.PROFILE);
          else if (target === 'pricing') setAppState(AppState.PRICING);
          else if (target === 'discover') setAppState(AppState.DISCOVER);
        }} 
        onTryNow={() => {
          if (appState !== AppState.LANDING) resetApp();
          fileInputRef.current?.click();
        }}
      />

      <main className="flex-grow">
        {/* ... 保留 LANDING, DISCOVER, UPLOADING, GENERATING 部分 ... */}
        {appState === AppState.LANDING && (
          <section className="max-w-6xl mx-auto px-6 pt-16 pb-32 text-center animate-in fade-in zoom-in-95 duration-700">
              <h1 className="text-7xl md:text-[10rem] font-black mb-10 tracking-tighter leading-[0.85] uppercase">
                {t.heroTitle}<br />
                <span className="text-[#AED9E0] italic">{t.heroTitleAccent}</span>
              </h1>
              <p className="text-xl md:text-2xl text-[#8C8379] max-w-xl mx-auto mb-20 leading-relaxed font-medium">{t.heroSub}</p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-16 py-8 bg-[#3E3636] text-white text-2xl font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-[#AED9E0]/20"
              >
                {t.btnStart}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </section>
        )}

        {appState === AppState.DISCOVER && (
          <section className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
             <div className="mb-20">
                <h2 className="text-6xl font-black tracking-tighter mb-4">{t.discoverTitle}</h2>
                <p className="text-xl font-medium text-[#8C8379]">{t.discoverSub}</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {[...user.history, ...user.history].slice(0, 6).map((img, i) => (
                  <div key={i} className="group cursor-pointer">
                     <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-sm border border-[#EAE0D5] relative mb-6">
                        <img src={img.url || MOCK_RESULT_URL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-black">❤️ {img.likes}</div>
                     </div>
                     <div className="px-4 flex justify-between items-center">
                        <p className="font-black text-xl italic tracking-tight">《{img.style}》</p>
                        <button className="text-xs font-black uppercase tracking-widest text-[#AED9E0]">{t.trySame}</button>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}

        {appState === AppState.UPLOADING && selectedImage && (
          <section className="max-w-6xl mx-auto px-6 py-12 animate-in slide-in-from-bottom-12 duration-700">
             <div className="flex flex-col lg:flex-row gap-16">
                <div className="lg:w-1/2">
                   <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white">
                      <img src={selectedImage} className="w-full h-full object-cover grayscale-[0.3]" alt="Preview" />
                   </div>
                   <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 text-lg font-black text-[#8C8379] hover:text-[#3E3636] transition-colors uppercase tracking-[0.2em]">{t.changePhoto}</button>
                </div>
                
                <div className="lg:w-1/2 flex flex-col justify-between bg-white p-12 rounded-[5rem] shadow-sm border border-[#EAE0D5]">
                   <div>
                     <h2 className="text-3xl font-black mb-12 tracking-tight uppercase">{t.chooseStyle}</h2>
                     <div className="grid grid-cols-1 gap-4">
                        {STYLE_OPTIONS.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => setSelectedStyle(s.id)} 
                            className={`p-8 rounded-[2.5rem] border-2 transition-all flex items-center gap-6 ${selectedStyle === s.id ? 'bg-[#3E3636] text-white border-[#3E3636] shadow-xl translate-x-4' : 'bg-white border-gray-100 hover:border-[#AED9E0]'}`}
                          >
                             <div className={`w-14 h-14 rounded-2xl ${s.previewColor} shrink-0`}></div>
                             <div className="text-left">
                               <p className="font-black text-xl">{lang === Language.ZH ? s.label.zh : s.label.en}</p>
                               <p className={`text-xs font-bold ${selectedStyle === s.id ? 'opacity-50' : 'text-[#8C8379]'}`}>{lang === Language.ZH ? s.description.zh : s.description.en}</p>
                             </div>
                          </button>
                        ))}
                     </div>
                   </div>
                   <button onClick={handleGenerate} className="w-full mt-16 py-8 bg-[#AED9E0] text-[#3E3636] rounded-full font-black text-2xl hover:shadow-2xl transition-all uppercase tracking-widest active:scale-95">
                     {t.btnGen}
                   </button>
                </div>
             </div>
          </section>
        )}

        {appState === AppState.GENERATING && <LoadingScreen lang={lang} />}

        {appState === AppState.RESULT && generatedResults.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-1000">
             <div className="bg-white p-12 md:p-20 rounded-[6rem] shadow-2xl mb-16 relative border border-[#EAE0D5] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#AED9E0]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                   <div className="lg:w-1/2">
                      <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl group cursor-pointer"
                           onMouseDown={() => setShowOriginal(true)}
                           onMouseUp={() => setShowOriginal(false)}>
                         <img src={showOriginal ? selectedImage! : generatedResults[0].url} className="w-full h-full object-cover transition-all" alt="Result" />
                         <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/30">Hold to compare</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="lg:w-1/2 text-center lg:text-left">
                      <span className="text-xs font-black text-[#AED9E0] uppercase tracking-[0.5em] mb-4 block">LAB EDITION No.024</span>
                      <h2 className="text-6xl font-black mb-10 tracking-tighter italic">《{generatedResults[0].style}》</h2>
                      
                      <div className="grid grid-cols-2 gap-4 mb-10">
                         <button onClick={() => window.open(generatedResults[0].url)} className="py-5 bg-[#3E3636] text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all">{t.btnDownload}</button>
                         <button onClick={() => setShowShareModal(true)} className="py-5 border-2 border-[#3E3636] text-[#3E3636] rounded-2xl font-black text-lg hover:bg-[#3E3636] hover:text-white transition-all">{t.btnShareCard}</button>
                      </div>

                      <div className="p-10 bg-[#FDFCFB] rounded-[3rem] border-2 border-dashed border-[#AED9E0] group hover:border-solid transition-all">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-[#3E3636] text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-lg group-hover:rotate-12 transition-transform">田</div>
                            <h3 className="text-2xl font-black tracking-tight">{t.physicalTitle}</h3>
                         </div>
                         <p className="text-sm font-bold text-[#8C8379] mb-8 leading-relaxed">{t.physicalSub}</p>
                         <button 
                            className="w-full py-5 bg-gradient-to-r from-[#AED9E0] to-[#F8C8D8] text-[#3E3636] rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md"
                            onClick={() => {
                               if (user.pets.length === 0) {
                                  alert(lang === Language.ZH ? '请先建立“喵喵护照”，以便匠人精准涂色。' : 'Create Passport first.');
                                  setAppState(AppState.PROFILE);
                                  setProfileTab('pets');
                               } else {
                                  alert(lang === Language.ZH ? '正在调取档案，已为您通知专属定制画师...' : 'Notifying artisan...');
                               }
                            }}
                         >
                            {t.physicalBtn}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={resetApp} className="block mx-auto text-lg font-black text-[#8C8379] uppercase tracking-widest hover:text-[#3E3636] transition-colors">← {t.btnBack}</button>
          </section>
        )}

        {appState === AppState.PROFILE && (
          <section className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
             {/* ... 保留 PROFILE 内容 ... */}
             <div className="flex flex-col md:flex-row gap-12">
                <aside className="md:w-1/4 space-y-6">
                   <div className="bg-[#3E3636] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-[3s]"></div>
                      <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mb-8">💎</div>
                      <h2 className="text-2xl font-black tracking-tighter mb-10">COLLECTOR<br />#{user.id.slice(-4).toUpperCase()}</h2>
                      <div className="bg-white/10 p-6 rounded-2xl">
                         <p className="text-[10px] font-black text-white/40 uppercase mb-1">{t.creditsBalance}</p>
                         <p className="text-4xl font-black">{user.credits.toFixed(0)}</p>
                      </div>
                   </div>
                   
                   <nav className="space-y-2">
                      {[
                        { id: 'art', label: t.tabArt, icon: '🖼️' },
                        { id: 'pets', label: t.tabPets, icon: '🐾' },
                        { id: 'invite', label: t.tabInvite, icon: '🎁' }
                      ].map(item => (
                        <button 
                          key={item.id}
                          onClick={() => setProfileTab(item.id as any)}
                          className={`w-full flex items-center gap-5 p-6 rounded-3xl font-black transition-all ${profileTab === item.id ? 'bg-white shadow-xl border border-[#EAE0D5]' : 'text-[#8C8379] hover:bg-white/50'}`}
                        >
                           <span className="text-xl">{item.icon}</span>
                           {item.label}
                        </button>
                      ))}
                   </nav>
                </aside>

                <div className="md:w-3/4 bg-white rounded-[5rem] p-12 md:p-20 shadow-sm border border-[#EAE0D5]">
                   {profileTab === 'art' && (
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
                        {user.history.map(img => (
                          <div key={img.id} className="aspect-square rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => { setSelectedImage(img.originalUrl!); setGeneratedResults([img]); setAppState(AppState.RESULT); }}>
                            <img src={img.url} className="w-full h-full object-cover" />
                          </div>
                        ))}
                     </div>
                   )}

                   {profileTab === 'pets' && (
                     <div className="animate-in fade-in">
                        <div className="flex justify-between items-center mb-16">
                           <h3 className="text-5xl font-black tracking-tighter uppercase">Passports</h3>
                           {!isAddingPet && (
                             <button onClick={() => setIsAddingPet(true)} className="px-10 py-4 bg-[#3E3636] text-white rounded-2xl font-black hover:scale-105 transition-all">{t.addPetBtn}</button>
                           )}
                        </div>

                        {isAddingPet && (
                          <div className="bg-[#FDFCFB] p-12 rounded-[4rem] border-2 border-[#EAE0D5] mb-12 space-y-8 animate-in slide-in-from-top-6">
                             <div className="grid grid-cols-2 gap-8">
                                <div>
                                   <label className="block text-xs font-black text-[#8C8379] uppercase mb-3">{t.petName}</label>
                                   <input value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-[#AED9E0] font-black text-xl" placeholder="例如：奥利奥" />
                                </div>
                                <div>
                                   <label className="block text-xs font-black text-[#8C8379] uppercase mb-3">{t.petBreed}</label>
                                   <input value={newPet.breed} onChange={e => setNewPet({...newPet, breed: e.target.value})} className="w-full p-5 rounded-2xl border border-gray-200 outline-none focus:border-[#AED9E0] font-black text-xl" placeholder="英短/田园/布偶..." />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-black text-[#8C8379] uppercase mb-3">{t.petFeatures}</label>
                                <textarea value={newPet.features} onChange={e => setNewPet({...newPet, features: e.target.value})} className="w-full p-6 rounded-2xl border border-gray-200 outline-none focus:border-[#AED9E0] h-32 font-medium" placeholder="详细描述猫咪的毛色斑点，方便匠人彩绘..." />
                             </div>
                             <div className="flex gap-4">
                                <button onClick={handleAddPet} className="flex-grow py-5 bg-[#3E3636] text-white rounded-2xl font-black text-xl shadow-xl">{t.savePet}</button>
                                <button onClick={() => setIsAddingPet(false)} className="px-10 py-5 bg-gray-200 rounded-2xl font-black">取消</button>
                             </div>
                          </div>
                        )}

                        <div className="space-y-6">
                           {user.pets.map(pet => (
                             <div key={pet.id} className="p-12 bg-[#FDFCFB] rounded-[4rem] border border-gray-100 flex items-center gap-10 group relative">
                                <div className="w-24 h-24 bg-[#AED9E0]/20 rounded-3xl flex items-center justify-center text-5xl">😺</div>
                                <div className="flex-grow">
                                   <div className="flex items-center gap-4 mb-3">
                                      <h4 className="text-4xl font-black tracking-tighter">{pet.name}</h4>
                                      <span className="px-4 py-1 bg-[#3E3636] text-white rounded-lg text-xs font-black tracking-widest uppercase">{pet.breed}</span>
                                   </div>
                                   <p className="text-lg font-medium text-[#8C8379] leading-relaxed">{pet.features || '尚未录入特征'}</p>
                                </div>
                                <button className="absolute top-10 right-10 text-red-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-black" onClick={() => setUser(prev => ({...prev, pets: prev.pets.filter(p => p.id !== pet.id)}))}>移除</button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>
          </section>
        )}
      </main>

      {/* 优化后的病毒式分享海报弹窗 */}
      {showShareModal && generatedResults.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E3636]/90 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white rounded-[3rem] max-w-[420px] w-full overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-[12px] border-white">
              <div className="aspect-[9/16] relative flex flex-col bg-[#FDFCFB]">
                 
                 {/* 海报顶部：紧凑品牌信息 */}
                 <div className="p-8 flex justify-between items-center border-b border-[#EAE0D5]">
                    <div>
                       <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#3E3636] leading-none mb-1">MEOW SQUARED</h5>
                       <p className="text-[7px] font-bold text-[#8C8379] uppercase tracking-widest">RECONSTRUCTION ID: #{generatedResults[0].id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#3E3636] text-white rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg">M²</div>
                 </div>

                 {/* 核心视觉区：After 主图全屏化 */}
                 <div className="flex-grow relative overflow-hidden bg-gray-50">
                    <img src={generatedResults[0].url} className="w-full h-full object-cover" />
                    
                    {/* 浮动原图对比：悬浮窗设计 */}
                    <div className="absolute top-6 right-6 group">
                       <div className="relative">
                          <div className="absolute -top-3 -right-3 bg-[#3E3636] text-white text-[8px] font-black px-2 py-1 rounded-md z-10 shadow-lg">ORIGIN</div>
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transition-transform hover:scale-110">
                             <img src={generatedResults[0].originalUrl || selectedImage!} className="w-full h-full object-cover grayscale-[0.2]" />
                          </div>
                       </div>
                    </div>

                    {/* 渐变遮罩：为底部文字提供阅读感 */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* 主图下方的浮动文字 */}
                    <div className="absolute bottom-6 left-8 text-white">
                       <h2 className="text-4xl font-black tracking-tight italic mb-1">《{generatedResults[0].style}》</h2>
                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Subject: {getPetName()}</p>
                    </div>
                 </div>

                 {/* 海报信息密度区：规格表 (Specs) */}
                 <div className="bg-[#FDFCFB] p-8">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 border-b border-[#EAE0D5] pb-6 mb-6">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-[#8C8379] uppercase tracking-widest">Medium / 材质</p>
                          <p className="text-xs font-black text-[#3E3636]">{generatedResults[0].style}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-[#8C8379] uppercase tracking-widest">Lighting / 布光</p>
                          <p className="text-xs font-black text-[#3E3636]">Museum Grade</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-[#8C8379] uppercase tracking-widest">Collector / 藏家</p>
                          <p className="text-xs font-black text-[#3E3636]">ID-{user.id.slice(-4).toUpperCase()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-[#8C8379] uppercase tracking-widest">Status / 状态</p>
                          <p className="text-xs font-black text-green-600">Verified</p>
                       </div>
                    </div>

                    {/* 海报页脚：二维码 + Slogan */}
                    <div className="flex items-center gap-6">
                       <div className="shrink-0 w-20 h-20 bg-white border border-[#EAE0D5] rounded-2xl p-2 relative">
                          <div className="w-full h-full bg-[#FDFCFB] rounded-lg flex items-center justify-center opacity-30">
                             <span className="text-[6px] font-black text-center leading-none">SCAN<br/>TO<br/>CRAFT</span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-4 h-4 bg-[#3E3636] rounded-sm flex items-center justify-center text-[5px] text-white font-black leading-none">M²</div>
                          </div>
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-[#3E3636] mb-1 tracking-tight">喵的二次方：重构次元</p>
                          <p className="text-[8px] font-bold text-[#8C8379] leading-relaxed uppercase tracking-wider">The most advanced AI laboratory<br/>for feline artistic reconstruction.</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl transition-all shadow-xl">×</button>
              <div className="p-6 bg-white border-t border-[#EAE0D5] flex gap-4">
                 <button onClick={() => alert('已保存海报：1242 x 2208 px')} className="flex-grow py-5 bg-[#3E3636] text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">保存认证海报</button>
              </div>
           </div>
        </div>
      )}

      {/* ... 保留 FOOTER ... */}
      <footer className="py-24 border-t border-[#EAE0D5] text-center bg-white">
         <p className="text-3xl font-black mb-4 tracking-tighter uppercase">Meow Squared</p>
         <p className="text-xs font-bold text-[#8C8379] opacity-40 uppercase tracking-[1em] mb-12">Artistry · Emotion · Kept</p>
         <div className="flex justify-center gap-10 text-[10px] font-black text-[#8C8379] uppercase tracking-widest">
            <a href="#" className="hover:text-[#3E3636]">Instagram</a>
            <a href="#" className="hover:text-[#3E3636]">Twitter</a>
            <a href="#" className="hover:text-[#3E3636]">Contact</a>
         </div>
      </footer>
    </div>
  );
}
