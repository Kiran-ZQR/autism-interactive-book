// client/src/components/StoryPage.tsx
/* ---------- Web-Speech 类型声明 ---------- */
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

import { useState, useRef, useEffect } from 'react';
import type { StoryPage as StoryPageType } from '../data/storyData';
import { Button }   from './ui/button';
import { Textarea } from './ui/textarea';
import { Card }     from './ui/card';

/* ====== 配置 ====== */
const WAIT_SECONDS = 30;
/* ================== */

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
  const [timeLeft, setTimeLeft] = useState(WAIT_SECONDS);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stage, setStage] = useState<'first' | 'second'>('first'); // 引导轮次

  /* ---------- ref ---------- */
  const recognitionRef = useRef<any>(null);
  const timerRef       = useRef<number | null>(null);

  /* ---------- 朗读 ---------- */
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang  = 'zh-CN';
    ut.rate  = 0.9;
    ut.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(ut);
  };

  /* ---------- 初始化 SR ---------- */
  const initSpeech = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
      return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous     = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang           = 'zh-CN';
    recognitionRef.current.onresult = (e: any) => {
      const txt = Array.from(e.results).map((r:any)=>r[0].transcript).join('');
      setUserResponse(txt);
    };
    recognitionRef.current.onend   = () => setIsListening(false);
    recognitionRef.current.onerror = () => setIsListening(false);
  };

  /* ---------- 计时器 ---------- */
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(WAIT_SECONDS);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          // 第一次超时 → guidancePrompt
          if (stage === 'first' && !responseSubmitted) {
            setStage('second');
            speak(page.guidancePrompt ?? '你可以试着回答哦～');
            // 再次等待
            startTimer();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ---------- 切页重置 ---------- */
  useEffect(() => {
    // 停止上页资源
    window.speechSynthesis.cancel();
    recognitionRef.current?.abort?.();
    if (timerRef.current) clearInterval(timerRef.current);

    // 重置 state
    setStage('first');
    setUserResponse('');
    setResponseSubmitted(
      !!userResponses.find(r => r.pageId === page.id)
    );

    // 首次朗读
    const txt = page.isInteractive
      ? `${page.content} ${page.interactiveQuestion}`
      : page.content;
    setTimeout(() => speak(txt), 300);

    // 开始计时（仅交互页且未回答）
    if (page.isInteractive && !responseSubmitted) startTimer();

    return () => {
      clearInterval(timerRef.current!);
      recognitionRef.current?.abort?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  /* ---------- 首次挂载 ---------- */
  useEffect(initSpeech, []);

  /* ---------- 语音按钮 ---------- */
  const toggleListening = () => {
    if (!recognitionRef.current) initSpeech();
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        alert('无法启动语音识别，请检查浏览器权限');
      }
    }
  };

  /* ---------- 提交答案 ---------- */
  const handleSubmit = () => {
    if (!userResponse.trim()) return;
    recognitionRef.current?.stop?.();
    clearInterval(timerRef.current!);

    onResponseSubmit(page.id, userResponse);
    setResponseSubmitted(true);
    speak('太棒了，继续下一页吧！');
    setTimeout(onNext, 1800);
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
        第{page.id}页{page.isInteractive ? ' · 交互' : ''}
      </h2>

      <img
        src={page.imagePath}
        alt={`第${page.id}页插图`}
        className="w-full max-h-[400px] object-contain rounded-lg shadow-md mb-6"
      />

      <Card className="w-full p-4">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={readAgain} disabled={isSpeaking}>
            {isSpeaking ? '朗读中...' : '再读一遍'}
          </Button>
        </div>

        <p className="text-lg mb-4">{page.content}</p>

        {/* 交互区域 */}
        {page.isInteractive && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-xl font-semibold mb-2">问题：</h3>
            <p className="mb-4">{page.interactiveQuestion}</p>

            {/* 第二轮提示文字 */}
            {stage === 'second' && !responseSubmitted && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                <p className="text-amber-800">{page.guidancePrompt}</p>
              </div>
            )}

            {!responseSubmitted ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant={isListening ? 'destructive' : 'default'}
                    onClick={toggleListening}
                  >
                    {isListening ? '停止录音' : '开始语音'}
                  </Button>
                  {isListening && <span className="text-sm text-gray-500">正在聆听…</span>}
                </div>

                <Textarea
                  value={userResponse}
                  onChange={e => setUserResponse(e.target.value)}
                  placeholder="可以键入或语音输入..."
                  className="min-h-[120px] mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {timeLeft > 0 ? `剩余 ${timeLeft}s` : '时间到'}
                  </span>
                  <Button onClick={handleSubmit} disabled={!userResponse.trim()}>
                    提交
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                <p className="text-green-800">谢谢你的回答！</p>
              </div>
            )}
          </div>
        )}

        {!page.isInteractive && (
          <div className="flex justify-end mt-4">
            <Button onClick={onNext}>继续</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
