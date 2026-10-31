import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  FileText,
  Trash2,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { api } from '../../services/api';
import { ChatMessage, RAGChunk, RAGDocument } from '../../types';

export const RAGChatbotView: React.FC = () => {
  const {
    profile,
    activeTargetRole,
    skillGapAnalysis,
    ragDocuments,
    ragChunks,
    addRAGDocument,
    health,
  } = useLearner();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${profile.fullName}! I'm **SkillForge AI Tutor**. I answer your questions grounded strictly in our technical handbook and your verified learning materials. I also adapt my answers to your target role (${activeTargetRole}) and priority skill gaps. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: false,
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDocPanel, setShowDocPanel] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Explain RAG in simple terms.',
    'What should I learn next to become an AI Engineer?',
    'Explain the difference between supervised and unsupervised learning.',
    'Generate practice questions about Python.',
    'Help me understand the feedback from my last interview.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion;
    if (!question.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const response = await api.askRAGChat({
        question: question.trim(),
        chunks: ragChunks,
        learnerContext: {
          targetRole: activeTargetRole,
          weakSkills: skillGapAnalysis.weakestSkills,
          hoursPerWeek: profile.hoursPerWeek,
        },
      });

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSources: response.groundedSources || [],
        isGrounded: response.isGrounded,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `I encountered an issue retrieving grounded context: ${err.message}. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-new',
        sender: 'assistant',
        text: `Conversation cleared. I am ready to answer technical questions grounded in your learning documents for ${activeTargetRole}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: false,
      },
    ]);
  };

  // Upload custom document into RAG index
  const handleCustomDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadStatus('Extracting text & chunking...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const textContent = (reader.result as string) || '';
        // If file is text or markdown or base64
        const docId = `doc-user-${Date.now()}`;
        const newDoc: RAGDocument = {
          id: docId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          category: 'Uploaded Material',
          uploadedAt: new Date().toISOString(),
          chunkCount: 2,
          contentPreview: textContent.slice(0, 150) + '...',
          fileSize: `${Math.round(file.size / 1024)} KB`,
        };

        // Split text into semantic chunks (~350 characters)
        const rawChunks = textContent.match(/[^.!?]+[.!?]+/g) || [textContent];
        const newChunks: RAGChunk[] = [];
        let curChunk = '';
        let chunkIndex = 1;

        for (const sentence of rawChunks) {
          curChunk += ' ' + sentence.trim();
          if (curChunk.length >= 300) {
            newChunks.push({
              id: `chk-${docId}-${chunkIndex++}`,
              docId,
              docTitle: newDoc.title,
              category: 'Custom Upload',
              pageOrSection: `Section ${chunkIndex - 1}`,
              text: curChunk.trim(),
            });
            curChunk = '';
          }
        }
        if (curChunk.trim().length > 0) {
          newChunks.push({
            id: `chk-${docId}-${chunkIndex}`,
            docId,
            docTitle: newDoc.title,
            category: 'Custom Upload',
            pageOrSection: `Section ${chunkIndex}`,
            text: curChunk.trim(),
          });
        }

        newDoc.chunkCount = newChunks.length;
        addRAGDocument(newDoc, newChunks);
        setUploadStatus(`Indexed ${newChunks.length} chunks successfully!`);
        setTimeout(() => setUploadStatus(null), 3000);
        setUploadingDoc(false);
      };

      reader.readAsText(file);
    } catch (e: any) {
      setUploadStatus('Upload failed: ' + e.message);
      setUploadingDoc(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retrieval-Augmented Generation (RAG)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">SkillForge AI Tutor</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time grounded assistance with strict citation references from your technical knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocPanel(!showDocPanel)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>{showDocPanel ? 'Hide Documents' : 'Knowledge Base'}</span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 rounded">
              {ragChunks.length} chunks
            </span>
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Conversation Column (8 cols or 12 cols) */}
        <div className={`${showDocPanel ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          {/* Messages Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
            {/* Top Status Bar */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Grounded Mode Active (Top 3 Chunks Cosine/BM25)</span>
              </span>
              <span className="text-[11px] text-slate-400">Model: {health?.model || 'Gemini 3.8'}</span>
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs ${
                        isUser
                          ? 'bg-blue-600'
                          : 'bg-gradient-to-tr from-teal-500 to-blue-600'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-3'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Grounded Sources Citation Box */}
                      {!isUser && msg.groundedSources && msg.groundedSources.length > 0 && (
                        <div className="border-t border-slate-200/70 pt-2.5 mt-2 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            <span>Retrieved Document Citations ({msg.groundedSources.length})</span>
                          </span>
                          <div className="space-y-1">
                            {msg.groundedSources.map((src, i) => (
                              <div
                                key={i}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>{src.docTitle}</span>
                                  <span className="text-[10px] text-blue-600 font-semibold">
                                    {src.relevance}% Match
                                  </span>
                                </div>
                                {src.section && <span className="text-[10px] text-slate-400 block">{src.section}</span>}
                                <p className="text-[10px] text-slate-500 italic mt-0.5">"{src.snippet}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={`text-[10px] text-right ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span>Searching vector indexes and synthesizing grounded response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Suggestions:</span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-700 text-[11px] whitespace-nowrap transition-colors shadow-2xs font-medium"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={`Ask questions about RAG, ML, Python, or interview feedback...`}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputQuestion.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ask Tutor</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Knowledge Base & Document Manager Panel (4 cols) */}
        {showDocPanel && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Indexed Knowledge Base</h3>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {ragChunks.length} Chunks
                </span>
              </div>

              {/* Upload Document to RAG */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Add Document to Vector Index</span>
                <p className="text-[11px] text-slate-500">
                  Upload text notes, PDF handouts, or architecture specs. The system will chunk and index them.
                </p>
                <label className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>{uploadingDoc ? 'Chunking...' : 'Upload Text or Document'}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={handleCustomDocUpload}
                    disabled={uploadingDoc}
                    className="hidden"
                  />
                </label>
                {uploadStatus && (
                  <p className="text-[10px] text-blue-700 font-semibold">{uploadStatus}</p>
                )}
              </div>

              {/* List of Indexed Documents */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Active Document Sources
                </span>
                {ragDocuments.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 truncate max-w-[180px]">{doc.title}</h4>
                      <span className="text-[10px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                        {doc.chunkCount} chunks
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.contentPreview}
                    </p>
                  </div>
                ))}
              </div>

              {/* Grounding Policy Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-[11px] space-y-1">
                <strong className="font-bold block">Safety & Integrity Policy:</strong>
                <span>
                  Responses strictly cite verified chunk IDs. Untrusted documents cannot override system safety prompt guardrails.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
