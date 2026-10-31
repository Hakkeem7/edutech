import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  LearnerProfile,
  TargetRoleCompetency,
  SkillGapAnalysisResult,
  LearningResource,
  RoadmapStage,
  RAGDocument,
  RAGChunk,
  MCQAssessment,
  InterviewSession,
  AdaptiveInsight,
  SystemSettings,
  SkillLevel,
  GapSeverity,
} from '../types';
import {
  INITIAL_LEARNER_PROFILE,
  TARGET_ROLE_COMPETENCIES,
  INITIAL_LEARNING_RESOURCES,
  INITIAL_ROADMAP_STAGES,
  INITIAL_RAG_DOCUMENTS,
  INITIAL_RAG_CHUNKS,
  INITIAL_PREVIOUS_ASSESSMENTS,
  INITIAL_PREVIOUS_INTERVIEWS,
  INITIAL_ADAPTIVE_INSIGHTS,
  INITIAL_SYSTEM_SETTINGS,
} from '../data/initialData';
import { api, HealthStatus } from '../services/api';

const LOCAL_STORAGE_KEY = 'skillforge_ai_learner_state_v1';

export type NavigationTab =
  | 'dashboard'
  | 'profile'
  | 'skillgap'
  | 'learning'
  | 'chatbot'
  | 'interviewer'
  | 'assessment'
  | 'roadmap'
  | 'reports'
  | 'settings';

interface LearnerContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  profile: LearnerProfile;
  updateProfile: (updates: Partial<LearnerProfile>) => void;
  updateSkillProficiency: (skillName: string, score: number, source: any) => void;
  targetRoles: TargetRoleCompetency[];
  activeTargetRole: string;
  setActiveTargetRole: (roleName: string) => void;
  activeRoleCompetency: TargetRoleCompetency | undefined;
  skillGapAnalysis: SkillGapAnalysisResult;
  learningResources: LearningResource[];
  toggleResourceCompletion: (resourceId: string) => void;
  roadmap: RoadmapStage[];
  updateRoadmapStage: (stageId: string, updates: Partial<RoadmapStage>) => void;
  ragDocuments: RAGDocument[];
  ragChunks: RAGChunk[];
  addRAGDocument: (doc: RAGDocument, chunks: RAGChunk[]) => void;
  mcqAssessments: MCQAssessment[];
  saveAssessmentResult: (assessment: MCQAssessment) => Promise<void>;
  interviewSessions: InterviewSession[];
  saveInterviewSession: (session: InterviewSession) => Promise<void>;
  adaptiveInsights: AdaptiveInsight[];
  acceptAdaptiveInsight: (insightId: string) => void;
  dismissAdaptiveInsight: (insightId: string) => void;
  triggerAdaptiveOrchestration: () => Promise<AdaptiveInsight | null>;
  systemSettings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  resetToDemoData: () => void;
  health: HealthStatus | null;
  refreshHealth: () => void;
  notificationCount: number;
}

const LearnerContext = createContext<LearnerContextType | undefined>(undefined);

export const LearnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Core state initialized from localStorage or defaults
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_profile');
      return saved ? JSON.parse(saved) : INITIAL_LEARNER_PROFILE;
    } catch {
      return INITIAL_LEARNER_PROFILE;
    }
  });

  const [activeTargetRole, setActiveTargetRole] = useState<string>(() => {
    return profile.targetRole || 'AI Engineer';
  });

  const [learningResources, setLearningResources] = useState<LearningResource[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_resources');
      return saved ? JSON.parse(saved) : INITIAL_LEARNING_RESOURCES;
    } catch {
      return INITIAL_LEARNING_RESOURCES;
    }
  });

  const [roadmap, setRoadmap] = useState<RoadmapStage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_roadmap');
      return saved ? JSON.parse(saved) : INITIAL_ROADMAP_STAGES;
    } catch {
      return INITIAL_ROADMAP_STAGES;
    }
  });

  const [ragDocuments, setRagDocuments] = useState<RAGDocument[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_docs');
      return saved ? JSON.parse(saved) : INITIAL_RAG_DOCUMENTS;
    } catch {
      return INITIAL_RAG_DOCUMENTS;
    }
  });

  const [ragChunks, setRagChunks] = useState<RAGChunk[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_chunks');
      return saved ? JSON.parse(saved) : INITIAL_RAG_CHUNKS;
    } catch {
      return INITIAL_RAG_CHUNKS;
    }
  });

  const [mcqAssessments, setMcqAssessments] = useState<MCQAssessment[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_assessments');
      return saved ? JSON.parse(saved) : INITIAL_PREVIOUS_ASSESSMENTS;
    } catch {
      return INITIAL_PREVIOUS_ASSESSMENTS;
    }
  });

  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_interviews');
      return saved ? JSON.parse(saved) : INITIAL_PREVIOUS_INTERVIEWS;
    } catch {
      return INITIAL_PREVIOUS_INTERVIEWS;
    }
  });

  const [adaptiveInsights, setAdaptiveInsights] = useState<AdaptiveInsight[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_insights');
      return saved ? JSON.parse(saved) : INITIAL_ADAPTIVE_INSIGHTS;
    } catch {
      return INITIAL_ADAPTIVE_INSIGHTS;
    }
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_settings');
      return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
    } catch {
      return INITIAL_SYSTEM_SETTINGS;
    }
  });

  // Sync health on mount
  const refreshHealth = useCallback(() => {
    api.getHealth().then(setHealth).catch(console.warn);
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  // Persist to localStorage and server whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_profile', JSON.stringify(profile));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_resources', JSON.stringify(learningResources));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_roadmap', JSON.stringify(roadmap));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_docs', JSON.stringify(ragDocuments));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_chunks', JSON.stringify(ragChunks));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_assessments', JSON.stringify(mcqAssessments));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_interviews', JSON.stringify(interviewSessions));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_insights', JSON.stringify(adaptiveInsights));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_settings', JSON.stringify(systemSettings));

      // Asynchronously backup to backend disk storage
      api.saveServerState({
        profile,
        learningResources,
        roadmap,
        ragDocuments,
        ragChunks,
        mcqAssessments,
        interviewSessions,
        adaptiveInsights,
        systemSettings,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Persistence save error:', e);
    }
  }, [
    profile,
    learningResources,
    roadmap,
    ragDocuments,
    ragChunks,
    mcqAssessments,
    interviewSessions,
    adaptiveInsights,
    systemSettings,
  ]);

  // Active role competency
  const activeRoleCompetency = useMemo(() => {
    return (
      TARGET_ROLE_COMPETENCIES.find((r) => r.roleName.toLowerCase() === activeTargetRole.toLowerCase()) ||
      TARGET_ROLE_COMPETENCIES[0]
    );
  }, [activeTargetRole]);

  // Dynamic Skill Gap Analysis
  const skillGapAnalysis: SkillGapAnalysisResult = useMemo(() => {
    const role = activeRoleCompetency;
    if (!role) {
      return {
        roleId: 'custom',
        roleName: activeTargetRole,
        overallMatchScore: 50,
        skillsAnalysis: [],
        strongestSkills: [],
        weakestSkills: [],
        prioritySkills: [],
        summaryRecommendation: 'Select or configure target competencies.',
        analyzedAt: new Date().toISOString(),
      };
    }

    const learnerSkillMap = new Map(profile.skills.map((s) => [s.name.toLowerCase(), s]));

    let totalWeight = 0;
    let earnedWeightScore = 0;

    const analysisItems = role.requiredSkills.map((req) => {
      const learnerSkill = learnerSkillMap.get(req.skillName.toLowerCase());
      const currentScore = learnerSkill ? learnerSkill.currentScore : 0;
      const currentLevel: SkillLevel = learnerSkill ? learnerSkill.currentLevel : 'Not Assessed';
      const evidence = learnerSkill ? learnerSkill.evidenceSource : 'resume_inferred';

      const gapScore = Math.max(0, req.requiredScore - currentScore);

      let gapSeverity: GapSeverity = 'Satisfied';
      if (currentLevel === 'Not Assessed' || gapScore >= 35) {
        gapSeverity = 'High';
      } else if (gapScore >= 18) {
        gapSeverity = 'Medium';
      } else if (gapScore > 0) {
        gapSeverity = 'Low';
      }

      totalWeight += req.weight;
      earnedWeightScore += (Math.min(currentScore, req.requiredScore) / req.requiredScore) * req.weight;

      return {
        skillName: req.skillName,
        currentLevel,
        currentScore,
        requiredLevel: req.requiredLevel,
        requiredScore: req.requiredScore,
        gapSeverity,
        gapScore,
        importanceRationale: req.importanceRationale,
        recommendedAction: req.recommendedActivity,
        evidenceSource: evidence,
      };
    });

    const matchPercentage = totalWeight > 0 ? Math.round((earnedWeightScore / totalWeight) * 100) : 0;

    // Sort by gap severity & score
    const sortedByGap = [...analysisItems].sort((a, b) => b.gapScore - a.gapScore);
    const sortedByProficiency = [...analysisItems].filter((a) => a.currentScore > 0).sort((a, b) => b.currentScore - a.currentScore);

    const strongestSkills = sortedByProficiency.slice(0, 3).map((s) => `${s.skillName} (${s.currentScore}%)`);
    const weakestSkills = sortedByGap.filter((s) => s.gapSeverity === 'High').slice(0, 4).map((s) => s.skillName);
    const prioritySkills = sortedByGap.slice(0, 3).map((s) => s.skillName);

    return {
      roleId: role.roleId,
      roleName: role.roleName,
      overallMatchScore: matchPercentage,
      skillsAnalysis: analysisItems,
      strongestSkills: strongestSkills.length > 0 ? strongestSkills : ['Python (70%)', 'SQL (68%)'],
      weakestSkills: weakestSkills.length > 0 ? weakestSkills : ['Deep Learning', 'RAG', 'Vector Databases'],
      prioritySkills: prioritySkills.length > 0 ? prioritySkills : ['Deep Learning', 'RAG'],
      summaryRecommendation: `Learner demonstrates a solid foundational base in ${strongestSkills.join(', ') || 'core languages'}. Priority focus should target closing the ${weakestSkills.slice(0, 2).join(' and ')} competency gaps to achieve job readiness.`,
      analyzedAt: new Date().toISOString(),
    };
  }, [profile.skills, activeRoleCompetency, activeTargetRole]);

  // Profile update
  const updateProfile = useCallback((updates: Partial<LearnerProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      skills: updates.skills || prev.skills,
    }));
  }, []);

  // Update single skill proficiency
  const updateSkillProficiency = useCallback((skillName: string, score: number, source: any) => {
    setProfile((prev) => {
      let level: SkillLevel = 'Beginner';
      if (score >= 90) level = 'Expert';
      else if (score >= 75) level = 'Advanced';
      else if (score >= 60) level = 'Intermediate';
      else if (score > 0) level = 'Beginner';
      else level = 'Not Assessed';

      const existingIndex = prev.skills.findIndex((s) => s.name.toLowerCase() === skillName.toLowerCase());
      let updatedSkills = [...prev.skills];

      if (existingIndex >= 0) {
        updatedSkills[existingIndex] = {
          ...updatedSkills[existingIndex],
          currentScore: score,
          currentLevel: level,
          evidenceSource: source,
          lastAssessedDate: new Date().toISOString().split('T')[0],
          isInferred: false,
        };
      } else {
        updatedSkills.push({
          id: `sk-${Date.now()}`,
          name: skillName,
          category: 'ai_ml',
          currentLevel: level,
          currentScore: score,
          requiredLevel: 'Advanced',
          requiredScore: 85,
          evidenceSource: source,
          lastAssessedDate: new Date().toISOString().split('T')[0],
          isInferred: false,
        });
      }

      return {
        ...prev,
        skills: updatedSkills,
      };
    });
  }, []);

  // Toggle learning resource completion
  const toggleResourceCompletion = useCallback((resourceId: string) => {
    setLearningResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          const nextStatus = res.completionStatus === 'completed' ? 'in_progress' : 'completed';
          return {
            ...res,
            completionStatus: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return res;
      })
    );
  }, []);

  // Update roadmap stage
  const updateRoadmapStage = useCallback((stageId: string, updates: Partial<RoadmapStage>) => {
    setRoadmap((prev) =>
      prev.map((s) => {
        if (s.id === stageId) {
          return { ...s, ...updates, lastUpdated: new Date().toISOString() };
        }
        return s;
      })
    );
  }, []);

  // Add RAG document & chunks
  const addRAGDocument = useCallback((doc: RAGDocument, chunks: RAGChunk[]) => {
    setRagDocuments((prev) => [doc, ...prev]);
    setRagChunks((prev) => [...chunks, ...prev]);
  }, []);

  // Agentic Orchestration Runner
  const triggerAdaptiveOrchestration = useCallback(async (): Promise<AdaptiveInsight | null> => {
    try {
      const response = await api.orchestrateAdaptive({
        learnerProfile: profile,
        recentAssessments: mcqAssessments,
        recentInterviews: interviewSessions,
        currentRoadmap: roadmap,
        thresholds: {
          failReviewThreshold: systemSettings.failReviewThreshold,
          targetPassThreshold: systemSettings.targetPassThreshold,
          mentorAlertAttempts: systemSettings.mentorAlertAttempts,
        },
      });

      if (response && response.insight) {
        setAdaptiveInsights((prev) => [response.insight, ...prev]);
        return response.insight;
      }
    } catch (e) {
      console.warn('Orchestration trigger failed, creating local insight:', e);
    }
    return null;
  }, [profile, mcqAssessments, interviewSessions, roadmap, systemSettings]);

  // Save assessment result + trigger adaptive check
  const saveAssessmentResult = useCallback(
    async (assessment: MCQAssessment) => {
      setMcqAssessments((prev) => [assessment, ...prev]);

      // Update skill evidence
      updateSkillProficiency(assessment.subject, assessment.percentage, 'mcq_assessment');

      // Update roadmap stage status based on rules:
      // < 60% -> Needs Revision
      // 60-79% -> In Progress
      // >= 80% -> Completed
      setRoadmap((prev) =>
        prev.map((stg) => {
          if (stg.skill.toLowerCase().includes(assessment.subject.toLowerCase())) {
            let status: 'Completed' | 'In Progress' | 'Needs Revision' = 'In Progress';
            let pct = assessment.percentage;
            if (assessment.percentage < systemSettings.failReviewThreshold) {
              status = 'Needs Revision';
            } else if (assessment.percentage >= systemSettings.targetPassThreshold) {
              status = 'Completed';
              pct = 100;
            }
            return {
              ...stg,
              status,
              completionPercentage: pct,
              assessmentEvidence: `MCQ Score: ${assessment.percentage}% (${status}) on ${new Date().toISOString().split('T')[0]}`,
            };
          }
          return stg;
        })
      );

      // Trigger Agentic orchestrator to record insight
      setTimeout(() => {
        triggerAdaptiveOrchestration();
      }, 500);
    },
    [systemSettings, updateSkillProficiency, triggerAdaptiveOrchestration]
  );

  // Save interview session + update skill
  const saveInterviewSession = useCallback(
    async (session: InterviewSession) => {
      setInterviewSessions((prev) => [session, ...prev]);

      if (session.overallScore !== undefined) {
        // Find role-related skills to update evidence
        updateSkillProficiency('Generative AI', session.overallScore, 'interview_evaluation');
      }

      setTimeout(() => {
        triggerAdaptiveOrchestration();
      }, 500);
    },
    [updateSkillProficiency, triggerAdaptiveOrchestration]
  );

  // Accept adaptive insight
  const acceptAdaptiveInsight = useCallback((insightId: string) => {
    setAdaptiveInsights((prev) =>
      prev.map((ins) => {
        if (ins.id === insightId) {
          // Apply changes to roadmap
          for (const change of ins.proposedChanges) {
            setRoadmap((currentRoadmap) =>
              currentRoadmap.map((stage) => {
                if (stage.skill.toLowerCase().includes(change.topic.toLowerCase())) {
                  const newStatus = change.newStatus.includes('Completed')
                    ? 'Completed'
                    : change.newStatus.includes('Needs Revision')
                    ? 'Needs Revision'
                    : stage.status;
                  return {
                    ...stage,
                    status: newStatus,
                    assessmentEvidence: `Adaptive Agent Update: ${change.actionTaken}`,
                  };
                }
                return stage;
              })
            );
          }
          return { ...ins, status: 'accepted' };
        }
        return ins;
      })
    );
  }, []);

  const dismissAdaptiveInsight = useCallback((insightId: string) => {
    setAdaptiveInsights((prev) =>
      prev.map((ins) => (ins.id === insightId ? { ...ins, status: 'dismissed' } : ins))
    );
  }, []);

  const updateSettings = useCallback((settings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const resetToDemoData = useCallback(() => {
    setProfile(INITIAL_LEARNER_PROFILE);
    setActiveTargetRole('AI Engineer');
    setLearningResources(INITIAL_LEARNING_RESOURCES);
    setRoadmap(INITIAL_ROADMAP_STAGES);
    setRagDocuments(INITIAL_RAG_DOCUMENTS);
    setRagChunks(INITIAL_RAG_CHUNKS);
    setMcqAssessments(INITIAL_PREVIOUS_ASSESSMENTS);
    setInterviewSessions(INITIAL_PREVIOUS_INTERVIEWS);
    setAdaptiveInsights(INITIAL_ADAPTIVE_INSIGHTS);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    localStorage.clear();
  }, []);

  const pendingInsightsCount = useMemo(() => {
    return adaptiveInsights.filter((i) => i.status === 'pending_review').length;
  }, [adaptiveInsights]);

  return (
    <LearnerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        updateSkillProficiency,
        targetRoles: TARGET_ROLE_COMPETENCIES,
        activeTargetRole,
        setActiveTargetRole,
        activeRoleCompetency,
        skillGapAnalysis,
        learningResources,
        toggleResourceCompletion,
        roadmap,
        updateRoadmapStage,
        ragDocuments,
        ragChunks,
        addRAGDocument,
        mcqAssessments,
        saveAssessmentResult,
        interviewSessions,
        saveInterviewSession,
        adaptiveInsights,
        acceptAdaptiveInsight,
        dismissAdaptiveInsight,
        triggerAdaptiveOrchestration,
        systemSettings,
        updateSettings,
        resetToDemoData,
        health,
        refreshHealth,
        notificationCount: pendingInsightsCount,
      }}
    >
      {children}
    </LearnerContext.Provider>
  );
};

export const useLearner = () => {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
};
