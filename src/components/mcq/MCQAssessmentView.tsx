import React, { useState } from 'react';
import {
  CheckSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  TrendingUp,
  History,
  ShieldCheck,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { MCQAssessment, MCQQuestion } from '../../types';
import { INITIAL_MCQ_BANK } from '../../data/initialData';

export const MCQAssessmentView: React.FC = () => {
  const {
    activeTargetRole,
    mcqAssessments,
    saveAssessmentResult,
    setActiveTab,
    systemSettings,
  } = useLearner();

  // Modes: 'setup' | 'quiz' | 'results' | 'history'
  const [viewMode, setViewMode] = useState<'setup' | 'quiz' | 'results' | 'history'>('setup');

  // Setup options
  const [subject, setSubject] = useState<string>('RAG');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active quiz state
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [latestAssessment, setLatestAssessment] = useState<MCQAssessment | null>(null);

  const availableSubjects = [
    'Python',
    'SQL',
    'Statistics',
    'Machine Learning',
    'Deep Learning',
    'Generative AI',
    'RAG',
    'Vector Databases',
  ];

  // Start new quiz
  const handleStartQuiz = async () => {
    setIsGenerating(true);
    try {
      // 1. Try Gemini generation
      const res = await api.generateMCQs({
        subject,
        difficulty,
        count: questionCount,
        targetRole: activeTargetRole,
      });

      let loadedQuestions: MCQQuestion[] = [];
      if (res && res.questions && res.questions.length > 0) {
        loadedQuestions = res.questions.map((q: any, i: number) => ({
          id: `mcq-live-${Date.now()}-${i}`,
          questionText: q.questionText,
          options: q.options as [string, string, string, string],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topic: q.topic || subject,
          difficulty: q.difficulty || difficulty,
        }));
      }

      // If empty or offline fallback needed, use pre-loaded bank
      if (loadedQuestions.length === 0) {
        const matches = INITIAL_MCQ_BANK.filter((q) => q.topic.toLowerCase() === subject.toLowerCase());
        loadedQuestions = matches.length > 0 ? matches : INITIAL_MCQ_BANK.slice(0, questionCount);
      }

      setQuestions(loadedQuestions);
      setCurrentIdx(0);
      setSelectedAnswers({});
      setViewMode('quiz');
    } catch (err: any) {
      console.warn('MCQ generator fallback to bank:', err);
      const matches = INITIAL_MCQ_BANK.filter((q) => q.topic.toLowerCase() === subject.toLowerCase());
      setQuestions(matches.length > 0 ? matches : INITIAL_MCQ_BANK.slice(0, questionCount));
      setCurrentIdx(0);
      setSelectedAnswers({});
      setViewMode('quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    setShowConfirmModal(false);

    // Calculate score
    let score = 0;
    const answeredQuestions = questions.map((q, idx) => {
      const userSelected = selectedAnswers[idx];
      if (userSelected === q.correctIndex) {
        score++;
      }
      return {
        ...q,
        userSelectedIndex: userSelected,
      };
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= systemSettings.targetPassThreshold;

    const weakTopics: string[] = [];
    if (percentage < systemSettings.failReviewThreshold) {
      weakTopics.push(`${subject} Foundations`);
    }

    const assessmentResult: MCQAssessment = {
      id: `assess-${Date.now()}`,
      learnerId: 'learner-alex-kumar',
      targetRole: activeTargetRole,
      subject,
      difficulty,
      questions: answeredQuestions,
      score,
      totalQuestions: total,
      percentage,
      passed,
      topicBreakdown: [
        {
          topic: subject,
          score,
          total,
          percentage,
        },
      ],
      weakTopics,
      recommendedResources: [
        `Recommended targeted review: Complete the ${subject} Concept Guide before next diagnostic attempt.`,
      ],
      completedAt: new Date().toISOString(),
    };

    setLatestAssessment(assessmentResult);
    await saveAssessmentResult(assessmentResult);
    setViewMode('results');
  };

  const activeQuestion = questions[currentIdx];
  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Diagnostic Verification</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">MCQ Skill Assessment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate subject mastery with verifiable questions. Scores calibrate your verified competency portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== 'setup' && (
            <button
              onClick={() => setViewMode('setup')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              New Quiz
            </button>
          )}
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              viewMode === 'history'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Quiz History ({mcqAssessments.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SETUP */}
      {viewMode === 'setup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Configure Skill Assessment</h3>
            <p className="text-xs text-slate-500">
              Select a subject gap area. Assessments generate single-choice questions with full pedagogical explanations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Subject / Skill Area</label>
              <div className="grid grid-cols-2 gap-2">
                {availableSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      subject === sub
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Difficulty Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        difficulty === diff
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Questions: <span className="font-bold text-blue-700">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="2"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2 Questions (Micro)</span>
                  <span>4 Questions (Diagnostic)</span>
                  <span>6 Questions (Full)</span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Scoring <strong className="text-blue-900">&gt;= 80%</strong> unlocks the next learning milestone. Scoring{' '}
                  <strong className="text-amber-800">&lt; 60%</strong> automatically updates your roadmap to recommend targeted
                  revision.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartQuiz}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Synthesizing Questions...' : 'Start Assessment Quiz'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE QUIZ */}
      {viewMode === 'quiz' && activeQuestion && (
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{activeQuestion.topic}</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{activeQuestion.difficulty}</span>
          </div>

          {/* Question Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {activeQuestion.questionText}
            </h3>

            {/* 4 Options */}
            <div className="space-y-2.5">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation and Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submission Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Submit Assessment?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You have answered <strong className="text-slate-900">{Object.keys(selectedAnswers).length}</strong> of{' '}
                  <strong className="text-slate-900">{questions.length}</strong> questions. Once submitted, your answers will be
                  scored and recorded into your competency evidence history.
                </p>
                {!allAnswered && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>You have unanswered questions. Are you sure you want to proceed?</span>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Continue Answering
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Confirm & Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: QUIZ RESULTS */}
      {viewMode === 'results' && latestAssessment && (
        <div className="space-y-6">
          {/* Result Score Banner */}
          <div
            className={`p-6 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              latestAssessment.passed
                ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
                : 'bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                Diagnostic Assessment Completed
              </span>
              <h2 className="text-2xl font-extrabold mt-1">
                {latestAssessment.passed ? 'Benchmark Target Achieved!' : 'Assessment Completed — Insights Generated'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Subject: <span className="text-white font-bold">{latestAssessment.subject}</span> | Level:{' '}
                <span className="text-white font-bold">{latestAssessment.difficulty}</span>
              </p>
            </div>

            <div className="text-right bg-white/10 p-3 rounded-xl border border-white/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 block">
                Total Score
              </span>
              <span className="text-3xl font-extrabold text-white">
                {latestAssessment.score} / {latestAssessment.totalQuestions}
                <span className="text-sm font-semibold text-cyan-300 ml-1.5">({latestAssessment.percentage}%)</span>
              </span>
            </div>
          </div>

          {/* Performance Breakdown & Adaptive Trigger Alert */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Adaptive Roadmap Action Triggered</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your score of <strong className="text-slate-900">{latestAssessment.percentage}%</strong> was forwarded to the
              SkillForge <strong className="text-blue-700">Central Agentic Orchestrator</strong>. Stage competency evidence for{' '}
              {latestAssessment.subject} has been updated in your personalized roadmap.
            </p>
          </div>

          {/* Answer-by-Answer Explanations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Detailed Question Explanations & Review
            </h3>

            <div className="space-y-4">
              {latestAssessment.questions.map((q, idx) => {
                const isCorrect = q.userSelectedIndex === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                    } space-y-2.5`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <h4 className="font-bold text-xs text-slate-900">Question {idx + 1}: {q.questionText}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Answer:</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {q.userSelectedIndex !== undefined ? q.options[q.userSelectedIndex] : 'Unanswered'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Correct Answer:</span>
                        <span className="font-semibold text-emerald-700">{q.options[q.correctIndex]}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/80 border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-800 block mb-0.5">Pedagogical Explanation:</strong>
                      <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setViewMode('setup')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Take Another Quiz
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

      {/* VIEW 4: QUIZ HISTORY */}
      {viewMode === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Completed Skill Assessments History
          </h3>

          <div className="space-y-3">
            {mcqAssessments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{a.subject}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {a.difficulty}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        a.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.passed ? 'Target Met' : 'Review Needed'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Completed: {new Date(a.completedAt).toLocaleDateString()} | {a.score}/{a.totalQuestions} questions
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                    <span className="text-lg font-bold text-blue-700">{a.percentage}%</span>
                  </div>
                  <button
                    onClick={() => {
                      setLatestAssessment(a);
                      setViewMode('results');
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    View Details
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
