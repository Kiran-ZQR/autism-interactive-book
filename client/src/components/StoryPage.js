"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryPage = StoryPage;
var ChoiceCards_1 = require("./ChoiceCards"); // 路径相对 StoryPage.tsx 所在目录
var react_1 = require("react");
var button_1 = require("../ui/button");
var textarea_1 = require("../ui/textarea");
var card_1 = require("../ui/card");
/* ================= 配置区 ================= */
var API_BASE = ''; // 若后端与前端同源留空；否则如 'http://localhost:3001'
var WAIT_SECONDS = 30;
function StoryPage(_a) {
    var _this = this;
    var page = _a.page, onNext = _a.onNext, onResponseSubmit = _a.onResponseSubmit, userResponses = _a.userResponses;
    /* ---------- state ---------- */
    var _b = (0, react_1.useState)(''), userResponse = _b[0], setUserResponse = _b[1];
    var _c = (0, react_1.useState)(false), responseSubmitted = _c[0], setResponseSubmitted = _c[1];
    var _d = (0, react_1.useState)('first'), stage = _d[0], setStage = _d[1]; // 引导轮次
    var _e = (0, react_1.useState)('ask'), mode = _e[0], setMode = _e[1]; // ask=语音模式  choice=选项卡
    var _f = (0, react_1.useState)(WAIT_SECONDS), timeLeft = _f[0], setTimeLeft = _f[1];
    var _g = (0, react_1.useState)(false), isListening = _g[0], setIsListening = _g[1];
    var _h = (0, react_1.useState)(false), isSpeaking = _h[0], setIsSpeaking = _h[1];
    /* ---------- ref ---------- */
    var recognitionRef = (0, react_1.useRef)(null);
    var timerRef = (0, react_1.useRef)(null);
    var timerStartedRef = (0, react_1.useRef)(false);
    /* ---------- Helpers ---------- */
    var speak = function (text) {
        if (!('speechSynthesis' in window))
            return;
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        var utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = 0.9;
        utter.onend = function () { return setIsSpeaking(false); };
        window.speechSynthesis.speak(utter);
    };
    /** === 初始化语音识别 === */
    var initSpeechRecognition = function () {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
            return;
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'zh-CN';
        recognitionRef.current.onresult = function (e) {
            var transcript = Array.from(e.results)
                .map(function (r) { return r[0].transcript; })
                .join('');
            setUserResponse(transcript);
        };
        recognitionRef.current.onerror = function () { return setIsListening(false); };
        recognitionRef.current.onend = function () { return setIsListening(false); };
    };
    /** === 计时器管理 === */
    var startTimer = function () {
        if (timerRef.current)
            clearInterval(timerRef.current);
        timerStartedRef.current = true;
        setTimeLeft(WAIT_SECONDS);
        timerRef.current = window.setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setTimeLeft(function (prev) {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        // ---------- 超时逻辑 ----------
                        if (stage === 'first') {
                            /* 第二句 GPT 引导 */
                            fetch("".concat(API_BASE, "/chat"), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    pageId: page.id,
                                    stage: 'second',
                                    prevAsk: page.interactiveQuestion,
                                }),
                            })
                                .then(function (r) { return r.json(); })
                                .then(function (d) {
                                setStage('second');
                                speak(d.ask);
                                startTimer(); // 再次 30 s
                            });
                        }
                        else {
                            /* second 也超时 → 选项模式 */
                            setMode('choice');
                            speak('让我们用选一选来帮忙吧');
                        }
                        return 0;
                    }
                    return prev - 1;
                });
                return [2 /*return*/];
            });
        }); }, 1000);
    };
    /* ---------- 页面切换时重置 ---------- */
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        // Stop timers & speech
        if (timerRef.current)
            clearInterval(timerRef.current);
        window.speechSynthesis.cancel();
        if (recognitionRef.current)
            (_b = (_a = recognitionRef.current).abort) === null || _b === void 0 ? void 0 : _b.call(_a);
        // reset
        setStage('first');
        setMode('ask');
        setUserResponse('');
        setTimeLeft(WAIT_SECONDS);
        setResponseSubmitted(!!((_c = userResponses.find(function (r) { return r.pageId === page.id; })) === null || _c === void 0 ? void 0 : _c.response));
        // speak first prompt
        var firstText = page.isInteractive
            ? "".concat(page.content, " ").concat(page.interactiveQuestion)
            : page.content;
        setTimeout(function () { return speak(firstText); }, 300);
        return function () {
            var _a, _b;
            clearInterval(timerRef.current);
            (_b = (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.abort) === null || _b === void 0 ? void 0 : _b.call(_a);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);
    /* ---------- 初始化 SR 一次 ---------- */
    (0, react_1.useEffect)(function () {
        initSpeechRecognition();
    }, []);
    /* ---------- 语音按钮 ---------- */
    var toggleListening = function () {
        var _a, _b, _c, _d;
        if (!recognitionRef.current)
            initSpeechRecognition();
        if (isListening) {
            (_b = (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.stop) === null || _b === void 0 ? void 0 : _b.call(_a);
            setIsListening(false);
        }
        else {
            try {
                (_d = (_c = recognitionRef.current) === null || _c === void 0 ? void 0 : _c.start) === null || _d === void 0 ? void 0 : _d.call(_c);
                setIsListening(true);
            }
            catch (e) {
                alert('启动语音识别失败，检查权限/浏览器支持');
            }
        }
    };
    /* ---------- 提交文本/语音答案 ---------- */
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var judge;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!userResponse.trim())
                        return [2 /*return*/];
                    (_b = (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.stop) === null || _b === void 0 ? void 0 : _b.call(_a);
                    clearInterval(timerRef.current);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/judge"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                expect: page.correctAnswer,
                                answer: userResponse,
                            }),
                        }).then(function (r) { return r.json(); })];
                case 1:
                    judge = _c.sent();
                    if (judge.result === 'yes') {
                        speak(judge.praise);
                        onResponseSubmit(page.id, userResponse);
                        setResponseSubmitted(true);
                        setTimeout(onNext, 1800);
                    }
                    else {
                        speak(judge.result === 'partial'
                            ? "\u5FEB\u6210\u529F\u5566\uFF0C\u518D\u60F3\u60F3\uFF1A".concat(page.guidancePrompt)
                            : page.guidancePrompt);
                        setStage('second');
                        setUserResponse('');
                        startTimer();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    /* ---------- 选项卡点击 ---------- */
    var handleChoice = function (pick) { return __awaiter(_this, void 0, void 0, function () {
        var praise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(pick === page.correctAnswer)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/judge"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ expect: pick, answer: pick }),
                        }).then(function (r) { return r.json(); })];
                case 1:
                    praise = (_a.sent()).praise;
                    speak(praise);
                    onResponseSubmit(page.id, pick);
                    setResponseSubmitted(true);
                    setTimeout(onNext, 1800);
                    return [3 /*break*/, 3];
                case 2:
                    speak('再想想哦～');
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var readAgain = function () {
        var txt = page.isInteractive
            ? "".concat(page.content, " ").concat(page.interactiveQuestion)
            : page.content;
        speak(txt);
    };
    /* ---------- UI ---------- */
    return (<div className="flex flex-col items-center max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        第{page.id}页{page.isInteractive ? ' - 交互环节' : ''}
      </h2>

      <div className="w-full mb-6">
        <img src={page.imagePath} alt={"\u6545\u4E8B\u7B2C".concat(page.id, "\u9875\u63D2\u56FE")} className="w-full max-h-[400px] object-contain rounded-lg shadow-md"/>
      </div>

      <card_1.Card className="w-full p-4 mb-6">
        <div className="flex justify-end mb-2">
          <button_1.Button variant="outline" size="sm" onClick={readAgain} disabled={isSpeaking}>
            {isSpeaking ? '正在朗读...' : '朗读内容'}
          </button_1.Button>
        </div>

        <p className="text-lg mb-4">{page.content}</p>

        {page.isInteractive && (<div className="mt-4 border-t pt-4">
            <h3 className="text-xl font-semibold mb-2">交互问题：</h3>
            <p className="mb-4">{page.interactiveQuestion}</p>

            {/* guidance 提示 */}
            {stage === 'second' && mode === 'ask' && !responseSubmitted && (<div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                <p className="text-amber-800">{page.guidancePrompt}</p>
              </div>)}

            {/* 语音模式 */}
            {mode === 'ask' && !responseSubmitted && (<>
                <div className="flex items-center gap-2 mb-2">
                  <button_1.Button variant={isListening ? 'destructive' : 'default'} onClick={toggleListening}>
                    {isListening ? '停止录音' : '开始语音输入'}
                  </button_1.Button>
                  <span className="text-sm text-gray-500">
                    {isListening && '正在聆听...请说话'}
                  </span>
                </div>

                <textarea_1.Textarea value={userResponse} onChange={function (e) { return setUserResponse(e.target.value); }} placeholder="请在这里输入你的回答，或使用语音输入..." className="min-h-[120px] mb-2"/>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {timeLeft > 0 && "\u5269\u4F59\u65F6\u95F4: ".concat(timeLeft, "\u79D2")}
                    {timeLeft === 0 && '时间到'}
                  </span>
                  <button_1.Button onClick={handleSubmit} disabled={!userResponse.trim()}>
                    提交回答
                  </button_1.Button>
                </div>
              </>)}

            {/* 选项卡模式 */}
            {mode === 'choice' && !responseSubmitted && (<ChoiceCards_1.ChoiceCards options={page.choices} onPick={handleChoice}/>)}

            {/* 已提交 */}
            {responseSubmitted && (<div className="bg-green-50 border border-green-200 p-3 rounded-md">
                <p className="text-green-800">谢谢你的回答！</p>
              </div>)}
          </div>)}

        {!page.isInteractive && (<div className="flex justify-end mt-4">
            <button_1.Button onClick={onNext}>继续阅读</button_1.Button>
          </div>)}
      </card_1.Card>
    </div>);
}
