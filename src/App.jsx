import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Moon, Sun, Bookmark, Settings, Play, Pause, 
  ChevronLeft, X, BookOpen, Quote, Heart, ChevronRight,
  ArrowRight, Music, Clock, Sparkles, LayoutGrid,
  FileText, Scroll, Hand, Loader2, Coffee, GraduationCap,
  Info
} from 'lucide-react';

// Konfigurasi
const API_BASE_URL = 'https://equran.id/api/v2';
const APP_NAME = "Nur Qur'an";
const BYLINE = "by Mas Dewa";
const TAGLINE = "Cahaya untuk Hati, Petunjuk Sepanjang Hidup";
const PREFERRED_QARI = '05'; 

// --- DATA STATIS ---
const TAHLIL_CONTENT = [
  { id: 1, title: "Al-Fatihah", ar: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ...", idn: "Kepada yang terhormat Nabi Muhammad SAW..." },
  { id: 2, title: "Al-Ikhlas (3x)", ar: "قُلْ هُوَ اللَّهُ أَحَدٌ . اللَّهُ الصَّمَدُ...", idn: "Katakanlah: Dialah Allah, Yang Maha Esa..." },
  { id: 3, title: "Kalimat Tahlil", ar: "لَا إِلَهَ إِلَّا اللهُ", idn: "Tiada Tuhan selain Allah." }
];

const DOA_CATEGORIES = [
  { id: 'daily', title: 'Doa Harian', icon: Coffee, count: 19 },
  { id: 'prophet', title: 'Doa Para Nabi', icon: GraduationCap, count: 10 },
  { id: 'sholat', title: 'Setelah Sholat', icon: Hand, count: 12 }
];

const DOA_LIST = {
  daily: [
    { id: 1, title: "Doa Bangun Tidur", ar: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا...", idn: "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami..." },
    { id: 2, title: "Doa Sebelum Makan", ar: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا...", idn: "Ya Allah, berkahilah kami atas rezeki yang Engkau berikan..." }
  ],
  prophet: [{ id: 1, title: "Doa Nabi Yunus", ar: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ...", idn: "Tidak ada Tuhan selain Engkau..." }],
  sholat: [{ id: 1, title: "Doa Setelah Sholat", ar: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ...", idn: "Ya Allah, bantulah aku untuk mengingat-Mu..." }]
};

const DZIKIR_PAGI = [{ id: 1, title: "Ayat Kursi", ar: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...", idn: "Allah, tidak ada Tuhan melainkan Dia Yang Hidup kekal..." }];
const DZIKIR_SORE = [{ id: 1, title: "Perlindungan (3x)", ar: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ...", idn: "Aku berlindung dengan kalimat Allah yang sempurna..." }];

const QUICK_SURAHS = [
  { id: 18, name: 'Al-Kahfi' }, { id: 36, name: 'Yasin' }, { id: 67, name: 'Al-Mulk' }, { id: 56, name: 'Al-Waqi\'ah' }
];

// --- UTILS ---
const saveToLocal = (key, val) => localStorage.setItem(`nurquran_${key}`, JSON.stringify(val));
const getFromLocal = (key) => {
  const data = localStorage.getItem(`nurquran_${key}`);
  return data ? JSON.parse(data) : null;
};

const App = () => {
  const [view, setView] = useState('landing'); 
  const [subMenu, setSubMenu] = useState(null); 
  const [doaCategory, setDoaCategory] = useState(null);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  
  const [activeVerse, setActiveVerse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const [darkMode, setDarkMode] = useState(getFromLocal('darkMode') ?? false);
  const [fontSize, setFontSize] = useState(getFromLocal('fontSize') ?? 32);
  const [showTranslation, setShowTranslation] = useState(getFromLocal('showTrans') ?? true);
  const [bookmarks, setBookmarks] = useState(getFromLocal('bookmarks') || []);
  
  // State untuk Popup Pengembangan
  const [showDevPopup, setShowDevPopup] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    fetchSurahs();
    // Tampilkan popup pengembangan setelah delay singkat
    const timer = setTimeout(() => setShowDevPopup(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    saveToLocal('darkMode', darkMode);
  }, [darkMode]);

  const fetchSurahs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/surat`);
      const json = await res.json();
      setSurahs(json.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const openSurah = async (number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/surat/${number}`);
      const json = await res.json();
      setSelectedSurah(json.data);
      setView('reader');
      setSubMenu(null);
      setDoaCategory(null);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setLoading(false);
    }
  };

  const toggleBookmark = (verse) => {
    const isBookmarked = bookmarks.some(b => b.nomorAyat === verse.nomorAyat && b.surahNumber === selectedSurah.nomor);
    let newBookmarks = isBookmarked 
      ? bookmarks.filter(b => !(b.nomorAyat === verse.nomorAyat && b.surahNumber === selectedSurah.nomor))
      : [...bookmarks, { ...verse, surahNumber: selectedSurah.nomor, surahName: selectedSurah.namaLatin }];
    setBookmarks(newBookmarks);
    saveToLocal('bookmarks', newBookmarks);
  };

  const playAudio = (verse) => {
    if (activeVerse === verse.nomorAyat && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setActiveVerse(verse.nomorAyat);
      setIsBuffering(true);
      const url = verse.audio[PREFERRED_QARI]; 
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        audioRef.current.play().catch(e => console.log(e));
      }
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nomor.toString().includes(searchTerm)
  );

  // --- UI COMPONENTS ---

  const Particles = () => {
    const pArray = useMemo(() => Array.from({ length: 15 }), []);
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {pArray.map((_, i) => (
          <div key={i} className="absolute bg-white/20 rounded-full animate-float-up"
            style={{ width: '4px', height: '4px', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s`, animationDuration: '15s' }}
          />
        ))}
      </div>
    );
  };

  const Header = () => (
    <nav className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-lg border-b px-4 sm:px-8 py-4 sm:py-6 transition-all duration-300 ${darkMode ? 'bg-slate-950/90 border-slate-800 shadow-2xl shadow-black/40' : 'bg-white/95 border-slate-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {setView('home'); setSubMenu(null); setDoaCategory(null); setSelectedSurah(null);}}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-700 rounded-[10px] flex items-center justify-center text-white shadow-xl">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-base sm:text-xl font-black leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>{APP_NAME}</h1>
            <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase mt-1 tracking-widest">{BYLINE}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-[10px] transition-all ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button onClick={() => setView('bookmarks')} className={`p-3 rounded-[10px] transition-all ${view === 'bookmarks' ? 'bg-emerald-600 text-white shadow-lg' : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            <Bookmark size={24} />
          </button>
          <button onClick={() => setView('settings')} className={`p-3 rounded-[10px] transition-all ${view === 'settings' ? 'bg-emerald-600 text-white shadow-lg' : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            <Settings size={24} />
          </button>
        </div>
      </div>
    </nav>
  );

  const Footer = () => (
    <footer className="mt-12 sm:mt-24 pb-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto relative rounded-[15px] overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-10 sm:p-20 text-center shadow-2xl">
        <div className="relative z-10 flex flex-col items-center">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-[10px] flex items-center justify-center text-white mb-6 border border-white/10"><BookOpen size={24} /></div>
           <h3 className="text-lg sm:text-2xl font-black text-white mb-2 tracking-tight">{APP_NAME} <span className="text-emerald-400">Digital</span></h3>
           <p className="text-[10px] sm:text-sm text-emerald-100/60 max-w-xs mb-8 italic font-medium">"{TAGLINE}"</p>
           <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-8"></div>
           <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 text-[9px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <span>{BYLINE}</span> <span className="hidden sm:block opacity-30">•</span> <span>© 2026 — Khidmat Digital Al-Qur'an</span>
           </div>
        </div>
      </div>
    </footer>
  );

  // FIX: Parameter fungsi murni JavaScript (Hapus tanda titik dua)
  const renderListContent = (title, data, IconComponent, backAction) => (
    <div className="max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      <button onClick={backAction} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-8 hover:translate-x-[-4px] transition-transform">
        <ChevronLeft size={20} /> Kembali
      </button>
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-14 h-14 bg-emerald-700 text-white rounded-[15px] flex items-center justify-center shadow-xl">
           <IconComponent size={28} />
        </div>
        <h2 className={`text-2xl sm:text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      </div>
      <div className="space-y-6">
        {data.map(item => (
          <div key={item.id} className={`p-6 sm:p-10 rounded-[15px] border shadow-sm transition-all hover:shadow-md ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-[6px] uppercase tracking-widest">{item.type || 'Bacaan'}</span>
              <h4 className="font-bold text-emerald-600 text-xs sm:text-sm">{item.title}</h4>
            </div>
            <div className={`text-right text-3xl sm:text-4xl font-serif mb-8 leading-relaxed ${darkMode ? 'text-slate-100' : 'text-slate-900'}`} dir="rtl">{item.ar}</div>
            <p className={`text-sm sm:text-lg font-light leading-relaxed border-l-4 border-emerald-100 pl-4 ${darkMode ? 'text-slate-400 border-emerald-900' : 'text-slate-600 border-emerald-50'}`}>{item.idn}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (view === 'landing') {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden relative ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <style>{`
          @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-100vh) translateX(20px); opacity: 0; } }
          .animate-float-up { animation: floatUp linear infinite; }
          @keyframes gradMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          .bg-animated-emerald { background: linear-gradient(-45deg, #064e3b, #065f46, #059669, #064e3b); background-size: 400% 400%; animation: gradMove 12s ease infinite; }
        `}</style>
        <div className="max-w-3xl w-full text-center relative z-10 animate-in fade-in duration-1000 px-4">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-700 rounded-[15px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl rotate-3"><BookOpen size={32} /></div>
           <h1 className="text-3xl sm:text-7xl font-black mb-8 tracking-tight leading-tight text-slate-900 dark:text-white">Dekatkan Diri dengan <span className="text-emerald-600">Kalamullah.</span></h1>
           <p className="text-sm sm:text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">Mushaf Digital modern dengan koleksi Yasin, Tahlil, Doa, dan Dzikir yang menenangkan jiwa.</p>
           <button onClick={() => setView('home')} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 sm:py-5 rounded-[12px] text-lg font-bold shadow-xl active:scale-95 transition-all flex items-center gap-3 mx-auto">Mulai Membaca <ArrowRight size={22} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-[86px] sm:pt-[106px] ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-100vh) translateX(20px); opacity: 0; } }
        .animate-float-up { animation: floatUp linear infinite; }
        @keyframes gradMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .bg-animated-emerald { background: linear-gradient(-45deg, #064e3b, #065f46, #059669, #064e3b); background-size: 400% 400%; animation: gradMove 12s ease infinite; }
      `}</style>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        
        {view === 'home' && !subMenu && (
          <>
            <section className="relative w-full mb-10 sm:mb-14 rounded-[15px] overflow-hidden shadow-2xl bg-animated-emerald">
              <Particles />
              <div className="relative z-10 p-8 sm:p-24 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] sm:text-xs font-black uppercase text-emerald-300 border border-white/5 mb-8">
                  <Sparkles size={12} className="animate-pulse" /> Nur Qurani - AL QURAN DIGITAL
                </div>
                <h2 className="text-2xl sm:text-6xl font-black text-white leading-tight mb-8 drop-shadow-xl">Pelita Hati dalam Setiap <span className="text-emerald-300">Lantunan Ayat.</span></h2>
                <div className="relative w-full max-w-2xl group px-2 sm:px-0">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={22} />
                  <input type="text" placeholder="Cari Surah atau Doa..." className="w-full bg-white/10 backdrop-blur-xl border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white rounded-[12px] py-4 sm:py-6 pl-16 pr-8 outline-none text-base sm:text-xl transition-all shadow-2xl placeholder:text-emerald-100/30 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </section>

            {/* QUICK MENU HUB */}
            <div className={`mb-12 p-4 rounded-[15px] border shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`}>
              <button onClick={() => {setView('home'); setSubMenu(null)}} className="flex items-center justify-center sm:justify-start gap-3 p-4 sm:p-6 rounded-[12px] bg-emerald-700 text-white shadow-lg active:scale-95 transition-all">
                <BookOpen size={20} className="shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Al-Quran</span>
              </button>
              <button onClick={() => setSubMenu('tahlil')} className={`flex items-center justify-center sm:justify-start gap-3 p-4 sm:p-6 rounded-[12px] active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <FileText size={20} className="text-emerald-600 shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Yasin Tahlil</span>
              </button>
              <button onClick={() => setSubMenu('doa')} className={`flex items-center justify-center sm:justify-start gap-3 p-4 sm:p-6 rounded-[12px] active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <Hand size={20} className="text-emerald-600 shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Doa Harian</span>
              </button>
              <button onClick={() => setSubMenu('dzikir')} className={`flex items-center justify-center sm:justify-start gap-3 p-4 sm:p-6 rounded-[12px] active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <Sun size={20} className="text-emerald-600 shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Dzikir P & S</span>
              </button>
            </div>

            <div className="px-1 sm:px-2 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1.5 h-8 bg-emerald-600 rounded-full shadow-lg"></div>
                 <h3 className={`text-lg sm:text-2xl font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daftar Surah</h3>
              </div>
              {loading ? <div className="py-24 text-center"><Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
                  {filteredSurahs.map((surah) => (
                    <div key={surah.nomor} onClick={() => openSurah(surah.nomor)} className={`group flex items-center gap-4 p-6 rounded-[15px] hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden active:scale-95 border ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className={`w-11 h-11 flex-shrink-0 rounded-[10px] flex items-center justify-center text-sm font-black ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'} group-hover:bg-emerald-700 group-hover:text-white transition-all`}>{surah.nomor}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold group-hover:text-emerald-700 transition-colors truncate text-sm sm:text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>{surah.namaLatin}</h3>
                        <p className="text-[8px] sm:text-[10px] font-medium uppercase truncate text-slate-500">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                      </div>
                      <div className={`text-right text-lg sm:text-2xl font-serif ${darkMode ? 'text-emerald-500' : 'text-emerald-800'}`}>{surah.nama}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- SUB-MENU VIEWS --- */}
        {subMenu === 'tahlil' && (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500 px-4">
            <button onClick={() => setSubMenu(null)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-10"><ChevronLeft size={20} /> Kembali</button>
            <h2 className={`text-3xl sm:text-5xl font-black mb-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Yasin & Tahlil</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button onClick={() => setView('tahlil-content')} className={`p-10 rounded-[15px] border group text-left active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-none' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'}`}>
                 <FileText size={48} className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                 <h3 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Bacaan Tahlil</h3>
                 <p className="text-sm text-slate-500">Urutan bacaan tahlil lengkap beserta terjemahannya.</p>
              </button>
              <button onClick={() => openSurah(36)} className={`p-10 rounded-[15px] border group text-left active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-none' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'}`}>
                 <Scroll size={48} className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                 <h3 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Surat Yasin</h3>
                 <p className="text-sm text-slate-500">Bacaan Surat Yasin lengkap (Surah ke-36).</p>
              </button>
            </div>
          </div>
        )}

        {subMenu === 'doa' && !doaCategory && (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500 px-4">
            <button onClick={() => setSubMenu(null)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-10"><ChevronLeft size={20} /> Kembali</button>
            <h2 className={`text-3xl sm:text-5xl font-black mb-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Kumpulan Doa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
               {DOA_CATEGORIES.map(cat => (
                 <button key={cat.id} onClick={() => setDoaCategory(cat.id)} className={`p-8 rounded-[15px] border group text-left active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'}`}>
                    <cat.icon size={32} className="text-emerald-600 mb-4 group-hover:rotate-12 transition-transform" />
                    <h3 className={`text-xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{cat.title}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{cat.count} Bacaan</p>
                 </button>
               ))}
            </div>
          </div>
        )}

        {subMenu === 'dzikir' && (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500 px-4">
            <button onClick={() => setSubMenu(null)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-10"><ChevronLeft size={20} /> Kembali</button>
            <h2 className={`text-3xl sm:text-5xl font-black mb-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dzikir Harian</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <button onClick={() => setView('dzikir-pagi')} className={`p-10 rounded-[15px] border group text-center active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-emerald-50 border-slate-200 shadow-sm'}`}>
                  <Sun size={48} className="text-amber-500 mx-auto mb-6 group-hover:scale-125 transition-transform duration-500" />
                  <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dzikir Pagi</h3>
                  <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em]">Sesuai Sunnah</p>
               </button>
               <button onClick={() => setView('dzikir-sore')} className={`p-10 rounded-[15px] border group text-center active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-indigo-50 border-slate-200 shadow-sm'}`}>
                  <Moon size={48} className="text-indigo-400 mx-auto mb-6 group-hover:scale-125 transition-transform duration-500" />
                  <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dzikir Sore</h3>
                  <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em]">Sesuai Sunnah</p>
               </button>
            </div>
          </div>
        )}

        {/* --- CONTENT SPECIFIC VIEW --- */}
        {view === 'tahlil-content' && renderListContent("Bacaan Tahlil", TAHLIL_CONTENT, FileText, () => setSubMenu('tahlil'))}
        {view === 'dzikir-pagi' && renderListContent("Dzikir Pagi", DZIKIR_PAGI, Sun, () => setSubMenu('dzikir'))}
        {view === 'dzikir-sore' && renderListContent("Dzikir Sore", DZIKIR_SORE, Moon, () => setSubMenu('dzikir'))}
        {doaCategory && renderListContent(DOA_CATEGORIES.find(c=>c.id===doaCategory).title, DOA_LIST[doaCategory], Hand, () => setDoaCategory(null))}

        {/* --- READER VIEW --- */}
        {view === 'reader' && selectedSurah && (
          <div className="max-w-4xl mx-auto py-2 sm:py-6 relative animate-in fade-in duration-500 px-1">
            <button onClick={() => {setView('home'); setSelectedSurah(null);}} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-xs sm:text-sm mb-6 px-2"><ChevronLeft size={16} /> Kembali</button>
            <div className="text-center mb-10 sm:mb-16 px-2">
              <h2 className={`text-xl sm:text-4xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedSurah.namaLatin}</h2>
              <p className="text-[10px] sm:text-base text-slate-500 mb-6 font-medium">{selectedSurah.arti} • {selectedSurah.jumlahAyat} Ayat</p>
              <div className="text-5xl sm:text-7xl font-serif text-emerald-700 mb-8 leading-tight">{selectedSurah.nama}</div>
            </div>
            <div className="space-y-12 sm:space-y-20 pb-40 px-4">
              {selectedSurah.nomor !== 9 && selectedSurah.nomor !== 1 && (
                <div className={`text-center text-3xl sm:text-5xl font-serif py-10 opacity-90 ${darkMode ? 'text-white' : 'text-slate-900'}`}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
              )}
              {selectedSurah.ayat.map((ayat) => (
                <div key={ayat.nomorAyat} className={`group border-b pb-10 sm:pb-16 last:border-0 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex flex-col gap-6 sm:gap-10">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 px-2.5 py-1 rounded-[6px] text-[10px] sm:text-xs font-black">{selectedSurah.nomor}:{ayat.nomorAyat}</span>
                      <button onClick={() => playAudio(ayat)} disabled={isBuffering && activeVerse === ayat.nomorAyat} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${activeVerse === ayat.nomorAyat && isPlaying ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                        {activeVerse === ayat.nomorAyat && isBuffering ? <Loader2 size={20} className="animate-spin" /> : activeVerse === ayat.nomorAyat && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} />}
                      </button>
                      <button onClick={() => toggleBookmark(ayat)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${bookmarks.some(b => b.nomorAyat === verse.nomorAyat && b.surahNumber === selectedSurah.nomor) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}><Bookmark size={20} fill={bookmarks.some(b => b.nomorAyat === ayat.nomorAyat && b.surahNumber === selectedSurah.nomor) ? "currentColor" : "none"} /></button>
                    </div>
                    <div className={`text-right font-serif leading-[2.8] sm:leading-[3.2] ${activeVerse === ayat.nomorAyat && isPlaying ? 'text-emerald-400' : darkMode ? 'text-slate-100' : 'text-slate-900'}`} style={{ fontSize: window.innerWidth < 640 ? `${fontSize * 0.75}px` : `${fontSize}px` }} dir="rtl">{ayat.teksArab}</div>
                    {showTranslation && <p className={`text-sm sm:text-lg font-light leading-relaxed max-w-2xl px-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{ayat.teksIndonesia}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKMARKS & SETTINGS VIEW */}
        {view === 'bookmarks' && (
          <div className="max-w-4xl mx-auto py-6 px-4">
             <h2 className={`text-2xl sm:text-3xl font-black mb-12 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}><Bookmark className="text-emerald-700" size={32} /> Penanda</h2>
             {bookmarks.length === 0 ? <div className="text-center py-32 rounded-[15px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">Belum ada ayat disimpan.</div> : (
               <div className="grid grid-cols-1 gap-6 px-2">
                 {bookmarks.map((b, i) => (
                   <div key={i} className={`p-8 rounded-[15px] border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{b.surahName} : {b.nomorAyat}</span>
                        <button onClick={() => toggleBookmark(b)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={20}/></button>
                      </div>
                      <div className={`text-right text-3xl font-serif mb-6 leading-relaxed ${darkMode ? 'text-white' : 'text-slate-900'}`} dir="rtl">{b.teksArab}</div>
                      <button onClick={() => openSurah(b.surahNumber)} className="font-black text-emerald-700 hover:gap-3 transition-all flex items-center gap-2 text-sm sm:text-base">Lanjut Membaca <ChevronRight size={18}/></button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-xl mx-auto py-6 px-4">
             <h2 className={`text-3xl font-black mb-12 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}><Settings className="text-emerald-700" size={32}/> Pengaturan</h2>
             <div className={`rounded-[15px] p-10 space-y-12 shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div><h4 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ukuran Teks Arab</h4><p className="text-sm text-slate-500">Sesuaikan kenyamanan mata Anda.</p></div>
                    <span className="text-emerald-700 font-black text-xl">{fontSize}px</span>
                  </div>
                  <input type="range" min="28" max="52" value={fontSize} onChange={(e) => { setFontSize(parseInt(e.target.value)); saveToLocal('fontSize', parseInt(e.target.value)); }} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-700" />
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                   <div><h4 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terjemahan</h4><p className="text-sm text-slate-500">Tampilkan arti Bahasa Indonesia.</p></div>
                   <button onClick={() => { const v = !showTranslation; setShowTranslation(v); saveToLocal('showTrans', v); }} className={`w-14 h-7 rounded-full relative transition-all duration-300 ${showTranslation ? 'bg-emerald-700' : 'bg-slate-200 dark:bg-slate-800'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${showTranslation ? 'left-8' : 'left-1'}`}></div></button>
                </div>
             </div>
             <button onClick={() => setView('home')} className="w-full mt-10 py-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[15px] font-black text-lg shadow-xl active:scale-95 transition-all">Selesai & Simpan</button>
          </div>
        )}
      </main>

      <Footer />

      {/* Floating Audio Player */}
      {activeVerse && (
        <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm backdrop-blur-md border p-4 sm:p-5 rounded-[15px] shadow-2xl flex items-center justify-between ring-4 ring-emerald-500/5 transition-all duration-300 ${darkMode ? 'bg-slate-900/95 border-slate-800 shadow-none' : 'bg-white/95 border-emerald-100 shadow-xl'}`}>
           <div className="flex flex-col ml-1 sm:ml-2 overflow-hidden">
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {isBuffering ? <Loader2 size={10} className="animate-spin" /> : <Music size={10} />} {isBuffering ? 'Memuat...' : 'Nahawand Style'}
              </span>
              <span className={`text-xs sm:text-sm font-bold truncate max-w-[140px] ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {selectedSurah ? selectedSurah.namaLatin : 'Nur Qur\'an'} : {activeVerse}
              </span>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={() => setIsPlaying(!isPlaying)} className="w-11 h-11 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                {isBuffering ? <Loader2 size={22} className="animate-spin" /> : isPlaying ? <Pause size={22} fill="white"/> : <Play size={22} fill="white"/>}
             </button>
             <button onClick={() => {setActiveVerse(null); setIsPlaying(false); if(audioRef.current){audioRef.current.pause()}}} className={`transition-colors p-2 ${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}><X size={18}/></button>
           </div>
           <audio ref={audioRef} onPlaying={() => {setIsPlaying(true); setIsBuffering(false);}} onWaiting={() => setIsBuffering(true)} onCanPlay={() => setIsBuffering(false)} onEnded={() => {setIsPlaying(false); setIsBuffering(false);}} className="hidden" />
        </div>
      )}

      {/* --- POPUP PENGEMBANGAN --- */}
      {showDevPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/40 animate-in fade-in duration-300">
          <div className={`relative max-w-md w-full p-8 sm:p-10 rounded-[15px] border shadow-2xl transition-all duration-300 transform scale-100 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-50'}`}>
            <button 
              onClick={() => setShowDevPopup(false)} 
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Info size={32} />
              </div>
              
              <h3 className={`text-xl sm:text-2xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Informasi Pengembangan
              </h3>
              
              <p className={`text-sm sm:text-base leading-relaxed mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Aplikasi ini masih dalam tahap penyempurnaan. Kami memohon maaf apabila terdapat fitur atau tombol yang belum dapat diakses sepenuhnya. Kami berkomitmen untuk terus memperbarui setiap bagian secara berkala demi kenyamanan ibadah Anda.
              </p>
              
              <button 
                onClick={() => setShowDevPopup(false)}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-[12px] shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;