import React, { useState, useRef, useEffect, useCallback } from 'react';
import HomePage from './HomePage';
import QuestionCard from './QuestionCard';
import ResultPage from './ResultPage';

// 👇 部署 Google Apps Script 後，把這裡換成你的 Web App URL（.../exec 結尾）
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1d4Yi7XXXzqwrz1ChNfc9iZ3qdoI52ZMlhCf86RWjfPkIxZKpqmSyzYy8fg8f3Wu6/exec';

// 自動儲存間隔：每 60 秒一次
const AUTO_SAVE_INTERVAL_MS = 60 * 1000;

// 產生一個此次填答的唯一識別碼，讓後端可以判斷「更新既有紀錄」還是「新增一筆」
function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function App() {
  // 控制目前顯示的畫面: 'home' | 'survey' | 'result'
  const [currentView, setCurrentView] = useState('home');
  
  // 儲存從首頁填寫的公司資料
  const [leadData, setLeadData] = useState(null);
  
  // 儲存最後的問卷結果
  const [surveyResult, setSurveyResult] = useState(null);

  // 儲存狀態：idle | saving | saved | error（給 UI 顯示用）
  const [saveStatus, setSaveStatus] = useState('idle');

  // 用 ref 存放最新資料，避免 interval / callback 抓到過期的 state（closure 問題）
  const sessionIdRef = useRef(generateSessionId());
  const leadDataRef = useRef(null);
  const progressRef = useRef({ currentIndex: 0, answersByCode: {} });

  // 統一的儲存函式：手動儲存、自動儲存、完成問卷時都呼叫這個
  const saveProgress = useCallback(async (overrides = {}) => {
    if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.includes('YOUR_DEPLOYMENT_ID')) {
      console.warn('尚未設定 GAS_WEB_APP_URL，略過本次儲存。請先部署 Google Apps Script 並填入網址。');
      return;
    }

    const payload = {
      sessionId: sessionIdRef.current,
      status: overrides.status || 'in_progress',
      leadData: leadDataRef.current || {},
      currentIndex: progressRef.current.currentIndex,
      answersByCode: progressRef.current.answersByCode,
      surveyResult: overrides.surveyResult || null,
    };

    setSaveStatus('saving');
    try {
      // 用 text/plain 避免瀏覽器發出 CORS 預檢 (preflight)，GAS 端用 e.postData.contents 解析
      await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('儲存到後端失敗：', err);
      setSaveStatus('error');
    }
  }, []);

  // 每分鐘自動儲存一次，只在問卷進行中啟動
  useEffect(() => {
    if (currentView !== 'survey') return undefined;

    const timer = setInterval(() => {
      saveProgress();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentView, saveProgress]);

  // 首頁表單送出後觸發
  const handleStartSurvey = (formData) => {
    leadDataRef.current = formData;
    setLeadData(formData);
    setCurrentView('survey');
    console.log("已暫存名單：", formData);
    // 一開始就先存一筆，確保後端已經有名單資料
    saveProgress();
  };

  // QuestionCard 內部答案有變動時觸發，只更新 ref，不會造成 App 重新 render
  const handleProgressChange = useCallback((currentIndex, answersByCode) => {
    progressRef.current = { currentIndex, answersByCode };
  }, []);

  // 手動儲存按鈕觸發
  const handleManualSave = useCallback(() => {
    saveProgress();
  }, [saveProgress]);

  // 問卷最後一題完成後觸發
  const handleSurveyComplete = (result) => {
    // 接收問卷組件回傳的完整摘要
    setSurveyResult(result);
    setCurrentView('result');
    // 完成時儲存最終結果與狀態
    saveProgress({ status: 'completed', surveyResult: result });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-6 sm:py-12 px-4 sm:px-6 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        {currentView === 'home' && <HomePage onStartSurvey={handleStartSurvey} />}
        {currentView === 'survey' && (
          <QuestionCard
            onComplete={handleSurveyComplete}
            onProgressChange={handleProgressChange}
            onSaveNow={handleManualSave}
            saveStatus={saveStatus}
          />
        )}
        {currentView === 'result' && <ResultPage surveyResult={surveyResult} leadData={leadData} />}
      </div>
    </div>
  );
}

export default App;