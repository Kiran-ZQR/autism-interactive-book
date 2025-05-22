"use strict";
// src/components/ReportCharts.tsx
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCharts = ReportCharts;
var recharts_1 = require("recharts");
function ReportCharts(_a) {
    var scores = _a.scores, history = _a.history;
    // 统一各项顺序，方便折线图和雷达图颜色对齐
    var radarItems = [
        { key: 'languageVocabulary', label: '语言词汇', color: '#8884d8' },
        { key: 'logicalThinking', label: '思维逻辑', color: '#82ca9d' },
        { key: 'socialAdaptation', label: '社会适应', color: '#ffc658' },
        { key: 'emotionalRecognition', label: '情感识别', color: '#ff7300' },
    ];
    var radarData = radarItems.map(function (item) { return ({
        item: item.label,
        value: scores[item.key],
    }); });
    return (<div className="flex flex-col gap-8">
      {/* —— 雷达图 —— */}
      <div className="bg-white p-4 rounded-lg shadow mb-4" style={{ width: '100%', height: 320 }}>
        <div className="font-bold text-blue-700 mb-2">能力分布雷达图</div>
        <recharts_1.ResponsiveContainer>
          <recharts_1.RadarChart data={radarData}>
            <recharts_1.PolarGrid strokeDasharray="3 3"/>
            <recharts_1.PolarAngleAxis dataKey="item"/>
            <recharts_1.PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6}/>
            <recharts_1.Radar name="本次评估" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5}/>
            <recharts_1.Tooltip />
          </recharts_1.RadarChart>
        </recharts_1.ResponsiveContainer>
      </div>
      
      {/* —— 折线图 —— */}
      {history && history.length > 1 && (<div className="bg-white p-4 rounded-lg shadow" style={{ width: '100%', height: 320 }}>
          <div className="font-bold text-blue-700 mb-2">核心能力 4 周趋势</div>
          <recharts_1.ResponsiveContainer>
            <recharts_1.LineChart data={history}>
              <recharts_1.CartesianGrid strokeDasharray="3 3"/>
              <recharts_1.XAxis dataKey="week"/>
              <recharts_1.YAxis domain={[0, 5]} tickCount={6}/>
              <recharts_1.Tooltip />
              <recharts_1.Legend />
              {radarItems.map(function (item) { return (<recharts_1.Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color} strokeWidth={2} dot={{ r: 3 }}/>); })}
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </div>)}
    </div>);
}
