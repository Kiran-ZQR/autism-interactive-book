/* ──────────────── StoryContainer.tsx ──────────────── */
import { useState } from 'react'
import storyData from '../data/storyData'
import { StoryPage as StoryPageComponent } from './StoryPage'
import { ReportCharts } from '../components/ReportCharts'
import { Button }   from './ui/button'
import { Progress } from './ui/progress'

/* ---------- 数据类型 ---------- */
interface UserResponse {
  pageId: number
  response: string
}
type ScoreSet = {
  languageVocabulary: number
  socialAdaptation: number
  logicalThinking: number
  narrative: number
  interaction: number
}
interface AnalysisReport {
  completedInteractions: number
  totalInteractions: number
  scores: ScoreSet
  recommendations: {
    languageVocabulary: string
    logicalThinking: string
    socialAdaptation: string
    narrative: string
    interaction: string
    overall: string
  }
  history: Array<{
    week: string
    languageVocabulary: number
    socialAdaptation: number
    logicalThinking: number
    narrative: number
    interaction: number
  }>
}

const buildEmptyReport = (): AnalysisReport => ({
  completedInteractions: 0,
  totalInteractions: 0,
  scores: {
    languageVocabulary: 0,
    socialAdaptation: 0,
    logicalThinking: 0,
    narrative: 0,
    interaction: 0,
  },
  recommendations: {
    languageVocabulary: '',
    logicalThinking: '',
    socialAdaptation: '',
    narrative: '',
    interaction: '',
    overall: ''
  },
  history: []
})

/* =================================================================== */
export function StoryContainer () {
  /* ---------- state ---------- */
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [userResponses,    setUserResponses]    = useState<UserResponse[]>([])
  const [showIntro,        setShowIntro]        = useState(true)
  const [showReport,       setShowReport]       = useState(false)
  const [analysisReport,   setAnalysisReport]   = useState<AnalysisReport>(buildEmptyReport())

  /* ---------- 派生 ---------- */
  const totalPages  = storyData.pages.length
  const progress    = ((currentPageIndex + 1) / totalPages) * 100
  const currentPage = storyData.pages[currentPageIndex]

  /* ---------- 翻页 ---------- */
  const handleNext = () => {
    window.speechSynthesis.cancel()
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(i => i + 1)
      window.scrollTo(0, 0)
    } else {
      generateReport()
    }
  }
  const handlePrevious = () => {
    window.speechSynthesis.cancel()
    if (currentPageIndex > 0) {
      setCurrentPageIndex(i => i - 1)
      window.scrollTo(0, 0)
    }
  }

  /* ---------- 保存回答 ---------- */
  const handleResponseSubmit = (pageId:number, response:string) => {
    setUserResponses(prev => {
      const idx = prev.findIndex(r => r.pageId === pageId)
      if (idx >= 0) {
        const clone = [...prev]
        clone[idx] = { pageId, response }
        return clone
      }
      return [...prev, { pageId, response }]
    })
  }

  /* ---------- 开始 / 重开 ---------- */
  const startStory   = () => setShowIntro(false)
  const restartStory = () => {
    setCurrentPageIndex(0)
    setUserResponses([])
    setShowReport(false)
    setShowIntro(true)
  }

  /* ---------- 生成报告 ---------- */
  const generateReport = () => {
    const interactivePages = storyData.pages.filter(p => p.isInteractive)
    const completed        = userResponses.length

    let lang = 0, logic = 0, social = 0
    let narrative = 0, interaction = 0

    userResponses.forEach(({ response }) => {
      const text   = response.toLowerCase()
      const words  = text.split(/\s+/)
      const unique = new Set(words)

      lang += Math.min(words.length / 5, 5) + Math.min(unique.size / 3, 5)

      const logicWords   = ['因为','所以','如果','但是','然后','接着','首先','其次','最后']
      const socialWords  = ['朋友','一起','帮助','分享','谢谢','请','对不起','合作','玩']
      const narrativeWords = ['故事', '开头', '结尾', '发生', '经过', '情节', '描述']
      const interactionWords = ['对话', '互动', '问', '答', '说', '请', '一起', '合作']

      const count = (arr:string[]) => arr.filter(w => text.includes(w)).length

      logic      += Math.min(count(logicWords)   * 2, 5)
      social     += Math.min(count(socialWords)  * 2, 5)
      narrative  += Math.min(count(narrativeWords) * 2, 5)
      interaction+= Math.min(count(interactionWords) * 2, 5)
    })

    const norm = (s:number) =>
      completed ? Math.min(Math.round((s / completed) * 10) / 10, 5) : 0

    const scores: ScoreSet = {
      languageVocabulary : norm(lang),
      socialAdaptation   : norm(social),
      logicalThinking    : norm(logic),
      narrative          : norm(narrative),
      interaction        : norm(interaction),
    }

    const report:AnalysisReport = {
      completedInteractions: completed,
      totalInteractions: interactivePages.length,
      scores,
      recommendations: generateRecommendations(
        scores.languageVocabulary,
        scores.logicalThinking,
        scores.socialAdaptation,
        scores.narrative,
        scores.interaction
      ),
      history: [
        { week:'2024-04', languageVocabulary:2, socialAdaptation:3, logicalThinking:2, narrative:2, interaction:4 },
        { week:'2024-05', languageVocabulary:2.5, socialAdaptation:3.5, logicalThinking:2, narrative:2.5, interaction:4.5 },
        { week:'2024-06', languageVocabulary:3, socialAdaptation:4, logicalThinking:2, narrative:3, interaction:5 },
        { week:'本次',    languageVocabulary: scores.languageVocabulary, socialAdaptation: scores.socialAdaptation, logicalThinking: scores.logicalThinking, narrative: scores.narrative, interaction: scores.interaction }
      ]
    }
    setAnalysisReport(report)
    setShowReport(true)
  }

  /* ---------- 建议文字 ---------- */
  const generateRecommendations = (
    language:number, logic:number, social:number, narrative:number, interaction:number
  ) => {
    const r = {
      languageVocabulary: '',
      logicalThinking:    '',
      socialAdaptation:   '',
      narrative:          '',
      interaction:        '',
      overall: ''
    }
    if (language < 3) r.languageVocabulary = '可以多尝试新词汇的表达～'
    if (logic < 3) r.logicalThinking = '尝试“因为…所以…”等句式练习逻辑思考'
    if (social < 3) r.socialAdaptation = '多练习与他人合作与分享'
    if (narrative < 3) r.narrative = '尝试用“开头、经过、结尾”描述小故事'
    if (interaction < 3) r.interaction = '可以多进行问答/情景对话模拟'
    r.overall = '继续坚持练习，能力会有更大提升哦！'
    return r
  }

  /* ================================================================= */
  /* --------------------------- Intro ------------------------------- */
  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">{storyData.title}</h1>
          {/* … Intro 描述自行补充 … */}
          <div className="flex justify-center">
            <Button onClick={startStory} size="lg">开始阅读</Button>
          </div>
        </div>
      </div>
    )
  }

  /* --------------------------- Report ------------------------------ */
  if (showReport && analysisReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            自闭症儿童语言交互能力评估报告
          </h1>

          {/* ----- 基本信息 ------ */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">基本信息</h2>
            <p>年龄段：{storyData.ageGroup}</p>
            <p>绘本主题：{storyData.theme}</p>
            <p>
              完成交互环节：{analysisReport.completedInteractions}/
              {analysisReport.totalInteractions}
            </p>
          </div>

          {/* ----- 丰富分析内容 ------ */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-2">本周亮点</h3>
            <ul className="list-disc list-inside mb-4 text-blue-700">
              <li>主动打招呼 5 次</li>
              <li>完成 3 次情绪配对小游戏</li>
              <li>把 4 格小故事连成完整情节</li>
            </ul>
            <h3 className="text-lg font-bold mb-2">四大核心技能雷达图</h3>
            <ReportCharts
              scores={analysisReport.scores}
              history={analysisReport.history}
            />
            <h3 className="text-lg font-bold mt-4 mb-2">细分技能趋势</h3>
            {/* 可加 LineChart 或其它趋势可视化 */}
            <blockquote className="border-l-4 border-blue-400 pl-4 italic mb-2 text-gray-800">
              “小熊丢了玩具，它感觉怎样？”<br/>
              孩子：“它难过，要别人帮忙找。”
            </blockquote>
            <h3 className="text-lg font-bold mt-4 mb-2">下周个性化目标</h3>
            <ul className="list-disc list-inside text-green-700">
              <li>句子长度提升至 6.8 词</li>
              <li>正确辨认“悲伤”表情达到 80%</li>
              <li>完成一次“协商轮流”互动剧本</li>
            </ul>
          </div>

          {/* ----- 文字建议 (可保留/美化) ------ */}
          <div className="mb-6 space-y-4">
            <div>
              <b>语言词汇：</b>{analysisReport.recommendations.languageVocabulary}
            </div>
            <div>
              <b>思维逻辑：</b>{analysisReport.recommendations.logicalThinking}
            </div>
            <div>
              <b>社会适应：</b>{analysisReport.recommendations.socialAdaptation}
            </div>
            <div>
              <b>叙事能力：</b>{analysisReport.recommendations.narrative}
            </div>
            <div>
              <b>互动表达：</b>{analysisReport.recommendations.interaction}
            </div>
            <div>
              <b>整体建议：</b>{analysisReport.recommendations.overall}
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={restartStory} size="lg">重新开始</Button>
          </div>
        </div>
      </div>
    )
  }

  /* --------------------------- 主故事 ------------------------------ */
  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center">{storyData.title}</h1>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>第 {currentPageIndex + 1} 页 · 共 {totalPages} 页</span>
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
          <Button variant="outline" onClick={handlePrevious} disabled={currentPageIndex === 0}>
            上一页
          </Button>
          {!currentPage.isInteractive && (
            <Button onClick={handleNext} disabled={currentPageIndex === totalPages - 1}>
              {currentPageIndex === totalPages - 1 ? '完成阅读' : '下一页'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
