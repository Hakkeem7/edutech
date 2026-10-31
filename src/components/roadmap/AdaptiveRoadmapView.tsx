import React, { useState } from 'react';
import {
  Milestone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Bot,
  Layers,
  ChevronRight,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { RoadmapStage, AdaptiveInsight } from '../../types';

export const AdaptiveRoadmapView: React.FC = () => {
  const {
    roadmap,
    updateRoadmapStage,
    adaptiveInsights,
    acceptAdaptiveInsight,
    dismissAdaptiveInsight,
    triggerAdaptiveOrchestration,
    activeTargetRole,
    setActiveTab,
  } = useLearner();

  const [orchestrating, setOrchestrating] = useState(false);
  const [selectedStage, setSelectedStage] = useState<RoadmapStage | null>(null);

  const handleManualOrchestration = async () => {
    setOrchestrating(true);
    await triggerAdaptiveOrchestration();
    setTimeout(() => {
      setOrchestrating(false);
    }, 600);
  };

  const pendingInsights = adaptiveInsights.filter((i) => i.status === 'pending_review');

  const getStatusColor = (status: RoadmapStage['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Needs Revision':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Not Started':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const agentArchitectureList = [
    { name: 'Learner Profiling Agent', role: 'Maintains verified profile & tracks missing evidence' },
    { name: 'Skill Gap Analysis Agent', role: 'Evaluates current proficiency vs target role benchmarks' },
    { name: 'Learning Recommendation Agent', role: 'Sequences activities by priority, duration & prerequisites' },
    { name: 'RAG Knowledge Agent', role: 'Retrieves grounded materials and contextual answers' },
    { name: 'Assessment Agent', role: 'Administers MCQs & extracts concrete skill scores' },
    { name: 'Interview Agent', role: 'Evaluates mock technical interviews against rubrics' },
    { name: 'Progress & Adaptation Agent', role: 'Coordinates adaptive rule triggers & path updates' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic Orchestration Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Adaptive Learning Roadmap</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic milestone progression for {activeTargetRole}. Milestones update automatically as you complete quizzes
            and interviews.
          </p>
        </div>

        <button
          onClick={handleManualOrchestration}
          disabled={orchestrating}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start md:self-center"
        >
          <Bot className="w-4 h-4" />
          <span>{orchestrating ? 'Agents Evaluating Signals...' : 'Run Agentic Orchestrator'}</span>
        </button>
      </div>

      {/* Adaptive Learning Insights Panel: Before vs After Review */}
      {pendingInsights.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 rounded-lg text-amber-800">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Adaptive Roadmap Insights — Action Required</h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
              Human-in-the-Loop Review
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            The Agentic Orchestrator has proposed the following modifications based on your recent performance. Please
            review and accept to apply changes to your live roadmap.
          </p>

          <div className="space-y-3">
            {pendingInsights.map((insight) => (
              <div key={insight.id} className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800">{insight.triggerSummary}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>Agents:</span>
                    <span className="font-semibold text-blue-600">{insight.agentsInvolved.slice(0, 2).join(', ')}</span>
                  </div>
                </div>

                {/* Before & After Diff Box */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Proposed Roadmap Diff:
                  </span>
                  {insight.proposedChanges.map((change, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                    >
                      <div className="sm:col-span-3 font-bold text-slate-800">{change.topic}</div>
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 line-through text-[11px]">
                          {change.previousStatus}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                          {change.newStatus}
                        </span>
                      </div>
                      <div className="sm:col-span-5 text-[11px] text-slate-500 leading-tight">
                        <strong>Justification:</strong> {change.justification}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next Activity Recommendation */}
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-950 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block text-blue-900">Recommended Next Step:</span>
                    <span className="text-[11px] text-slate-600">{insight.recommendedNextActivity}</span>
                  </div>
                </div>

                {/* Accept / Dismiss Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => dismissAdaptiveInsight(insight.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => acceptAdaptiveInsight(insight.id)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Apply to Roadmap</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Roadmap Timeline Stages */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Target Learning Timeline</h3>
            <p className="text-xs text-slate-500">Stages 1 through {roadmap.length} dynamically prioritized</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {roadmap.filter((s) => s.status === 'Completed').length} / {roadmap.length} Completed
          </span>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {roadmap.map((stage, idx) => {
            const isCompleted = stage.status === 'Completed';
            const isNeedsRevision = stage.status === 'Needs Revision';
            const isInProgress = stage.status === 'In Progress';

            return (
              <div key={stage.id} className="relative group">
                {/* Node icon on timeline */}
                <div
                  className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 border-white text-white shadow-xs'
                      : isNeedsRevision
                      ? 'bg-amber-500 border-white text-white shadow-xs'
                      : isInProgress
                      ? 'bg-blue-600 border-white text-white shadow-xs ring-4 ring-blue-100'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stage.stageNumber}
                </div>

                {/* Stage Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    isInProgress
                      ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                      : isNeedsRevision
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Stage {stage.stageNumber}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-800">{stage.skill}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(stage.status)}`}>
                        {stage.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{stage.estimatedDuration}</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mb-1">{stage.title}</h4>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{stage.activity}</p>

                  {/* Prerequisites & Verification Evidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block">Prerequisites:</span>
                      <span className="text-slate-700">{stage.prerequisites.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Assessment Evidence:</span>
                      <span className="text-blue-700 font-medium">{stage.assessmentEvidence || 'Pending Quiz'}</span>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="mt-3 pt-2 flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${stage.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('assessment')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                      >
                        Verify via Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Agent Architecture Blueprint Drawer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-xs text-slate-800">Coordinated Agent Architecture</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {agentArchitectureList.map((ag, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="font-bold text-slate-900 block text-[11px]">{ag.name}</span>
              <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">{ag.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
