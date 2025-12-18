
import React, { useState, useEffect } from 'react';
import { 
  GenerationSettings, 
  StoryInput, 
  AnalysisResult, 
  GeneratedScript,
  InputMode,
  TitleGeneratorInput,
  TitleResult,
  TitleMode
} from './types';
import { 
  AGE_GROUPS, 
  FORMATS, 
  LENGTHS, 
  TONES, 
  INTENSITIES, 
  TOPIC_PRESETS,
  EMOTIONS,
  RELATIONSHIPS
} from './constants';
import { analyzeStory, generateScript, generateTitles } from './geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GeneratedScript[]>([]);
  
  // Title Generator State
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleInput, setTitleInput] = useState<TitleGeneratorInput>({
    mode: 'long',
    category: '가정',
    emotion: '후회',
    relationship: '배우자',
    input: '',
    intensity: '현실적'
  });
  const [generatedTitles, setGeneratedTitles] = useState<TitleResult[]>([]);

  // State for Settings
  const [settings, setSettings] = useState<GenerationSettings>({
    ageGroup: '40대',
    format: '라디오 사연',
    length: '2~3분',
    tone: '따뜻함',
    intensity: '현실적'
  });

  // State for Input
  const [inputMode, setInputMode] = useState<InputMode>('summary');
  const [storyInput, setStoryInput] = useState<StoryInput>({
    mode: 'summary',
    content: '',
    keywords: [],
    characters: '등장인물',
    conflict: '',
    twist: ''
  });

  // Result state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('radio_scripts_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newScript: GeneratedScript) => {
    const updated = [newScript, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('radio_scripts_history', JSON.stringify(updated));
  };

  const handleStartGeneration = async () => {
    setLoading(true);
    try {
      const analysisResult = await analyzeStory(storyInput);
      setAnalysis(analysisResult);
      const generatedScript = await generateScript(settings, storyInput, analysisResult);
      setScript(generatedScript);
      saveToHistory(generatedScript);
      setStep(3);
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTitles = async (override?: string) => {
    setTitleLoading(true);
    try {
      const titles = await generateTitles(titleInput, override);
      setGeneratedTitles(titles);
    } catch (error) {
      console.error(error);
      alert('제목 생성 중 오류가 발생했습니다.');
    } finally {
      setTitleLoading(false);
    }
  };

  const handleApplyTitleToInput = (titleRes: TitleResult) => {
    setStoryInput(prev => ({
      ...prev,
      conflict: titleRes.title,
      characters: titleRes.characters,
      twist: titleRes.twist
    }));
    setInputMode('summary');
    // Scroll to input section
    const target = document.getElementById('story-input-section');
    if (target) {
      window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto px-4">
      {[1, 2, 3, 4].map((num) => (
        <React.Fragment key={num}>
          <div className={`flex flex-col items-center z-10`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              step >= num ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              {num}
            </div>
            <span className={`text-[11px] mt-2 font-semibold ${step >= num ? 'text-indigo-400' : 'text-slate-600'}`}>
              {['설정 및 입력', '분석 중', '대본 결과', '보관함'][num - 1]}
            </span>
          </div>
          {num < 4 && (
            <div className={`flex-1 h-1 mx-2 rounded ${step > num ? 'bg-indigo-600' : 'bg-slate-800'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-20 overflow-x-hidden custom-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-rose-500 p-2 rounded-lg">
            <i className="fas fa-microphone-lines text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight gradient-text">3060 라디오 대본 생성기</h1>
          </div>
        </div>
        <button 
          onClick={() => setStep(4)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <i className="fas fa-folder-open"></i>
          보관함
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {renderStepIndicator()}

        {/* Step 1: Integrated Screen */}
        {step === 1 && !loading && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1) Title Generator Section */}
            <section className="glass-panel p-8 rounded-3xl shadow-2xl border border-indigo-500/20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-indigo-300">
                  <i className="fas fa-heading text-indigo-500"></i>
                  유튜브/라디오 제목 생성기
                </h2>
                <div className="flex bg-slate-900 p-1 rounded-xl">
                  {(['shorts', 'long'] as TitleMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTitleInput({ ...titleInput, mode: m })}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                        titleInput.mode === m 
                          ? 'bg-indigo-600 text-white shadow-lg' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m === 'shorts' ? '숏츠 (15-60초)' : '롱폼 (3-10분)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side: Inputs */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">카테고리</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                        value={titleInput.category}
                        onChange={(e) => setTitleInput({...titleInput, category: e.target.value})}
                      >
                        {TOPIC_PRESETS.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">감정 선택</label>
                      <div className="flex flex-wrap gap-2">
                        {EMOTIONS.map(e => (
                          <button
                            key={e}
                            onClick={() => setTitleInput({...titleInput, emotion: e})}
                            className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all ${
                              titleInput.emotion === e 
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">관계 선택</label>
                      <div className="flex flex-wrap gap-2">
                        {RELATIONSHIPS.map(r => (
                          <button
                            key={r}
                            onClick={() => setTitleInput({...titleInput, relationship: r})}
                            className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all ${
                              titleInput.relationship === r 
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">핵심 사건 또는 키워드 (선택)</label>
                      <textarea 
                        className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="사건을 입력하지 않으면 카테고리와 감정 기반으로 제목을 추천합니다."
                        value={titleInput.input}
                        onChange={(e) => setTitleInput({...titleInput, input: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">수위</label>
                      <div className="flex gap-2">
                        {INTENSITIES.map(i => (
                          <button
                            key={i}
                            onClick={() => setTitleInput({ ...titleInput, intensity: i })}
                            className={`flex-1 py-2 px-3 rounded-xl border transition-all text-xs ${
                              titleInput.intensity === i 
                                ? 'border-rose-500 bg-rose-500/20 text-rose-300' 
                                : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleGenerateTitles()}
                      disabled={titleLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      {titleLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                      제목 20개 생성하기
                    </button>
                  </div>
                </div>

                {/* Right side: Results */}
                <div className="lg:col-span-8">
                  {generatedTitles.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-400">생성된 제목 및 시나리오</h3>
                        <div className="flex gap-2">
                          <button onClick={() => handleGenerateTitles("사이다 위주로")} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-400">#사이다만</button>
                          <button onClick={() => handleGenerateTitles("눈물/감동 위주로")} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-400">#눈물만</button>
                          <button onClick={() => handleGenerateTitles("비슷한 톤으로 10개 더")} className="text-[10px] bg-indigo-900/30 hover:bg-indigo-900/50 px-3 py-1 rounded-full text-indigo-400 border border-indigo-800/50">10개 더</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {generatedTitles.map((t, idx) => (
                          <div key={idx} className="group glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col gap-3 relative">
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold border ${
                                t.score >= 80 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                                t.score >= 65 ? 'bg-amber-500/10 border-amber-500 text-amber-400' :
                                'bg-slate-800 border-slate-700 text-slate-500'
                              }`}>
                                {t.score}
                              </div>
                              <div className="flex-1">
                                <p className="text-base font-bold text-slate-200 mb-1">{t.title}</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-[10px] text-indigo-400 font-mono font-bold">[{t.hookType}]</span>
                                  {t.tags.map(tag => <span key={tag} className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">#{tag}</span>)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-slate-900/40 p-3 rounded-xl space-y-2 border border-slate-800/50">
                                <div className="flex gap-2 text-[11px]">
                                    <span className="text-slate-500 font-bold shrink-0">등장인물:</span>
                                    <span className="text-slate-300">{t.characters}</span>
                                </div>
                                <div className="flex gap-2 text-[11px]">
                                    <span className="text-rose-400 font-bold shrink-0">반전/깨달음:</span>
                                    <span className="text-rose-200 italic">{t.twist}</span>
                                </div>
                            </div>

                            <button 
                              onClick={() => handleApplyTitleToInput(t)}
                              className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[11px] font-bold transition-all shadow-xl"
                            >
                              대본 입력에 사용
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 p-12">
                      <i className="fas fa-wand-sparkles text-4xl"></i>
                      <p className="text-center font-bold">왼쪽에서 사연 필터를 선택하고<br/>CTR이 높은 제목과 시나리오를 먼저 생성해보세요.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 2) Broadcast Settings & Story Input Section */}
            <div id="story-input-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Settings */}
              <div className="lg:col-span-4 space-y-6">
                <section className="glass-panel p-8 rounded-3xl shadow-xl space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                    <i className="fas fa-sliders"></i> 방송 대본 설정
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">타겟 연령</label>
                      <div className="flex flex-wrap gap-2">
                        {AGE_GROUPS.map(age => (
                          <button
                            key={age}
                            onClick={() => setSettings({ ...settings, ageGroup: age })}
                            className={`flex-1 py-2.5 px-3 rounded-xl border transition-all text-xs ${
                              settings.ageGroup === age 
                                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' 
                                : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-2 block">방송 포맷</label>
                      <div className="grid grid-cols-2 gap-2">
                        {FORMATS.map(f => (
                          <button
                            key={f}
                            onClick={() => setSettings({ ...settings, format: f })}
                            className={`py-2.5 px-3 rounded-xl border transition-all text-xs ${
                              settings.format === f 
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' 
                                : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-2 block">분량</label>
                        <select 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          value={settings.length}
                          onChange={(e) => setSettings({...settings, length: e.target.value})}
                        >
                          {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-2 block">톤/분위기</label>
                        <select 
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          value={settings.tone}
                          onChange={(e) => setSettings({...settings, tone: e.target.value})}
                        >
                          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Story Input */}
              <div className="lg:col-span-8 space-y-6">
                <section className="glass-panel p-8 rounded-3xl shadow-xl flex flex-col h-full">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-purple-400 mb-6">
                    <i className="fas fa-pen-nib"></i> 상세 사연 내용
                  </h2>
                  <div className="flex bg-slate-900 p-1 rounded-xl mb-6">
                    {(['paste', 'summary', 'auto'] as InputMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setInputMode(mode);
                          setStoryInput({ ...storyInput, mode });
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                          inputMode === mode 
                            ? 'bg-slate-800 text-white shadow-lg' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {mode === 'paste' ? '원문 입력' : mode === 'summary' ? '요약 입력' : '자동 생성'}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 space-y-6">
                    {inputMode === 'paste' && (
                      <textarea
                        className="w-full h-80 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all custom-scrollbar"
                        placeholder="사연 원문을 여기에 입력해주세요..."
                        value={storyInput.content}
                        onChange={(e) => setStoryInput({ ...storyInput, content: e.target.value })}
                      />
                    )}
                    {inputMode === 'summary' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 mb-2 block">등장인물</label>
                          <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="등장인물 (예: 50대 엄마와 취준생 아들)"
                            value={storyInput.characters}
                            onChange={(e) => setStoryInput({ ...storyInput, characters: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 mb-2 block">핵심 사건 (제목)</label>
                          <textarea
                            className="w-full h-32 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="핵심 사건: 어떤 일이 있었나요? (제목 생성기에서 선택한 제목이 여기에 자동 입력될 수 있습니다)"
                            value={storyInput.conflict}
                            onChange={(e) => setStoryInput({ ...storyInput, conflict: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 mb-2 block">반전/깨달음</label>
                          <textarea
                            className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="반전/깨달음: 마지막에 어떻게 되었나요?"
                            value={storyInput.twist}
                            onChange={(e) => setStoryInput({ ...storyInput, twist: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                    {inputMode === 'auto' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {TOPIC_PRESETS.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setStoryInput({ ...storyInput, content: topic.label + " 주제로 감동적인 사연을 만들어줘." })}
                            className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center h-full justify-center ${
                              storyInput.content.includes(topic.label)
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-sm text-white shadow-lg`}>
                              {topic.icon}
                            </div>
                            <span className="text-[11px] font-bold text-slate-300 leading-tight">{topic.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={handleStartGeneration}
                      disabled={loading || (inputMode === 'paste' && !storyInput.content) || (inputMode === 'summary' && !storyInput.conflict)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 text-white py-5 rounded-2xl font-bold shadow-2xl transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                    >
                      {loading ? <i className="fas fa-broadcast-tower animate-bounce"></i> : <i className="fas fa-paper-plane"></i>}
                      라디오 대본 생성 시작
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="glass-panel p-20 rounded-3xl flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <i className="fas fa-broadcast-tower absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-indigo-400"></i>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold gradient-text">최적의 대본을 구성하는 중입니다</h3>
              <p className="text-slate-400">사연을 분석하고 방송용 톤으로 다듬고 있습니다...</p>
            </div>
          </div>
        )}

        {/* Step 3: Result Screen */}
        {step === 3 && script && !loading && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Script */}
              <div className="lg:col-span-8 space-y-6">
                <section className="glass-panel p-10 rounded-3xl shadow-xl space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-8">
                    <h2 className="text-3xl font-bold flex items-center gap-4">
                      <i className="fas fa-microphone text-emerald-500"></i>
                      최종 방송 대본
                    </h2>
                    <button 
                      onClick={() => {
                        const text = `[오프닝]\n${script.opening}\n\n[사연소개]\n${script.intro}\n\n[사연본문]\n${script.body}\n\n[클라이맥스]\n${script.climax}\n\n[엔딩]\n${script.ending}\n\n[코멘트]\n${script.comment.empathy}\n${script.comment.advice}`;
                        navigator.clipboard.writeText(text);
                        alert('대본이 복사되었습니다.');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl text-slate-300 transition-all border border-slate-700"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>

                  <div className="space-y-12 font-serif leading-relaxed text-slate-200">
                    <section>
                      <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest block mb-4 px-3 py-1.5 bg-indigo-500/10 w-fit rounded-lg">오프닝</span>
                      <p className="text-2xl whitespace-pre-wrap leading-relaxed">{script.opening}</p>
                    </section>
                    
                    <section className="bg-slate-900/40 p-8 rounded-3xl border-l-4 border-slate-700">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-widest block mb-4">인트로 / 사연 소개</span>
                      <p className="text-lg whitespace-pre-wrap leading-relaxed">{script.intro}</p>
                    </section>

                    <section>
                      <span className="text-amber-500 font-bold text-xs uppercase tracking-widest block mb-4 px-3 py-1.5 bg-amber-500/10 w-fit rounded-lg">사연 본문</span>
                      <div className="whitespace-pre-wrap leading-loose space-y-8 text-lg">
                        {script.body.split('\n').filter(line => line.trim()).map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </section>

                    <section className="bg-rose-500/5 p-8 rounded-3xl border-l-4 border-rose-500 italic">
                      <span className="text-rose-400 font-bold text-xs uppercase tracking-widest block mb-4">클라이맥스 대화</span>
                      <div className="whitespace-pre-wrap leading-loose space-y-6 text-xl text-rose-100">
                        {script.climax.split('\n').filter(line => line.trim()).map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </section>

                    <section>
                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest block mb-4 px-3 py-1.5 bg-emerald-500/10 w-fit rounded-lg">엔딩</span>
                      <p className="text-lg whitespace-pre-wrap leading-relaxed">{script.ending}</p>
                    </section>

                    <section className="bg-indigo-900/10 p-10 rounded-[2.5rem] border border-indigo-500/20 shadow-inner">
                      <span className="text-indigo-300 font-bold text-xs uppercase tracking-widest block mb-6">진행자 마무리 코멘트</span>
                      <div className="space-y-6">
                        <p className="text-2xl text-indigo-100 font-bold leading-relaxed italic">"{script.comment.empathy}"</p>
                        <p className="text-lg text-slate-300 leading-relaxed border-l-2 border-indigo-500/40 pl-6">{script.comment.advice}</p>
                        <p className="text-slate-500 text-sm mt-8">{script.comment.outro}</p>
                      </div>
                    </section>
                  </div>
                </section>
              </div>

              {/* Sidebar Assets */}
              <div className="lg:col-span-4 space-y-8">
                <div className="glass-panel p-8 rounded-3xl space-y-6 border border-indigo-500/20">
                  <h4 className="text-md font-bold text-slate-300 flex items-center gap-2">
                    <i className="fas fa-closed-captioning text-emerald-500"></i> 영상 자막 추천
                  </h4>
                  <div className="space-y-3">
                    {script.captions.map((cap, i) => (
                      <div key={i} className="bg-slate-900/80 p-4 rounded-xl text-xs border border-slate-800 text-slate-300 leading-relaxed group hover:border-indigo-500 transition-all cursor-pointer" onClick={() => {navigator.clipboard.writeText(cap); alert('복사되었습니다.');}}>
                        {cap}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl space-y-6">
                  <h4 className="text-md font-bold text-slate-300 flex items-center gap-2">
                    <i className="fas fa-image text-amber-500"></i> 추천 썸네일 카피
                  </h4>
                  <div className="space-y-3">
                    {script.thumbnails.map((thumb, i) => (
                      <div key={i} className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-5 rounded-2xl text-sm font-bold text-indigo-50 border border-indigo-500/30">
                        {thumb}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl">
                  <h4 className="text-md font-bold text-slate-300 flex items-center gap-2 mb-4">
                    <i className="fas fa-hashtag text-rose-500"></i> 연관 해시태그
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {script.hashtags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"><i className="fas fa-plus"></i> 처음으로</button>
                  <button onClick={handleStartGeneration} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"><i className="fas fa-redo"></i> 대본 다시 생성</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Storage */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold flex items-center gap-4">
                <i className="fas fa-bookmark text-rose-500"></i>
                나의 대본 저장소
              </h2>
              <button onClick={() => setStep(1)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">새로 만들기</button>
            </div>
            {history.length === 0 ? (
              <div className="glass-panel p-24 rounded-[3rem] text-center space-y-6 border border-slate-800">
                <i className="fas fa-inbox text-5xl text-slate-700"></i>
                <h3 className="text-2xl font-bold text-slate-500">저장된 대본이 하나도 없어요</h3>
                <p className="text-slate-600">지금 바로 사연을 입력하고 멋진 대본을 만들어보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {history.map((item) => (
                  <div key={item.id} className="glass-panel p-8 rounded-[2rem] hover:border-indigo-500/50 transition-all flex flex-col h-full border border-slate-800/50 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] bg-indigo-900/40 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-800/30 font-bold">{item.settings.ageGroup}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700 font-bold">{item.settings.format}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 line-clamp-2 mb-4 h-14 leading-tight group-hover:text-indigo-400 transition-colors">
                      {item.thumbnails[0]}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-8 flex-1 leading-relaxed italic">
                      {item.body.substring(0, 120)}...
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => { setScript(item); setStep(3); }} className="flex-1 bg-indigo-900/20 hover:bg-indigo-600 text-indigo-400 hover:text-white py-3.5 rounded-2xl text-xs font-bold transition-all border border-indigo-800/30">열기</button>
                      <button onClick={() => { const updated = history.filter(h => h.id !== item.id); setHistory(updated); localStorage.setItem('radio_scripts_history', JSON.stringify(updated)); }} className="bg-slate-800 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 px-5 rounded-2xl transition-all border border-slate-700"><i className="fas fa-trash-can"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
