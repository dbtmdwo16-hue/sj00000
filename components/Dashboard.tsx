import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MoodEntry, Goal } from '../types';
import { Sun, CheckCircle, TrendingUp, Battery } from 'lucide-react';

interface DashboardProps {
  moodHistory: MoodEntry[];
  goals: Goal[];
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ moodHistory, goals, userName }) => {
  const completedCount = goals.filter(g => g.completed).length;
  // const pendingCount = goals.length - completedCount; // Unused
  const completionRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  // Prepare chart data (take last 7 entries)
  const chartData = useMemo(() => {
    return moodHistory.slice(-7).map(entry => ({
      date: entry.date.slice(5), // MM-DD
      level: entry.level
    }));
  }, [moodHistory]);

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">반가워요, {userName}님 👋</h1>
        <p className="text-slate-500">오늘도 나를 위한 작은 한 걸음.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
          <div className="bg-indigo-100 p-2 rounded-lg mb-2 text-indigo-600">
            <CheckCircle size={20} />
          </div>
          <span className="text-sm text-slate-500">완료한 활동</span>
          <span className="text-2xl font-bold text-slate-800">{completedCount}개</span>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start">
          <div className="bg-emerald-100 p-2 rounded-lg mb-2 text-emerald-600">
            <Battery size={20} />
          </div>
          <span className="text-sm text-slate-500">나의 활력 지수</span>
          <span className="text-2xl font-bold text-slate-800">{completionRate}%</span>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-500" />
            마음의 흐름
          </h2>
          <span className="text-xs text-slate-400">최근 7일</span>
        </div>
        
        <div className="h-48 w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 12, fill: '#94a3b8'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 6]} 
                  hide 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff'}}
                  activeDot={{r: 6}}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              아직 데이터가 충분하지 않아요.<br/>오늘의 기분을 기록해보세요!
            </div>
          )}
        </div>
      </div>

      {/* Daily Motivation Card */}
      <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-5 rounded-2xl border border-orange-200">
        <div className="flex items-start gap-3">
          <div className="bg-white/50 p-2 rounded-full text-orange-600 shrink-0">
            <Sun size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900">오늘의 생각</h3>
            <p className="text-sm text-orange-800 mt-1 leading-relaxed">
              도착지에 대해 너무 걱정하지 마세요.<br/>오늘 내딛는 발걸음 그 자체를 즐겨보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;