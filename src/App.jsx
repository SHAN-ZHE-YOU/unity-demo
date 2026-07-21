import React, { useState } from 'react';
import HomePage from './HomePage';
import QuestionCard from './QuestionCard';
import ResultPage from './ResultPage';

function App() {
  // 控制目前顯示的畫面: 'home' | 'survey' | 'result'
  const [currentView, setCurrentView] = useState('home');
  
  // 儲存從首頁填寫的公司資料
  const [leadData, setLeadData] = useState(null);
  
  // 儲存最後的雷達圖分數
  const [finalScores, setFinalScores] = useState([]);

  // 首頁表單送出後觸發
  const handleStartSurvey = (formData) => {
    setLeadData(formData);
    setCurrentView('survey');
    console.log("已暫存名單：", formData);
  };

  // 問卷最後一題完成後觸發
  const handleSurveyComplete = (axisScores) => {
    // 接收問卷組件回傳的六軸分數
    setFinalScores(axisScores);
    setCurrentView('result');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-6 sm:py-12 px-4 sm:px-6 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        {currentView === 'home' && <HomePage onStartSurvey={handleStartSurvey} />}
        {currentView === 'survey' && <QuestionCard onComplete={handleSurveyComplete} />}
        {currentView === 'result' && <ResultPage axisScores={finalScores} />}
      </div>
    </div>
  );
}

export default App;