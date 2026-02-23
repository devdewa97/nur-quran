import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Moon, Sun, Bookmark, Settings, Play, Pause, 
  ChevronLeft, X, BookOpen, Quote, Heart, ChevronRight,
  ArrowRight, Music, Clock, Sparkles, LayoutGrid,
  FileText, Scroll, Hand, Loader2, Coffee, GraduationCap,
  Info, Home, MapPin
} from 'lucide-react';

// Konfigurasi
const API_BASE_URL = 'https://equran.id/api/v2';
const APP_NAME = "Nur Qur'an";
const BYLINE = "by Mas Dewa";
const TAGLINE = "Cahaya untuk Hati, Petunjuk Sepanjang Hidup";
const PREFERRED_QARI = '05'; 

// --- DATABASE TAHLIL LENGKAP (TANPA POTONGAN) ---
const TAHLIL_FULL = [
  { 
    id: 1, 
    title: "Hadloroh (Pembuka)", 
    ar: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَعَلَى آلِهِ وَأَصْحَابِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ، اَلْفَاتِحَة", 
    idn: "Ke hadirat Nabi Muhammad SAW, keluarga, para sahabat, istri-istri, dan keturunannya. Al-Fatihah." 
  },
  { 
    id: 2, 
    title: "Surah Al-Ikhlas (3x)", 
    ar: "قُلْ هُوَ اللَّهُ أَحَدٌ . اللَّهُ الصَّمَدُ . لَمْ يَلِدْ وَلَمْ يُولَدْ . وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", 
    idn: "Katakanlah (Muhammad): Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. (Allah) tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan-Nya." 
  },
  { 
    id: 3, 
    title: "Tahlil & Takbir", 
    ar: "لَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ", 
    idn: "Tiada Tuhan selain Allah, Allah Maha Besar." 
  },
  { 
    id: 4, 
    title: "Surah Al-Falaq", 
    ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ . مِن شَرِّ مَا خَلَقَ . وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ . وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ . وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", 
    idn: "Katakanlah: Aku berlindung kepada Tuhan Yang Menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang meniup pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki." 
  },
  { 
    id: 5, 
    title: "Surah An-Nas", 
    ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ . مَلِكِ النَّاسِ . إِلَهِ النَّاسِ . مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ . الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ . مِنَ الْجِنَّةِ وَالنَّاسِ", 
    idn: "Katakanlah: Aku berlindung kepada Tuhan (yang memelihara) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) setan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia." 
  },
  { 
    id: 6, 
    title: "Al-Baqarah 1-5", 
    ar: "الم . ذَلِكَ الْكِتَابُ لاَ رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ . الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ . وَالَّذِينَ يُؤْمِنُونَ bِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ . أُولَئِكَ عَلَى هُدًى مِّن رَّبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ", 
    idn: "Alif Lam Mim. Kitab ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa. (Yaitu) mereka yang beriman kepada yang gaib, mendirikan shalat, dan menafkahkan sebagian rezeki yang Kami berikan kepada mereka. Dan mereka yang beriman kepada Kitab (Al-Qur'an) yang telah diturunkan kepadamu dan kitab-kitab yang telah diturunkan sebelummu, serta mereka yakin akan adanya (kehidupan) akhirat. Mereka itulah yang tetap mendapat petunjuk dari Tuhan mereka, dan merekalah orang-orang yang beruntung." 
  },
  { 
    id: 7, 
    title: "Ayat Kursi", 
    ar: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا bِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ", 
    idn: "Allah, tidak ada Tuhan melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tiada yang dapat memberi syafaat di sisi Allah tanpa izin-Nya? Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar." 
  },
  { 
    id: 8, 
    title: "Istighfar (3x)", 
    ar: "أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", 
    idn: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tiada Tuhan selain Dia Yang Maha Hidup lagi terus menerus mengurus makhluk-Nya, dan aku bertobat kepada-Nya." 
  },
  { 
    id: 9, 
    title: "Kalimat Tahlil (100x)", 
    ar: "لَا إِلَهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", 
    idn: "Tiada Tuhan selain Allah, Muhammad adalah utusan Allah, semoga Allah memberikan rahmat dan kesejahteraan kepadanya." 
  },
  { 
    id: 10, 
    title: "Tasbih & Tahmid", 
    ar: "سُبْحَانَ اللهِ وَبِحَمْدِهِ ، سُبْحَانَ اللهِ الْعَظِيمِ", 
    idn: "Maha Suci Allah dengan memuji-Nya, Maha Suci Allah Yang Maha Agung." 
  },
  { 
    id: 11, 
    title: "Sholawat Nabi", 
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ ، اللَّهُمَّ صَلِّ عَلَيْهِ وَسَلِّمْ", 
    idn: "Ya Allah, limpahkanlah rahmat kepada Nabi Muhammad. Ya Allah limpahkanlah rahmat dan salam kepadanya." 
  },
  { 
    id: 12, 
    title: "Doa Penutup Tahlil", 
    ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، حَمْدَ الشَّاكِرِينَ، حَمْدَ النَّاعِمِينَ، حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ. اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ", 
    idn: "Aku berlindung kepada Allah dari setan yang terkutuk. Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah Tuhan semesta alam, pujian orang-orang yang bersyukur, pujian orang-orang yang memperoleh nikmat, pujian yang sebanding dengan nikmat-Nya dan menjamin tambahannya. Wahai Tuhan kami, bagi-Mu segala puji sebagaimana layaknya bagi kemuliaan wajah-Mu dan keagungan kekuasaan-Mu. Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad dan kepada keluarga junjungan kami Nabi Muhammad." 
  }
];

const DOA_CATEGORIES = [
  { id: 'daily', title: 'Doa Harian', icon: Coffee, count: 19 },
  { id: 'prophet', title: 'Doa Para Nabi', icon: GraduationCap, count: 10 },
  { id: 'sholat', title: 'Setelah Sholat', icon: Hand, count: 12 }
];

const DOA_LIST = {
  daily: [
    { id: 1, title: "Doa Bangun Tidur", ar: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا...", idn: "Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami dan kepada-Nya kami kembali." },
    { id: 2, title: "Doa Sebelum Makan", ar: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", idn: "Ya Allah, berkahilah kami atas rezeki yang Engkau berikan dan peliharalah kami dari siksa api neraka." }
  ],
  prophet: [{ id: 1, title: "Doa Nabi Yunus", ar: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", idn: "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zalim." }],
  sholat: [{ id: 1, title: "Doa Setelah Sholat", ar: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", idn: "Ya Allah, bantulah aku untuk mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan baik kepada-Mu." }]
};

const DZIKIR_PAGI = [{ id: 1, title: "Ayat Kursi", ar: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...", idn: "Allah, tidak ada Tuhan melainkan Dia Yang Hidup kekal..." }];
const DZIKIR_SORE = [{ id: 1, title: "Perlindungan", ar: "أَعُوذُ بِكَلِمَاتِ اللَّهِ Tَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", idn: "Aku berlindung dengan kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya." }];

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
  const [showDevPopup, setShowDevPopup] = useState(false);

  const [prayerTimes, setPrayerTimes] = useState(null);
  const [locationName, setLocationName] = useState("Mencari lokasi...");
  const [prayerLoading, setPrayerLoading] = useState(true);

  const audioRef = useRef(null);

  useEffect(() => {
    fetchSurahs();
    fetchLocationAndPrayers();
    const timer = setTimeout(() => setShowDevPopup(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    saveToLocal('darkMode', darkMode);
  }, [darkMode]);

  const fetchLocationAndPrayers = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
            const data = await response.json();
            setPrayerTimes(data.data.timings);

            const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const locData = await locRes.json();
            const city = locData.address.city || locData.address.town || locData.address.village || locData.address.county;
            setLocationName(city || "Lokasi Anda");
            setPrayerLoading(false);
          } catch (err) {
            setPrayerLoading(false);
            setLocationName("Lokasi Default");
          }
        },
        () => {
          setPrayerLoading(false);
          setLocationName("Akses Lokasi Ditolak");
        }
      );
    } else {
      setPrayerLoading(false);
      setLocationName("GPS tidak didukung");
    }
  };

  const fetchSurahs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/surat`);
      const json = await res.json();
      setSurahs(json.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
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
    } catch (err) { setLoading(false); }
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
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nomor.toString().includes(searchTerm)
  );

  const Header = () => (
    <nav className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-lg border-b px-4 sm:px-8 py-4 sm:py-6 transition-all duration-300 ${darkMode ? 'bg-slate-950/95 border-slate-800 shadow-2xl' : 'bg-white/95 border-slate-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {setView('home'); setSubMenu(null); setDoaCategory(null); setSelectedSurah(null);}}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-700 rounded-[10px] flex items-center justify-center text-white shadow-xl rotate-1">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col text-slate-900 dark:text-white text-left">
            <h1 className="text-base sm:text-xl font-black leading-none">{APP_NAME}</h1>
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

  const renderListContent = (title, data, IconComponent, backAction) => {
    const isTahlil = view === 'tahlil-content';
    const arabicFontSize = window.innerWidth < 640 ? `${fontSize * 0.75}px` : `${fontSize}px`;
    const translationFontSize = window.innerWidth < 640 ? `${Math.max(14, fontSize * 0.45)}px` : `${Math.max(16, fontSize * 0.55)}px`;

    return (
      <div className="max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
        <button onClick={backAction} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-8 hover:translate-x-[-4px] transition-transform">
          <ChevronLeft size={20} /> Kembali
        </button>
        <div className="flex items-center gap-4 mb-10 px-2 text-left">
          <div className="w-14 h-14 bg-emerald-700 text-white rounded-[15px] flex items-center justify-center shadow-xl">
             <IconComponent size={28} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">{title}</h2>
        </div>

        {isTahlil ? (
          <div className={`p-8 sm:p-20 rounded-[15px] border shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {data.map((item, idx) => (
              <div key={item.id} className={`mb-24 last:mb-0 ${idx !== 0 ? 'pt-24 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                <div className="flex items-center gap-4 mb-10 text-left">
                  <span className="w-10 h-10 flex items-center justify-center bg-emerald-700 text-white rounded-full text-xs font-black shadow-lg shadow-emerald-900/20">{idx + 1}</span>
                  <h4 className="font-bold text-emerald-600 text-sm sm:text-2xl uppercase tracking-tighter">{item.title}</h4>
                </div>
                <div className="text-right font-serif mb-12 leading-relaxed text-slate-900 dark:text-white" style={{ fontSize: arabicFontSize }} dir="rtl">{item.ar}</div>
                {showTranslation && (
                  <div className="flex items-start gap-4 text-left">
                    <div className="w-1.5 h-auto bg-emerald-200 dark:bg-emerald-800 rounded-full flex-shrink-0"></div>
                    <p className="font-light leading-relaxed text-slate-500 dark:text-slate-300 italic" style={{ fontSize: translationFontSize }}>{item.idn}</p>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-32 pt-16 border-t-8 border-emerald-700/10">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <button onClick={() => openSurah(36)} className="flex items-center justify-center gap-4 py-8 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-[15px] shadow-2xl active:scale-95 transition-all text-lg"><Scroll size={28} /> Baca Yasin</button>
                  <button onClick={() => {setView('home'); setSubMenu(null);}} className={`flex items-center justify-center gap-4 py-8 font-black rounded-[15px] border active:scale-95 transition-all text-lg ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}><Home size={28} /> Menu Utama</button>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map(item => (
              <div key={item.id} className={`p-6 sm:p-10 rounded-[15px] border shadow-sm transition-all hover:shadow-md ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-6 text-left">
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-[6px] uppercase tracking-widest">{item.type || 'Bacaan'}</span>
                  <h4 className="font-bold text-emerald-600 text-sm">{item.title}</h4>
                </div>
                <div className="text-right font-serif mb-8 leading-relaxed text-slate-900 dark:text-white" style={{ fontSize: arabicFontSize }} dir="rtl">{item.ar}</div>
                {showTranslation && <p className="text-left font-light leading-relaxed border-l-4 border-emerald-100 pl-4 text-slate-500 dark:text-slate-400" style={{ fontSize: translationFontSize }}>{item.idn}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

  if (view === 'landing') {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden relative ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <div className="max-w-3xl w-full text-center relative z-10 animate-in fade-in duration-1000 px-4">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-700 rounded-[15px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl rotate-3"><BookOpen size={32} /></div>
           <h1 className="text-3xl sm:text-7xl font-black mb-8 tracking-tight leading-tight">Dekatkan Diri dengan <span className="text-emerald-600">Kalamullah.</span></h1>
           <p className="text-sm sm:text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">Mushaf Digital modern dengan koleksi Yasin, Tahlil, Doa, dan Dzikir yang menenangkan jiwa.</p>
           <button onClick={() => setView('home')} className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 sm:py-5 rounded-[12px] text-lg font-bold shadow-xl active:scale-95 transition-all flex items-center gap-3 mx-auto">Mulai Membaca <ArrowRight size={22} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-[82px] sm:pt-[106px] ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-100vh) translateX(20px); opacity: 0; } }
        .animate-float-up { animation: floatUp linear infinite; }
        @keyframes gradMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .bg-animated-emerald { background: linear-gradient(-45deg, #064e3b, #065f46, #059669, #064e3b); background-size: 400% 400%; animation: gradMove 12s ease infinite; }
      `}</style>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-20">
        
        {view === 'home' && !subMenu && (
          <>
            <section className="relative w-full mb-8 sm:mb-12 rounded-[15px] overflow-hidden shadow-2xl bg-animated-emerald">
              <Particles />
              <div className="relative z-10 p-8 sm:p-24 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] sm:text-xs font-black uppercase text-emerald-300 border border-white/5 mb-8">
                  <Sparkles size={12} className="animate-pulse" /> Nur Qurani - AL QURAN DIGITAL
                </div>
                <h2 className="text-2xl sm:text-6xl font-black text-white leading-tight mb-8 drop-shadow-xl">Pelita Hati dalam Setiap <span className="text-emerald-300">Lantunan Ayat.</span></h2>
                <div className="relative w-full max-w-2xl group px-2 sm:px-0">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={22} />
                  <input type="text" placeholder="Cari Surah atau Doa..." className="w-full bg-white/10 backdrop-blur-xl border border-white/20 focus:border-emerald-400 focus:bg-white/20 text-white rounded-[10px] py-4 sm:py-6 pl-16 pr-8 outline-none text-base sm:text-xl transition-all shadow-2xl placeholder:text-emerald-100/30 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </section>

            {/* JADWAL SHOLAT SECTION */}
            <div className={`mb-12 p-6 sm:p-10 rounded-[15px] border shadow-sm transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 text-left">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[12px] flex items-center justify-center">
                     <Clock size={32} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white">Jadwal Sholat</h3>
                     <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                       <MapPin size={16} className="text-emerald-500" /> {locationName}
                     </div>
                   </div>
                </div>
                {!prayerLoading && (
                  <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-600 text-sm font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>

              {prayerLoading ? (
                <div className="flex items-center justify-center py-10 gap-3">
                   <Loader2 size={24} className="animate-spin text-emerald-600" />
                   <p className="text-slate-400 font-bold uppercase text-[10px]">Menyambungkan Koordinat...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { label: 'Subuh', time: prayerTimes?.Fajr },
                    { label: 'Dzuhur', time: prayerTimes?.Dhuhr },
                    { label: 'Ashar', time: prayerTimes?.Asr },
                    { label: 'Maghrib', time: prayerTimes?.Maghrib },
                    { label: 'Isya', time: prayerTimes?.Isha },
                    { label: 'Imsak', time: prayerTimes?.Imsak },
                  ].map((p, idx) => (
                    <div key={idx} className={`p-5 rounded-[15px] text-center border transition-all hover:border-emerald-500 group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                      <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-widest group-hover:scale-110 transition-transform">{p.label}</p>
                      <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white">{p.time || '--:--'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK MENU HUB */}
            <div className={`mb-12 p-4 rounded-[15px] border shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200'}`}>
              <button onClick={() => {setView('home'); setSubMenu(null)}} className="flex items-center justify-center sm:justify-start gap-3 p-4 sm:p-6 rounded-[12px] bg-emerald-700 text-white shadow-lg active:scale-95 transition-all">
                <BookOpen size={20} className="shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Al-Quran</span>
              </button>
              <button onClick={() => setSubMenu('tahlil')} className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-3 p-4 sm:p-6 rounded-[12px] active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <FileText size={20} className="text-emerald-600 shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Yasin Tahlil</span>
              </button>
              <button onClick={() => setSubMenu('doa')} className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-3 p-4 sm:p-6 rounded-[12px] active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <Hand size={20} className="text-emerald-600 shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Doa Harian</span>
              </button>
              <button onClick={() => setSubMenu('dzikir')} className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-3 p-4 sm:p-6 rounded-[12px] active:scale-95 transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <Sun size={20} className="text-emerald-600 shrink-0" /><span className="text-[10px] sm:text-sm font-black uppercase whitespace-nowrap">Dzikir P & S</span>
              </button>
            </div>

            <div className="px-1 sm:px-2 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-8 text-left">
                 <div className="w-1.5 h-8 bg-emerald-600 rounded-full shadow-lg"></div>
                 <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">Daftar Surah</h3>
              </div>
              {loading ? <div className="py-24 text-center"><Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredSurahs.map((surah) => (
                    <div key={surah.nomor} onClick={() => openSurah(surah.nomor)} className={`group flex items-center gap-4 p-6 rounded-[15px] hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden active:scale-95 border ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className={`w-11 h-11 flex-shrink-0 rounded-[10px] flex items-center justify-center text-sm font-black ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'} group-hover:bg-emerald-700 group-hover:text-white transition-all`}>{surah.nomor}</div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-bold group-hover:text-emerald-700 transition-colors truncate text-sm sm:text-base text-slate-900 dark:text-white">{surah.namaLatin}</h3>
                        <p className="text-[8px] sm:text-[10px] font-medium uppercase truncate text-slate-500">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                      </div>
                      <div className="text-right text-lg sm:text-2xl font-serif text-emerald-800 dark:text-emerald-500">{surah.nama}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- SUB-MENU VIEWS --- */}
        {subMenu === 'tahlil' && (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500 px-4 text-left">
            <button onClick={() => setSubMenu(null)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-10"><ChevronLeft size={20} /> Kembali</button>
            <h2 className="text-3xl sm:text-5xl font-black mb-12 text-slate-900 dark:text-white">Yasin & Tahlil</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button onClick={() => setView('tahlil-content')} className={`p-10 rounded-[15px] border group text-left active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-none' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'}`}>
                 <FileText size={48} className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                 <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Bacaan Tahlil</h3>
                 <p className="text-sm text-slate-500">Urutan bacaan tahlil lengkap beserta terjemahannya.</p>
              </button>
              <button onClick={() => openSurah(36)} className={`p-10 rounded-[15px] border group text-left active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-none' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'}`}>
                 <Scroll size={48} className="text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                 <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Surat Yasin</h3>
                 <p className="text-sm text-slate-500">Bacaan Surat Yasin lengkap (Surah ke-36).</p>
              </button>
            </div>
          </div>
        )}

        {subMenu === 'doa' && !doaCategory && (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500 px-4 text-left">
            <button onClick={() => setSubMenu(null)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-10"><ChevronLeft size={20} /> Kembali</button>
            <h2 className="text-3xl sm:text-5xl font-black mb-12 text-slate-900 dark:text-white">Kumpulan Doa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {DOA_CATEGORIES.map(cat => (
                 <button key={cat.id} onClick={() => setDoaCategory(cat.id)} className={`p-8 rounded-[15px] border group text-left active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'}`}>
                    {React.createElement(cat.icon, { size: 32, className: "text-emerald-600 mb-4 group-hover:rotate-12 transition-transform" })}
                    <h3 className="text-xl font-black mb-1 text-slate-900 dark:text-white">{cat.title}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{cat.count} Bacaan</p>
                 </button>
               ))}
            </div>
          </div>
        )}

        {subMenu === 'dzikir' && (
          <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500 px-4 text-left">
            <button onClick={() => setSubMenu(null)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-10"><ChevronLeft size={20} /> Kembali</button>
            <h2 className="text-3xl sm:text-5xl font-black mb-12 text-slate-900 dark:text-white">Dzikir Harian</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <button onClick={() => setView('dzikir-pagi')} className={`p-10 rounded-[15px] border group text-center active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-emerald-50 border-slate-200 shadow-sm'}`}>
                  <Sun size={48} className="text-amber-500 mx-auto mb-6 group-hover:scale-125 transition-transform duration-500" />
                  <h3 className="text-2xl font-black text-white dark:text-white">Dzikir Pagi</h3>
                  <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em]">Sesuai Sunnah</p>
               </button>
               <button onClick={() => setView('dzikir-sore')} className={`p-10 rounded-[15px] border group text-center active:scale-95 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-indigo-50 border-slate-200 shadow-sm'}`}>
                  <Moon size={48} className="text-indigo-400 mx-auto mb-6 group-hover:scale-125 transition-transform duration-500" />
                  <h3 className="text-2xl font-black text-white dark:text-white">Dzikir Sore</h3>
                  <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em]">Sesuai Sunnah</p>
               </button>
            </div>
          </div>
        )}

        {/* --- DYNAMIC VIEWS --- */}
        {view === 'tahlil-content' && renderListContent("Bacaan Tahlil", TAHLIL_FULL, FileText, () => setSubMenu('tahlil'))}
        {view === 'dzikir-pagi' && renderListContent("Dzikir Pagi", DZIKIR_PAGI, Sun, () => setSubMenu('dzikir'))}
        {view === 'dzikir-sore' && renderListContent("Dzikir Sore", DZIKIR_SORE, Moon, () => setSubMenu('dzikir'))}
        {doaCategory && renderListContent(DOA_CATEGORIES.find(c=>c.id===doaCategory).title, DOA_LIST[doaCategory], Hand, () => setDoaCategory(null))}

        {/* --- BOOKMARKS VIEW (FIXED) --- */}
        {view === 'bookmarks' && (
          <div className="max-w-4xl mx-auto py-6 px-4 animate-in slide-in-from-right-4 duration-500 text-left">
             <h2 className="text-2xl sm:text-3xl font-black mb-12 flex items-center gap-3 text-slate-900 dark:text-white"><Bookmark className="text-emerald-700" size={32} /> Penanda</h2>
             {bookmarks.length === 0 ? (
               <div className="text-center py-32 rounded-[15px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">Belum ada ayat disimpan.</div>
             ) : (
               <div className="grid grid-cols-1 gap-6">
                 {bookmarks.map((b, i) => (
                   <div key={i} className={`p-8 rounded-[15px] border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{b.surahName} : {b.nomorAyat}</span>
                        <button onClick={() => toggleBookmark(b)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={20}/></button>
                      </div>
                      <div className="text-right text-3xl font-serif mb-6 leading-relaxed text-slate-900 dark:text-white" dir="rtl">{b.teksArab}</div>
                      <button onClick={() => openSurah(b.surahNumber)} className="font-black text-emerald-700 hover:gap-3 transition-all flex items-center gap-2 text-sm sm:text-base">Lanjut Membaca <ChevronRight size={18}/></button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* --- SETTINGS VIEW (FIXED) --- */}
        {view === 'settings' && (
          <div className="max-w-xl mx-auto py-6 px-4 animate-in slide-in-from-right-4 duration-500 text-left">
             <h2 className="text-3xl font-black mb-12 flex items-center gap-3 text-slate-900 dark:text-white"><Settings className="text-emerald-700" size={32}/> Pengaturan</h2>
             <div className={`rounded-[15px] p-10 space-y-12 shadow-sm border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div><h4 className="font-black text-lg text-slate-900 dark:text-white">Ukuran Teks Arab</h4><p className="text-sm text-slate-500">Sesuaikan kenyamanan mata Anda.</p></div>
                    <span className="text-emerald-700 font-black text-xl">{fontSize}px</span>
                  </div>
                  <input type="range" min="28" max="52" value={fontSize} onChange={(e) => { setFontSize(parseInt(e.target.value)); saveToLocal('fontSize', parseInt(e.target.value)); }} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-700" />
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                   <div><h4 className="font-black text-lg text-slate-900 dark:text-white">Terjemahan</h4><p className="text-sm text-slate-500">Tampilkan arti Bahasa Indonesia.</p></div>
                   <button onClick={() => { const v = !showTranslation; setShowTranslation(v); saveToLocal('showTrans', v); }} className={`w-14 h-7 rounded-full relative transition-all duration-300 ${showTranslation ? 'bg-emerald-700' : 'bg-slate-200 dark:bg-slate-800'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${showTranslation ? 'left-8' : 'left-1'}`}></div></button>
                </div>
             </div>
             <button onClick={() => setView('home')} className="w-full mt-10 py-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[15px] font-black text-lg shadow-xl active:scale-95 transition-all">Selesai & Simpan</button>
          </div>
        )}

        {/* --- READER VIEW --- */}
        {view === 'reader' && selectedSurah && (
          <div className="max-w-4xl mx-auto py-2 sm:py-6 relative animate-in fade-in duration-500 px-1">
            <button onClick={() => {setView('home'); setSelectedSurah(null);}} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-xs sm:text-sm mb-6 px-2"><ChevronLeft size={16} /> Kembali</button>
            <div className="text-center mb-10 sm:mb-16 px-2">
              <h2 className="text-xl sm:text-4xl font-black mb-1 text-slate-900 dark:text-white">{selectedSurah.namaLatin}</h2>
              <p className="text-[10px] sm:text-base text-slate-500 mb-6 font-medium">{selectedSurah.arti} • {selectedSurah.jumlahAyat} Ayat</p>
              <div className="text-5xl sm:text-7xl font-serif text-emerald-700 mb-8 leading-tight">{selectedSurah.nama}</div>
            </div>
            <div className="space-y-12 sm:space-y-20 pb-40 px-4">
              {selectedSurah.nomor !== 9 && selectedSurah.nomor !== 1 && (
                <div className="text-center text-3xl sm:text-5xl font-serif py-10 opacity-90 text-slate-900 dark:text-white">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
              )}
              {selectedSurah.ayat.map((ayat) => (
                <div key={ayat.nomorAyat} className="group border-b pb-10 sm:pb-16 last:border-0 border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-6 sm:gap-10">
                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 px-2.5 py-1 rounded-[6px] text-[10px] sm:text-xs font-black">{selectedSurah.nomor}:{ayat.nomorAyat}</span>
                      <button onClick={() => playAudio(ayat)} disabled={isBuffering && activeVerse === ayat.nomorAyat} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${activeVerse === ayat.nomorAyat && isPlaying ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                        {activeVerse === ayat.nomorAyat && isBuffering ? <Loader2 size={20} className="animate-spin" /> : activeVerse === ayat.nomorAyat && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} />}
                      </button>
                      <button onClick={() => toggleBookmark(ayat)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${bookmarks.some(b => b.nomorAyat === ayat.nomorAyat && b.surahNumber === selectedSurah.nomor) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}><Bookmark size={20} fill={bookmarks.some(b => b.nomorAyat === ayat.nomorAyat && b.surahNumber === selectedSurah.nomor) ? "currentColor" : "none"} /></button>
                    </div>
                    <div className="text-right font-serif leading-relaxed text-slate-900 dark:text-white" style={{ fontSize: window.innerWidth < 640 ? `${fontSize * 0.75}px` : `${fontSize}px` }} dir="rtl">{ayat.teksArab}</div>
                    {showTranslation && <p className="text-left text-sm sm:text-lg font-light leading-relaxed max-w-2xl px-1 text-slate-500 dark:text-slate-400" style={{ fontSize: window.innerWidth < 640 ? `${Math.max(14, fontSize * 0.45)}px` : `${Math.max(16, fontSize * 0.55)}px` }}>{ayat.teksIndonesia}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Floating Audio Player */}
      {activeVerse && (
        <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm backdrop-blur-md border p-4 sm:p-5 rounded-[15px] shadow-2xl flex items-center justify-between ring-4 ring-emerald-500/5 transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800 shadow-none text-white' : 'bg-white border-emerald-100 shadow-xl text-slate-900'}`}>
           <div className="flex flex-col ml-1 sm:ml-2 overflow-hidden text-left">
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {isBuffering ? <Loader2 size={10} className="animate-spin" /> : <Music size={10} />} {isBuffering ? 'Memuat...' : 'Nahawand Style'}
              </span>
              <span className="text-xs sm:text-sm font-bold truncate max-w-[140px]">
                {selectedSurah ? selectedSurah.namaLatin : 'Nur Qur\'an'} : {activeVerse}
              </span>
           </div>
           <div className="flex items-center gap-3">
             <button onClick={() => setIsPlaying(!isPlaying)} className="w-11 h-11 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                {isBuffering ? <Loader2 size={22} className="animate-spin" /> : isPlaying ? <Pause size={22} fill="white"/> : <Play size={22} fill="white"/>}
             </button>
             <button onClick={() => {setActiveVerse(null); setIsPlaying(false); if(audioRef.current){audioRef.current.pause()}}} className="transition-colors p-2 text-slate-400 hover:text-red-500"><X size={18}/></button>
           </div>
           <audio ref={audioRef} onPlaying={() => {setIsPlaying(true); setIsBuffering(false);}} onWaiting={() => setIsBuffering(true)} onCanPlay={() => setIsBuffering(false)} onEnded={() => {setIsPlaying(false); setIsBuffering(false);}} className="hidden" />
        </div>
      )}

      {/* Popup Pengembangan */}
      {showDevPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-10 backdrop-blur-md bg-black/50 animate-in fade-in duration-500">
           <div className={`relative max-w-md w-full p-10 rounded-[15px] border shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-emerald-50 text-slate-900'}`}>
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mb-6 mx-auto"><Info size={32} /></div>
              <h3 className="text-2xl font-black text-center mb-4 leading-tight">Informasi Penting</h3>
              <p className="text-sm sm:text-base text-center leading-relaxed text-slate-500 mb-8">Aplikasi ini sedang dalam tahap penyempurnaan secara bertahap. Mohon maaf jika terdapat bagian yang belum dapat diakses sepenuhnya. Kami berkomitmen untuk terus memperbarui demi kenyamanan ibadah Anda.</p>
              <button onClick={() => setShowDevPopup(false)} className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-[12px] shadow-lg active:scale-95 transition-all">Saya Mengerti</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;