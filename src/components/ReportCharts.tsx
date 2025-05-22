// src/components/ReportCharts.tsx

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

/* ====== 类型定义 ====== */
export interface ScoreSet {
  languageVocabulary: number
  logicalThinking: number
  socialAdaptation: number
  emotionalRecognition: number
}

export interface WeeklyTrend {
  week: string // e.g. "W-20"
  languageVocabulary: number
  logicalThinking: number
  socialAdaptation: number
  emotionalRecognition: number
}

interface Props {
  scores: ScoreSet           // 本次得分 0-5
  history?: WeeklyTrend[]    // 可选：最近 4 周
}

export function ReportCharts({ scores, history }: Props) {
  // 统一各项顺序，方便折线图和雷达图颜色对齐
  const radarItems = [
    { key: 'languageVocabulary', label: '语言词汇', color: '#8884d8' },
    { key: 'logicalThinking', label: '思维逻辑', color: '#82ca9d' },
    { key: 'socialAdaptation', label: '社会适应', color: '#ffc658' },
    { key: 'emotionalRecognition', label: '情感识别', color: '#ff7300' },
  ] as const;

  const radarData = radarItems.map(item => ({
    item: item.label,
    value: scores[item.key],
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* —— 雷达图 —— */}
      <div className="bg-white p-4 rounded-lg shadow mb-4" style={{ width: '100%', height: 320 }}>
        <div className="font-bold text-blue-700 mb-2">能力分布雷达图</div>
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="item" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6}/>
            <Radar
              name="本次评估"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.5}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* —— 折线图 —— */}
      {history && history.length > 1 && (
        <div className="bg-white p-4 rounded-lg shadow" style={{ width: '100%', height: 320 }}>
          <div className="font-bold text-blue-700 mb-2">核心能力 4 周趋势</div>
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 5]} tickCount={6} />
              <Tooltip />
              <Legend />
              {radarItems.map(item => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
