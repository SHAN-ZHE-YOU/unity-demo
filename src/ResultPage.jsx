import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { AXIS_NAMES, normalizeAxisScores } from './esgScoring';

// 註冊 Chart.js 元件
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ResultPage = ({ axisScores }) => {
  const axisNames = AXIS_NAMES;
  const scores = normalizeAxisScores(axisScores);

  // 2. 計算總分與找出最低分面向
  const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / 6);
  const minScore = Math.min(...scores);
  
  // 找出最低分的面向名稱 (最多取2個)
  const lowestAxes = scores
    .map((score, index) => score === minScore ? axisNames[index] : null)
    .filter(name => name !== null)
    .slice(0, 2)
    .join("」與「");

  // 3. 判斷風險等級與差異分析文字 (依據規格書)
  let riskLabel = "";
  let riskColor = "";
  let suggestionText = "";

  if (totalScore >= 80) {
    riskLabel = "低風險";
    riskColor = "text-green-600 bg-green-50 border-green-200";
    // 六面向平均皆 >= 80，不特別點名最低分面向
    const displayAxis = minScore >= 80 ? "各面向" : `「${lowestAxes}」`;
    suggestionText = `貴公司於${displayAxis}表現已達一定基礎，建議持續維持現有管理機制，並可進一步了解完整版供應鏈ESG管理平台，強化制度化與可查核性。`;
  } else if (totalScore >= 60) {
    riskLabel = "中風險";
    riskColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
    suggestionText = `貴公司於「${lowestAxes}」仍有補強空間，建議優先建立或完善相關制度與資料紀錄；完整版平台可提供逐題差距分析與改善建議清單。`;
  } else {
    riskLabel = "高風險";
    riskColor = "text-red-600 bg-red-50 border-red-200";
    suggestionText = `貴公司於「${lowestAxes}」存在明顯落差，建議儘速規劃改善措施；完整版平台可提供分項風險判定、佐證文件追蹤與改善優先順序建議。`;
  }

  // 4. 雷達圖設定
  const data = {
    labels: axisNames,
    datasets: [
      {
        label: '企業 ESG 成熟度',
        data: scores,
        backgroundColor: 'rgba(0, 188, 212, 0.3)', // 青藍色帶透明度
        borderColor: 'rgba(0, 188, 212, 0.8)',
        pointBackgroundColor: 'rgba(255, 235, 59, 1)', // 黃色節點
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 188, 212, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          font: { size: 12, family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" },
          color: '#475569'
        },
        ticks: {
          stepSize: 20,
          display: false // 隱藏軸線上的數字，保持畫面乾淨
        }
      }
    },
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 animate-fade-in-down">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 sm:px-8 py-8 sm:py-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">永續健檢初步結果</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="text-center">
              <span className="text-slate-300 text-sm block mb-1">整體總分</span>
              <span className="text-5xl sm:text-6xl font-black text-white">{totalScore}</span>
            </div>
            <div className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 font-bold text-base sm:text-lg ${riskColor}`}>
              {riskLabel}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* 雷達圖區塊 */}
          <div className="relative w-full" style={{ height: '300px', minHeight: '280px' }}>
            <div className="absolute inset-0">
              <Radar data={data} options={options} />
            </div>
          </div>

          {/* 差異分析建議區塊 */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 sm:p-6 rounded-lg border border-slate-200">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 flex items-start gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>差異分析與建議</span>
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {suggestionText}
            </p>
          </div>

          {/* CTA 按鈕 */}
          <button className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white font-bold py-3.5 sm:py-4 rounded-lg shadow-md hover:shadow-lg hover:from-slate-700 hover:to-slate-600 transition-all active:scale-95 touch-manipulation text-base">
            預約完整版永續供應鏈健檢
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;