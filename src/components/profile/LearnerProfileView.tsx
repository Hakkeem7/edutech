import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { SkillItem, SkillLevel } from '../../types';

export const LearnerProfileView: React.FC = () => {
  const { profile, updateProfile, targetRoles, activeTargetRole, setActiveTargetRole } = useLearner();

  // Local form state
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    email: profile.email,
    title: profile.title,
    organization: profile.organization,
    location: profile.location,
    targetRole: profile.targetRole,
    careerGoals: profile.careerGoals,
    preferredLearningStyle: profile.preferredLearningStyle,
    hoursPerWeek: profile.hoursPerWeek,
  });

  const [skillsList, setSkillsList] = useState<SkillItem[]>(profile.skills);
  const [projectsList, setProjectsList] = useState(profile.projects);
  const [certsList, setCertsList] = useState(profile.certifications);
  const [expList, setExpList] = useState(profile.workExperience);

  // Resume upload & parsing state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedModalOpen, setExtractedModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractedSource, setExtractedSource] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New skill input state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hoursPerWeek' ? parseInt(value, 10) || 10 : value,
    }));
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const scoreMap: Record<SkillLevel, number> = {
      'Not Assessed': 0,
      'Beginner': 45,
      'Intermediate': 70,
      'Advanced': 85,
      'Expert': 95,
    };
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      category: 'ai_ml',
      currentLevel: newSkillLevel,
      currentScore: scoreMap[newSkillLevel],
      requiredLevel: 'Advanced',
      requiredScore: 85,
      evidenceSource: 'learner_confirmed',
      lastAssessedDate: new Date().toISOString().split('T')[0],
      isInferred: false,
    };
    setSkillsList((prev) => [...prev, newSkill]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (id: string) => {
    setSkillsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      skills: skillsList,
      projects: projectsList,
      certifications: certsList,
      workExperience: expList,
    });
    if (formData.targetRole !== activeTargetRole) {
      setActiveTargetRole(formData.targetRole);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // PDF Resume file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.type.includes('pdf')) {
      setUploadError('Please select a valid PDF resume file.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.parseResume({
            base64Pdf: base64Data,
            fileName: file.name,
          });

          setExtractedData(res.data);
          setExtractedSource(res.source);
          setExtractedModalOpen(true);
        } catch (err: any) {
          setUploadError(err.message || 'Failed to extract resume content');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Error reading uploaded file.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Upload error');
      setUploading(false);
    }
  };

  // Confirm extracted resume information
  const handleConfirmExtractedData = () => {
    if (!extractedData) return;

    // Update candidate basic info if available
    if (extractedData.fullName && extractedData.fullName !== 'Extracted Candidate') {
      setFormData((prev) => ({
        ...prev,
        fullName: extractedData.fullName,
        title: extractedData.title || prev.title,
        careerGoals: extractedData.summary || prev.careerGoals,
      }));
    }

    // Append newly inferred skills labeled strictly as "isInferred: true"
    if (extractedData.inferredSkills && Array.isArray(extractedData.inferredSkills)) {
      const existingNames = new Set(skillsList.map((s) => s.name.toLowerCase()));
      const newSkillsToAdd: SkillItem[] = [];

      for (const raw of extractedData.inferredSkills) {
        if (!existingNames.has(raw.name.toLowerCase())) {
          newSkillsToAdd.push({
            id: `sk-inferred-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            name: raw.name,
            category: (raw.category as any) || 'ai_ml',
            currentLevel: (raw.inferredLevel as SkillLevel) || 'Beginner',
            currentScore: raw.inferredLevel === 'Intermediate' ? 65 : 45,
            requiredLevel: 'Advanced',
            requiredScore: 85,
            evidenceSource: 'resume_inferred',
            confidenceScore: raw.confidenceScore || 70,
            isInferred: true,
          });
        }
      }
      setSkillsList((prev) => [...prev, ...newSkillsToAdd]);
    }

    // Add projects if extracted
    if (extractedData.projects && Array.isArray(extractedData.projects)) {
      const newProjects = extractedData.projects.map((p: any, idx: number) => ({
        id: `proj-ext-${Date.now()}-${idx}`,
        title: p.title || 'Resume Project',
        description: p.description || '',
        technologies: p.technologies || [],
      }));
      setProjectsList((prev) => [...prev, ...newProjects]);
    }

    setExtractedModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Learner Identity & Competency Profile</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Learner Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal background, verified skills, and resume metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saved Successfully!</span>
            </span>
          )}
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* PDF Resume Parser Section */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">AI-Powered Resume Skill Extractor</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                PDF Upload
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your engineering resume (PDF). Gemini will extract technical skills, tools, and experiences into structured
              inferred competencies for your review before saving.
            </p>
            {profile.resumeMetadata && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Last processed: <strong className="text-slate-700">{profile.resumeMetadata.fileName}</strong></span>
              </p>
            )}
          </div>

          <div className="w-full md:w-auto shrink-0">
            <label className="relative flex flex-col items-center justify-center px-6 py-4 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white rounded-xl cursor-pointer transition-colors shadow-xs group">
              <div className="flex items-center gap-3">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                )}
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">
                    {uploading ? 'Extracting text & parsing skills...' : 'Upload PDF Resume'}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF up to 25MB supported</span>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>
            {uploadError && (
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Personal & Career Goals */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Personal & Career Target</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education / Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Organization / College</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role</label>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-800"
                >
                  {targetRoles.map((r) => (
                    <option key={r.roleId} value={r.roleName}>
                      {r.roleName}
                    </option>
                  ))}
                  <option value="Custom Role">Custom Role...</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Goals & Aspirations</label>
              <textarea
                name="careerGoals"
                rows={3}
                value={formData.careerGoals}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Describe what roles and skills you want to attain..."
              />
            </div>
          </div>

          {/* Card: Learning Preferences & Time Allocation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Learning Preferences & Commitments</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Learning Style
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['Hands-on Projects', 'Video & Visual', 'Deep Theory & Papers', 'Interactive Quizzes'] as const).map(
                  (style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, preferredLearningStyle: style }))}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        formData.preferredLearningStyle === style
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Available Learning Hours / Week</label>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {formData.hoursPerWeek} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="2"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleInputChange}
                className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>4 hrs (Casual)</span>
                <span>12 hrs (Recommended)</span>
                <span>30+ hrs (Bootcamp Pace)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Verification Policy Notice</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Skills derived from resumes or self-declaration are labeled <strong className="text-slate-700">"Inferred"</strong>.
                Proficiencies are only considered fully verified after completing MCQ diagnostics or AI mock interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Confirmed & Inferred Skills Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Skills & Proficiency Portfolio</h3>
              <p className="text-xs text-slate-500">
                Skills are evaluated against {formData.targetRole} benchmark requirements.
              </p>
            </div>

            {/* Quick Add Skill Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. PyTorch)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Skill Name</th>
                  <th className="py-2.5 px-3 font-bold">Current Proficiency</th>
                  <th className="py-2.5 px-3 font-bold">Score</th>
                  <th className="py-2.5 px-3 font-bold">Verification Evidence</th>
                  <th className="py-2.5 px-3 font-bold">Status Badge</th>
                  <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skillsList.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{skill.name}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-medium">{skill.currentLevel}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              skill.currentScore >= 75 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${skill.currentScore}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">{skill.currentScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 capitalize">
                      {skill.evidenceSource.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3">
                      {skill.isInferred ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Info className="w-3 h-3" /> Inferred (Unassessed)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card: Projects & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Projects ({projectsList.length})</span>
            </h3>
            <div className="space-y-3">
              {projectsList.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <h4 className="font-bold text-xs text-slate-800">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.technologies.map((t) => (
                      <span key={t} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Certifications ({certsList.length})</span>
            </h3>
            <div className="space-y-2.5">
              {certsList.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{c.name}</h4>
                    <span className="text-[11px] text-slate-400">{c.issuer}</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {c.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Structured Resume Review Modal */}
      {extractedModalOpen && extractedData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Review AI-Extracted Resume Details</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {extractedSource === 'gemini-live' ? 'Gemini 3.8 Live Parsing' : 'Parsed Fallback'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  <strong>Verification Notice:</strong> All resume-derived skills below will be tagged as{' '}
                  <span className="font-bold underline">"Inferred"</span> until you confirm them or prove mastery through an
                  assessment.
                </p>
              </div>

              {extractedData.summary && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Candidate Summary:</h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 italic">
                    "{extractedData.summary}"
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">
                  Extracted Skills ({extractedData.inferredSkills?.length || 0})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {extractedData.inferredSkills?.map((s: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 block">{s.name}</span>
                        <span className="text-[10px] text-slate-500">Inferred: {s.inferredLevel}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {s.confidenceScore}% conf.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setExtractedModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExtractedData}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Import Extracted Skills</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
