import React, { useState } from 'react';
import {
  Bell,
  Briefcase,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const Header: React.FC = () => {
  const {
    profile,
    activeTargetRole,
    setActiveTargetRole,
    targetRoles,
    setActiveTab,
    resetToDemoData,
    health,
    adaptiveInsights,
    acceptAdaptiveInsight,
  } = useLearner();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const pendingInsights = adaptiveInsights.filter((i) => i.status === 'pending_review');

  const handleCustomRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRoleInput.trim()) {
      setActiveTargetRole(customRoleInput.trim());
      setShowCustomModal(false);
      setCustomRoleInput('');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Tagline & Platform Title */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>SkillForge AI</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-xs font-normal text-slate-500 italic">
              "Identify Skill Gaps. Learn Smarter. Become Job-Ready."
            </span>
          </h2>
        </div>

        {/* Target Job Role Selector */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-medium hover:bg-blue-100/70 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500">Target Role:</span>
            <span className="font-bold text-blue-950">{activeTargetRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Competency Profile
              </div>
              {targetRoles.map((r) => (
                <button
                  key={r.roleId}
                  onClick={() => {
                    setActiveTargetRole(r.roleName);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    activeTargetRole === r.roleName ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{r.roleName}</span>
                  {activeTargetRole === r.roleName && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1 px-3 py-1">
                <button
                  onClick={() => {
                    setRoleDropdownOpen(false);
                    setShowCustomModal(true);
                  }}
                  className="w-full text-left text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 py-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Enter Custom Target Role</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: AI Engine Status, Notifications, Demo Reset, Profile */}
      <div className="flex items-center gap-3">
        {/* AI Engine Status Pill */}
        <div
          title={
            health?.geminiConfigured
              ? 'Connected to Google Gemini 3.8 Flash via Official SDK'
              : 'Running in Local Deterministic Fallback Mode'
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            health?.geminiConfigured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${health?.geminiConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>{health?.geminiConfigured ? 'Gemini 3.8 Active' : 'Demo Fallback Mode'}</span>
        </div>

        {/* Demo Mode Reset Button */}
        <button
          onClick={() => {
            if (confirm('Reset SkillForge AI to initial demo state for Alex Kumar?')) {
              resetToDemoData();
            }
          }}
          title="Reset to Initial Alex Kumar Demo Data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline font-medium">Reset Demo</span>
        </button>

        {/* Notifications / Adaptive Updates */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingInsights.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Adaptive Intelligence Alerts</span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {pendingInsights.length} pending
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {pendingInsights.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    All adaptive roadmap suggestions have been reviewed!
                  </div>
                ) : (
                  pendingInsights.map((ins) => (
                    <div key={ins.id} className="p-3 text-xs hover:bg-slate-50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">{ins.triggerSummary}</p>
                          <p className="text-slate-500 text-[11px] mt-1">{ins.recommendedNextActivity}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                acceptAdaptiveInsight(ins.id);
                                setNotifOpen(false);
                              }}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700"
                            >
                              Apply to Roadmap
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab('roadmap');
                                setNotifOpen(false);
                              }}
                              className="text-[10px] text-slate-500 underline font-medium"
                            >
                              Inspect Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {profile.fullName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-none">{profile.fullName}</div>
              <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Demo Learner</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{profile.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-between"
              >
                <span>Edit Profile & Resume</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-between"
              >
                <span>My Progress Analytics</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Platform Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Custom Target Role */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-2">Set Custom Target Role</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter any target engineering or technical job role. The SkillForge AI agent will generate targeted competency metrics.
            </p>
            <form onSubmit={handleCustomRoleSubmit} className="space-y-4">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="e.g. LLM Systems Architect, MLOps Specialist"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Set Target Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
