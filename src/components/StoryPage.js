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
var react_1 = require("react");
var tts_1 = require("@/lib/tts");
var button_1 = require("./ui/button");
var textarea_1 = require("./ui/textarea");
var card_1 = require("./ui/card");
var WAIT_SECONDS = 30;
var praises = [
    '太棒啦！继续冒险～',
    '回答得真好，给你点个赞！',
    '真机智，小熊在鼓掌哦！',
    '精彩！往下读吧～'
];
function StoryPage(_a) {
    var _this = this;
    var _b;
    var page = _a.page, onNext = _a.onNext, onResponseSubmit = _a.onResponseSubmit, userResponses = _a.userResponses;
    var _c = (0, react_1.useState)(''), userResponse = _c[0], setUserResponse = _c[1];
    var _d = (0, react_1.useState)(false), responseSubmitted = _d[0], setResponseSubmitted = _d[1];
    var _e = (0, react_1.useState)(WAIT_SECONDS), timeLeft = _e[0], setTimeLeft = _e[1];
    var _f = (0, react_1.useState)(false), isListening = _f[0], setIsListening = _f[1];
    var _g = (0, react_1.useState)(false), isSpeaking = _g[0], setIsSpeaking = _g[1];
    var _h = (0, react_1.useState)('first'), stage = _h[0], setStage = _h[1];
    var _j = (0, react_1.useState)(false), canStartListening = _j[0], setCanStartListening = _j[1];
    var recognitionRef = (0, react_1.useRef)(null);
    var timerRef = (0, react_1.useRef)(null);
    // ===== TTS 优先用 ElevenLabs，后备 Web Speech，确保前一次 audio 被 stop =====
    var speak = function (text, onComplete) { return __awaiter(_this, void 0, void 0, function () {
        var url, audio_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 停掉前一段 audio/TTS
                    try {
                        window.speechSynthesis.cancel();
                    }
                    catch (_b) { }
                    if (window.luluAudio && typeof window.luluAudio.pause === 'function') {
                        window.luluAudio.pause();
                        window.luluAudio = null;
                    }
                    setIsSpeaking(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, tts_1.ttsElevenLabs)(text)];
                case 2:
                    url = _a.sent();
                    audio_1 = new Audio(url);
                    window.luluAudio = audio_1;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            audio_1.onended = function () { setIsSpeaking(false); resolve(); if (onComplete)
                                onComplete(); };
                            audio_1.onerror = function () { setIsSpeaking(false); resolve(); if (onComplete)
                                onComplete(); };
                            audio_1.play();
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4:
                    e_1 = _a.sent();
                    console.warn('ElevenLabs 失败，回退 WebSpeech');
                    return [3 /*break*/, 5];
                case 5:
                    if (!('speechSynthesis' in window)) return [3 /*break*/, 7];
                    window.speechSynthesis.cancel();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var ut = new SpeechSynthesisUtterance(text);
                            ut.lang = 'zh-CN';
                            ut.rate = 0.9;
                            ut.onend = function () { setIsSpeaking(false); resolve(); if (onComplete)
                                onComplete(); };
                            window.speechSynthesis.speak(ut);
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    setIsSpeaking(false);
                    if (onComplete)
                        onComplete();
                    return [2 /*return*/];
            }
        });
    }); };
    // ===== 初始化 SR =====
    var initSpeech = function () {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
            return;
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'zh-CN';
        recognitionRef.current.onresult = function (e) {
            var txt = Array.from(e.results).map(function (r) { return r[0].transcript; }).join('');
            setUserResponse(txt);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setTimeLeft(WAIT_SECONDS);
            }
        };
        recognitionRef.current.onend = function () { return setIsListening(false); };
        recognitionRef.current.onerror = function () { return setIsListening(false); };
    };
    // ===== 点击“开始语音”才启动 SR & 计时 =====
    var handleStartListening = function () {
        if (!recognitionRef.current)
            initSpeech();
        setUserResponse('');
        setIsListening(true);
        setTimeLeft(WAIT_SECONDS);
        recognitionRef.current.start();
        timerRef.current = window.setInterval(function () {
            setTimeLeft(function (prev) {
                var _a;
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    setIsListening(false);
                    recognitionRef.current.stop();
                    // 30 秒未作答，朗读引导内容，朗读结束前禁止操作
                    if (stage === 'first' && !responseSubmitted && !userResponse.trim()) {
                        setStage('second');
                        setCanStartListening(false);
                        speak((_a = page.guidancePrompt) !== null && _a !== void 0 ? _a : '你可以试试这样回答哦～', function () {
                            setCanStartListening(true);
                            console.log('第二轮引导后已允许开始语音');
                        });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    // ===== 切页重置 =====
    (0, react_1.useEffect)(function () {
        var _a, _b;
        try {
            window.speechSynthesis.cancel();
        }
        catch (_c) { }
        if (window.luluAudio && typeof window.luluAudio.pause === 'function') {
            window.luluAudio.pause();
            window.luluAudio = null;
        }
        (_b = (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.abort) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (timerRef.current)
            clearInterval(timerRef.current);
        setStage('first');
        setUserResponse('');
        setResponseSubmitted(!!userResponses.find(function (r) { return r.pageId === page.id; }));
        setCanStartListening(false);
        setIsListening(false);
        setTimeLeft(WAIT_SECONDS);
        // 朗读内容和问题，朗读完后按钮才可用
        if (page.isInteractive && !userResponses.find(function (r) { return r.pageId === page.id; })) {
            speak("".concat(page.content, " ").concat(page.interactiveQuestion), function () {
                setCanStartListening(true);
                console.log('首次朗读完毕，可开始语音');
            });
        }
        else {
            speak(page.content);
        }
        return function () {
            var _a, _b;
            clearInterval(timerRef.current);
            (_b = (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.abort) === null || _b === void 0 ? void 0 : _b.call(_a);
            try {
                window.speechSynthesis.cancel();
            }
            catch (_c) { }
            if (window.luluAudio && typeof window.luluAudio.pause === 'function') {
                window.luluAudio.pause();
                window.luluAudio = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);
    (0, react_1.useEffect)(initSpeech, []);
    // ===== 提交 =====
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!userResponse.trim())
                        return [2 /*return*/];
                    (_b = (_a = recognitionRef.current) === null || _a === void 0 ? void 0 : _a.stop) === null || _b === void 0 ? void 0 : _b.call(_a);
                    if (timerRef.current)
                        clearInterval(timerRef.current);
                    setIsListening(false);
                    setTimeLeft(WAIT_SECONDS);
                    onResponseSubmit(page.id, userResponse);
                    setResponseSubmitted(true);
                    setCanStartListening(false);
                    return [4 /*yield*/, speak(praises[Math.floor(Math.random() * praises.length)])];
                case 1:
                    _c.sent();
                    setTimeout(onNext, 350);
                    return [2 /*return*/];
            }
        });
    }); };
    var readAgain = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setCanStartListening(false);
                    return [4 /*yield*/, speak(page.isInteractive
                            ? "".concat(page.content, " ").concat(page.interactiveQuestion)
                            : page.content, function () {
                            if (page.isInteractive && !responseSubmitted)
                                setCanStartListening(true);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // --- debug: 可以看到每次canStartListening变化
    (0, react_1.useEffect)(function () {
        console.log('canStartListening', canStartListening);
    }, [canStartListening]);
    /* ---------- UI ---------- */
    return (<div style={{ position: 'relative' }}>
      <div className="flex flex-col items-center max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">
          第{page.id}页{page.isInteractive ? ' · 交互' : ''}
        </h2>

        <img src={((_b = page.imagePath) === null || _b === void 0 ? void 0 : _b.startsWith('/')) ? page.imagePath : "/assets/".concat(page.imagePath)} alt={"\u7B2C".concat(page.id, "\u9875\u63D2\u56FE")} style={{
            width: '100%', maxHeight: '320px', objectFit: 'contain',
            borderRadius: '12px', marginBottom: '1.5rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
        }}/>

        <card_1.Card className="w-full p-4">
          <div className="flex justify-end mb-2">
            <button_1.Button variant="outline" size="sm" onClick={readAgain} disabled={isSpeaking}>
              {isSpeaking ? '朗读中...' : '再读一遍'}
            </button_1.Button>
          </div>

          <p className="text-lg mb-4">{page.content}</p>

          {page.isInteractive && (<div className="mt-4 border-t pt-4">
              <h3 className="text-xl font-semibold mb-2">问题：</h3>
              <p className="mb-4">{page.interactiveQuestion}</p>

              {stage === 'second' && !responseSubmitted && (<div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                  <p className="text-amber-800">{page.guidancePrompt}</p>
                </div>)}

              {!responseSubmitted ? (<>
                  <div className="flex items-center gap-2 mb-2">
                    <button_1.Button variant={isListening ? 'destructive' : 'default'} onClick={handleStartListening} disabled={isSpeaking || isListening || !canStartListening}>
                      {isListening ? '录音中...' : '开始语音'}
                    </button_1.Button>
                    {isListening && <span className="text-sm text-gray-500">正在聆听…</span>}
                  </div>

                  <textarea_1.Textarea value={userResponse} onChange={function (e) { return setUserResponse(e.target.value); }} placeholder="可以键入或语音输入..." className="min-h-[120px] mb-2" disabled={isSpeaking}/>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {isListening && timeLeft > 0 ? "\u5269\u4F59 ".concat(timeLeft, "s") : ''}
                    </span>
                    <button_1.Button onClick={handleSubmit} disabled={!userResponse.trim()}>
                      提交
                    </button_1.Button>
                  </div>
                </>) : (<div className="bg-green-50 border border-green-200 p-3 rounded-md">
                  <p className="text-green-800">谢谢你的回答！</p>
                </div>)}
            </div>)}

          {!page.isInteractive && (<div className="flex justify-end mt-4">
              <button_1.Button onClick={onNext}>继续</button_1.Button>
            </div>)}
        </card_1.Card>
      </div>
      {/* Lulu 虚拟形象固定悬浮，较小 */}
      <div style={{
            position: 'fixed',
            left: '20px',
            bottom: '20px',
            zIndex: 1000,
            pointerEvents: 'none'
        }}>
        <img src="/LULU 2.png" alt="Lulu 虚拟形象" style={{
            width: '54px',
            height: '54px',
            animation: 'luluWiggle 1.7s infinite',
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
        }}/>
      </div>
      <style>
        {"\n          @keyframes luluWiggle {\n            0% { transform: translateX(0) rotate(0deg);}\n            15% { transform: translateX(-7px) rotate(-5deg);}\n            40% { transform: translateX(7px) rotate(5deg);}\n            65% { transform: translateX(-7px) rotate(-4deg);}\n            100% { transform: translateX(0) rotate(0deg);}\n          }\n        "}
      </style>
    </div>);
}
