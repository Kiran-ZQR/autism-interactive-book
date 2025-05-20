import { useState } from 'react';
import storyData from '../data/storyData';
import { StoryPage as StoryPageComponent } from './StoryPage';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

/* ----------- 类型 ----------- */
interface UserResponse {
  pageId: number;
  response: string;
}
type AnalysisReport = ReturnType<typeof buildEmptyReport>;

const buildEmptyReport = () => ({
  completedInteractions: 0,
  totalInteractions: 0,
  scores: {
    languageVocabulary: 0,
    logicalThinking: 0,
    socialAdaptation: 0,
    emotionalRecognition: 0
  },
  recommendations: {
    languageVocabulary: '',
    logicalThinking: '',
    socialAdaptation: '',
    emotionalRecognition: '',
    overall: ''
  }
});

/* =================================================================== */
export function StoryContainer() {
  /* ---------- state ---------- */
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport>(buildEmptyReport);

  /* ---------- 计算量 ---------- */
  const totalPages = storyData.pages.length;
  const progress = ((currentPageIndex + 1) / totalPages) * 100;
  const currentPage = storyData.pages[currentPageIndex];

  /* ---------- 翻页 ---------- */
  const handleNext = () => {
    window.speechSynthesis.cancel();
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(idx => idx + 1);
      window.scrollTo(0, 0);
    } else {
      generateReport();
    }
  };

  const handlePrevious = () => {
    window.speechSynthesis.cancel();
    if (currentPageIndex > 0) {
      setCurrentPageIndex(idx => idx - 1);
      window.scrollTo(0, 0);
    }
  };

  /* ---------- 保存回答 ---------- */
  const handleResponseSubmit = (pageId: number, response: string) => {
    setUserResponses(prev => {
      const idx = prev.findIndex(r => r.pageId === pageId);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { pageId, response };
        return clone;
      }
      return [...prev, { pageId, response }];
    });
  };

  /* ---------- 进入故事 ---------- */
  const startStory = () => setShowIntro(false);

  /* ---------- 生成报告 ---------- */
  const generateReport = () => {
    const interactivePages = storyData.pages.filter(p => p.isInteractive);
    const completed = userResponses.length;

    let lang = 0, logic = 0, social = 0, emotion = 0;

    userResponses.forEach(({ response }) => {
      const text = response.toLowerCase();
      const words = text.split(/\s+/);
      const unique = new Set(words);

      lang += Math.min(words.length / 5, 5) + Math.min(unique.size / 3, 5);

      const logicWords   = ['因为','所以','如果','但是','然后','接着','首先','其次','最后'];
      const socialWords  = ['朋友','一起','帮助','分享','谢谢','请','对不起','合作','玩'];
      const emotionWords = ['高兴','难过','害怕','生气','担心','开心','喜欢','爱','紧张','兴奋'];
      const count = (arr: string[]) => arr.filter(w => text.includes(w)).length;

      logic   += Math.min(count(logicWords)   * 2, 5);
      social  += Math.min(count(socialWords)  * 2, 5);
      emotion += Math.min(count(emotionWords) * 2, 5);
    });

    const norm = (s: number) =>
      completed ? Math.min(Math.round((s / completed) * 10) / 10, 5) : 0;

    const report: AnalysisReport = {
      completedInteractions: completed,
      totalInteractions: interactivePages.length,
      scores: {
        languageVocabulary : norm(lang),
        logicalThinking    : norm(logic),
        socialAdaptation   : norm(social),
        emotionalRecognition: norm(emotion)
      },
      recommendations: generateRecommendations(
        norm(lang), norm(logic), norm(social), norm(emotion)
      )
    };

    setAnalysisReport(report);
    setShowReport(true);
  };

  /* ---------- 建议 ---------- */
  const generateRecommendations = (
    languageScore: number,
    logicScore: number,
    socialScore: number,
    emotionalScore: number
  ) => {
    const rec = {
      languageVocabulary: '',
      logicalThinking: '',
      socialAdaptation: '',
      emotionalRecognition: '',
      overall: ''
    };
    /* —— 下面保留你原来的评分→文字逻辑 —— */
    // …（此处保持与之前相同的 if/else 赋值）…
    return rec;
  };

  /* ---------- 重开 ---------- */
  const restartStory = () => {
    setCurrentPageIndex(0);
    setUserResponses([]);
    setShowReport(false);
    setShowIntro(true);
  };

  /* ================================================================= */
  /* --------------------------- Intro ------------------------------- */
  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">{storyData.title}</h1>
          <div className="mb-6">
            <p className="text-lg mb-4">
              这是一个为 {storyData.ageGroup} 自闭症儿童设计的交互式绘本，
              主题是 “{storyData.theme}”。
            </p>
            <p className="mb-4">在这个故事中，你将跟随小熊波波的冒险，学习友谊的重要性。</p>
            <p className="mb-4">故事中有 {storyData.pages.filter(p => p.isInteractive).length} 个交互环节，你需要回答问题，帮助波波做出选择。</p>
            <p className="mb-4">完成后系统会生成评估报告，分析语言、逻辑、社交与情感 4 个维度。</p>
            <p className="mb-4 font-semibold text-blue-600">
              支持语音朗读和语音输入，让体验更加便捷！
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={startStory} size="lg">开始阅读</Button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------- Report ------------------------------ */
  if (showReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            自闭症儿童语言交互能力评估报告
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">基本信息</h2>
            <p>年龄段：{storyData.ageGroup}</p>
            <p>绘本主题：{storyData.theme}</p>
            <p>
              完成交互环节数量：{analysisReport.completedInteractions}/
              {analysisReport.totalInteractions}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">能力维度评估（满分 5 分）</h2>

            {(
              Object.entries(analysisReport.scores) as
              Array<[keyof typeof analysisReport.scores, number]>
            ).map(([k, v]) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>
                    {{
                      languageVocabulary: '语言词汇量',
                      logicalThinking: '思维逻辑',
                      socialAdaptation: '社会适应',
                      emotionalRecognition: '情感识别'
                    }[k]}
                    ：{v} 分
                  </span>
                  <span>{v}/5</span>
                </div>
                <Progress value={v * 20} className="h-2" />
              </div>
            ))}
          </div>

          {/* 建议文字 */}
          <div className="mb-6 space-y-4">
            {Object.entries(analysisReport.recommendations).map(([k, v]) =>
              k !== 'overall' ? (
                <div key={k}>
                  <h3 className="font-medium">
                    {{
                      languageVocabulary: '语言词汇量',
                      logicalThinking: '思维逻辑',
                      socialAdaptation: '社会适应',
                      emotionalRecognition: '情感识别'
                    }[k as keyof typeof analysisReport.recommendations]}
                  </h3>
                  <p>{v}</p>
                </div>
              ) : null
            )}
            <div>
              <h3 className="font-medium">整体建议</h3>
              <p>{analysisReport.recommendations.overall}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={restartStory} size="lg">重新开始</Button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------- 主故事 ------------------------------ */
  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center">{storyData.title}</h1>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                第 {currentPageIndex + 1} 页，共 {totalPages} 页
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </header>

        <StoryPageComponent
          page={currentPage}
          onNext={handleNext}
          onResponseSubmit={handleResponseSubmit}
          userResponses={userResponses}
        />

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPageIndex === 0}
          >
            上一页
          </Button>

          {!currentPage.isInteractive && (
            <Button
              onClick={handleNext}
              disabled={currentPageIndex === totalPages - 1}
            >
              {currentPageIndex === totalPages - 1 ? '完成阅读' : '下一页'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}