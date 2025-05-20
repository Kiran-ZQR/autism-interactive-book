import { ChoiceCards } from './ChoiceCards';   // 路径相对 StoryPage.tsx 所在目录
// 添加 Web Speech API 的类型声明
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

import { useState, useRef, useEffect } from 'react';
import type { StoryPage as StoryPageType } from '../data/storyData';
import { Button }   from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card }     from '../ui/card';
import { ChoiceCards } from './ChoiceCards';   // ← 新建组件见下文

/* ================= 配置区 ================= */
const API_BASE = ''; // 若后端与前端同源留空；否则如 'http://localhost:3001'
const WAIT_SECONDS = 30;
/* ========================================= */

interface StoryPageProps {
  page: StoryPageType;
  onNext: () => void;
  onResponseSubmit: (pageId: number, response: string) => void;
  userResponses: Array<{ pageId: number; response: string }>;
}

export function StoryPage({
  page,
  onNext,
  onResponseSubmit,
  userResponses,
}: StoryPageProps) {
  /* ---------- state ---------- */
  const [userResponse, setUserResponse] = useState('');
  const [responseSubmitted, setResponseSubmitted] = useState(false);

  const [stage, setStage] = useState<'first' | 'second'>('first'); // 引导轮次
  const [mode, setMode] = useState<'ask' | 'choice'>('ask');      // ask=语音模式  choice=选项卡

  const [timeLeft, setTimeLeft] = useState(WAIT_SECONDS);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* ---------- ref ---------- */
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const timerStartedRef = useRef<boolean>(false);

  /* ---------- Helpers ---------- */
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.9;
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  /** === 初始化语音识别 === */
  const initSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
      return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'zh-CN';

    recognitionRef.current.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setUserResponse(transcript);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
  };

  /** === 计时器管理 === */
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerStartedRef.current = true;
    setTimeLeft(WAIT_SECONDS);

    timerRef.current = window.setInterval(async () => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          // ---------- 超时逻辑 ----------
          if (stage === 'first') {
            /* 第二句 GPT 引导 */
            fetch(`${API_BASE}/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pageId: page.id,
                stage: 'second',
                prevAsk: page.interactiveQuestion,
              }),
            })
              .then((r) => r.json())
              .then((d) => {
                setStage('second');
                speak(d.ask);
                startTimer(); // 再次 30 s
              });
          } else {
            /* second 也超时 → 选项模式 */
            setMode('choice');
            speak('让我们用选一选来帮忙吧');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ---------- 页面切换时重置 ---------- */
  useEffect(() => {
    // Stop timers & speech
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.abort?.();

    // reset
    setStage('first');
    setMode('ask');
    setUserResponse('');
    setTimeLeft(WAIT_SECONDS);
    setResponseSubmitted(
      !!userResponses.find((r) => r.pageId === page.id)?.response
    );

    // speak first prompt
    const firstText = page.isInteractive
      ? `${page.content} ${page.interactiveQuestion}`
      : page.content;
    setTimeout(() => speak(firstText), 300);

    return () => {
      clearInterval(timerRef.current!);
      recognitionRef.current?.abort?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  /* ---------- 初始化 SR 一次 ---------- */
  useEffect(() => {
    initSpeechRecognition();
  }, []);

  /* ---------- 语音按钮 ---------- */
  const toggleListening = () => {
    if (!recognitionRef.current) initSpeechRecognition();

    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start?.();
        setIsListening(true);
      } catch (e) {
        alert('启动语音识别失败，检查权限/浏览器支持');
      }
    }
  };

  /* ---------- 提交文本/语音答案 ---------- */
  const handleSubmit = async () => {
    if (!userResponse.trim()) return;

    recognitionRef.current?.stop?.();
    clearInterval(timerRef.current!);

    /* 调 GPT 判定 */
    const judge = await fetch(`${API_BASE}/judge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expect: page.correctAnswer,
        answer: userResponse,
      }),
    }).then((r) => r.json());

    if (judge.result === 'yes') {
      speak(judge.praise);
      onResponseSubmit(page.id, userResponse);
      setResponseSubmitted(true);
      setTimeout(onNext, 1800);
    } else {
      speak(
        judge.result === 'partial'
          ? `快成功啦，再想想：${page.guidancePrompt}`
          : page.guidancePrompt
      );
      setStage('second');
      setUserResponse('');
      startTimer();
    }
  };

  /* ---------- 选项卡点击 ---------- */
  const handleChoice = async (pick: string) => {
    if (pick === page.correctAnswer) {
      const { praise } = await fetch(`${API_BASE}/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expect: pick, answer: pick }),
      }).then((r) => r.json());
      speak(praise);
      onResponseSubmit(page.id, pick);
      setResponseSubmitted(true);
      setTimeout(onNext, 1800);
    } else {
      speak('再想想哦～');
      // TODO: 可加按钮抖动动画
    }
  };

  const readAgain = () => {
    const txt = page.isInteractive
      ? `${page.content} ${page.interactiveQuestion}`
      : page.content;
    speak(txt);
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        第{page.id}页{page.isInteractive ? ' - 交互环节' : ''}
      </h2>

      <div className="w-full mb-6">
        <img
          src={page.imagePath}
          alt={`故事第${page.id}页插图`}
          className="w-full max-h-[400px] object-contain rounded-lg shadow-md"
        />
      </div>

      <Card className="w-full p-4 mb-6">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={readAgain} disabled={isSpeaking}>
            {isSpeaking ? '正在朗读...' : '朗读内容'}
          </Button>
        </div>

        <p className="text-lg mb-4">{page.content}</p>

        {page.isInteractive && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-xl font-semibold mb-2">交互问题：</h3>
            <p className="mb-4">{page.interactiveQuestion}</p>

            {/* guidance 提示 */}
            {stage === 'second' && mode === 'ask' && !responseSubmitted && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                <p className="text-amber-800">{page.guidancePrompt}</p>
              </div>
            )}

            {/* 语音模式 */}
            {mode === 'ask' && !responseSubmitted && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant={isListening ? 'destructive' : 'default'}
                    onClick={toggleListening}
                  >
                    {isListening ? '停止录音' : '开始语音输入'}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {isListening && '正在聆听...请说话'}
                  </span>
                </div>

                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="请在这里输入你的回答，或使用语音输入..."
                  className="min-h-[120px] mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {timeLeft > 0 && `剩余时间: ${timeLeft}秒`}
                    {timeLeft === 0 && '时间到'}
                  </span>
                  <Button onClick={handleSubmit} disabled={!userResponse.trim()}>
                    提交回答
                  </Button>
                </div>
              </>
            )}

            {/* 选项卡模式 */}
            {mode === 'choice' && !responseSubmitted && (
              <ChoiceCards options={page.choices} onPick={handleChoice} />
            )}

            {/* 已提交 */}
            {responseSubmitted && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                <p className="text-green-800">谢谢你的回答！</p>
              </div>
            )}
          </div>
        )}

        {!page.isInteractive && (
          <div className="flex justify-end mt-4">
            <Button onClick={onNext}>继续阅读</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
