import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, resetSession } from './services/geminiService';
import { Message, SEOPhase } from './types';
import PhaseStepper from './components/PhaseStepper';
import MarkdownViewer from './components/MarkdownViewer';
import TypingIndicator from './components/TypingIndicator';
import { RefreshCw, Zap, Play, PenTool, CheckCircle, FileText, ArrowRight, Copy, Link as LinkIcon, Sparkles, AlertCircle, Code, FileType, Languages, ArrowLeft, Key } from 'lucide-react';

// --- Configuration Options Constants ---
const AUDIENCE_OPTIONS = [
  "[A1] 痛点感知型 (小白找方案)",
  "[A2] 产品对比型 (纠结买哪个)",
  "[A4] 售后/老客户 (使用教程)",
  "[B2] 极客/发烧友 (硬核参数党)",
  "[B3] 怀疑论者 (只信数据)",
  "[B4] 收藏家/投资人 (看重升值)",
  "[B5] DIY动手党 (改装/制作)",
  "[B6] 礼物选购者 (送礼焦虑)",
  "[C1] 价格敏感型 (找平替/折扣)",
  "[C3] B2B 决策者 (采购/批发)"
];

const TONE_OPTIONS = [
  "[A1] 亲切/社区感 (像老朋友)",
  "[A2] 激情/炒作 (新品发布)",
  "[A3] 严肃/警示 (避坑/打假)",
  "[A4] 治愈/共情 (健康/情感)",
  "[B1] 权威/百科 (严谨科普)",
  "[B2] 极简/数据流 (纯干货)",
  "[B3] 奢华/高雅 (高端格调)",
  "[B4] 故事叙述 (电影/沉浸)",
  "[B5] 犀利/批判 (毒舌真实)"
];

const GOAL_OPTIONS = [
  "[A1] 关键词霸屏 (SEO科普)",
  "[A2] 热点追踪 (蹭流量)",
  "[A3] 外链诱饵 (数据报告)",
  "[B1] 硬广转化 (直接卖货)",
  "[B2] 深度对比 (A vs B)",
  "[B3] 导购清单 (Top 10)",
  "[C1] 信任建设 (专家观点)",
  "[C2] 邮件获客 (吸粉)",
  "[C3] 故障排查 (解决问题)"
];

const App: React.FC = () => {
  // 🟢 新增：API Key 状态
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("USER_GEMINI_KEY") || "";
  });

  useEffect(() => {
    localStorage.setItem("USER_GEMINI_KEY", apiKey);
  }, [apiKey]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<SEOPhase>(SEOPhase.CONFIG);
  
  // Language Mode State for Article Module
  const [langMode, setLangMode] = useState<'CN' | 'EN'>('CN');

  // Copy States
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyRichSuccess, setCopyRichSuccess] = useState(false);
  
  // Ref for capturing HTML content
  const articleRef = useRef<HTMLDivElement>(null);
  
  // Configuration Form State
  const [configForm, setConfigForm] = useState({
    keyword: '',
    audience: '',
    tone: '',
    goal: '',
    knowledge: '',
    extra: '',
    brandProtocol: ''
  });

  const initialized = useRef(false);

  // Initial Start
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    resetSession();
    setMessages([]);
    setError(null);
    setIsLoading(true);
    setCurrentPhase(SEOPhase.CONFIG);
    setConfigForm({
      keyword: '',
      audience: '',
      tone: '',
      goal: '',
      knowledge: '',
      extra: '',
      brandProtocol: ''
    });
    setInputValue('');
    setCopySuccess(false);
    setCopyRichSuccess(false);
    setLangMode('CN'); // Reset language to CN
    
    try {
      // 🟢 修改：有 Key 才初始化，没 Key 就不发请求以免报错
      if (apiKey) {
        await sendMessageToGemini(apiKey, "Initialize Auto-SEO Engine.", () => {});
      }
    } catch (err: any) {
      console.error("Failed to start session", err);
      setError(err.message || "Could not connect to Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation Logic
  const handleHome = () => {
    if (messages.length > 2 && currentPhase !== SEOPhase.CONFIG) {
        if (window.confirm("Return to Home? This will clear your current session data.")) {
            startSession();
        }
    } else {
        startSession();
    }
  };

  const handleBack = () => {
    if (currentPhase === SEOPhase.BLUEPRINT) {
        setCurrentPhase(SEOPhase.CONFIG);
    } else if (currentPhase === SEOPhase.GENERATION || currentPhase === SEOPhase.DONE) {
        setCurrentPhase(SEOPhase.BLUEPRINT);
    }
  };

  // Click Stepper Logic
  const canNavigateTo = (phase: SEOPhase): boolean => {
    if (phase === SEOPhase.CONFIG) return true;
    if (phase === SEOPhase.BLUEPRINT) return messages.length > 1; // Must have sent config
    if (phase === SEOPhase.GENERATION) {
      // Must have at least one response in model role to jump to generation (or be done)
      return messages.some(m => m.role === 'model' && m.content.length > 0);
    }
    return false;
  };

  const onPhaseClick = (phase: SEOPhase) => {
    if (canNavigateTo(phase)) {
      setCurrentPhase(phase);
    }
  };

  const submitConfiguration = () => {
    if (!apiKey.trim()) {
        alert("请先在页面顶部填入 Google API Key！");
        return;
    }
    if (!configForm.keyword || isLoading) return;

    // OPTIMIZATION: When submitting from Config, clear old messages and reset session
    // This ensures modified data triggers a FRESH generation process even if we just returned from Page 2.
    setMessages([]);
    resetSession();
    setLangMode('CN');

    const formattedConfig = `**Configuration Block**
Target Keyword: ${configForm.keyword}
Target Audience: ${configForm.audience || 'General Audience'}
Tone & Style: ${configForm.tone || 'Professional'}
Content Goal: ${configForm.goal || 'SEO Ranking'}

Brand Core Protocol (MUST ADHERE):
${configForm.brandProtocol || 'Standard Professional Voice (No specific protocol provided).'}

Reference Material/Competitor Content:
${configForm.knowledge || 'None provided.'}

Extra Prompts:
${configForm.extra || 'None.'}`;

    setCurrentPhase(SEOPhase.BLUEPRINT);
    handleSendMessage(formattedConfig, true);
  };

  const executeGeneration = () => {
    setCurrentPhase(SEOPhase.GENERATION);
    handleSendMessage("执行", true);
  };

  const handleSendMessage = async (contentToSend: string, hiddenFromView = false) => {
    // 🟢 插入检查
    if (!apiKey.trim()) {
      setError("请先在页面顶部填入 Google API Key！");
      return;
    }
    // ... 原来的 if (!contentToSend.trim() ...

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!hiddenFromView) setInputValue('');
    
    setIsLoading(true);
    setError(null);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'model',
      content: '', 
      timestamp: Date.now() + 1
    }]);

    try {
      let fullContent = '';
      // 🟢 修改：传入 apiKey
      await sendMessageToGemini(apiKey, userMsg.content, (chunkText) => {
        fullContent = chunkText;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, content: chunkText } : msg
        ));
      });
      
      if (currentPhase === SEOPhase.GENERATION && (fullContent.includes('```json') || fullContent.includes('〓〓EXTRAS〓〓'))) {
        setCurrentPhase(SEOPhase.DONE);
      }

    } catch (err: any) {
      console.error(err);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, content: "**Error**: " + (err.message || "Failed to generate response. Please try again.") } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayContent = () => {
    // For Blueprint: Find first model response that contains strategy
    // For Generation: Find model response that contains delimiters
    if (currentPhase === SEOPhase.BLUEPRINT) {
       const blueprintMsg = messages.find(m => m.role === 'model' && (m.content.includes('Blueprint') || m.content.includes('Strategy')));
       return blueprintMsg ? blueprintMsg.content : (messages.find(m => m.role === 'model')?.content || '');
    }
    const lastModelMsg = [...messages].reverse().find(m => m.role === 'model' && m.content.includes('〓〓'));
    return lastModelMsg ? lastModelMsg.content : '';
  };

  const handleCopyMarkdown = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCopyRichText = async () => {
    if (!articleRef.current) return;
    try {
      const html = articleRef.current.innerHTML;
      const text = articleRef.current.innerText;
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      const data = [new ClipboardItem({ 
          'text/html': blobHtml, 
          'text/plain': blobText 
      })];
      await navigator.clipboard.write(data);
      setCopyRichSuccess(true);
      setTimeout(() => setCopyRichSuccess(false), 2000);
    } catch (err) {
      console.error("Rich copy failed:", err);
      alert("Browser permissions blocked rich copy.");
    }
  };

  // --- UI Components ---
  const renderInputWindow = (
    title: string, 
    value: string, 
    field: keyof typeof configForm, 
    options: string[], 
    isTextArea = false,
    placeholder = "在此输入..."
  ) => (
    <div className="bg-white p-6 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(235,201,238,1)] hover:shadow-[6px_6px_0px_0px_rgba(199,240,201,1)] transition-all duration-300 group">
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="w-3 h-3 bg-[#EBC9EE] border border-slate-900"></div>
        {title}
      </h3>
      
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setConfigForm(prev => ({ ...prev, [field]: opt }))}
              className={`text-xs px-3 py-2 rounded border-2 font-bold transition-all text-left ${
                value === opt 
                  ? 'bg-[#EBC9EE] text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-900 hover:text-slate-900'
              }`}
            >
              {opt.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}

      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => setConfigForm(prev => ({ ...prev, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full text-sm p-4 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:bg-[#FDFBFD] outline-none min-h-[120px] transition-all font-medium placeholder-slate-400"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setConfigForm(prev => ({ ...prev, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full text-sm p-4 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:bg-[#FDFBFD] outline-none transition-all font-medium placeholder-slate-400"
        />
      )}
    </div>
  );

  const parseContentModules = (fullText: string) => {
    let metadata = '';
    let articleCn = '';
    let articleEn = '';
    let extras = '';
    const metadataParts = fullText.split('〓〓METADATA〓〓');
    if (metadataParts[1]) {
      const remainingAfterMeta = metadataParts[1];
      const articleCnParts = remainingAfterMeta.split('〓〓ARTICLE_CN〓〓');
      metadata = articleCnParts[0]; 
      if (articleCnParts[1]) {
        const remainingAfterCn = articleCnParts[1];
        const articleEnParts = remainingAfterCn.split('〓〓ARTICLE_EN〓〓');
        articleCn = articleEnParts[0];
        if (articleEnParts[1]) {
          const remainingAfterEn = articleEnParts[1];
          const extrasParts = remainingAfterEn.split('〓〓EXTRAS〓〓');
          articleEn = extrasParts[0];
          extras = extrasParts[1] || '';
        }
      }
    }
    return { metadata, articleCn, articleEn, extras };
  };

  // --- Views ---
  const renderConfigView = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-[#EBC9EE] border-2 border-slate-900 p-6 rounded-xl mb-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-24 h-24 text-white" /></div>
        <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Mission Config</h2>
        <p className="text-slate-900 font-medium">填写 7 个关键窗口，一键生成摩天大楼级 SEO 内容</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">{renderInputWindow("窗口 1: 核心关键词 (Target Keyword)", configForm.keyword, 'keyword', [], false, "例如：Best Running Shoes 2024")}</div>
        {renderInputWindow("窗口 2: 目标受众 (Audience)", configForm.audience, 'audience', AUDIENCE_OPTIONS)}
        {renderInputWindow("窗口 3: 语气风格 (Tone)", configForm.tone, 'tone', TONE_OPTIONS)}
        <div className="md:col-span-2">{renderInputWindow("窗口 4: 文章目标 (Goal)", configForm.goal, 'goal', GOAL_OPTIONS)}</div>
        <div className="md:col-span-2 border-t-2 border-slate-900/10 pt-4 mt-2">
           {renderInputWindow("窗口 7: 品牌底层协议 (Brand Core Protocol)", configForm.brandProtocol, 'brandProtocol', [], true, "在此输入品牌红线或通用原则...")}
        </div>
        <div className="md:col-span-2">{renderInputWindow("窗口 5: 知识库投喂 (Knowledge Base)", configForm.knowledge, 'knowledge', [], true, "在此粘贴竞品文章内容...")}</div>
        <div className="md:col-span-2">{renderInputWindow("窗口 6: 备注/额外提示 (Extra Prompts)", configForm.extra, 'extra', [], true, "特殊要求？")}</div>
      </div>
      <div className="mt-10 flex justify-center pb-8">
        <button
          onClick={submitConfiguration}
          disabled={!configForm.keyword.trim()}
          className={`flex items-center gap-3 px-10 py-4 rounded-xl text-xl font-black border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform transition-all active:translate-y-1 active:shadow-none ${!configForm.keyword.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border-slate-300' : 'bg-[#C7F0C9] text-slate-900 hover:bg-[#b0e8b3]'}`}
        >
          <Zap className="w-6 h-6 fill-current" />
          启动引擎 (Start Engine)
        </button>
      </div>
    </div>
  );

  const renderBlueprintView = () => {
    const content = getDisplayContent();
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#C7F0C9]">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded border border-slate-900 bg-[#EBC9EE] text-slate-900"><PenTool className="w-5 h-5" /></div>
             <div><h2 className="text-lg font-black text-slate-900 uppercase">Blueprint Strategy</h2></div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-slate-900 overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {content ? <MarkdownViewer content={content} /> : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <TypingIndicator /><p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-900">Designing...</p>
                </div>
              )}
              {isLoading && content && <div className="mt-4"><TypingIndicator /></div>}
           </div>
           <div className="border-t-2 border-slate-900 bg-[#F9F5FA] p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                 <div className="flex-1 w-full relative">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Feedback loop > Type changes here..."
                      className="w-full pl-4 pr-12 py-3 rounded-lg border-2 border-slate-300 focus:border-slate-900 focus:bg-white outline-none text-sm font-medium"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    />
                    <button onClick={() => handleSendMessage(inputValue)} disabled={!inputValue.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 rounded-md text-white hover:bg-slate-700 disabled:opacity-50"><ArrowRight className="w-4 h-4" /></button>
                 </div>
                 <button onClick={executeGeneration} disabled={isLoading || !content} className="w-full md:w-auto px-8 py-3 bg-[#C7F0C9] border-2 border-slate-900 text-slate-900 rounded-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-all hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Play className="w-5 h-5 fill-current" /> EXECUTE
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderGenerationView = () => {
    const rawContent = getDisplayContent();
    const { metadata, articleCn, articleEn, extras } = parseContentModules(rawContent);
    const currentArticleContent = langMode === 'CN' ? articleCn : articleEn;
    const isEnContentEmpty = langMode === 'EN' && !articleEn.trim();

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 h-full overflow-y-auto custom-scrollbar space-y-8 pb-20">
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#EBC9EE] overflow-hidden animate-fade-in-up">
           <div className="bg-[#EBC9EE] px-6 py-4 border-b-2 border-slate-900 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md text-[#EBC9EE]"><FileText className="w-4 h-4" /></div>
              <h3 className="font-black text-slate-900 uppercase tracking-wide">01. Metadata Assets</h3>
           </div>
           <div className="p-6">{metadata ? <MarkdownViewer content={metadata} /> : <div className="py-8 flex justify-center"><TypingIndicator /></div>}</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#C7F0C9] overflow-hidden animate-fade-in-up [animation-delay:0.1s]">
           <div className="bg-[#C7F0C9] px-6 py-4 border-b-2 border-slate-900 flex flex-wrap justify-between items-center sticky top-0 z-10 gap-3">
              <div className="flex items-center gap-2">
                 <div className="bg-slate-900 p-1.5 rounded-md text-[#C7F0C9]"><CheckCircle className="w-4 h-4" /></div>
                 <h3 className="font-black text-slate-900 uppercase tracking-wide mr-4">02. Article Content</h3>
                 <div className="flex bg-white rounded border-2 border-slate-900 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                   <button onClick={() => setLangMode('CN')} className={`px-3 py-1 text-xs font-black transition-colors ${langMode === 'CN' ? 'bg-slate-900 text-[#EBC9EE]' : 'text-slate-500 hover:text-slate-900'}`}>CN</button>
                   <div className="w-[2px] bg-slate-900"></div>
                   <button onClick={() => setLangMode('EN')} className={`px-3 py-1 text-xs font-black transition-colors flex items-center gap-1 ${langMode === 'EN' ? 'bg-slate-900 text-[#C7F0C9]' : 'text-slate-500 hover:text-slate-900'}`}>EN <Languages className="w-3 h-3" /></button>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={handleCopyRichText} disabled={isEnContentEmpty} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border-2 border-slate-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] disabled:opacity-50 ${copyRichSuccess ? 'bg-slate-900 text-[#EBC9EE]' : 'bg-[#EBC9EE] text-slate-900 hover:brightness-110'}`}>{copyRichSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : <FileType className="w-3.5 h-3.5" />} {copyRichSuccess ? 'COPIED!' : 'COPY FORMATTED'}</button>
                 <button onClick={() => handleCopyMarkdown(currentArticleContent)} disabled={isEnContentEmpty} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded border-2 border-slate-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] disabled:opacity-50 ${copySuccess ? 'bg-slate-900 text-[#C7F0C9]' : 'bg-white text-slate-900 hover:bg-slate-50'}`}>{copySuccess ? <CheckCircle className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />} {copySuccess ? 'COPIED!' : 'COPY MD'}</button>
              </div>
           </div>
           <div className="p-8 min-h-[300px]" ref={articleRef}>
              {currentArticleContent ? <MarkdownViewer content={currentArticleContent} /> : (
                <div className="h-40 flex items-center justify-center text-slate-400">
                   <div className="text-center">
                     {isEnContentEmpty && articleCn ? (
                       <><div className="flex items-center gap-2 justify-center mb-2"><RefreshCw className="w-5 h-5 animate-spin" /><span className="font-bold text-slate-900">Generating English Version...</span></div></>
                     ) : (
                       <><TypingIndicator /><p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Writing...</p></>
                     )}
                   </div>
                </div>
              )}
           </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#EBC9EE] overflow-hidden animate-fade-in-up [animation-delay:0.2s]">
           <div className="bg-[#EBC9EE] px-6 py-4 border-b-2 border-slate-900 flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md text-[#EBC9EE]"><LinkIcon className="w-4 h-4" /></div>
              <h3 className="font-black text-slate-900 uppercase tracking-wide">03. Technical Extras</h3>
           </div>
           <div className="p-6">{extras ? <MarkdownViewer content={extras} /> : <div className="py-4 text-center text-slate-400 text-sm font-bold">{isLoading ? 'Processing Schema...' : 'Waiting...'}</div>}</div>
        </div>
        {(currentPhase === SEOPhase.DONE) && (
           <div className="flex justify-center pb-10"><button onClick={startSession} className="px-8 py-3 bg-slate-900 text-white border-2 border-slate-900 rounded-lg hover:bg-slate-800 font-bold shadow-[4px_4px_0px_0px_#C7F0C9] flex items-center gap-2 transition-all hover:-translate-y-1"><RefreshCw className="w-4 h-4" /> NEW MISSION</button></div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9F5FA] overflow-hidden">
    {/* 🟢 插入：顶部 API Key 输入栏 */}
      <div className="bg-slate-900 text-white p-3 border-b-4 border-slate-900 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 font-black text-sm tracking-tighter">
                <span className="bg-[#ffeb3b] text-black px-2 py-0.5 rounded-sm transform -rotate-2">API</span>
                <span>SETTINGS</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-800 p-1 rounded border border-slate-700">
                <Key size={14} className="text-[#ffeb3b] ml-2 shrink-0" />
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="在此粘贴 Google Gemini API Key (以 AIza 开头)..."
                    className="bg-transparent border-none text-white text-sm focus:ring-0 w-full sm:w-80 placeholder-slate-500 font-mono"
                />
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs bg-[#ffeb3b] text-black px-2 py-1.5 font-bold hover:bg-white rounded-sm whitespace-nowrap">GET KEY</a>
            </div>
        </div>
      </div>
      {/* 🟢 插入结束，下面是你原来的 <header ... */}
      <header className="bg-[#EBC9EE] border-b-2 border-slate-900 z-20 shadow-sm relative">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
             {currentPhase !== SEOPhase.CONFIG && (
                <button onClick={handleBack} className="p-2 bg-white border-2 border-slate-900 rounded-lg hover:bg-slate-50 transition-transform active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><ArrowLeft className="w-5 h-5" /></button>
             )}
            <button onClick={handleHome} className="flex items-center gap-3 group focus:outline-none">
                <div className="bg-slate-900 p-2 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all"><Zap className="text-[#EBC9EE] w-5 h-5 fill-current" /></div>
                <div className="text-left"><h1 className="text-lg font-black text-slate-900 tracking-tighter leading-none group-hover:underline decoration-2 underline-offset-2">SEO-CREATOR</h1><p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">PRO ENGINE</p></div>
            </button>
          </div>
          <PhaseStepper currentPhase={currentPhase} onPhaseClick={onPhaseClick} canNavigateTo={canNavigateTo} />
        </div>
      </header>
      <main className="flex-1 overflow-hidden relative">
        {error && (
             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border-2 border-red-500 px-4 py-2 rounded-lg flex items-center gap-2 text-red-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><AlertCircle className="w-5 h-5" /><span className="text-sm font-bold">{error}</span><button onClick={startSession} className="text-xs underline ml-2 font-bold hover:text-red-900">RETRY</button></div>
        )}
        {currentPhase === SEOPhase.CONFIG && <div className="h-full overflow-y-auto custom-scrollbar">{renderConfigView()}</div>}
        {currentPhase === SEOPhase.BLUEPRINT && renderBlueprintView()}
        {(currentPhase === SEOPhase.GENERATION || currentPhase === SEOPhase.DONE) && renderGenerationView()}
      </main>
    </div>
  );
};

export default App;