import React, { useState } from 'react';
import {
  TrendingDown,
  Target,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
  Info,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { useLearner } from '../../context/LearnerContext';
import { GapSeverity } from '../../types';

export const SkillGapView: React.FC = () => {
  const {
    activeTargetRole,
    setActiveTargetRole,
    targetRoles,
    skillGapAnalysis,
    setActiveTab,
    triggerAdaptiveOrchestration,
  } = useLearner();

  const [generatingPath, setGeneratingPath] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredSkills = skillGapAnalysis.skillsAnalysis.filter((item) => {
    if (filterSeverity === 'all') return true;
    return item.gapSeverity === filterSeverity;
  });

  const radarData = skillGapAnalysis.skillsAnalysis.map((s) => ({
    subject: s.skillName,
    current: s.currentScore,
    required: s.requiredScore,
    fullMark: 100,
  }));

  const handleGenerateLearningPath = async () => {
    setGeneratingPath(true);
    await triggerAdaptiveOrchestration();
    setTimeout(() => {
      setGeneratingPath(false);
      setActiveTab('learning');
    }, 600);
  };

  const getSeverityBadge = (severity: GapSeverity) => {
    switch (severity) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-500" /> High Gap
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Medium Gap
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3 h-3 text-blue-500" /> Low Gap
          </span>
        );
      case 'Satisfied':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Target Met
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Role Competency Benchmark</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">AI Skill Gap Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time gap evaluation comparing confirmed assessment evidence against standard market competencies.
          </p>
        </div>

        {/* Target Role Selector & Generate CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Target Role:</span>
            <select
              value={activeTargetRole}
              onChange={(e) => setActiveTargetRole(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-white text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500"
            >
              {targetRoles.map((r) => (
                <option key={r.roleId} value={r.roleName}>
                  {r.roleName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateLearningPath}
            disabled={generatingPath}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generatingPath ? 'Synthesizing Path...' : 'Generate Personalized Learning Path'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid: Radar Chart + Gap Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Visual (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Competency Radar Comparison</h3>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Match: {skillGapAnalysis.overallMatchScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Overlay of current assessed score vs benchmark required score for {activeTargetRole}.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Target Required" dataKey="required" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Radar name="Current Assessed" dataKey="current" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.45} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-cyan-600">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Current Proficiency
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Required Benchmark
            </span>
          </div>
        </div>

        {/* 4 Summary Panels: Gap Breakdown, Strongest, Weakest, Priority (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card A: Overall Match Summary */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Role Readiness Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{skillGapAnalysis.overallMatchScore}%</span>
                <span className="text-xs font-semibold text-slate-500">Benchmark Fit</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {skillGapAnalysis.summaryRecommendation}
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Required Skills: <strong>{skillGapAnalysis.skillsAnalysis.length}</strong></span>
              <span>Updated: Real-time</span>
            </div>
          </div>

          {/* Card B: Strongest Verified Skills */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strongest Verified Skills
              </span>
              <div className="space-y-1.5 mt-2">
                {skillGapAnalysis.strongestSkills.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-950">{s}</span>
                    <span className="text-[10px] font-semibold text-emerald-700">Demonstrated</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Leverage these strengths to accelerate high-level machine learning concepts.
            </p>
          </div>

          {/* Card C: Weakest / Critical Gaps */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High Severity Skill Gaps
              </span>
              <div className="space-y-1.5 mt-2">
                {skillGapAnalysis.weakestSkills.map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-rose-50/60 p-1.5 rounded-lg border border-rose-100">
                    <span className="font-bold text-rose-950">{w}</span>
                    <span className="text-[10px] font-bold text-rose-700">Needs Study</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Requires diagnostic assessment or remedial learning modules.
            </p>
          </div>

          {/* Card D: Priority Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Recommended Next Steps
              </span>
              <div className="space-y-1.5 mt-2 text-xs text-slate-700">
                <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="font-bold block text-blue-900">1. Take RAG Diagnostic Quiz</span>
                  <span className="text-[11px] text-slate-500">Provide baseline evidence for 0% assessed skills.</span>
                </div>
                <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="font-bold block text-blue-900">2. Review Statistics Lab</span>
                  <span className="text-[11px] text-slate-500">Close the 45% vs 75% gap flagged in quiz.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Competency Comparison Matrix</h3>
            <p className="text-xs text-slate-500">
              Skill | Current Level | Required Level | Gap Severity | Recommended Action
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Filter:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs">
              {(['all', 'High', 'Medium', 'Low', 'Satisfied'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filterSeverity === sev ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev === 'all' ? 'All Skills' : sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Skill</th>
                <th className="py-3 px-4 font-bold">Current Level</th>
                <th className="py-3 px-4 font-bold">Required Level</th>
                <th className="py-3 px-4 font-bold">Gap Severity</th>
                <th className="py-3 px-4 font-bold">Why It Matters</th>
                <th className="py-3 px-4 font-bold">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkills.map((item) => (
                <tr key={item.skillName} className="hover:bg-slate-50/60 transition-colors">
                  {/* Skill Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{item.skillName}</span>
                      {item.currentLevel === 'Not Assessed' && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                          Unassessed
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Current Level */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-700 block">{item.currentLevel}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.currentScore >= item.requiredScore
                                ? 'bg-emerald-500'
                                : item.currentScore >= 50
                                ? 'bg-blue-600'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.currentScore}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{item.currentScore}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Required Level */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{item.requiredLevel}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Target: {item.requiredScore}%</span>
                    </div>
                  </td>

                  {/* Gap Severity */}
                  <td className="py-3.5 px-4">{getSeverityBadge(item.gapSeverity)}</td>

                  {/* Why It Matters */}
                  <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px] leading-relaxed">
                    {item.importanceRationale}
                  </td>

                  {/* Recommended Action */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px] text-blue-950 font-medium">
                      {item.recommendedAction}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
