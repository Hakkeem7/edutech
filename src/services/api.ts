export interface HealthStatus {
  status: string;
  geminiConfigured: boolean;
  model: string;
  embeddingModel: string;
  serverTime: string;
  demoModeAvailable: boolean;
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (e) {
      return {
        status: 'demo-local',
        geminiConfigured: false,
        model: 'gemini-3.8-flash (Fallback Mode)',
        embeddingModel: 'gemini-embedding-2-preview',
        serverTime: new Date().toISOString(),
        demoModeAvailable: true,
      };
    }
  },

  async parseResume(payload: { base64Pdf?: string; rawText?: string; fileName?: string }) {
    try {
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to parse resume');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('API parse resume error:', err);
      throw err;
    }
  },

  async askRAGChat(payload: { question: string; chunks: any[]; learnerContext: any }) {
    try {
      const res = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to query RAG assistant');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('API RAG chat error:', err);
      throw err;
    }
  },

  async generateInterview(payload: { targetRole: string; difficulty: string; category: string; count?: number }) {
    try {
      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate interview questions');
      return await res.json();
    } catch (err: any) {
      console.warn('API interview generate error:', err);
      throw err;
    }
  },

  async evaluateInterviewAnswer(payload: { question: string; learnerAnswer: string; targetRole: string; rubricCriteria: string }) {
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to evaluate interview answer');
      }
      return await res.json();
    } catch (err: any) {
      console.warn('API interview evaluate error:', err);
      throw err;
    }
  },

  async generateMCQs(payload: { subject: string; difficulty: string; count?: number; targetRole: string }) {
    try {
      const res = await fetch('/api/mcq/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to generate MCQ questions');
      return await res.json();
    } catch (err: any) {
      console.warn('API mcq generate error:', err);
      throw err;
    }
  },

  async orchestrateAdaptive(payload: {
    learnerProfile: any;
    recentAssessments: any[];
    recentInterviews: any[];
    currentRoadmap: any[];
    thresholds: any;
  }) {
    try {
      const res = await fetch('/api/adaptive/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to orchestrate adaptive learning');
      return await res.json();
    } catch (err: any) {
      console.warn('API adaptive orchestrate error:', err);
      throw err;
    }
  },

  async loadServerState() {
    try {
      const res = await fetch('/api/storage/state');
      if (!res.ok) return null;
      const data = await res.json();
      if (data.empty) return null;
      return data;
    } catch (e) {
      return null;
    }
  },

  async saveServerState(state: any) {
    try {
      await fetch('/api/storage/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
    } catch (e) {
      console.warn('Could not save state to server disk:', e);
    }
  },
};
