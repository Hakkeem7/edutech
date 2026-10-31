import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  TrendingDown,
  BookOpen,
  BotMessageSquare,
  Mic,
  CheckSquare,
  Milestone,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useLearner, NavigationTab } from '../../context/LearnerContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { activeTab, setActiveTab, notificationCount, activeTargetRole, health } = useLearner();

  const navigationItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Learner Profile', icon: UserCheck },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: TrendingDown },
    { id: 'learning', label: 'Personalized Learning', icon: BookOpen },
    { id: 'chatbot', label: 'AI Learning Chatbot', icon: BotMessageSquare, badge: 'RAG' },
    { id: 'interviewer', label: 'AI Interviewer', icon: Mic, badge: 'Mock' },
    { id: 'assessment', label: 'MCQ Assessment', icon: CheckSquare, badge: 'Quiz' },
    {
      id: 'roadmap',
      label: 'Adaptive Roadmap',
      icon: Milestone,
      badge: notificationCount > 0 ? `${notificationCount} new` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'reports', label: 'Progress Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">SkillForge</span>
              <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-tight leading-tight">
              Adaptive L&D Platform
            </p>
          </div>
        </div>
      </div>

      {/* Target Role Mini Badge */}
      <div className="mx-4 mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Target Role</span>
          <span className="font-semibold text-slate-800 truncate block max-w-[130px]">{activeTargetRole}</span>
        </div>
        <button
          onClick={() => setActiveTab('skillgap')}
          className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] underline flex items-center"
        >
          View Gaps
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Learning Modules
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                health?.geminiConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
            <span className="font-semibold text-slate-700">
              {health?.geminiConfigured ? 'Gemini 3.8 Connected' : 'AI Engine: Local Fallback'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
            v1.0
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Agentic Orchestration Active</span>
        </p>
      </div>
    </aside>
  );
};
