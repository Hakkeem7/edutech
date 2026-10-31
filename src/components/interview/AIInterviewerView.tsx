import React, { useState } from 'react';
import {
  Mic,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  Sparkles,
  Loader2,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  History,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { InterviewQuestion, InterviewSession } from '../../types';

export const AIInterviewerView: React.FC = () => {
  const {
    activeTargetRole,
    interviewSessions,
    saveInterviewSession,
    setActiveTab,
    health,
  } = useLearner();

  // Mode: 'setup' | 'session' | 'report' | 'history'
  const [viewMode, setViewMode] = useState<'setup' | 'session' | 'report' | 'history'>('setup');

  // Setup options
  const [selectedRole, setSelectedRole] = useState(activeTargetRole);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Junior' | 'Mid-Level' | 'Senior'>('Junior');
  const [selectedCategory, setSelectedCategory] = useState<
    'Technical' | 'Conceptual' | 'Problem-solving' | 'Role-specific scenarios' | 'Mixed'
  >('Technical');
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Active interview state
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [learnerAnswerInput, setLearnerAnswerInput] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [historySelectedSession, setHistorySelectedSession] = useState<InterviewSession | null>(null);

  // Start a new interview session
  const handleStartInterview = async () => {
    setIsGenerating(true);
    try {
      const response = await api.generateInterview({
        targetRole: selectedRole,
        difficulty: selectedDifficulty,
        category: selectedCategory,
        count: questionCount,
      });

      const questions: InterviewQuestion[] = response.questions.map((q: any, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        questionNumber: i + 1,
        questionText: q.questionText,
        category: q.category || selectedCategory,
        rubricCriteria: q.rubricCriteria || 'Demonstrate thorough comprehension and trade-offs.',
        targetSkill: q.targetSkill || selectedRole,
      }));

      const newSession: InterviewSession = {
        id: `interview-${Date.now()}`,
        learnerId: 'learner-alex-kumar',
        targetRole: selectedRole,
        difficulty: selectedDifficulty,
        category: selectedCategory,
        questions,
        currentQuestionIndex: 0,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      };

      setCurrentSession(newSession);
      setActiveQuestionIdx(0);
      setLearnerAnswerInput('');
      setViewMode('session');
    } catch (e: any) {
      alert('Could not initialize interview session: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit answer for evaluation
  const handleSubmitAnswer = async () => {
    if (!currentSession || !learnerAnswerInput.trim()) return;

    const currentQuestion = currentSession.questions[activeQuestionIdx];
    setIsEvaluating(true);

    try {
      const result = await api.evaluateInterviewAnswer({
        question: currentQuestion.questionText,
        learnerAnswer: learnerAnswerInput.trim(),
        targetRole: currentSession.targetRole,
        rubricCriteria: currentQuestion.rubricCriteria,
      });

      const evaluation = result.evaluation;

      // Update question in session
      const updatedQuestions = [...currentSession.questions];
      updatedQuestions[activeQuestionIdx] = {
        ...currentQuestion,
        learnerAnswer: learnerAnswerInput.trim(),
        score: evaluation.score,
        conceptualScore: evaluation.conceptualScore,
        technicalScore: evaluation.technicalScore,
        problemSolvingScore: evaluation.problemSolvingScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvementAreas: evaluation.improvementAreas,
        evaluatedAt: new Date().toISOString(),
      };

      const updatedSession: InterviewSession = {
        ...currentSession,
        questions: updatedQuestions,
        currentQuestionIndex: activeQuestionIdx + 1,
      };

      setCurrentSession(updatedSession);
      setLearnerAnswerInput('');

      // If last question, finalize session report
      if (activeQuestionIdx + 1 >= updatedQuestions.length) {
        finalizeReport(updatedSession);
      } else {
        setActiveQuestionIdx(activeQuestionIdx + 1);
      }
    } catch (err: any) {
      alert('Evaluation failed: ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Finalize full interview report
  const finalizeReport = async (session: InterviewSession) => {
    const scoredQuestions = session.questions.filter((q) => q.score !== undefined);
    const avgScore = Math.round(
      scoredQuestions.reduce((acc, q) => acc + (q.score || 0), 0) / (scoredQuestions.length || 1)
    );
    const avgConceptual = Math.round(
      scoredQuestions.reduce((acc, q) => acc + (q.conceptualScore || 0), 0) / (scoredQuestions.length || 1)
    );
    const avgTechnical = Math.round(
      scoredQuestions.reduce((acc, q) => acc + (q.technicalScore || 0), 0) / (scoredQuestions.length || 1)
    );
    const avgProblem = Math.round(
      scoredQuestions.reduce((acc, q) => acc + (q.problemSolvingScore || 0), 0) / (scoredQuestions.length || 1)
    );

    const allStrengths = Array.from(new Set(scoredQuestions.flatMap((q) => q.strengths || [])));
    const allImprovements = Array.from(new Set(scoredQuestions.flatMap((q) => q.improvementAreas || [])));

    const finalReport = {
      overallScore: avgScore,
      conceptualUnderstanding: avgConceptual,
      technicalAccuracy: avgTechnical,
      problemSolvingAbility: avgProblem,
      summary: `Candidate demonstrated solid foundational awareness for ${session.targetRole} (${session.difficulty}). Core technical criteria were addressed. Continuing with deep-dive system design will solidify mastery.`,
      strengths: allStrengths.slice(0, 4),
      areasForImprovement: allImprovements.slice(0, 4),
      recommendedLearningTopics: [
        'Advanced Retrieval Benchmarks (Recall@K)',
        'Vector Indexing Latency Optimization',
        'Failure Recovery Protocols',
      ],
      suggestedPracticeQuestions: [
        'How does HNSW graph pruning affect query latency during billion-vector indexing?',
        'What metrics would you monitor on Cloud Run to detect memory degradation in streaming LLM calls?',
      ],
    };

    const completedSession: InterviewSession = {
      ...session,
      status: 'completed',
      overallScore: avgScore,
      completedAt: new Date().toISOString(),
      finalReport,
    };

    setCurrentSession(completedSession);
    await saveInterviewSession(completedSession);
    setViewMode('report');
  };

  const activeQ = currentSession ? currentSession.questions[activeQuestionIdx] : null;
  const previousQ = currentSession && activeQuestionIdx > 0 ? currentSession.questions[activeQuestionIdx - 1] : null;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>AI Mock Interview Simulator</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">AI Technical Interviewer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-tailored simulation evaluated with an explicit 0-100 rubric. Results directly calibrate your adaptive roadmap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== 'setup' && (
            <button
              onClick={() => setViewMode('setup')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              New Interview
            </button>
          )}
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              viewMode === 'history'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Interview History ({interviewSessions.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SETUP MODE */}
      {viewMode === 'setup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-sm">Configure Your Mock Interview</h3>
            <p className="text-xs text-slate-500">
              Customize role scope, rubric difficulty, and focus area. Questions are dynamically generated by Gemini 3.8.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Job Role</label>
              <input
                type="text"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interview Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Junior', 'Mid-Level', 'Senior'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      selectedDifficulty === diff
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interview Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Technical">Technical (Coding & Architecture)</option>
                <option value="Conceptual">Conceptual & Theoretical</option>
                <option value="Problem-solving">Problem-Solving & Debugging</option>
                <option value="Role-specific scenarios">Role-Specific Scenarios</option>
                <option value="Mixed">Mixed Comprehensive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Questions: <span className="font-bold text-purple-700">{questionCount}</span>
              </label>
              <input
                type="range"
                min="2"
                max="5"
                step="1"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>2 Questions (Quick)</span>
                <span>3 Questions (Standard)</span>
                <span>5 Questions (In-Depth)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Objective Scoring Rubric:</strong> Answers are evaluated on relevance,
              technical accuracy, and reasoning completeness. Long answers do not automatically receive high scores.
              Scores are labeled as <span className="underline">AI-generated practice feedback</span>.
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartInterview}
              disabled={isGenerating}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isGenerating ? 'Synthesizing Questions...' : 'Start Mock Interview'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE SESSION QUESTION-BY-QUESTION */}
      {viewMode === 'session' && currentSession && activeQ && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Question {activeQuestionIdx + 1} of {currentSession.questions.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Category: {activeQ.category}</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{currentSession.targetRole} Mock</span>
          </div>

          {/* Question Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Interviewer Prompt
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{activeQ.questionText}</h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800 block mb-0.5 font-semibold">Evaluation Rubric Guidance:</strong>
              <p className="text-[11px] leading-relaxed text-slate-500">{activeQ.rubricCriteria}</p>
            </div>

            {/* Answer Text Area */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Your Response (Text submission):
              </label>
              <textarea
                rows={6}
                value={learnerAnswerInput}
                onChange={(e) => setLearnerAnswerInput(e.target.value)}
                placeholder="Structure your answer clearly. Explain key mechanisms, production trade-offs, and examples..."
                className="w-full p-4 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
                disabled={isEvaluating}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Word count: {learnerAnswerInput.trim() ? learnerAnswerInput.trim().split(/\s+/).length : 0} words
              </span>

              <button
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !learnerAnswerInput.trim()}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                <span>
                  {isEvaluating
                    ? 'Scoring Answer...'
                    : activeQuestionIdx + 1 === currentSession.questions.length
                    ? 'Submit & Generate Final Report'
                    : 'Submit & Next Question'}
                </span>
              </button>
            </div>
          </div>

          {/* Previous Question Feedback Card (if exists) */}
          {previousQ && previousQ.feedback && (
            <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Feedback on Question {previousQ.questionNumber}</span>
                </span>
                <span className="text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Score: {previousQ.score}/100
                </span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">{previousQ.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE FINAL REPORT */}
      {viewMode === 'report' && currentSession?.finalReport && (
        <div className="space-y-6">
          {/* Executive Score Card */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Mock Interview Completed
                </span>
                <h2 className="text-2xl font-extrabold mt-1">Final Performance Report</h2>
                <p className="text-xs text-slate-300">
                  Role: <span className="text-white font-bold">{currentSession.targetRole}</span> | Difficulty:{' '}
                  <span className="text-white font-bold">{currentSession.difficulty}</span>
                </p>
              </div>

              <div className="text-right bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
                  Overall Score
                </span>
                <span className="text-3xl font-extrabold text-purple-300">
                  {currentSession.finalReport.overallScore}
                  <span className="text-sm text-slate-300 font-normal">/100</span>
                </span>
              </div>
            </div>

            {/* Rubric Criteria Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-300 block mb-1">Conceptual Understanding</span>
                <span className="text-lg font-bold text-white">
                  {currentSession.finalReport.conceptualUnderstanding}%
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-300 block mb-1">Technical Accuracy</span>
                <span className="text-lg font-bold text-white">
                  {currentSession.finalReport.technicalAccuracy}%
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-300 block mb-1">Problem-Solving Depth</span>
                <span className="text-lg font-bold text-white">
                  {currentSession.finalReport.problemSolvingAbility}%
                </span>
              </div>
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentSession.finalReport.strengths.map((str, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Areas for Improvement</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentSession.finalReport.areasForImprovement.map((imp, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Recommended Study Topics & Questions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800">Key Topics to Solidify:</span>
                {currentSession.finalReport.recommendedLearningTopics.map((top, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-blue-50 border border-blue-100 font-medium text-blue-900">
                    {top}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800">Suggested Follow-Up Practice Questions:</span>
                {currentSession.finalReport.suggestedPracticeQuestions.map((pq, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                    "{pq}"
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setViewMode('setup')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Start Another Interview
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>View Updated Adaptive Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 4: INTERVIEW HISTORY */}
      {viewMode === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Past Mock Interviews & Feedback Logs
          </h3>

          <div className="space-y-3">
            {interviewSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{sess.targetRole}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      {sess.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {sess.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Completed: {new Date(sess.startedAt).toLocaleDateString()} | {sess.questions.length} questions
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                    <span className="text-lg font-bold text-purple-700">{sess.overallScore ?? 'N/A'}/100</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentSession(sess);
                      setViewMode('report');
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
