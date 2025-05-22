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
var react_1 = require("react");
var storyData_1 = require("../data/storyData");
var StoryPage_1 = require("./StoryPage");
var button_1 = require("../ui/button");
var progress_1 = require("../ui/progress");
var buildEmptyReport = function () { return ({
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
}); };
/* =================================================================== */
function StoryContainer() {
    /* ---------- state ---------- */
    var _a = (0, react_1.useState)(0), currentPageIndex = _a[0], setCurrentPageIndex = _a[1];
    var _b = (0, react_1.useState)([]), userResponses = _b[0], setUserResponses = _b[1];
    var _c = (0, react_1.useState)(true), showIntro = _c[0], setShowIntro = _c[1];
    var _d = (0, react_1.useState)(false), showReport = _d[0], setShowReport = _d[1];
    var _e = (0, react_1.useState)(buildEmptyReport), analysisReport = _e[0], setAnalysisReport = _e[1];
    /* ---------- 计算量 ---------- */
    var totalPages = storyData_1.default.pages.length;
    var progress = ((currentPageIndex + 1) / totalPages) * 100;
    var currentPage = storyData_1.default.pages[currentPageIndex];
    /* ---------- 翻页 ---------- */
    var handleNext = function () {
        window.speechSynthesis.cancel();
        if (currentPageIndex < totalPages - 1) {
            setCurrentPageIndex(function (idx) { return idx + 1; });
            window.scrollTo(0, 0);
        }
        else {
            generateReport();
        }
    };
    var handlePrevious = function () {
        window.speechSynthesis.cancel();
        if (currentPageIndex > 0) {
            setCurrentPageIndex(function (idx) { return idx - 1; });
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
    /* ---------- 进入故事 ---------- */
    var startStory = function () { return setShowIntro(false); };
    /* ---------- 生成报告 ---------- */
    var generateReport = function () {
        var interactivePages = storyData_1.default.pages.filter(function (p) { return p.isInteractive; });
        var completed = userResponses.length;
        var lang = 0, logic = 0, social = 0, emotion = 0;
        userResponses.forEach(function (_a) {
            var response = _a.response;
            var text = response.toLowerCase();
            var words = text.split(/\s+/);
            var unique = new Set(words);
            lang += Math.min(words.length / 5, 5) + Math.min(unique.size / 3, 5);
            var logicWords = ['因为', '所以', '如果', '但是', '然后', '接着', '首先', '其次', '最后'];
            var socialWords = ['朋友', '一起', '帮助', '分享', '谢谢', '请', '对不起', '合作', '玩'];
            var emotionWords = ['高兴', '难过', '害怕', '生气', '担心', '开心', '喜欢', '爱', '紧张', '兴奋'];
            var count = function (arr) { return arr.filter(function (w) { return text.includes(w); }).length; };
            logic += Math.min(count(logicWords) * 2, 5);
            social += Math.min(count(socialWords) * 2, 5);
            emotion += Math.min(count(emotionWords) * 2, 5);
        });
        var norm = function (s) {
            return completed ? Math.min(Math.round((s / completed) * 10) / 10, 5) : 0;
        };
        var report = {
            completedInteractions: completed,
            totalInteractions: interactivePages.length,
            scores: {
                languageVocabulary: norm(lang),
                logicalThinking: norm(logic),
                socialAdaptation: norm(social),
                emotionalRecognition: norm(emotion)
            },
            recommendations: generateRecommendations(norm(lang), norm(logic), norm(social), norm(emotion))
        };
        setAnalysisReport(report);
        setShowReport(true);
    };
    /* ---------- 建议 ---------- */
    var generateRecommendations = function (languageScore, logicScore, socialScore, emotionalScore) {
        var rec = {
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
    var restartStory = function () {
        setCurrentPageIndex(0);
        setUserResponses([]);
        setShowReport(false);
        setShowIntro(true);
    };
    /* ================================================================= */
    /* --------------------------- Intro ------------------------------- */
    if (showIntro) {
        return (<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">{storyData_1.default.title}</h1>
          <div className="mb-6">
            <p className="text-lg mb-4">
              这是一个为 {storyData_1.default.ageGroup} 自闭症儿童设计的交互式绘本，
              主题是 “{storyData_1.default.theme}”。
            </p>
            <p className="mb-4">在这个故事中，你将跟随小熊波波的冒险，学习友谊的重要性。</p>
            <p className="mb-4">故事中有 {storyData_1.default.pages.filter(function (p) { return p.isInteractive; }).length} 个交互环节，你需要回答问题，帮助波波做出选择。</p>
            <p className="mb-4">完成后系统会生成评估报告，分析语言、逻辑、社交与情感 4 个维度。</p>
            <p className="mb-4 font-semibold text-blue-600">
              支持语音朗读和语音输入，让体验更加便捷！
            </p>
          </div>
          <div className="flex justify-center">
            <button_1.Button onClick={startStory} size="lg">开始阅读</button_1.Button>
          </div>
        </div>
      </div>);
    }
    /* --------------------------- Report ------------------------------ */
    if (showReport) {
        return (<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-amber-50">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            自闭症儿童语言交互能力评估报告
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">基本信息</h2>
            <p>年龄段：{storyData_1.default.ageGroup}</p>
            <p>绘本主题：{storyData_1.default.theme}</p>
            <p>
              完成交互环节数量：{analysisReport.completedInteractions}/
              {analysisReport.totalInteractions}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">能力维度评估（满分 5 分）</h2>

            {Object.entries(analysisReport.scores).map(function (_a) {
                var k = _a[0], v = _a[1];
                return (<div key={k} className="mb-3">
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
                <progress_1.Progress value={v * 20} className="h-2"/>
              </div>);
            })}
          </div>

          {/* 建议文字 */}
          <div className="mb-6 space-y-4">
            {Object.entries(analysisReport.recommendations).map(function (_a) {
                var k = _a[0], v = _a[1];
                return k !== 'overall' ? (<div key={k}>
                  <h3 className="font-medium">
                    {{
                        languageVocabulary: '语言词汇量',
                        logicalThinking: '思维逻辑',
                        socialAdaptation: '社会适应',
                        emotionalRecognition: '情感识别'
                    }[k]}
                  </h3>
                  <p>{v}</p>
                </div>) : null;
            })}
            <div>
              <h3 className="font-medium">整体建议</h3>
              <p>{analysisReport.recommendations.overall}</p>
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
              <span>
                第 {currentPageIndex + 1} 页，共 {totalPages} 页
              </span>
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
