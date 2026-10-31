import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  ExternalLink,
  Sparkles,
  Award,
  Filter,
  Check,
  RotateCcw,
  Info,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { LearningResource } from '../../types';

export const PersonalizedLearningView: React.FC = () => {
  const {
    learningResources,
    toggleResourceCompletion,
    profile,
    activeTargetRole,
    setActiveTab,
  } = useLearner();

  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [activeCourseModal, setActiveCourseModal] = useState<LearningResource | null>(null);

  // Groupings
  const sections = [
    { id: 'start_here', label: '1. Start Here (Urgent Priority)' },
    { id: 'recommended_next', label: '2. Recommended Next (Target Gaps)' },
    { id: 'practice_more', label: '3. Practice More (Deepening Foundations)' },
    { id: 'advanced_learning', label: '4. Advanced Learning (Mastery & Scale)' },
  ];

  const uniqueSkills = Array.from(new Set(learningResources.map((r) => r.skill)));

  const filteredResources = learningResources.filter((r) => {
    if (selectedSection !== 'all' && r.section !== selectedSection) return false;
    if (selectedSkillFilter !== 'all' && r.skill !== selectedSkillFilter) return false;
    return true;
  });

  const completedCount = learningResources.filter((r) => r.completionStatus === 'completed').length;
  const progressPct = Math.round((completedCount / learningResources.length) * 100);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Curriculum</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Personalized Learning Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modules sequenced dynamically for {activeTargetRole} based on your skill gaps and preferred learning style (
            {profile.preferredLearningStyle}).
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 min-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-600">Overall Course Progress</span>
            <span className="font-bold text-blue-700">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>{completedCount} Completed</span>
            <span>{learningResources.length - completedCount} Incomplete</span>
          </div>
        </div>
      </div>

      {/* Mastery Verification Reminder */}
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Pedagogical Guardrail:</strong> Completing a course or lab marks the curriculum activity
          complete, but does <span className="underline font-bold">not</span> automatically mark a skill as mastered in your profile.
          To earn verified skill points, take the diagnostic <strong>MCQ Assessment</strong> or conduct an <strong>AI Mock Interview</strong>!
        </div>
      </div>

      {/* Filter and Category Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              selectedSection === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Sections
          </button>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSection(s.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                selectedSection === s.id ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Skill Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Skills</option>
            {uniqueSkills.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Organized Content Sections */}
      <div className="space-y-8">
        {sections.map((sec) => {
          const itemsInSection = filteredResources.filter((r) => r.section === sec.id);
          if (itemsInSection.length === 0) return null;

          return (
            <div key={sec.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>{sec.label}</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {itemsInSection.filter((i) => i.completionStatus === 'completed').length}/{itemsInSection.length} finished
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itemsInSection.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                      item.completionStatus === 'completed'
                        ? 'border-emerald-200/80 bg-emerald-50/20'
                        : 'border-slate-200/80 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Tags & Duration Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {item.skill}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.difficulty}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                            {item.resourceType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.durationMinutes}m</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-sm text-slate-900 mb-1 leading-snug">{item.title}</h4>

                      {/* Learning Objective */}
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.learningObjective}</p>

                      {/* Rationale Notice */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                        <strong className="text-slate-700 block font-semibold">Why Recommended:</strong>
                        <span>{item.reasonForRecommendation}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setActiveCourseModal(item)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Launch Study Guide</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {item.completionStatus === 'completed' ? (
                          <button
                            onClick={() => toggleResourceCompletion(item.id)}
                            className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-200 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleResourceCompletion(item.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Course Study Guide Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {activeCourseModal.skill} — {activeCourseModal.resourceType}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">{activeCourseModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900 space-y-1">
                <span className="font-bold block">Learning Objective:</span>
                <p className="text-[11px] leading-relaxed">{activeCourseModal.learningObjective}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Module Outline & Technical Reading:</h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs space-y-2">
                  <p>
                    <strong>1. Core Theoretical Foundations:</strong> Review architectural concepts, trade-offs between memory
                    consumption and latency, and key production constraints.
                  </p>
                  <p>
                    <strong>2. Code Walkthrough & Implementation:</strong> Construct the hands-on snippet using standard SDKs,
                    handling edge cases and connection pools.
                  </p>
                  <p>
                    <strong>3. Production Benchmarking:</strong> Measure throughput, recall, and error recovery in simulated
                    high-load scenarios.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Verified External Documentation:</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-md block">{activeCourseModal.contentReference}</span>
                </div>
                <a
                  href={activeCourseModal.contentReference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setActiveCourseModal(null);
                  setActiveTab('assessment');
                }}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Verify via Quiz</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCourseModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleResourceCompletion(activeCourseModal.id);
                    setActiveCourseModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {activeCourseModal.completionStatus === 'completed' ? 'Mark Incomplete' : 'Mark as Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
