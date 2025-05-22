declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    luluAudio?: HTMLAudioElement | null;
  }
}

import { useState, useRef, useEffect } from 'react'
import { ttsElevenLabs } from '@/lib/tts'
import type { StoryPage as StoryPageType } from '../data/storyData'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'

const WAIT_SECONDS = 30
const praises = [
  '太棒啦！继续冒险～',
  '回答得真好，给你点个赞！',
  '真机智，小熊在鼓掌哦！',
  '精彩！往下读吧～'
]

interface Props {
  page: StoryPageType
  onNext: () => void
  onResponseSubmit: (pageId: number, resp: string) => void
  userResponses: Array<{ pageId: number; response: string }>
}

export function StoryPage({
  page, onNext, onResponseSubmit, userResponses
}: Props) {
  const [userResponse, setUserResponse] = useState('')
  const [responseSubmitted, setResponseSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(WAIT_SECONDS)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [stage, setStage] = useState<'first' | 'second'>('first')
  const [canStartListening, setCanStartListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<number | null>(null)

  // ===== TTS 优先用 ElevenLabs，后备 Web Speech，确保前一次 audio 被 stop =====
  const speak = async (text: string, onComplete?: () => void) => {
    // 停掉前一段 audio/TTS
    try { window.speechSynthesis.cancel(); } catch {}
    if (window.luluAudio && typeof window.luluAudio.pause === 'function') {
      window.luluAudio.pause();
      window.luluAudio = null;
    }
    setIsSpeaking(true);
    try {
      const url = await ttsElevenLabs(text)
      const audio = new Audio(url)
      window.luluAudio = audio;
      await new Promise<void>(resolve => {
        audio.onended = () => { setIsSpeaking(false); resolve(); if (onComplete) onComplete(); }
        audio.onerror = () => { setIsSpeaking(false); resolve(); if (onComplete) onComplete(); }
        audio.play()
      })
      return
    } catch (e) {
      console.warn('ElevenLabs 失败，回退 WebSpeech')
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      await new Promise<void>(resolve => {
        const ut = new SpeechSynthesisUtterance(text)
        ut.lang = 'zh-CN'; ut.rate = 0.9
        ut.onend = () => { setIsSpeaking(false); resolve(); if (onComplete) onComplete(); }
        window.speechSynthesis.speak(ut)
      })
    }
    setIsSpeaking(false)
    if (onComplete) onComplete();
  }

  // ===== 初始化 SR =====
  const initSpeech = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SR()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'zh-CN'

    recognitionRef.current.onresult = (e: any) => {
      const txt = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setUserResponse(txt)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
        setTimeLeft(WAIT_SECONDS)
      }
    }
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.onerror = () => setIsListening(false)
  }

  // ===== 点击“开始语音”才启动 SR & 计时 =====
  const handleStartListening = () => {
    if (!recognitionRef.current) initSpeech()
    setUserResponse('')
    setIsListening(true)
    setTimeLeft(WAIT_SECONDS)
    recognitionRef.current.start()
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          setIsListening(false)
          recognitionRef.current.stop()
          // 30 秒未作答，朗读引导内容，朗读结束前禁止操作
          if (stage === 'first' && !responseSubmitted && !userResponse.trim()) {
            setStage('second')
            setCanStartListening(false)
            speak(page.guidancePrompt ?? '你可以试试这样回答哦～', () => {
              setCanStartListening(true)
              console.log('第二轮引导后已允许开始语音')
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ===== 切页重置 =====
  useEffect(() => {
    try { window.speechSynthesis.cancel(); } catch {}
    if (window.luluAudio && typeof window.luluAudio.pause === 'function') {
      window.luluAudio.pause(); window.luluAudio = null;
    }
    recognitionRef.current?.abort?.()
    if (timerRef.current) clearInterval(timerRef.current)

    setStage('first')
    setUserResponse('')
    setResponseSubmitted(!!userResponses.find(r => r.pageId === page.id))
    setCanStartListening(false)
    setIsListening(false)
    setTimeLeft(WAIT_SECONDS)

    // 朗读内容和问题，朗读完后按钮才可用
    if (page.isInteractive && !userResponses.find(r => r.pageId === page.id)) {
      speak(
        `${page.content} ${page.interactiveQuestion}`,
        () => {
          setCanStartListening(true)
          console.log('首次朗读完毕，可开始语音')
        }
      )
    } else {
      speak(page.content)
    }

    return () => {
      clearInterval(timerRef.current!)
      recognitionRef.current?.abort?.()
      try { window.speechSynthesis.cancel(); } catch {}
      if (window.luluAudio && typeof window.luluAudio.pause === 'function') {
        window.luluAudio.pause(); window.luluAudio = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id])

  useEffect(initSpeech, [])

  // ===== 提交 =====
  const handleSubmit = async () => {
    if (!userResponse.trim()) return
    recognitionRef.current?.stop?.()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsListening(false)
    setTimeLeft(WAIT_SECONDS)
    onResponseSubmit(page.id, userResponse)
    setResponseSubmitted(true)
    setCanStartListening(false)
    await speak(praises[Math.floor(Math.random() * praises.length)])
    setTimeout(onNext, 350)
  }

  const readAgain = async () => {
    setCanStartListening(false)
    await speak(page.isInteractive
      ? `${page.content} ${page.interactiveQuestion}`
      : page.content, () => {
        if (page.isInteractive && !responseSubmitted) setCanStartListening(true)
      })
  }

  // --- debug: 可以看到每次canStartListening变化
  useEffect(() => {
    console.log('canStartListening', canStartListening)
  }, [canStartListening])

  /* ---------- UI ---------- */
  return (
    <div style={{ position: 'relative' }}>
      <div className="flex flex-col items-center max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">
          第{page.id}页{page.isInteractive ? ' · 交互' : ''}
        </h2>

        <img
          src={page.imagePath?.startsWith('/') ? page.imagePath : `/assets/${page.imagePath}`}
          alt={`第${page.id}页插图`}
          style={{
            width: '100%', maxHeight: '320px', objectFit: 'contain',
            borderRadius: '12px', marginBottom: '1.5rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
          }}
        />

        <Card className="w-full p-4">
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={readAgain}
              disabled={isSpeaking}
            >
              {isSpeaking ? '朗读中...' : '再读一遍'}
            </Button>
          </div>

          <p className="text-lg mb-4">{page.content}</p>

          {page.isInteractive && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-xl font-semibold mb-2">问题：</h3>
              <p className="mb-4">{page.interactiveQuestion}</p>

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
                      onClick={handleStartListening}
                      disabled={isSpeaking || isListening || !canStartListening}
                    >
                      {isListening ? '录音中...' : '开始语音'}
                    </Button>
                    {isListening && <span className="text-sm text-gray-500">正在聆听…</span>}
                  </div>

                  <Textarea
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    placeholder="可以键入或语音输入..."
                    className="min-h-[120px] mb-2"
                    disabled={isSpeaking}
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {isListening && timeLeft > 0 ? `剩余 ${timeLeft}s` : ''}
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
      {/* Lulu 虚拟形象固定悬浮，较小 */}
      <div
        style={{
          position: 'fixed',
          left: '20px',
          bottom: '20px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <img
          src="/LULU 2.png"
          alt="Lulu 虚拟形象"
          style={{
            width: '54px',
            height: '54px',
            animation: 'luluWiggle 1.7s infinite',
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
          }}
        />
      </div>
      <style>
        {`
          @keyframes luluWiggle {
            0% { transform: translateX(0) rotate(0deg);}
            15% { transform: translateX(-7px) rotate(-5deg);}
            40% { transform: translateX(7px) rotate(5deg);}
            65% { transform: translateX(-7px) rotate(-4deg);}
            100% { transform: translateX(0) rotate(0deg);}
          }
        `}
      </style>
    </div>
  )
}
