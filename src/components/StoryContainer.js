"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryContainer = StoryContainer;
/* ──────────────── StoryContainer.tsx ──────────────── */
var react_1 = require("react");
var storyData_1 = require("../data/storyData");
var StoryPage_1 = require("./StoryPage");
var ReportCharts_1 = require("../components/ReportCharts");
var button_1 = require("./ui/button");
var progress_1 = require("./ui/progress");
var buildEmptyReport = function () { return ({
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
}); };
/* =================================================================== */
function StoryContainer() {
    /* ---------- state ---------- */
    var _a = (0, react_1.useState)(0), currentPageIndex = _a[0], setCurrentPageIndex = _a[1];
    var _b = (0, react_1.useState)([]), userResponses = _b[0], setUserResponses = _b[1];
    var _c = (0, react_1.useState)(true), showIntro = _c[0], setShowIntro = _c[1];
    var _d = (0, react_1.useState)(false), showReport = _d[0], setShowReport = _d[1];
    var _e = (0, react_1.useState)(buildEmptyReport()), analysisReport = _e[0], setAnalysisReport = _e[1];
    /* ---------- 派生 ---------- */
    var totalPages = storyData_1.default.pages.length;
    var progress = ((currentPageIndex + 1) / totalPages) * 100;
    var currentPage = storyData_1.default.pages[currentPageIndex];
    /* ---------- 翻页 ---------- */
    var handleNext = function () {
        window.speechSynthesis.cancel();
        if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(function (i) { return i + 1; });
            window.scrollTo(0, 0);
        }
        else {
            generateReport();
        }
    };
    var handlePrevious = function () {
        window.speechSynthesis.cancel();
        if (currentPageIndex > 0) {
            setCurrentPageIndex(function (i) { return i - 1; });
            window.scrollTo(0, 0);
        }
    };
    /* ---------- 保存回答 ---------- */
    var handleResponseSubmit = function (pageId, response) {
        setUserResponses(function (prev) {
            var idx = prev.findIndex(function (r) { return r.pageId === pageId; });
            if (idx >= 0) {
                var clone = __spreadArray([], prev, true);
                clone[idx] = { pageId: pageId, response: response };
                return clone;
            }
            return __spreadArray(__spreadArray([], prev, true), [{ pageId: pageId, response: response }], false);
        });
    };
    /* ---------- 开始 / 重开 ---------- */
    var startStory = function () { return setShowIntro(false); };
    var restartStory = function () {
        setCurrentPageIndex(0);
        setUserResponses([]);
        setShowReport(false);
        setShowIntro(true);
    };
    /* ---------- 生成报告 ---------- */
    var generateReport = function () {
        var interactivePages = storyData_1.default.pages.filter(function (p) { return p.isInteractive; });
        var completed = userResponses.length;
        var lang = 0, logic = 0, social = 0;
        var narrative = 0, interaction = 0;
        userResponses.forEach(function (_a) {
            var response = _a.response;
            var text = response.toLowerCase();
            var words = text.split(/\s+/);
            var unique = new Set(words);
            lang += Math.min(words.length / 5, 5) + Math.min(unique.size / 3, 5);
            var logicWords = ['因为', '所以', '如果', '但是', '然后', '接着', '首先', '其次', '最后'];
            var socialWords = ['朋友', '一起', '帮助', '分享', '谢谢', '请', '对不起', '合作', '玩'];
            var narrativeWords = ['故事', '开头', '结尾', '发生', '经过', '情节', '描述'];
            var interactionWords = ['对话', '互动', '问', '答', '说', '请', '一起', '合作'];
            var count = function (arr) { return arr.filter(function (w) { return text.includes(w); }).length; };
            logic += Math.min(count(logicWords) * 2, 5);
            social += Math.min(count(socialWords) * 2, 5);
            narrative += Math.min(count(narrativeWords) * 2, 5);
            interaction += Math.min(count(interactionWords) * 2, 5);
        });
        var norm = function (s) {
            return completed ? Math.min(Math.round((s / completed) * 10) / 10, 5) : 0;
        };
        var scores = {
            languageVocabulary: norm(lang),
            socialAdaptation: norm(social),
            logicalThinking: norm(logic),
            narrative: norm(narrative),
            interaction: norm(interaction),
        };
        var report = {
            completedInteractions: completed,
            totalInteractions: interactivePages.length,
            scores: scores,
            recommendations: generateRecommendations(scores.languageVocabulary, scores.logicalThinking, scores.socialAdaptation, scores.narrative, scores.interaction),
            history: [
                { week: '2024-04', languageVocabulary: 2, socialAdaptation: 3, logicalThinking: 2, narrative: 2, interaction: 4 },
                { week: '2024-05', languageVocabulary: 2.5, socialAdaptation: 3.5, logicalThinking: 2, narrative: 2.5, interaction: 4.5 },
                { week: '2024-06', languageVocabulary: 3, socialAdaptation: 4, logicalThinking: 2, narrative: 3, interaction: 5 },
                { week: '本次', languageVocabulary: scores.languageVocabulary, socialAdaptation: scores.socialAdaptation, logicalThinking: scores.logicalThinking, narrative: scores.narrative, interaction: scores.interaction }
            ]
        };
        setAnalysisReport(report);
        setShowReport(true);
    };
    /* ---------- 建议文字 ---------- */
    var generateRecommendations = function (language, logic, social, narrative, interaction) {
        var r = {
            languageVocabulary: '',
            logicalThinking: '',
            socialAdaptation: '',
            narrative: '',
            interaction: '',
            overall: ''
        };
        if (language < 3)
            r.languageVocabulary = '可以多尝试新词汇的表达～';
        if (logic < 3)
            r.logicalThinking = '尝试“因为…所以…”等句式练习逻辑思考';
        if (social < 3)
            r.socialAdaptation = '多练习与他人合作与分享';
        if (narrative < 3)
            r.narrative = '尝试用“开头、经过、结尾”描述小故事';
        if (interaction < 3)
            r.interaction = '可以多进行问答/情景对话模拟';
        r.overall = '继续坚持练习，能力会有更大提升哦！';
        return r;
    };
    /* ================================================================= */
    /* --------------------------- Intro ------------------------------- */
    if (showIntro) {
        return (<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">{storyData_1.default.title}</h1>
          {/* … Intro 描述自行补充 … */}
          <div className="flex justify-center">
            <button_1.Button onClick={startStory} size="lg">开始阅读</button_1.Button>
          </div>
        </div>
      </div>);
    }
    /* --------------------------- Report ------------------------------ */
    if (showReport && analysisReport) {
        return (<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            自闭症儿童语言交互能力评估报告
          </h1>

          {/* ----- 基本信息 ------ */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">基本信息</h2>
            <p>年龄段：{storyData_1.default.ageGroup}</p>
            <p>绘本主题：{storyData_1.default.theme}</p>
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
            <ReportCharts_1.ReportCharts scores={analysisReport.scores} history={analysisReport.history}/>
            <h3 className="text-lg font-bold mt-4 mb-2">细分技能趋势</h3>
            {/* 可加 LineChart 或其它趋势可视化 */}
            <blockquote className="border-l-4 border-blue-400 pl-4 italic mb-2 text-gray-800">
              “小熊丢了玩具，它感觉怎样？”<br />
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
            <button_1.Button onClick={restartStory} size="lg">重新开始</button_1.Button>
          </div>
        </div>
      </div>);
    }
    /* --------------------------- 主故事 ------------------------------ */
    return (<div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-center">{storyData_1.default.title}</h1>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>第 {currentPageIndex + 1} 页 · 共 {totalPages} 页</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <progress_1.Progress value={progress} className="h-2"/>
          </div>
        </header>

        <StoryPage_1.StoryPage page={currentPage} onNext={handleNext} onResponseSubmit={handleResponseSubmit} userResponses={userResponses}/>

        <div className="flex justify-between mt-6">
          <button_1.Button variant="outline" onClick={handlePrevious} disabled={currentPageIndex === 0}>
            上一页
          </button_1.Button>
          {!currentPage.isInteractive && (<button_1.Button onClick={handleNext} disabled={currentPageIndex === totalPages - 1}>
              {currentPageIndex === totalPages - 1 ? '完成阅读' : '下一页'}
            </button_1.Button>)}
        </div>
      </div>
    </div>);
}
