import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  RotateCcw,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Server,
  Save,
  HelpCircle,
  Database,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export const SettingsView: React.FC = () => {
  const { systemSettings, updateSettings, resetToDemoData, health, refreshHealth } = useLearner();

  const [formSettings, setFormSettings] = useState(systemSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure adaptive learning thresholds, AI model parameters, and persistent demo storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Adaptive Learning Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Adaptive Orchestration Rules & Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Remedial Review Threshold (&lt; %)</label>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {formSettings.failReviewThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="75"
                step="5"
                value={formSettings.failReviewThreshold}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, failReviewThreshold: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Scores below this trigger automatic roadmap flags for "Needs Revision" and remedial practice.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Target Mastery Threshold (&gt;= %)</label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {formSettings.targetPassThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                step="5"
                value={formSettings.targetPassThreshold}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, targetPassThreshold: parseInt(e.target.value, 10) })
                }
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Scores at or above this mark the milestone "Completed" and unlock subsequent stages.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: AI Engine & RAG Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>AI Model & RAG Retrieval Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active AI Model</label>
              <input
                type="text"
                disabled
                value="gemini-3.8-flash (Official @google/genai SDK)"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Server-side execution with user-agent telemetry.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">RAG Context Chunks (Top K)</label>
              <select
                value={formSettings.ragTopK}
                onChange={(e) => setFormSettings({ ...formSettings, ragTopK: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
              >
                <option value={2}>2 Chunks (Concise)</option>
                <option value={3}>3 Chunks (Standard)</option>
                <option value={5}>5 Chunks (Comprehensive)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Number of grounded source snippets retrieved per prompt.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Storage & Demo Reset */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-600" />
            <span>Persistence & Demo Mode Management</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-xs text-slate-800 block">Reset Demo State to Initial Baseline</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Restores Alex Kumar's profile, initial gap analysis, 7-stage roadmap, and demo quizzes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset SkillForge AI to initial demo state?')) {
                  resetToDemoData();
                  alert('Demo state restored!');
                }
              }}
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Alex Kumar Data</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>
                Backend Server Status: <strong className="text-blue-900">{health?.status || 'Online'}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={refreshHealth}
              className="text-xs text-blue-700 underline font-semibold"
            >
              Ping Server
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
