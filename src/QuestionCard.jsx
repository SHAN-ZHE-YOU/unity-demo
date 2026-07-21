import React, { useState, useEffect, useRef } from 'react';
import { questionBank } from './questions';

const QuestionCard = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navRef = useRef(null);

  const currentQ = questionBank[currentIndex];

  // 測試開關（可改為 import.meta.env.VITE_ENABLE_TEST_FILL 在正式環境關閉）
  const ENABLE_TEST_FILL = true;

  // 共用狀態
  const [isNone, setIsNone] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // 1. Parallel 狀態
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [subValue, setSubValue] = useState(null);

  // 2. Sequential 狀態
  const [seqLevel, setSeqLevel] = useState(0);

  // 3. Violation 狀態
  const [safeChecked, setSafeChecked] = useState(false);
  const [violationChecked, setViolationChecked] = useState(false);
  const [violationSub, setViolationSub] = useState(null);

  // 4. Multiple 狀態
  const [multiChecked, setMultiChecked] = useState({});

  // 儲存每題答案以便保留填寫紀錄
  const [answers, setAnswers] = useState(() => questionBank.map(() => ({})));

  const applyAnswerToLocal = (answer = {}) => {
    setCheck1(!!answer.check1);
    setCheck2(!!answer.check2);
    setSubValue(answer.subValue ?? null);
    setSeqLevel(answer.seqLevel ?? 0);
    setSafeChecked(!!answer.safeChecked);
    setViolationChecked(!!answer.violationChecked);
    setViolationSub(answer.violationSub ?? null);
    setMultiChecked(answer.multiChecked ?? {});
    setIsNone(!!answer.isNone);
  };

  // 狀態重置（僅清本題暫存）
  const resetAllStates = () => {
    setCheck1(false); setCheck2(false); setSubValue(null);
    setSeqLevel(0);
    setSafeChecked(false); setViolationChecked(false); setViolationSub(null);
    setMultiChecked({});
    setIsNone(false);
  };

  const saveCurrentStateToAnswers = (index) => {
    const payload = { check1, check2, subValue, seqLevel, safeChecked, violationChecked, violationSub, multiChecked, isNone };
    setAnswers(prev => {
      const copy = [...prev];
      copy[index] = payload;
      return copy;
    });
    return payload;
  };

  const loadAnswersToLocal = (index) => {
    applyAnswerToLocal(answers[index] || {});
  };

  const handleJumpToQuestion = (index) => {
    if (index === currentIndex) return;
    saveCurrentStateToAnswers(currentIndex);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      loadAnswersToLocal(index);
      setIsTransitioning(false);
    }, 200);
  };

  useEffect(() => {
    if (navRef.current) {
      const activeButton = navRef.current.children[currentIndex];
      if (activeButton) activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  const handleNoneClick = () => {
    if (!isNone) {
      const hasAnySelection = check1 || check2 || seqLevel > 0 || safeChecked || violationChecked || Object.values(multiChecked).some(v => v);
      if (hasAnySelection) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }
      resetAllStates();
      setIsNone(true);
    } else setIsNone(false);
  };

  // --- Handlers ---
  const handleCheck1Toggle = () => { setCheck1(prev => !prev); setIsNone(false); saveCurrentStateToAnswers(currentIndex); };
  const handleCheck2Toggle = () => {
    const nextState = !check2;
    setCheck2(nextState);
    if (nextState && currentQ.subOptions) setSubValue(currentQ.subOptions[0].value);
    else setSubValue(null);
    setIsNone(false);
    saveCurrentStateToAnswers(currentIndex);
  };

  const handleSeqClick = (level) => {
    setIsNone(false);
    if (seqLevel === level) setSeqLevel(level - 1);
    else setSeqLevel(level);
    saveCurrentStateToAnswers(currentIndex);
  };

  // --- 計分與防呆邏輯 ---
  const currentState = { check1, check2, subValue, seqLevel, safeChecked, violationChecked, violationSub, multiChecked, isNone };
  const score = currentQ.calculateScore ? currentQ.calculateScore(currentState) : 0;

  let isNextDisabled = true;
  if (currentQ.type === 'parallel') {
    isNextDisabled = !check1 && !check2 && !isNone;
  } else if (currentQ.type === 'sequential') {
    isNextDisabled = seqLevel === 0 && !isNone;
  } else if (currentQ.type === 'violation') {
    isNextDisabled = !safeChecked && (!violationChecked || !violationSub) && !isNone;
  } else if (currentQ.type === 'multiple') {
    isNextDisabled = Object.values(multiChecked).every(v => !v) && !isNone;
  }

  const handleNextQuestion = () => {
    if (isNextDisabled) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const payload = saveCurrentStateToAnswers(currentIndex);

      if (currentIndex < questionBank.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);
        loadAnswersToLocal(next);
      } else {
        const allAnswers = answers.slice();
        allAnswers[currentIndex] = payload;
        const scores = allAnswers.map((a, idx) => {
          const s = questionBank[idx].calculateScore ? questionBank[idx].calculateScore(a || {}) : 0;
          return typeof s === 'number' ? s : 0;
        });
        // 轉為 6 軸，保留原本 mapping 邏輯（若需要可擴充）
        const axisDefaults = [60,60,60,60,60,60];
        const g1 = scores[0];
        const g2 = scores[1];
        const axisScores = [...axisDefaults];
        if (typeof g2 === 'number') axisScores[0] = Math.round(g2);
        if (typeof g1 === 'number') axisScores[1] = Math.round(g1);
        if (typeof onComplete === 'function') onComplete(axisScores);
      }
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    loadAnswersToLocal(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasAnswer = (idx) => {
    const a = answers[idx] || {};
    return Boolean(a.isNone || a.check1 || a.check2 || (a.seqLevel > 0) || a.safeChecked || a.violationChecked || (a.multiChecked && Object.values(a.multiChecked).some(v => v)));
  };

  const createRandomAnswerForQuestion = (q) => {
    if (q.type === 'parallel') {
      const state = Math.floor(Math.random() * 4);
      const check1Random = state === 1 || state === 3;
      const check2Random = state === 2 || state === 3;
      const subValueRandom = check2Random && q.subOptions?.length
        ? q.subOptions[Math.floor(Math.random() * q.subOptions.length)].value
        : null;

      return {
        check1: check1Random,
        check2: check2Random,
        subValue: subValueRandom,
        seqLevel: 0,
        safeChecked: false,
        violationChecked: false,
        violationSub: null,
        multiChecked: {},
        isNone: state === 0,
      };
    }

    if (q.type === 'sequential') {
      const maxLevel = q.steps?.length || 0;
      const seqLevelRandom = Math.floor(Math.random() * (maxLevel + 1));

      return {
        check1: false,
        check2: false,
        subValue: null,
        seqLevel: seqLevelRandom,
        safeChecked: false,
        violationChecked: false,
        violationSub: null,
        multiChecked: {},
        isNone: seqLevelRandom === 0,
      };
    }

    if (q.type === 'violation') {
      const state = Math.floor(Math.random() * 4);
      const violationSubRandom = (state === 2 || state === 3) && q.subOptions?.length
        ? q.subOptions[Math.floor(Math.random() * q.subOptions.length)].value
        : null;

      return {
        check1: false,
        check2: false,
        subValue: null,
        seqLevel: 0,
        safeChecked: state === 0,
        violationChecked: state === 2 || state === 3,
        violationSub: violationSubRandom,
        multiChecked: {},
        isNone: state === 1,
      };
    }

    if (q.type === 'multiple') {
      const multiCheckedRandom = {};
      let hasSelection = false;

      (q.options || []).forEach((opt) => {
        const selected = Math.random() > 0.5;
        multiCheckedRandom[opt.id] = selected;
        hasSelection = hasSelection || selected;
      });

      return {
        check1: false,
        check2: false,
        subValue: null,
        seqLevel: 0,
        safeChecked: false,
        violationChecked: false,
        violationSub: null,
        multiChecked: multiCheckedRandom,
        isNone: !hasSelection,
      };
    }

    return {
      check1: false,
      check2: false,
      subValue: null,
      seqLevel: 0,
      safeChecked: false,
      violationChecked: false,
      violationSub: null,
      multiChecked: {},
      isNone: true,
    };
  };

  const randomFillCurrent = () => {
    if (!ENABLE_TEST_FILL) return;
    const randomAnswers = questionBank.map((question) => createRandomAnswerForQuestion(question));
    setAnswers(randomAnswers);
    applyAnswerToLocal(randomAnswers[currentIndex]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">

      {/* Progress Navigation */}
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <div className="p-2 sm:p-3 flex items-center overflow-x-auto hide-scrollbar" ref={navRef}>
          {questionBank.map((q, idx) => {
            const answered = hasAnswer(idx);
            const baseClass = `flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 mx-1 rounded-full text-xs sm:text-sm font-bold transition-all duration-300`;
            const cls = idx === currentIndex
              ? `${baseClass} bg-slate-600 text-white ring-2 ring-slate-400 shadow-md`
              : answered
                ? `${baseClass} bg-slate-400 text-white`
                : `${baseClass} bg-slate-100 text-slate-400 hover:bg-slate-200`;
            return (
              <button key={q.id} onClick={() => handleJumpToQuestion(idx)} className={cls} title={`第 ${idx + 1} 題`}>
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className={`bg-white rounded-xl shadow-sm font-sans transition-opacity duration-300 overflow-hidden ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="p-5 sm:p-8">
        <div className="text-xs font-semibold text-slate-400 mb-2 tracking-wider">
          {currentQ.prefix} / {questionBank.length}
        </div>

          <div className="text-xs font-semibold text-slate-500 mb-2 tracking-wider uppercase">
            {currentQ.prefix} / {questionBank.length}
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-slate-800 leading-snug">
            {currentQ.title}
          </h2>

          <div className={`space-y-3 ${isShaking ? 'animate-shake' : 'transition-colors duration-300'}`}>

            {currentQ.type === 'parallel' && (
              <>
                <button onClick={handleCheck1Toggle} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg font-medium transition-all text-sm sm:text-base touch-manipulation ${check1 ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  {check1 ? '☑' : '☐'} {currentQ.check1Label}
                </button>
                <div className="space-y-2">
                  <button onClick={handleCheck2Toggle} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg font-medium transition-all text-sm sm:text-base touch-manipulation ${check2 ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    {check2 ? '☑' : '☐'} {currentQ.check2Label}
                  </button>
                  {check2 && currentQ.subOptions && (
                    <div className="space-y-2 mt-3 animate-fade-in-down ml-4 sm:ml-6 border-l-2 border-slate-200 pl-4">
                      {currentQ.subOptions.map((sub) => (
                        <label key={sub.value} className={`flex items-center gap-3 w-full px-3 sm:px-4 py-3 rounded-lg border transition-all cursor-pointer text-sm sm:text-base touch-manipulation ${subValue === sub.value ? 'border-slate-400 bg-slate-100 text-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                          <input type="radio" checked={subValue === sub.value} onChange={() => { setSubValue(sub.value); setIsNone(false); saveCurrentStateToAnswers(currentIndex); }} className="w-5 h-5 text-slate-600 flex-shrink-0" />
                          <span className="font-medium">{sub.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {currentQ.type === 'sequential' && (
              <div className="space-y-3">
                {currentQ.steps.map((step) => {
                  const isVisible = step.level === 1 || seqLevel >= step.level - 1;
                  const isActive = seqLevel >= step.level;
                  if (!isVisible) return null;
                  return (
                    <div key={step.level} className="animate-fade-in-down">
                      <button onClick={() => handleSeqClick(step.level)} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg border font-medium transition-all text-sm sm:text-base touch-manipulation ${isActive ? 'border-slate-500 bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full text-xs font-semibold bg-white/20 text-current align-middle flex-shrink-0">
                          {step.level}
                        </span>
                        {step.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'violation' && (
              <>
                <button onClick={() => { setSafeChecked(true); setViolationChecked(false); setViolationSub(null); setIsNone(false); saveCurrentStateToAnswers(currentIndex); }} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg font-medium transition-all text-sm sm:text-base touch-manipulation ${safeChecked ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  {safeChecked ? '☑' : '☐'} {currentQ.safeLabel}
                </button>
                <div className="space-y-2">
                  <button onClick={() => { setViolationChecked(true); setSafeChecked(false); if(!violationSub) setViolationSub(currentQ.subOptions[0].value); setIsNone(false); saveCurrentStateToAnswers(currentIndex); }} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg font-medium transition-all text-sm sm:text-base touch-manipulation ${violationChecked ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    {violationChecked ? '☑' : '☐'} {currentQ.violationLabel}
                  </button>
                  {violationChecked && (
                    <div className="space-y-2 mt-3 animate-fade-in-down ml-4 sm:ml-6 border-l-2 border-slate-200 pl-4">
                      {currentQ.subOptions.map((sub) => (
                        <label key={sub.value} className={`flex items-center gap-3 w-full px-3 sm:px-4 py-3 rounded-lg border transition-all cursor-pointer text-sm sm:text-base touch-manipulation ${violationSub === sub.value ? 'border-slate-400 bg-slate-100 text-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                          <input type="radio" checked={violationSub === sub.value} onChange={() => { setViolationSub(sub.value); setIsNone(false); saveCurrentStateToAnswers(currentIndex); }} className="w-5 h-5 text-slate-600 flex-shrink-0" />
                          <span className="font-medium">{sub.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {currentQ.type === 'multiple' && (
              <div className="space-y-3">
                {currentQ.options.map((opt) => (
                  <button key={opt.id} onClick={() => { 
                    setMultiChecked(prev => {
                      const next = {...prev, [opt.id]: !prev[opt.id]};
                      setTimeout(() => saveCurrentStateToAnswers(currentIndex), 10);
                      return next;
                    }); 
                    setIsNone(false); 
                  }} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg font-medium transition-all text-sm sm:text-base touch-manipulation ${multiChecked[opt.id] ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    {multiChecked[opt.id] ? '☑' : '☐'} {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 my-6"></div>

            <button onClick={handleNoneClick} className={`w-full text-left px-4 py-3.5 sm:py-4 rounded-lg font-medium transition-all text-sm sm:text-base touch-manipulation ${isNone ? 'bg-slate-700 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {isNone ? '☑' : '☐'} {currentQ.noneLabel}
            </button>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm font-medium text-slate-500">目前預估得分: <span className="text-slate-700 text-lg font-bold ml-2">{score}</span></div>
            <div className="flex items-center gap-2 sm:gap-3">
              {ENABLE_TEST_FILL && (
                <button onClick={randomFillCurrent} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-medium transition-all touch-manipulation">隨機填答全部</button>
              )}
              <button onClick={handleNextQuestion} disabled={isNextDisabled} className={`flex-1 sm:flex-none px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all touch-manipulation ${
                isNextDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md active:scale-95'
              }`}>
                {currentIndex === questionBank.length - 1 ? '看結果' : '下一題'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default QuestionCard;
