import React, { useState, useEffect } from 'react';
import { generateSpark } from '../services/geminiService';
import { MoodEntry } from '../types';
import { Sparkles, RefreshCw, Smile, Meh, Frown, Angry, Annoyed, Save } from 'lucide-react';

interface InspirationProps {
  addMoodEntry: (level: number, note: string) => void;
}

const Inspiration: React.FC<InspirationProps> = ({ addMoodEntry }) => {
  const [spark, setSpark] = useState<{title: string, content: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [moodLevel, setMoodLevel] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [savedMood, setSavedMood] = useState(false);

  const fetchSpark = async () => {
    setLoading(true);
    try {
      const data = await generateSpark();
      setSpark(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpark();
  }, []);

  const handleSaveMood = () => {
    if (moodLevel !== null) {
      addMoodEntry(moodLevel, moodNote);
      setSavedMood(true);
      setTimeout(() => setSavedMood(false), 3000);
      setMoodLevel(null);
      setMoodNote('');
    }
  };

  const moods = [
    { level: 1, icon: <Angry size={24} />, label: "힘듦", color: "text-red-500 bg-red-50" },
    { level: 2, icon: <Frown size={24} />, label: "우울", color: "text-orange-500 bg-orange-50" },
    { level: 3, icon: <Meh size={24} />, label: "보통", color: "text-yellow-500 bg-yellow-50" },
    { level: 4, icon: <Smile size={24} />, label: "좋음", color: "text-emerald-500 bg-emerald-50" },
    { level: 5, icon: <Sparkles size={24} />, label: "최고", color: "text-indigo-500 bg-indigo-50" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">오늘의 영감</h1>
        <p className="text-slate-500">나의 마음을 들여다보고 작은 불꽃 찾기</p>
      </header>

      {/* Spark Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white min-h-[200px] flex flex-col justify-between">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>

         <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Sparkles className="text-yellow-300" size={24} />
                </div>
                <button 
                    onClick={fetchSpark} 
                    disabled={loading}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            
            {loading ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-white/20 rounded w-1/3"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
            ) : spark ? (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold mb-2">{spark.title}</h2>
                    <p className="text-indigo-100 leading-relaxed opacity-90">{spark.content}</p>
                </div>
            ) : null}
         </div>
      </div>

      {/* Mood Tracker */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">오늘 기분은 어떠신가요?</h3>
        
        {!savedMood ? (
            <>
                <div className="flex justify-between mb-6">
                    {moods.map((m) => (
                        <button
                            key={m.level}
                            onClick={() => setMoodLevel(m.level)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${moodLevel === m.level ? `ring-2 ring-indigo-500 scale-110 ${m.color}` : 'hover:bg-slate-50 grayscale hover:grayscale-0'}`}
                        >
                            <div className={moodLevel === m.level ? '' : 'text-slate-400'}>
                                {m.icon}
                            </div>
                            <span className="text-xs font-medium text-slate-600">{m.label}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <textarea
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        placeholder="선택사항: 오늘의 짧은 메모를 남겨주세요..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
                    />
                    <button
                        onClick={handleSaveMood}
                        disabled={moodLevel === null}
                        className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        <Save size={18} /> 기록하기
                    </button>
                </div>
            </>
        ) : (
            <div className="py-10 text-center flex flex-col items-center animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                    <CheckCircle size={24} />
                </div>
                <p className="text-slate-800 font-medium">저장되었습니다!</p>
                <p className="text-slate-500 text-sm">내일 또 만나요.</p>
            </div>
        )}
      </div>
    </div>
  );
};

// Quick helper component for success state
const CheckCircle: React.FC<{size:number}> = ({size}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
)

export default Inspiration;