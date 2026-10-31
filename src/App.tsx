import React from 'react';
import { LearnerProvider, useLearner } from './context/LearnerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { LearnerProfileView } from './components/profile/LearnerProfileView';
import { SkillGapView } from './components/skillgap/SkillGapView';
import { PersonalizedLearningView } from './components/learning/PersonalizedLearningView';
import { RAGChatbotView } from './components/chatbot/RAGChatbotView';
import { AIInterviewerView } from './components/interview/AIInterviewerView';
import { MCQAssessmentView } from './components/mcq/MCQAssessmentView';
import { AdaptiveRoadmapView } from './components/roadmap/AdaptiveRoadmapView';
import { ProgressReportsView } from './components/reports/ProgressReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useLearner();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'profile' && <LearnerProfileView />}
      {activeTab === 'skillgap' && <SkillGapView />}
      {activeTab === 'learning' && <PersonalizedLearningView />}
      {activeTab === 'chatbot' && <RAGChatbotView />}
      {activeTab === 'interviewer' && <AIInterviewerView />}
      {activeTab === 'assessment' && <MCQAssessmentView />}
      {activeTab === 'roadmap' && <AdaptiveRoadmapView />}
      {activeTab === 'reports' && <ProgressReportsView />}
      {activeTab === 'settings' && <SettingsView />}
    </main>
  );
};

export function App() {
  return (
    <LearnerProvider>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Column */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <Header />
          <MainContent />
        </div>
      </div>
    </LearnerProvider>
  );
}

export default App;
