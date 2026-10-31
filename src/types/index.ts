export type SkillLevel = 'Not Assessed' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type GapSeverity = 'High' | 'Medium' | 'Low' | 'Satisfied';

export type EvidenceSource =
  | 'resume_inferred'
  | 'learner_confirmed'
  | 'mcq_assessment'
  | 'interview_evaluation'
  | 'course_completed';

export interface SkillItem {
  id: string;
  name: string;
  category: 'core' | 'ai_ml' | 'data' | 'engineering' | 'soft_skills';
  currentLevel: SkillLevel;
  currentScore: number; // 0 - 100
  requiredLevel: SkillLevel;
  requiredScore: number; // 0 - 100
  evidenceSource: EvidenceSource;
  lastAssessedDate?: string;
  confidenceScore?: number; // e.g. 70% confidence if inferred
  isInferred?: boolean;
}

export interface TargetRoleCompetency {
  roleId: string;
  roleName: string;
  description: string;
  category: string;
  requiredSkills: {
    skillName: string;
    requiredLevel: SkillLevel;
    requiredScore: number;
    weight: number; // 1 - 5
    importanceRationale: string;
    recommendedActivity: string;
  }[];
}

export interface LearnerProfile {
  id: string;
  fullName: string;
  email: string;
  title: string;
  organization: string;
  location: string;
  targetRole: string;
  careerGoals: string;
  preferredLearningStyle: 'Hands-on Projects' | 'Video & Visual' | 'Deep Theory & Papers' | 'Interactive Quizzes';
  hoursPerWeek: number;
  skills: SkillItem[];
  projects: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: string;
  }[];
  workExperience: {
    id: string;
    role: string;
    company: string;
    duration: string;
    highlights: string[];
  }[];
  resumeMetadata?: {
    fileName: string;
    extractedAt: string;
    summary: string;
  };
}

export interface SkillGapAnalysisResult {
  roleId: string;
  roleName: string;
  overallMatchScore: number; // 0 - 100
  skillsAnalysis: {
    skillName: string;
    currentLevel: SkillLevel;
    currentScore: number;
    requiredLevel: SkillLevel;
    requiredScore: number;
    gapSeverity: GapSeverity;
    gapScore: number; // gap delta
    importanceRationale: string;
    recommendedAction: string;
    evidenceSource: EvidenceSource;
  }[];
  strongestSkills: string[];
  weakestSkills: string[];
  prioritySkills: string[];
  summaryRecommendation: string;
  analyzedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  skill: string;
  category: string;
  resourceType: 'Interactive Lab' | 'Concept Guide' | 'Project Blueprint' | 'Video Walkthrough';
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjective: string;
  contentReference: string; // Verified link or internal reading
  reasonForRecommendation: string;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  section: 'start_here' | 'recommended_next' | 'practice_more' | 'advanced_learning';
  completedAt?: string;
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  skill: string;
  activity: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedDuration: string;
  prerequisites: string[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Needs Revision';
  completionPercentage: number;
  assessmentEvidence?: string;
  lastUpdated?: string;
}

export interface RAGChunk {
  id: string;
  docId: string;
  docTitle: string;
  text: string;
  category: string;
  pageOrSection?: string;
  similarityScore?: number;
}

export interface RAGDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  uploadedAt: string;
  chunkCount: number;
  contentPreview: string;
  fileSize: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  groundedSources?: {
    docTitle: string;
    section?: string;
    snippet: string;
    relevance: number;
  }[];
  isGrounded?: boolean;
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  category: 'Technical' | 'Conceptual' | 'Problem-solving' | 'Role-specific scenarios';
  rubricCriteria: string;
  targetSkill: string;
  learnerAnswer?: string;
  score?: number; // 0 - 100
  conceptualScore?: number;
  technicalScore?: number;
  problemSolvingScore?: number;
  feedback?: string;
  strengths?: string[];
  improvementAreas?: string[];
  evaluatedAt?: string;
}

export interface InterviewSession {
  id: string;
  learnerId: string;
  targetRole: string;
  difficulty: 'Junior' | 'Mid-Level' | 'Senior' | 'Staff/Lead';
  category: 'Technical' | 'Conceptual' | 'Problem-solving' | 'Role-specific scenarios' | 'Mixed';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  status: 'in_progress' | 'completed';
  overallScore?: number;
  startedAt: string;
  completedAt?: string;
  finalReport?: {
    overallScore: number;
    conceptualUnderstanding: number;
    technicalAccuracy: number;
    problemSolvingAbility: number;
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendedLearningTopics: string[];
    suggestedPracticeQuestions: string[];
  };
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  userSelectedIndex?: number;
}

export interface MCQAssessment {
  id: string;
  learnerId: string;
  targetRole: string;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: MCQQuestion[];
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  topicBreakdown: {
    topic: string;
    score: number;
    total: number;
    percentage: number;
  }[];
  weakTopics: string[];
  recommendedResources: string[];
  completedAt: string;
}

export interface AdaptiveRuleChange {
  topic: string;
  previousStatus: string;
  newStatus: string;
  actionTaken: string;
  justification: string;
}

export interface AdaptiveInsight {
  id: string;
  timestamp: string;
  triggerEvent: 'mcq_assessment' | 'interview_evaluation' | 'course_completed' | 'profile_update';
  triggerSummary: string;
  agentsInvolved: string[];
  proposedChanges: AdaptiveRuleChange[];
  recommendedNextActivity: string;
  status: 'pending_review' | 'accepted' | 'dismissed';
}

export interface SystemSettings {
  failReviewThreshold: number; // default 60%
  targetPassThreshold: number; // default 80%
  mentorAlertAttempts: number; // default 2
  activeModel: string;
  ragTopK: number;
  useLiveGemini: boolean;
  demoMode: boolean;
}
