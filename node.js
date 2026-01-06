import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, deleteDoc, query, onSnapshot, serverTimestamp, getDocs, setLogLevel } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Award, Loader2, Home, Briefcase, FileText, PlusCircle, Trash2, X, Lock, Unlock, Eye, Newspaper, Send, Image as ImageIcon, Video, PlayCircle, Info, ExternalLink, Monitor, Target, Activity, Waves, BarChart3, Layers, ShieldAlert, Heart, Languages, Link as LinkIcon, ChevronDown, ChevronUp, Languages as TranslateIcon, Zap, Repeat, Quote, CheckCircle2, Camera, Search, GraduationCap, Brain, ShieldCheck, Microscope, Percent, CircleDot, ActivitySquare } from 'lucide-react';

// Konfigurasi API
const apiKey = "";

// Konfigurasi log level
setLogLevel('error');

// --- FIREBASE SETUP & CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDi_WDMJe4iIjFpkQ76MhBT_qKd_YgXhBQ",
  authDomain: "trademaster-cb1bf.firebaseapp.com",
  projectId: "trademaster-cb1bf",
  storageBucket: "trademaster-cb1bf.firebasestorage.app",
  messagingSenderId: "222478072374",
  appId: "1:222478072374:web:3554fa549dafd51a61f697",
  measurementId: "G-RWHE41XDK0"
};

const appId = "trademaster-cb1bf";

// PIN RAHASIA UNTUK ADMIN
const ADMIN_ACCESS_PIN = "1320321969";

const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null; 

// --- KONSTANTA PENYIMPANAN ---
const CHUNK_SIZE = 800000; 

// --- TRANSLATIONS (UI STATIC) ---
const translations = {
    id: {
        home: "Beranda",
        journal: "Jurnal",
        news: "Warta",
        edu: "Edukasi",
        platform: "Platform",
        welcome: "Halo, Trader!",
        discipline: "Market tidak tidur, tetap disiplin.",
        dailyMotivation: "Motivasi Harian",
        publicJournal: "Jurnal Publik",
        marketNews: "Warta Pasar",
        techCurriculum: "Kurikulum Teknikal",
        mentorCurriculum: "Learning from Mentors",
        proStandard: "Materi Standar Profesional",
        readMore: "Baca Selengkapnya",
        showMore: "Lihat Selengkapnya",
        showLess: "Sembunyikan",
        addNews: "Kirim Warta",
        linkPlaceholder: "Tautan Sumber (Opsional)",
        loadingMedia: "Memuat Media...",
        cancel: "Batal",
        translating: "Menerjemahkan...",
        original: "Asli",
        addMotivation: "Tambah Motivasi",
        quotePlaceholder: "Kata-kata bijak hari ini...",
        searchPlaceholder: "Cari sesuatu..."
    },
    en: {
        home: "Home",
        journal: "Journal",
        news: "News",
        edu: "Education",
        platform: "Platform",
        welcome: "Hello, Trader!",
        discipline: "Market never sleeps, stay disciplined.",
        dailyMotivation: "Daily Motivation",
        publicJournal: "Public Journal",
        marketNews: "Market News",
        techCurriculum: "Technical Curriculum",
        mentorCurriculum: "Learning from Mentors",
        proStandard: "Professional Standard Materials",
        readMore: "Read More",
        showMore: "Read More",
        showLess: "Show Less",
        addNews: "Post News",
        linkPlaceholder: "Source Link (Optional)",
        loadingMedia: "Loading Media...",
        cancel: "Cancel",
        translating: "Translating...",
        original: "Original",
        addMotivation: "Add Motivation",
        quotePlaceholder: "Wisdom of the day...",
        searchPlaceholder: "Search something..."
    }
};

const TECHNICAL_CURRICULUM = [
    { 
        id: "snr", 
        title: "Support & Resistance", 
        icon: Target, 
        desc: "Batas psikologis harga di pasar.", 
        detail: "Support adalah area di mana pembeli cukup kuat untuk menahan harga agar tidak jatuh lebih dalam (lantai harga). Resistance adalah area di mana penjual cukup kuat untuk menahan kenaikan harga (atap harga). Mengidentifikasi S&R membantu trader mengetahui kapan harga kemungkinan akan berbalik arah atau pecah (breakout)." 
    },
    { 
        id: "trend", 
        title: "Trend Identification", 
        icon: TrendingUp, 
        desc: "Arah pergerakan pasar utama.", 
        detail: "Memahami struktur Market: Uptrend (Higher High & Higher Low), Downtrend (Lower High & Lower Low), dan Sideways. Prinsip utamanya adalah 'Trend is your Friend', yang menyarankan kita bertransaksi searah dengan kekuatan dominan pasar untuk meminimalisir risiko." 
    },
    { 
        id: "candlestick", 
        title: "Candlestick Confirmation", 
        icon: Layers, 
        desc: "Bahasa visual psikologi pelaku pasar.", 
        detail: "Mempelajari pola konfirmasi sebagai pemicu (trigger) untuk masuk ke pasar. Pola krusial seperti Pin Bar (Hammer/Shooting Star), Engulfing (Bullish/Bearish), dan Doji memberikan petunjuk apakah harga benar-benar akan bereaksi pada level Support atau Resistance." 
    },
    { 
        id: "fibonacci", 
        title: "Fibonacci Retracement", 
        icon: Repeat, 
        desc: "Mengukur titik koreksi harga dalam tren.", 
        detail: "Menggunakan rasio matematika alam untuk menemukan area potensial di mana harga akan berhenti koreksi (pullback) sebelum melanjutkan tren. Level krusial yang dipelajari adalah 50.0%, 61.8% (Golden Ratio), dan 78.6% sebagai zona pantulan terbaik." 
    },
    { 
        id: "bollinger", 
        title: "Bollinger Bands", 
        icon: Waves, 
        desc: "Indikator volatilitas dan rentang harga.", 
        detail: "Terdiri dari Upper, Middle, dan Lower Band. Alat ini membantu mengukur volatilitas pasar: saat band menyempit (Squeeze) menandakan ledakan harga akan terjadi, dan saat harga menyentuh band luar menandakan kondisi jenuh (Overbought atau Oversold) dalam kondisi pasar tertentu." 
    },
    { 
        id: "rsi", 
        title: "Relative Strength Index (RSI)", 
        icon: ActivitySquare, 
        desc: "Indikator momentum pasar.", 
        detail: "Oscillator yang mengukur kecepatan pergerakan harga. Digunakan untuk mendeteksi kondisi jenuh beli (>70) dan jenuh jual (<30). Fitur terpentingnya adalah Divergence, yaitu ketidaksesuaian antara harga dan indikator yang seringkali menjadi sinyal awal pembalikan arah tren besar." 
    }
];

const MENTOR_CURRICULUM = [
    {
        id: "psychology",
        title: "Trading Psychology",
        icon: Brain,
        desc: "Mengelola emosi saat berhadapan dengan risiko.",
        detail: "Seorang mentor pernah berkata, 'Pasar adalah alat untuk memindahkan uang dari yang tidak sabar ke yang sabar.' Fokuslah pada penguasaan rasa takut (Fear of Missing Out) dan keserakahan. Kedisiplinan mengikuti rencana jauh lebih penting daripada prediksi harga yang tepat."
    },
    {
        id: "risk_management",
        title: "Risk Management",
        icon: ShieldCheck,
        desc: "Aturan utama untuk bertahan hidup di market.",
        detail: "Mentor menekankan penggunaan 'Risk per Trade' yang ketat (maksimal 1-2%). Belajarlah untuk mencintai 'Stop Loss' karena itu adalah biaya bisnis Anda. Tanpa manajemen risiko, satu kesalahan fatal bisa menghapus seluruh keuntungan berbulan-bulan."
    },
    {
        id: "backtesting",
        title: "Backtesting Mastery",
        icon: Microscope,
        desc: "Membangun kepercayaan diri melalui data.",
        detail: "Jangan percayai strategi apa pun sebelum Anda mengujinya pada data historis minimal 100 sampel. Backtesting bukan hanya tentang melihat profit, tapi memahami 'Drawdown' dan perilaku strategi Anda di berbagai kondisi pasar."
    }
];

// --- FUNGSI GEMINI TRANSLATE ---
const translateContent = async (text, targetLang) => {
    if (!text || text.length < 3) return text;
    const prompt = `Translate the following financial news content to ${targetLang === 'id' ? 'Indonesian' : 'English'}. Keep the financial terminology professional and accurate. Text: "${text}"`;
    let retries = 5;
    let delay = 1000;
    while (retries > 0) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || text;
        } catch (error) {
            retries--;
            if (retries === 0) return text;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    return text;
};

// --- FUNGSI UTILITAS FIREBASE ---
const savePublicMedia = async (collectionName, dataObject, base64String) => {
    if (!db || !auth.currentUser) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
    if (!base64String || base64String.length < CHUNK_SIZE) {
        return await addDoc(colRef, { ...dataObject, url: base64String || "", isChunked: false, createdAt: serverTimestamp() });
    }
    const chunks = [];
    for (let i = 0; i < base64String.length; i += CHUNK_SIZE) { chunks.push(base64String.substring(i, i + CHUNK_SIZE)); }
    const docRef = await addDoc(colRef, { ...dataObject, isChunked: true, chunkCount: chunks.length, createdAt: serverTimestamp() });
    const chunksCol = collection(db, 'artifacts', appId, 'public', 'data', collectionName, docRef.id, 'chunks');
    for (let i = 0; i < chunks.length; i++) { await setDoc(doc(chunksCol, `chunk_${i}`), { index: i, data: chunks[i] }); }
    return docRef;
};

const fetchFullMedia = async (item, collectionName) => {
    if (!db || !auth.currentUser) return "";
    if (!item.isChunked) return item.url;
    const chunksCol = collection(db, 'artifacts', appId, 'public', 'data', collectionName, item.id, 'chunks');
    const snapshot = await getDocs(chunksCol);
    const chunksData = snapshot.docs.map(d => d.data()).sort((a, b) => a.index - b.index);
    return chunksData.map(c => c.data).join('');
};

const formatTimeAgo = (timestamp, lang) => {
    if (!timestamp) return "...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 1000);
    if (lang === 'id') {
        if (diff < 60) return `${diff} dtk lalu`;
        if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    } else {
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    }
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US');
};

const InlineMediaRenderer = ({ item, collectionName, onClick }) => {
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!item.url && !item.isChunked) { if (isMounted) setLoading(false); return; }
            try { const data = await fetchFullMedia(item, collectionName); if (isMounted) setSource(data); } 
            catch (e) { console.error(e); } finally { if (isMounted) setLoading(false); }
        };
        load();
        return () => { isMounted = false; };
    }, [item, collectionName]);
    if (loading) return <div className="w-full h-48 bg-white/5 flex items-center justify-center animate-pulse rounded-t-[2.5rem]"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>;
    if (!source) return null;
    return (
        <div className="relative w-full overflow-hidden cursor-pointer group rounded-t-[2.5rem]" onClick={onClick}>
            {item.mediaType === 'video' ? (
                 <div className="w-full flex items-center justify-center bg-black/40 relative">
                    <video src={`${source}#t=0.5`} className="w-full h-auto max-h-[500px] object-contain" preload="metadata" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all"><PlayCircle className="w-14 h-14 text-white/90 drop-shadow-xl scale-100 group-hover:scale-110 transition-transform" /></div>
                </div>
            ) : ( <img src={source} alt="Preview" className="w-full h-auto max-h-[600px] object-contain bg-black/20 hover:opacity-95 transition-opacity duration-300"/> )}
        </div>
    );
};

const NewsCard = ({ item, isAdmin, db, onExpandMedia, t, lang, collectionName }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [translatedTitle, setTranslatedTitle] = useState(item.title);
    const [translatedContent, setTranslatedContent] = useState(item.content);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const charThreshold = 180;
    const isLongContent = (showOriginal ? item.content : translatedContent).length > charThreshold;
    useEffect(() => {
        const handleAutoTranslate = async () => {
            if ((lang === 'id' && item.originalLang === 'id') || (lang === 'en' && item.originalLang === 'en')) {
                setTranslatedTitle(item.title); setTranslatedContent(item.content); return;
            }
            setIsTranslating(true);
            try {
                const [tTitle, tContent] = await Promise.all([translateContent(item.title, lang), translateContent(item.content, lang)]);
                setTranslatedTitle(tTitle); setTranslatedContent(tContent);
            } catch (err) { console.error(err); } finally { setIsTranslating(false); }
        };
        handleAutoTranslate();
    }, [lang, item.title, item.content, item.originalLang]);
    const displayTitle = showOriginal ? item.title : translatedTitle;
    const displayContent = showOriginal ? item.content : translatedContent;
    return (
        <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300">
            {item.mediaType && item.mediaType !== 'none' && <InlineMediaRenderer item={item} collectionName={collectionName} onClick={() => onExpandMedia(item, collectionName)} />}
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${item.category === 'Urgent' ? 'bg-red-500 text-white' : item.category === 'Insight' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'}`}>{item.category}</span>
                        {isTranslating && <span className="flex items-center gap-1 text-[8px] text-blue-200 font-bold animate-pulse"><TranslateIcon className="w-2.5 h-2.5" /> {t.translating}</span>}
                    </div>
                    <span className="text-[8px] text-blue-100/80 font-bold">{formatTimeAgo(item.createdAt, lang)}</span>
                </div>
                <h3 className="text-sm font-black text-white mb-2 leading-tight">{displayTitle}</h3>
                <div className="relative">
                    <p className={`text-[11px] text-blue-50/80 leading-relaxed transition-all duration-500 ${!isExpanded && isLongContent ? 'line-clamp-3' : ''}`}>{displayContent}</p>
                    <div className="flex items-center gap-4 mt-3">
                        {isLongContent && <button onClick={() => setIsExpanded(!isExpanded)} className="text-[10px] font-bold text-white flex items-center gap-1 hover:text-blue-200 transition-colors">{isExpanded ? <><ChevronUp className="w-3 h-3" /> {t.showLess}</> : <><ChevronDown className="w-3 h-3" /> {t.showMore}</>}</button>}
                        <button onClick={() => setShowOriginal(!showOriginal)} className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border transition-all ${showOriginal ? 'bg-white text-blue-800 border-white' : 'text-blue-200 border-white/20'}`}>{showOriginal ? t.original : 'Translate'}</button>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
                    {item.link && <a href={item.link.startsWith('http') ? item.link : `https://${item.link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"><span className="text-[10px] font-black uppercase tracking-wider">{t.readMore}</span><ExternalLink className="w-3 h-3" /></a>}
                    {isAdmin && <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, item.id))} className="text-white/50 hover:text-red-400 transition-colors ml-auto p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
            </div>
        </div>
    );
};

const FullMediaModal = ({ media, onClose, collectionName, t }) => { 
  const [fullUrl, setFullUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!media || !auth?.currentUser || !collectionName) return;
    const load = async () => {
        setLoading(true);
        try { const url = await fetchFullMedia(media, collectionName); setFullUrl(url); } catch (e) { console.error(e); }
        setLoading(false);
    };
    load();
  }, [media, collectionName]);
  if (!media) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
      <button onClick={onClose} className="absolute top-6 right-6 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-[110]"><X className="w-6 h-6" /></button>
      {loading ? ( <div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /><p className="text-sm font-bold text-slate-400 tracking-widest uppercase">{t.loadingMedia}</p></div>
      ) : ( <div className="w-full max-w-5xl max-h-[85vh] flex items-center justify-center">{media.mediaType === 'video' ? <video src={fullUrl} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" /> : <img src={fullUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />}</div> )}
    </div>
  );
};

// --- SEARCH COMPONENT ---
const SearchBar = ({ value, onChange, placeholder, t }) => (
    <div className="relative mb-6">
        <input 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder || t.searchPlaceholder} 
            className="w-full bg-slate-900/50 p-4 pl-12 rounded-[1.5rem] text-xs text-white outline-none border border-white/5 focus:border-indigo-500/40 transition-all shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        {value && (
            <button onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
            </button>
        )}
    </div>
);

const WartaSection = ({ isAdmin, user, db, onExpandMedia, t, lang }) => {
    const [news, setNews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', category: 'News', link: '' });
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const mediaInputRef = useRef(null);
    const collectionName = 'news';
    useEffect(() => {
        if (!user || !db) return;
        const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNews(items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });
    }, [db, user]);

    const filteredNews = news.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMediaSelect = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const reader = new FileReader(); reader.onload = () => { setMediaPreview(reader.result); setMediaType(type); }; reader.readAsDataURL(file);
    };
    const handleAddNews = async () => {
        if (!form.title.trim() || !form.content.trim() || !user || !isAdmin) return;
        setIsAdding(true);
        try { await savePublicMedia(collectionName, { ...form, mediaType, author: user.displayName || 'Admin', originalLang: lang }, mediaPreview); setForm({ title: '', content: '', category: 'News', link: '' }); setMediaPreview(null); setMediaType(null); } 
        catch (e) { console.error(e); } finally { setIsAdding(false); }
    };
    return (
        <div className="p-6 pt-24 pb-32 animate-fadeIn space-y-8">
            <h2 className="text-2xl font-black text-white mb-2">{t.marketNews}</h2>
            
            <SearchBar value={searchTerm} onChange={setSearchTerm} t={t} />

            {isAdmin && (
                <div className="bg-slate-900 border border-amber-500/20 p-6 rounded-[2.5rem] space-y-4 shadow-xl shadow-amber-500/5">
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Judul Berita" className="w-full bg-slate-800/50 p-4 rounded-2xl text-xs text-white outline-none border border-white/5 focus:border-amber-500/40 transition-all" />
                    <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Isi berita..." className="w-full bg-slate-800/50 p-4 rounded-2xl text-xs text-white outline-none min-h-[120px] border border-white/5 focus:border-amber-500/40 transition-all" />
                    <div className="relative">
                        <input value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder={t.linkPlaceholder} className="w-full bg-slate-800/50 p-4 pl-12 rounded-2xl text-xs text-white outline-none border border-white/5 focus:border-amber-500/40 transition-all" />
                        <LinkIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="flex flex-1 gap-1 bg-slate-800/50 p-1 rounded-2xl border border-white/5">
                            {['News', 'Urgent', 'Insight'].map(cat => (<button key={cat} onClick={() => setForm({...form, category: cat})} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${form.category === cat ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}>{cat}</button>))}
                        </div>
                        <input ref={mediaInputRef} type="file" hidden accept="image/*,video/*" onChange={handleMediaSelect} />
                        <button onClick={() => mediaInputRef.current.click()} className={`p-4 rounded-2xl transition-all border border-white/5 ${mediaPreview ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-800/50 text-slate-400'}`}>{mediaType === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}</button>
                    </div>
                    {mediaPreview && (
                         <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-amber-500/30">
                            {mediaType === 'video' ? <video src={`${mediaPreview}#t=0.5`} className="w-full h-full object-cover" preload="metadata" muted /> : <img src={mediaPreview} className="w-full h-full object-cover" />}
                            <button onClick={() => setMediaPreview(null)} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full"><X className="w-2 h-2 text-white" /></button>
                         </div>
                    )}
                    <button onClick={handleAddNews} disabled={isAdding} className="w-full py-4 bg-amber-500 rounded-2xl text-black text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/10">{isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> {t.addNews}</>}</button>
                </div>
            )}
            <div className="space-y-6">
                {filteredNews.length > 0 ? filteredNews.map(item => (<NewsCard key={item.id} item={item} isAdmin={isAdmin} db={db} onExpandMedia={onExpandMedia} t={t} lang={lang} collectionName={collectionName} />)) : (
                    <div className="text-center py-20 opacity-30"><p className="text-xs font-black uppercase tracking-widest">Tidak ada hasil ditemukan</p></div>
                )}
            </div>
        </div>
    );
};

const JournalSection = ({ user, db, onExpandMedia, isAdmin, t, lang }) => {
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ pair: '', type: 'BUY', result: 'PROFIT', amount: '', notes: '' });
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const fileInputRef = useRef(null);
    const collectionName = 'journal';
    useEffect(() => {
        if (!db || !user) return; 
        const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        return onSnapshot(q, (s) => {
            const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
            setEntries(data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });
    }, [user, db]);

    const filteredEntries = entries.filter(e => 
        e.pair?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileSelect = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const reader = new FileReader(); reader.onload = () => { setMediaPreview(reader.result); setMediaType(type); }; reader.readAsDataURL(file);
    };
    const handleSaveEntry = async () => {
        if (!form.pair || !form.notes || !user || !isAdmin) return;
        setLoading(true);
        try { await savePublicMedia(collectionName, { ...form, mediaType: mediaType || 'none' }, mediaPreview); setForm({ pair: '', type: 'BUY', result: 'PROFIT', amount: '', notes: '' }); setMediaPreview(null); setMediaType(null); setIsAdding(false); } 
        catch (e) { console.error(e); } finally { setLoading(false); }
    };
    const handleDelete = async (id) => { if (!isAdmin) return; try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id)); } catch (e) { console.error(e); } };
    return (
        <div className="p-6 pt-24 pb-32 animate-fadeIn space-y-8">
            <div className="flex justify-between items-end">
                <div><h2 className="text-2xl font-black text-white mb-2">{t.publicJournal}</h2><p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Catatan Transaksi & Evaluasi</p></div>
                {isAdmin && (<button onClick={() => setIsAdding(!isAdding)} className="p-3 bg-emerald-500 rounded-2xl text-black hover:scale-105 transition-transform">{isAdding ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}</button>)}
            </div>

            <SearchBar value={searchTerm} onChange={setSearchTerm} t={t} />

            {isAdmin && isAdding && (
                 <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2.5rem] space-y-4 animate-slideUp">
                    <div className="grid grid-cols-2 gap-2"><input value={form.pair} onChange={e => setForm({...form, pair: e.target.value.toUpperCase()})} placeholder="Pair (XAUUSD)" className="bg-slate-800/50 p-4 rounded-2xl text-xs text-white outline-none border border-white/5" /><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Amount ($)" className="bg-slate-800/50 p-4 rounded-2xl text-xs text-white outline-none border border-white/5" /></div>
                    <div className="flex gap-2"><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="flex-1 bg-slate-800 p-3 rounded-xl text-xs outline-none appearance-none font-bold text-white"><option value="BUY">BUY</option><option value="SELL">SELL</option></select><select value={form.result} onChange={e => setForm({...form, result: e.target.value})} className={`flex-1 p-3 rounded-xl text-xs outline-none appearance-none font-bold ${form.result === 'PROFIT' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}><option value="PROFIT">PROFIT</option><option value="LOSS">LOSS</option></select></div>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Catatan analisa..." className="w-full bg-slate-800/50 p-4 rounded-2xl text-xs text-white outline-none min-h-[80px] border border-white/5" />
                    <div className="flex items-center gap-3"><input ref={fileInputRef} type="file" hidden accept="image/*,video/*" onChange={handleFileSelect} /><button onClick={() => fileInputRef.current.click()} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mediaPreview ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50' : 'bg-slate-800 text-slate-500'}`}>{mediaType === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}{mediaPreview ? 'Media Terpilih' : 'Lampirkan Bukti'}</button></div>
                    <button onClick={handleSaveEntry} disabled={loading} className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Simpan Jurnal</>}</button>
                 </div>
            )}
            <div className="space-y-4">
                {filteredEntries.length > 0 ? filteredEntries.map(e => (
                    <div key={e.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] relative group overflow-hidden">{e.mediaType && e.mediaType !== 'none' && (<InlineMediaRenderer item={e} collectionName={collectionName} onClick={() => onExpandMedia(e, collectionName)} />)}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div><div className="flex items-center gap-2 mb-1"><h4 className="text-sm font-black text-white">{e.pair}</h4><span className={`px-2 py-0.5 rounded text-[8px] font-black ${e.type === 'BUY' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{e.type}</span></div><p className="text-[10px] text-slate-500 font-bold uppercase">{formatTimeAgo(e.createdAt, lang)}</p></div>
                                <div className="text-right flex items-center gap-3"><p className={`text-sm font-black ${e.result === 'PROFIT' ? 'text-emerald-500' : 'text-red-500'}`}>{e.result === 'PROFIT' ? '+' : '-'}${e.amount || '0'}</p>{isAdmin && <button onClick={() => handleDelete(e.id)} className="p-1 text-slate-700 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>}</div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic">"{e.notes}"</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 opacity-30"><p className="text-xs font-black uppercase tracking-widest">Jurnal tidak ditemukan</p></div>
                )}
            </div>
        </div>
    );
};

// --- BROKER AVATAR RENDERER ---
const BrokerAvatar = ({ brokerId, isAdmin, db, t, color, initial, icon: Icon }) => {
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef(null);
    const collectionName = 'broker_logos';

    useEffect(() => {
        if (!db) return;
        const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        return onSnapshot(q, (s) => {
            const data = s.docs.map(d => ({ id: d.id, ...d.data() })).find(m => m.brokerId === brokerId);
            if (data) {
                fetchFullMedia(data, collectionName).then(url => {
                    setLogo(url);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
    }, [brokerId, db]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !isAdmin) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            await savePublicMedia(collectionName, { brokerId, mediaType: 'image' }, reader.result);
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative">
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-xl font-black italic shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                ) : logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                    Icon ? <Icon className="w-7 h-7 text-white" /> : initial
                )}
            </div>
            {isAdmin && (
                <button 
                    onClick={() => fileRef.current.click()} 
                    className="absolute -bottom-2 -right-2 p-1.5 bg-white text-slate-900 rounded-full shadow-lg border border-slate-200 hover:bg-slate-100 transition-colors z-20"
                >
                    <Camera className="w-3 h-3" />
                </button>
            )}
            <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleUpload} />
        </div>
    );
};

const BrokerSection = ({ t, isAdmin, db }) => {
    const brokers = [
        { 
            id: "triv_broker",
            name: "TRIV.CO.ID", 
            type: "Crypto & Digital Assets Exchange",
            desc: "TRIV adalah platform jual beli aset kripto dan aset digital terkemuka di Indonesia yang memberikan kemudahan akses 24/7 secara real-time.", 
            url: "https://triv.co.id/", 
            color: "bg-blue-600", 
            shadow: "shadow-blue-600/20", 
            initial: "T",
            details: [
                "Terdaftar & Diawasi Resmi: Memiliki lisensi penuh dari BAPPEBTI dan beroperasi di bawah regulasi Kominfo.",
                "Likuiditas Tinggi: Penarikan dana (withdrawal) instan ke lebih dari 100 bank di Indonesia secara real-time tanpa hari libur.",
                "Pilihan Aset Luas: Mendukung ratusan jenis cryptocurrency populer termasuk Bitcoin, Ethereum, dan stablecoin.",
                "Keamanan Standar Dunia: Menggunakan sistem penyimpanan dingin (Cold Storage) untuk melindungi aset nasabah dari risiko serangan siber."
            ]
        },
        { 
            id: "tradingview_broker",
            name: "TRADINGVIEW", 
            type: "Professional Charting & Social Network",
            desc: "TradingView adalah ekosistem charting paling canggih di dunia yang digunakan oleh jutaan trader untuk menganalisis pergerakan harga pasar global.", 
            url: "https://www.tradingview.com/", 
            color: "bg-[#131722]", 
            shadow: "shadow-slate-600/10", 
            initial: "TV",
            icon: Monitor,
            details: [
                "Analisa Teknikal Superior: Dilengkapi dengan ratusan indikator bawaan, alat gambar cerdas, dan visualisasi data yang sangat responsif.",
                "Cakupan Pasar Global: Akses data real-time untuk Saham, Forex, Crypto, Komoditas, hingga Obligasi dari berbagai bursa dunia.",
                "Komunitas Trader Terbesar: Fitur sosial yang memungkinkan pengguna berbagi ide trading, skrip Pine Script kustom, dan edukasi pasar.",
                "Multi-Platform: Sinkronisasi sempurna antara aplikasi mobile, desktop, dan web browser untuk memantau pasar di mana saja."
            ]
        }
    ];

    return (
        <div className="p-6 pt-24 pb-32 animate-fadeIn space-y-8">
            <div>
                <h2 className="text-2xl font-black text-white mb-2">{t.platform}</h2>
                <p className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest">Partner Ekosistem Resmi & Alat Bantu Profesional</p>
            </div>
            
            <div className="space-y-10">
                {brokers.map((broker, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 group hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden">
                        <div className={`absolute -top-10 -right-10 w-40 h-40 ${broker.color} opacity-5 blur-[80px] rounded-full`}></div>
                        
                        <div className="flex items-start gap-5 mb-8 relative z-10">
                            <BrokerAvatar 
                                brokerId={broker.id} 
                                isAdmin={isAdmin} 
                                db={db} 
                                t={t} 
                                color={broker.color} 
                                initial={broker.initial}
                                icon={broker.icon}
                            />
                            <div className="flex-1">
                                <span className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-1 block">{broker.type}</span>
                                <h3 className="text-xl font-black text-white tracking-tight">{broker.name}</h3>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">
                                "{broker.desc}"
                            </p>
                            
                            <div className="grid gap-3">
                                {broker.details.map((detail, dIdx) => (
                                    <div key={dIdx} className="flex gap-3 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                            {detail}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                            <a 
                                href={broker.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`inline-flex items-center justify-center w-full gap-2 px-6 py-5 rounded-2xl text-[10px] font-black uppercase text-white transition-all active:scale-95 ${broker.color === 'bg-[#131722]' ? 'bg-slate-800 border border-white/5 hover:bg-slate-700' : broker.color + ' hover:brightness-110'} shadow-lg ${broker.shadow}`}
                            >
                                Kunjungi Situs Resmi <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MOTIVATION ITEM RENDERER ---
const MotivationItem = ({ m, isAdmin, db, onExpandMedia, collectionName }) => {
    const [mediaUrl, setMediaUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!m.mediaType || m.mediaType === 'none') {
            setLoading(false);
            return;
        }
        fetchFullMedia(m, collectionName).then(url => {
            setMediaUrl(url);
            setLoading(false);
        });
    }, [m, collectionName]);

    return (
        <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] flex flex-col group relative overflow-hidden transition-all hover:border-indigo-500/30">
            {mediaUrl && (
                <div className="w-full relative overflow-hidden cursor-pointer" onClick={() => onExpandMedia(m, collectionName)}>
                    {m.mediaType === 'video' ? (
                        <div className="aspect-video relative bg-black flex items-center justify-center overflow-hidden">
                            <video src={`${mediaUrl}#t=0.5`} className="w-full h-full object-cover opacity-60" preload="metadata" muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <PlayCircle className="w-10 h-10 text-white opacity-40 group-hover:opacity-80 transition-opacity" />
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video relative">
                            <img src={mediaUrl} className="w-full h-full object-cover opacity-60" alt="Motivasi" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                </div>
            )}
            
            <div className="p-6 relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl"><Quote className="w-4 h-4 text-indigo-500/50" /></div>
                    <div className="flex-1">
                        <p className="text-slate-200 text-xs italic font-medium leading-relaxed">"{m.text}"</p>
                        <span className="text-[8px] text-slate-500 font-black uppercase mt-2 block tracking-widest">— {m.author}</span>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, m.id))} className="absolute top-4 right-4 p-1 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

const IntroSection = ({ onStart, user, db, isAdmin, onExpandMedia, t }) => {
    const [motivations, setMotivations] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newQuote, setNewQuote] = useState("");
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const mediaInputRef = useRef(null);
    const collectionName = 'motivations';

    useEffect(() => {
        if (!user || !db) return;
        const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        return onSnapshot(q, (s) => {
            const items = s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMotivations(items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });
    }, [db, user]);

    const handleMediaSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const reader = new FileReader();
        reader.onload = () => {
            setMediaPreview(reader.result);
            setMediaType(type);
        };
        reader.readAsDataURL(file);
    };

    const handleAddMotivation = async () => {
        if (!newQuote.trim() || !user || !isAdmin) return;
        setIsSaving(true);
        try {
            await savePublicMedia(collectionName, {
                text: newQuote,
                author: "Admin Master",
                mediaType: mediaType || 'none'
            }, mediaPreview);
            
            setNewQuote("");
            setMediaPreview(null);
            setMediaType(null);
            setIsAdding(false);
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    return (
        <div className="p-6 pt-24 pb-32 animate-fadeIn space-y-8">
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-slate-900 p-10 shadow-2xl">
                <div className="relative z-10"><span className="inline-block py-1 px-3 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-4">Dashboard Aktif</span><h2 className="text-3xl font-black text-white mb-2 leading-tight">{t.welcome}</h2><p className="text-blue-100/70 text-sm font-medium">{t.discipline}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {[ { id: 'Teknikal', label: t.edu, icon: Award, color: 'text-blue-400', bg: 'bg-blue-400/10' }, { id: 'Jurnal', label: t.journal, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }, { id: 'Warta', label: t.news, icon: Newspaper, color: 'text-amber-400', bg: 'bg-amber-400/10' }, { id: 'Broker', label: t.platform, icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-400/10' }, ].map((item) => (
                    <button key={item.id} onClick={() => onStart(item.id)} className="flex flex-col items-start p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-slate-600 transition-all active:scale-95">
                        <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4`}><item.icon className={`w-6 h-6 ${item.color}`} /></div>
                        <span className="text-sm font-black text-white">{item.label}</span>
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{t.dailyMotivation}</h3>
                    {isAdmin && (
                        <button onClick={() => setIsAdding(!isAdding)} className="text-indigo-500 transition-transform active:scale-90">
                            {isAdding ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                        </button>
                    )}
                </div>
                
                {isAdmin && isAdding && (
                    <div className="bg-slate-900 border border-indigo-500/20 p-5 rounded-[2rem] space-y-3 animate-slideUp">
                        <textarea value={newQuote} onChange={e => setNewQuote(e.target.value)} placeholder={t.quotePlaceholder} className="w-full bg-slate-800/40 p-4 rounded-2xl text-[11px] text-white outline-none border border-white/5 min-h-[80px]" />
                        
                        <div className="flex items-center gap-2">
                            <input ref={mediaInputRef} type="file" hidden accept="image/*,video/*" onChange={handleMediaSelect} />
                            <button onClick={() => mediaInputRef.current.click()} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mediaPreview ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/50' : 'bg-slate-800 text-slate-500'}`}>
                                {mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                {mediaPreview ? 'Media Terpilih' : 'Unggah Latar'}
                            </button>
                            {mediaPreview && (
                                <button onClick={() => {setMediaPreview(null); setMediaType(null);}} className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {mediaPreview && (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5">
                                {mediaType === 'video' ? (
                                    <video src={`${mediaPreview}#t=0.5`} className="w-full h-full object-cover" preload="metadata" muted />
                                ) : (
                                    <img src={mediaPreview} className="w-full h-full object-cover" />
                                )}
                            </div>
                        )}

                        <button onClick={handleAddMotivation} disabled={isSaving} className="w-full py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : t.addMotivation}
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {motivations.length > 0 ? motivations.map(m => (
                        <MotivationItem key={m.id} m={m} isAdmin={isAdmin} db={db} onExpandMedia={onExpandMedia} collectionName={collectionName} />
                    )) : (
                        <div className="py-10 text-center"><p className="text-[10px] text-slate-700 uppercase italic font-black tracking-widest">Belum ada motivasi hari ini.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TechnicalSection = ({ isAdmin, db, onExpandMedia, user, t }) => (
    <div className="p-6 pt-24 pb-32 animate-fadeIn space-y-12">
        <section>
            <h2 className="text-2xl font-black text-white mb-2">{t.techCurriculum}</h2>
            <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-10">{t.proStandard}</p>
            <div className="space-y-8">{TECHNICAL_CURRICULUM.map((topic) => (
                    <div key={topic.id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 relative overflow-hidden group hover:border-indigo-500/30 transition-colors shadow-xl">
                        <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><topic.icon className="w-6 h-6" /></div><h3 className="text-lg font-black text-white">{topic.title}</h3></div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4 font-bold">{topic.desc}</p>
                        <div className="bg-black/40 p-5 rounded-2xl mb-6 border border-white/5"><p className="text-[10px] text-slate-400 leading-relaxed font-medium">{topic.detail}</p></div>
                        <MediaUploader topicId={topic.id} collectionName="technical_materials" onExpand={onExpandMedia} db={db} isAdmin={isAdmin} user={user} allowAll={true} />
                    </div>
                ))}</div>
        </section>

        <section className="pt-12 border-t border-white/5">
            <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-black text-white">{t.mentorCurriculum}</h2>
            </div>
            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-10">Pelajaran Berharga dari Praktisi</p>
            <div className="space-y-8">
                {MENTOR_CURRICULUM.map((topic) => (
                    <div key={topic.id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-colors shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                <topic.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-white">{topic.title}</h3>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4 font-bold italic">"{topic.desc}"</p>
                        <div className="bg-black/60 p-6 rounded-2xl mb-6 border border-white/5 shadow-inner">
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{topic.detail}</p>
                        </div>
                        <MediaUploader topicId={topic.id} collectionName="mentor_materials" onExpand={onExpandMedia} db={db} isAdmin={isAdmin} user={user} allowAll={false} />
                    </div>
                ))}
            </div>
        </section>
    </div>
);

const MediaUploader = ({ topicId, collectionName, onExpand, db, isAdmin, user, allowAll }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);
    useEffect(() => {
        if (!user || !db) return;
        const q = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        return onSnapshot(q, (s) => { setMedia(s.docs.map(d => ({ id: d.id, ...d.data() })).filter(m => m.topicId === topicId)); });
    }, [topicId, db, user]);
    const handleUpload = async (e) => {
        const file = e.target.files[0]; 
        if (!file || !user || !isAdmin) return;
        
        // Cek jika hanya diperbolehkan video (untuk Mentor Section)
        if (!allowAll && !file.type.startsWith('video')) {
            return; // Abaikan jika bukan video
        }
        
        setLoading(true); 
        const r = new FileReader(); 
        r.onload = async () => { 
            await savePublicMedia(collectionName, { topicId, mediaType: file.type.startsWith('video') ? 'video' : 'image' }, r.result); 
            setLoading(false); 
        }; 
        r.readAsDataURL(file);
    };
    return (
        <div className="mt-4 border-t border-white/5 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                    {allowAll ? 'Materi Visual & Tutorial' : 'Video Pembelajaran Mentor'}
                </h4>
                {isAdmin && (
                    <button onClick={() => fileRef.current.click()} disabled={loading} className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 hover:bg-indigo-500/20 transition-colors">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlusCircle className="w-3 h-3" />}
                    </button>
                )}
                <input 
                    ref={fileRef} 
                    type="file" 
                    hidden 
                    accept={allowAll ? "image/*,video/*" : "video/*"} 
                    onChange={handleUpload} 
                />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {media.length > 0 ? media.map(m => (
                    <div key={m.id} onClick={() => onExpand(m, collectionName)} className="w-20 h-20 bg-slate-950 rounded-2xl flex-shrink-0 relative overflow-hidden group border border-white/5 cursor-pointer hover:border-indigo-500/50 transition-all">
                        {m.mediaType === 'video' ? <div className="w-full h-full flex items-center justify-center bg-indigo-500/5"><PlayCircle className="w-8 h-8 text-indigo-500 opacity-60" /></div> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-800 italic uppercase font-black">Pratinjau</div>}
                        {isAdmin && <button onClick={(e) => {e.stopPropagation(); deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, m.id))}} className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg text-red-500 backdrop-blur-md transition-colors hover:bg-red-500 hover:text-white"><X className="w-3 h-3" /></button>}
                    </div>
                )) : <p className="text-[9px] text-slate-700 uppercase italic py-4">Belum ada lampiran visual.</p>}
            </div>
        </div>
    );
};

const TradMasterApp = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('Intro'); 
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [expandedMedia, setExpandedMedia] = useState(null);
    const [expandedCollection, setExpandedCollection] = useState(null);
    const [language, setLanguage] = useState('id');
    const t = translations[language];

    useEffect(() => {
        if (!auth) return;
        
        const login = async () => {
            try {
                // Gunakan Anonymous Auth secara langsung
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Login failed:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
        login();
        
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-[#080a0c] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden pb-32">
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#080a0c]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex justify-between items-center">
                <div className="flex items-center gap-3" onClick={() => setActiveTab('Intro')}><div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 cursor-pointer transition-transform hover:scale-105 active:scale-95"><TrendingUp className="w-5 h-5 text-white" /></div><h1 className="text-base font-black italic uppercase tracking-tighter cursor-pointer">TradeMaster</h1></div>
                <div className="flex items-center gap-3"><button onClick={() => setLanguage(l => l === 'id' ? 'en' : 'id')} className="p-2.5 bg-white/5 rounded-xl text-slate-400 flex items-center gap-2 transition-all hover:bg-white/10"><Languages className="w-4 h-4" /><span className="text-[10px] font-black uppercase">{language}</span></button>{!isAdmin ? (<button onClick={() => setIsPinModalOpen(true)} className="p-2.5 bg-white/5 rounded-xl text-slate-500 transition-all hover:bg-white/10 active:scale-90"><Lock className="w-4 h-4" /></button>) : (<button onClick={() => setIsAdmin(false)} className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20 animate-pulse transition-all"><Unlock className="w-4 h-4" /></button>)}</div>
            </header>
            <main className="max-w-xl mx-auto min-h-screen">
                {activeTab === 'Intro' && <IntroSection user={user} onStart={setActiveTab} db={db} isAdmin={isAdmin} t={t} onExpandMedia={(i, c) => { setExpandedMedia(i); setExpandedCollection(c); }} />}
                {activeTab === 'Teknikal' && <TechnicalSection isAdmin={isAdmin} db={db} user={user} t={t} onExpandMedia={(i, c) => { setExpandedMedia(i); setExpandedCollection(c); }} />}
                {activeTab === 'Broker' && <BrokerSection t={t} isAdmin={isAdmin} db={db} />}
                {activeTab === 'Jurnal' && <JournalSection user={user} db={db} t={t} lang={language} onExpandMedia={(i, c) => { setExpandedMedia(i); setExpandedCollection(c); }} isAdmin={isAdmin} />}
                {activeTab === 'Warta' && <WartaSection isAdmin={isAdmin} user={user} db={db} t={t} lang={language} onExpandMedia={(i, c) => { setExpandedMedia(i); setExpandedCollection(c); }} />}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080a0c]/90 backdrop-blur-xl border-t border-white/5 px-4 pb-10 pt-4 shadow-2xl">
                <div className="flex justify-around items-center max-w-lg mx-auto">{[{ id: 'Intro', icon: Home, label: t.home }, { id: 'Jurnal', icon: FileText, label: t.journal }, { id: 'Warta', icon: Newspaper, label: t.news }, { id: 'Teknikal', icon: Award, label: t.edu }, { id: 'Broker', icon: Briefcase, label: t.platform }].map(item => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-indigo-500 scale-110' : 'text-slate-600'}`}><item.icon className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span></button>))}</div>
            </nav>
            {isPinModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-8 backdrop-blur-sm">
                    <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 w-full max-w-xs text-center shadow-2xl"><Lock className="w-12 h-12 text-amber-500 mx-auto mb-6" /><h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest text-center">Admin Access</h3><input type="password" placeholder="PIN" className="w-full p-5 bg-slate-800 rounded-3xl text-center text-2xl mb-8 outline-none border border-white/5 text-white focus:border-amber-500/40 transition-all" autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value === ADMIN_ACCESS_PIN) { setIsAdmin(true); setIsPinModalOpen(false); } }} /><button onClick={() => setIsPinModalOpen(false)} className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-colors">{t.cancel}</button></div>
                </div>
            )}
            <FullMediaModal media={expandedMedia} onClose={() => setExpandedMedia(null)} collectionName={expandedCollection} t={t} />
        </div>
    );
};

export default TradMasterApp;