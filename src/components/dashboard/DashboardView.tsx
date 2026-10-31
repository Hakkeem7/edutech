import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Mic,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  PlayCircle,
  FileText,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useLearner } from '../../context/LearnerContext';

export const DashboardView: React.FC = () => {
  const {
    profile,
    activeTargetRole,
    skillGapAnalysis,
    learningResources,
    roadmap,
    mcqAssessments,
    interviewSessions,
    setActiveTab,
  } = useLearner();

  // 1. Calculate KPI Metrics from real state
  const totalAssessedSkills = profile.skills.filter((s) => s.currentLevel !== 'Not Assessed');
  const avgProficiencyScore =
    totalAssessedSkills.length > 0
      ? Math.round(
          totalAssessedSkills.reduce((acc, s) => acc + s.currentScore, 0) / totalAssessedSkills.length
        )
      : 55;

  const highSeverityGaps = skillGapAnalysis.skillsAnalysis.filter((s) => s.gapSeverity === 'High');
  const totalGapsCount = skillGapAnalysis.skillsAnalysis.filter((s) => s.gapSeverity !== 'Satisfied').length;

  const completedCourses = learningResources.filter((r) => r.completionStatus === 'completed').length;
  const totalCourses = learningResources.length;
  const learningProgressPct = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const latestMCQ = mcqAssessments[0];
  const avgMCQScore =
    mcqAssessments.length > 0
      ? Math.round(mcqAssessments.reduce((acc, a) => acc + a.percentage, 0) / mcqAssessments.length)
      : 0;

  const latestInterview = interviewSessions[0];
  const interviewScore = latestInterview?.overallScore ?? 68;

  // Tracked learning hours estimation
  const totalHoursSpent = Math.round(
    learningResources
      .filter((r) => r.completionStatus === 'completed')
      .reduce((acc, r) => acc + r.durationMinutes, 0) / 60
  ) + 12; // Initial base + completed

  // 2. Prepare Radar Chart Data for Core Competencies
  const radarData = skillGapAnalysis.skillsAnalysis.slice(0, 7).map((s) => ({
    subject: s.skillName,
    current: s.currentScore,
    required: s.requiredScore,
    fullMark: 100,
  }));

  // 3. Prepare Bar Chart Data for Assessment & Interview Track
  const assessmentHistoryData = [
    ...mcqAssessments.map((a) => ({
      name: a.subject.slice(0, 8),
      score: a.percentage,
      type: 'MCQ',
    })),
    ...interviewSessions.map((i) => ({
      name: 'Interview',
      score: i.overallScore || 0,
      type: 'Interview',
    })),
  ].slice(0, 5);

  const recommendedCourses = learningResources.filter((r) => r.completionStatus !== 'completed').slice(0, 3);
  const activeRoadmapStage = roadmap.find((s) => s.status === 'In Progress') || roadmap[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized AI Learning Pathway</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Welcome back, {profile.fullName}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Targeting <span className="text-cyan-300 font-semibold">{activeTargetRole}</span>. You are{' '}
              <span className="text-teal-300 font-bold">{skillGapAnalysis.overallMatchScore}%</span> matched with target
              competencies.
            </p>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <button
              onClick={() => setActiveTab('learning')}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue Learning</span>
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Take Assessment</span>
            </button>
            <button
              onClick={() => setActiveTab('interviewer')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Start AI Interview</span>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chat AI Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Performance Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Skill Level */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skill Level</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{avgProficiencyScore}%</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Avg across <span className="font-semibold text-slate-700">{totalAssessedSkills.length}</span> assessed skills
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${avgProficiencyScore}%` }} />
          </div>
        </div>

        {/* Card 2: Skill Gaps */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Identified Gaps</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{totalGapsCount} Skills</div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
            <span className="font-bold">{highSeverityGaps.length}</span> High Priority Gaps
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, highSeverityGaps.length * 25)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Learning Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Course Progress</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{learningProgressPct}%</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-700">{completedCourses}</span> of {totalCourses} activities done
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${learningProgressPct}%` }} />
          </div>
        </div>

        {/* Card 4: MCQ Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">MCQ Diagnostic</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{latestMCQ ? `${latestMCQ.percentage}%` : 'N/A'}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {latestMCQ ? `Subject: ${latestMCQ.subject}` : 'No quizzes taken yet'}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${avgMCQScore}%` }} />
          </div>
        </div>

        {/* Card 5: AI Interview Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interview Score</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{interviewScore}/100</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {latestInterview ? `${latestInterview.questions.length} questions scored` : 'Diagnostic baseline'}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${interviewScore}%` }} />
          </div>
        </div>

        {/* Card 6: Learning Hours */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Learning Time</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{totalHoursSpent} hrs</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Target: <span className="font-semibold text-slate-700">{profile.hoursPerWeek} hrs/week</span>
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      {/* Weak Skills Alert Banner */}
      {highSeverityGaps.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Priority Skill Gaps Identified for {activeTargetRole}</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Immediate attention required in:{' '}
                <span className="font-bold">{highSeverityGaps.map((g) => g.skillName).join(', ')}</span>.
                Target proficiency has not yet been demonstrated or assessed.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('skillgap')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 self-start md:self-center flex items-center gap-1.5"
          >
            <span>Analyze Skill Gaps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Visuals Grid: Radar Chart + Learning Progress Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Current vs Required Competency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Role Competency Radar</h3>
              <p className="text-xs text-slate-500">Current Assessed vs Target Role Benchmark</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Current Level
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Target Required
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Target" dataKey="required" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Radar name="Current" dataKey="current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-1 flex items-center justify-between text-xs text-slate-600">
            <span>Overall Competency Match: <strong className="text-slate-900">{skillGapAnalysis.overallMatchScore}%</strong></span>
            <button
              onClick={() => setActiveTab('skillgap')}
              className="text-blue-600 hover:text-blue-700 font-bold underline"
            >
              Open Detailed Gap Report
            </button>
          </div>
        </div>

        {/* Assessment & Performance Tracking Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Assessment & Interview Scores</h3>
              <p className="text-xs text-slate-500">Continuous Evaluation Evidence (0 - 100%)</p>
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Verified Evidence
            </span>
          </div>

          <div className="h-64 w-full">
            {assessmentHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentHistoryData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Score']}
                    contentStyle={{ borderRadius: '0.75rem', borderColor: '#e2e8f0' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                No assessment history yet. Take your first quiz!
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-1 flex items-center justify-between text-xs text-slate-600">
            <span>Minimum Target Passing Threshold: <strong>80%</strong></span>
            <button
              onClick={() => setActiveTab('assessment')}
              className="text-blue-600 hover:text-blue-700 font-bold underline"
            >
              Take Skill Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Current Roadmap Stage + Recommended Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Active Roadmap Milestone */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Active Learning Stage</h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeRoadmapStage.status === 'Needs Revision'
                  ? 'bg-amber-100 text-amber-800'
                  : activeRoadmapStage.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {activeRoadmapStage.status}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700">Stage {activeRoadmapStage.stageNumber}</span>
              <span className="text-[11px] text-slate-500">{activeRoadmapStage.estimatedDuration}</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">{activeRoadmapStage.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{activeRoadmapStage.activity}</p>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <strong className="text-slate-700">Evidence:</strong> {activeRoadmapStage.assessmentEvidence || 'Profile baseline'}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="w-full mt-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Explore Complete 7-Stage Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recommended Learning Activities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recommended Next Courses & Labs</h3>
              <p className="text-xs text-slate-500">Prioritized based on skill gaps & learning style ({profile.preferredLearningStyle})</p>
            </div>
            <button
              onClick={() => setActiveTab('learning')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedCourses.map((course) => (
              <div
                key={course.id}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {course.skill}
                      </span>
                      <span className="text-[11px] text-slate-400">{course.durationMinutes} mins</span>
                      <span className="text-[11px] text-teal-700 font-semibold">{course.resourceType}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 mt-1">{course.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{course.learningObjective}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('learning')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-xs"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
