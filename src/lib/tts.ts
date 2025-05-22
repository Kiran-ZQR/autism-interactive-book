// client/src/lib/tts.ts
/**
 * 调用 ElevenLabs TTS – 返回一个可在 <audio src={url} /> 播放的 blob URL
 * 只做最基础的异常处理，生产环境请自行缓存 / 错误重试
 */
export async function ttsElevenLabs(text: string) {
  const apiKey = import.meta.env.VITE_ELEVEN_KEY;
  const voice  = import.meta.env.VITE_ELEVEN_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB'; // 官方 demo voice

  if (!apiKey) throw new Error('缺少 VITE_ELEVEN_KEY');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method : 'POST',
    headers: {
      'xi-api-key' : apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: { stability: 0.4, similarity_boost: 0.8 }
    })
  });

  if (!res.ok) throw new Error('TTS 请求失败');
  const blob = await res.blob();
  return URL.createObjectURL(blob);   // ← 一定要转 blob → objectURL
}
