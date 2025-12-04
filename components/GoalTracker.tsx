import React, { useState } from 'react';
import { Goal } from '../types';
import { Plus, Check, Trash2, Wand2, Loader2, ChevronRight, ChevronDown, BookOpen, Coffee, Users } from 'lucide-react';
import { breakDownGoal } from '../services/geminiService';

interface GoalTrackerProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, setGoals }) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Goal['category']>('study');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const addGoal = async (withAI: boolean) => {
    if (!newGoalTitle.trim()) return;

    const newGoalId = Date.now().toString();
    let subTasks: Goal[] = [];

    if (withAI) {
      setIsBreakingDown(true);
      try {
        const steps = await breakDownGoal(newGoalTitle);
        subTasks = steps.map((step, index) => ({
          id: `${newGoalId}-sub-${index}`,
          title: step,
          completed: false,
          category: selectedCategory,
          createdAt: Date.now()
        }));
      } catch (e) {
        console.error("AI breakdown failed", e);
      } finally {
        setIsBreakingDown(false);
      }
    }

    const newGoal: Goal = {
      id: newGoalId,
      title: newGoalTitle,
      completed: false,
      category: selectedCategory,
      createdAt: Date.now(),
      subTasks: subTasks.length > 0 ? subTasks : undefined
    };

    setGoals(prev => [newGoal, ...prev]);
    setNewGoalTitle('');
    if (subTasks.length > 0) {
        setExpandedGoals(prev => new Set(prev).add(newGoalId));
    }
  };

  const toggleGoal = (id: string, parentId?: string) => {
    setGoals(prev => {
      return prev.map(goal => {
        // If it's a subtask completion
        if (parentId && goal.id === parentId && goal.subTasks) {
          const updatedSubTasks = goal.subTasks.map(sub => 
            sub.id === id ? { ...sub, completed: !sub.completed } : sub
          );
          // Check if all subtasks are done, if so, complete parent
          const allDone = updatedSubTasks.every(st => st.completed);
          return { ...goal, completed: allDone, subTasks: updatedSubTasks };
        }
        
        // If it's a main task
        if (goal.id === id) {
          const newCompleted = !goal.completed;
          // If unchecking parent, uncheck all children? Or keep them? Let's keep specific children state but maybe mark them all done if parent is checked? 
          // For simplicity: Checking parent marks all children done. Unchecking parent leaves children as is.
          let updatedSubTasks = goal.subTasks;
          if (newCompleted && updatedSubTasks) {
             updatedSubTasks = updatedSubTasks.map(st => ({...st, completed: true}));
          }
          return { ...goal, completed: newCompleted, subTasks: updatedSubTasks };
        }
        return goal;
      });
    });
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'study': return <BookOpen size={16} />;
      case 'social': return <Users size={16} />;
      default: return <Coffee size={16} />;
    }
  };

  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'study': return '공부';
          case 'social': return '관계';
          case 'life': return '생활';
          default: return cat;
      }
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">나의 목표</h1>
        <p className="text-slate-500">큰 산도 작은 돌멩이부터.</p>
      </header>

      {/* Input Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex gap-2 mb-2">
          {['study', 'life', 'social'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 transition-colors
                ${selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
              `}
            >
              {getCategoryIcon(cat)} {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
        
        <div className="relative">
            <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="어떤 일을 해볼까요?"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-24 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {/* Action Buttons inside Input */}
            <div className="absolute right-2 top-1.5 flex gap-1">
                 <button
                    onClick={() => addGoal(true)}
                    disabled={isBreakingDown || !newGoalTitle.trim()}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="AI로 단계 쪼개기"
                >
                    {isBreakingDown ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                </button>
                <button
                    onClick={() => addGoal(false)}
                    disabled={!newGoalTitle.trim()}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
        <p className="text-xs text-slate-400 px-1">
            팁: 마법봉 <Wand2 size={12} className="inline"/>을 누르면 AI가 아주 작은 실행 단위로 쪼개줍니다.
        </p>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                <p>아직 목표가 없어요.<br/>작은 것부터 시작해보세요!</p>
            </div>
        )}
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-center p-4 gap-3">
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                  ${goal.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 text-transparent hover:border-emerald-400'}
                `}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-slate-800 font-medium truncate ${goal.completed ? 'line-through text-slate-400' : ''}`}>
                  {goal.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500`}>
                        {getCategoryLabel(goal.category)}
                    </span>
                    {goal.subTasks && goal.subTasks.length > 0 && (
                        <span className="text-xs text-slate-400">
                            {goal.subTasks.filter(st => st.completed).length}/{goal.subTasks.length} 단계
                        </span>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                 {goal.subTasks && goal.subTasks.length > 0 && (
                    <button 
                        onClick={() => toggleExpand(goal.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        {expandedGoals.has(goal.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                 )}
                <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Subtasks */}
            {expandedGoals.has(goal.id) && goal.subTasks && (
                <div className="bg-slate-50 border-t border-slate-100 p-3 pl-12 space-y-2">
                    {goal.subTasks.map(sub => (
                        <div key={sub.id} className="flex items-center gap-3">
                             <button
                                onClick={() => toggleGoal(sub.id, goal.id)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0
                                ${sub.completed 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'border-slate-300 bg-white text-transparent hover:border-emerald-400'}
                                `}
                            >
                                <Check size={12} strokeWidth={3} />
                            </button>
                            <span className={`text-sm ${sub.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                                {sub.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;