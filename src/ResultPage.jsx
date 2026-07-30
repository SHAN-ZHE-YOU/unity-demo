import React, { useMemo } from 'react';
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
import { AXIS_GUIDANCE, AXIS_NAMES, getAxisGuide, getAxisLevel, normalizeAxisScores } from './esgScoring';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const levelToneClass = {
  起步: 'bg-slate-100 text-slate-700 border-slate-200',
  建置中: 'bg-amber-50 text-amber-700 border-amber-200',
  已成形: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  成熟: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const lampToneClass = {
  綠燈: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  黃燈: 'bg-amber-50 text-amber-700 border-amber-200',
  紅燈: 'bg-rose-50 text-rose-700 border-rose-200',
  灰燈: 'bg-slate-100 text-slate-700 border-slate-200',
};

const ResultPage = ({ surveyResult, leadData }) => {
  const axisScores = normalizeAxisScores(surveyResult?.axisScores);
  const axisLevels = Array.isArray(surveyResult?.axisLevels) && surveyResult.axisLevels.length === AXIS_NAMES.length
    ? surveyResult.axisLevels
    : axisScores.map((score) => getAxisLevel(score));
  const complianceResults = Array.isArray(surveyResult?.complianceResults) ? surveyResult.complianceResults : [];

  const lowestAxisIndex = useMemo(() => {
    if (axisScores.length === 0) return 0;
    return axisScores.reduce((lowestIndex, score, index, array) => {
      return score < array[lowestIndex] ? index : lowestIndex;
    }, 0);
  }, [axisScores]);

  const lowestAxisName = AXIS_NAMES[lowestAxisIndex];
  const lowestAxisGuide = getAxisGuide(lowestAxisIndex, axisScores[lowestAxisIndex]);

  const data = {
    labels: AXIS_NAMES,
    datasets: [
      {
        label: '企業成熟度',
        data: axisScores,
        backgroundColor: 'rgba(15, 23, 42, 0.16)',
        borderColor: 'rgba(15, 23, 42, 0.78)',
        pointBackgroundColor: 'rgba(15, 23, 42, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(15, 23, 42, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    // 新增：增加圖表四周的 padding，避免手機版左右標籤被卡片切掉
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 25,
        right: 25,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 25,
          display: false,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.28)',
        },
        angleLines: {
          color: 'rgba(148, 163, 184, 0.28)',
        },
        pointLabels: {
          color: '#334155',
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-0 animate-fade-in-down">
      <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-8 sm:px-10 sm:py-10">
          <div className="text-center">
            {/* <p className="mb-2 text-sm font-semibold tracking-[0.35em] text-slate-300 uppercase">
              永續健檢結果
            </p> */}
            <h2 className="text-2xl font-bold text-white sm:text-4xl">
              {leadData?.companyName ? `${leadData.companyName} 的` : ''}永續健檢結果
            </h2>
            {/* <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              這份結果只顯示四軸成熟度、合規燈號與建議下一步，不顯示總分與百分比。
            </p> */}
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
              {/* <div className="relative h-[280px] w-full sm:h-[360px]"> */}
              <div className="relative mx-auto h-[260px] w-full max-w-[280px] sm:h-[360px] sm:max-w-none">
                <Radar data={data} options={options} />
              </div>
            </div>
{/* 
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">關鍵缺口</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{lowestAxisName}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{lowestAxisGuide}</p>
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">目前等級</p>
                <p className={`mt-2 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${levelToneClass[axisLevels[lowestAxisIndex]] || levelToneClass.起步}`}>
                  {axisLevels[lowestAxisIndex]}
                </p>
              </div>
            </div> */}
          </div>

          <div>
            {/* <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">詳細說明</h3>
                <p className="text-sm text-slate-500">每軸顯示等級與下一步建議。</p>
              </div>
            </div> */}
            <div className="md:grid-cols-2 grid gap-4">
              {AXIS_GUIDANCE.map((axisProfile, index) => (
                <div key={axisProfile.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {/* <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">軸 {index + 1}</p> */}
                      <h4 className="mt-1 text-lg font-bold text-slate-900">{axisProfile.name}</h4>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-sm font-bold ${levelToneClass[axisLevels[index]] || levelToneClass.起步}`}>
                      {axisLevels[index]}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
                    {getAxisGuide(index, axisScores[index])}
                  </p>
                </div>
              ))}
            </div>
          </div>

           <hr className="my-3 border-slate-200" />

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">合規燈號</h3>
                {/* <p className="text-sm text-slate-500">獨立顯示五題燈號，不納入雷達圖。</p> */}
              </div>
            </div>
            {/* 更改：將 md:grid-cols-2 移除，改為單欄垂直堆疊 (grid gap-4)，讓每張合規燈號卡片各自佔據一橫列 */}
            <div className="grid gap-4">
              {complianceResults.map((item) => (
                <div key={item.code} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">{item.code}</p>
                      <h4 className="mt-1 text-base font-bold text-slate-900">{item.title}</h4>
                    </div>
                    {/* <span className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-bold ${lampToneClass[item.lamp] || lampToneClass.灰燈}`}>

                      {item.lamp}
                    </span> */}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full rounded-2xl bg-slate-900 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.99] touch-manipulation">
            預約完整版永續健檢
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
