// src/questions.js

export const questionBank = [
  // --- G: 公司治理與誠信 ---
  {
    id: 1, type: "parallel", prefix: "G1",
    title: "貴公司資安管理與客戶資料保護，目前實際狀況為何？",
    check1Label: "有資安防護設備", check2Label: "訂有資安管理規則",
    subOptions: [
      { value: 'no-leak', label: '近三年無資料外洩事件' },
      { value: 'improved', label: '近三年曾有投訴但已改善' }
    ],
    noneLabel: "皆無 / 不清楚",
    calculateScore: ({ check1, check2, subValue, isNone }) => {
      if (check1 && check2 && subValue === 'no-leak') return 100;   //[cite: 1]
      if (check1 && check2 && subValue === 'improved') return 60;   //[cite: 1]
      if (!check1 && check2 && subValue === 'no-leak') return 60;
      if (!check1 && check2 && subValue === 'improved') return 30;
      if (check1 && !check2) return 30;                             //[cite: 1]
      if (isNone) return 0;                                         //[cite: 1]
      return 0;
    }
  },
  {
    id: 2, type: "sequential", prefix: "G2",
    title: "貴公司永續發展 (ESG) 推動現況為何？",
    steps: [
      { level: 1, label: "有專責單位或專人推動" },
      { level: 2, label: "已納入企業策略" },
      { level: 3, label: "訂有短中長期目標" }
    ],
    noneLabel: "僅初步想法 / 尚未開始",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 3) return 100;     //[cite: 1]
      if (seqLevel === 2) return 60;      //[cite: 1]
      if (seqLevel === 1) return 30;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 3, type: "sequential", prefix: "G3",
    title: "貴公司反賄賂與商業道德政策，實際執行情形為何？",
    steps: [
      { level: 1, label: "訂有反賄賂與商業道德政策" },
      { level: 2, label: "近一年辦過相關教育訓練" }
    ],
    noneLabel: "尚未訂定 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 2) return 100;     //[cite: 1]
      if (seqLevel === 1) return 60;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 4, type: "violation", prefix: "G4",
    title: "貴公司近三年是否曾因反競爭行為、壟斷受到裁罰或訴訟？",
    safeLabel: "無受罰或訴訟紀錄",
    violationLabel: "曾受裁罰或訴訟",
    subOptions: [
      { value: 'improved', label: '已改善結案' },
      { value: 'not-improved', label: '尚未結案或改善' }
    ],
    noneLabel: "不清楚",
    calculateScore: ({ safeChecked, violationSub, isNone }) => {
      if (safeChecked) return 100;                      //[cite: 1]
      if (violationSub === 'improved') return 60;       //[cite: 1]
      if (violationSub === 'not-improved') return 0;    //[cite: 1]
      if (isNone) return 30;                            //[cite: 1]
      return 0;
    }
  },
  {
    id: 5, type: "multiple", prefix: "G5",
    title: "貴公司對供應商的 ESG / 永續管理，有採取哪些做法？（可複選）",
    options: [
      { id: 'opt1', label: '已簽署 RBA 或客戶要求之供應商行為準則' },
      { id: 'opt2', label: '對供應商執行環安衛稽核' },
      { id: 'opt3', label: '已制定 ESG 準則並要求供應商簽署' },
      { id: 'opt4', label: '可提供近 2 年會計簽證財務報表' }
    ],
    noneLabel: "皆無採取上述做法",
    calculateScore: ({ multiChecked, isNone }) => {
      if (isNone) return 0;                             //[cite: 1]
      const count = Object.values(multiChecked).filter(Boolean).length;
      return count * 25; // 每項 25 分，最高 100 分[cite: 1]
    }
  },

  // --- S: 社會與勞動人權 ---
  {
    id: 6, type: "violation", prefix: "S1",
    title: "貴公司近三年是否曾違反《勞動基準法》且遭裁罰？",
    safeLabel: "無違反紀錄", violationLabel: "曾違反且遭裁罰",
    subOptions: [
      { value: 'improved', label: '已提出改善計畫' },
      { value: 'not-improved', label: '未提出改善計畫' }
    ],
    noneLabel: "不清楚",
    calculateScore: ({ safeChecked, violationSub, isNone }) => {
      if (safeChecked) return 100;                      //[cite: 1]
      if (violationSub === 'improved') return 60;       //[cite: 1]
      if (violationSub === 'not-improved') return 0;    //[cite: 1]
      if (isNone) return 30;                            //[cite: 1]
      return 0;
    }
  },
  {
    id: 7, type: "violation", prefix: "S2",
    title: "貴公司近三年在性別平等 / 反歧視方面，實際狀況為何？",
    safeLabel: "無違法紀錄，且無經證實之歧視事件", violationLabel: "曾發生相關歧視事件",
    subOptions: [
      { value: 'improved', label: '已全部改善' },
      { value: 'not-improved', label: '尚未完成改善' }
    ],
    noneLabel: "不清楚",
    calculateScore: ({ safeChecked, violationSub, isNone }) => {
      if (safeChecked) return 100;                      //[cite: 1]
      if (violationSub === 'improved') return 60;       //[cite: 1]
      if (violationSub === 'not-improved') return 0;    //[cite: 1]
      if (isNone) return 30;                            //[cite: 1]
      return 0;
    }
  },
  {
    id: 8, type: "sequential", prefix: "S3",
    title: "貴公司是否確認無童工雇用，並進行人權盡職調查？",
    steps: [
      { level: 1, label: "確認無童工雇用" },
      { level: 2, label: "人權盡職調查機制建立中" },
      { level: 3, label: "已完成盡職調查並訂有改善計畫" }
    ],
    noneLabel: "有僱用未滿18歲員工 / 不符法規 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 3) return 100;     //[cite: 1]
      if (seqLevel === 2) return 60;      //[cite: 1]
      if (seqLevel === 1) return 30;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 9, type: "sequential", prefix: "S4",
    title: "貴公司職業安全衛生管理與職災紀錄，實際狀況為何？",
    steps: [
      { level: 1, label: "內部訂有職業安全衛生規範" },
      { level: 2, label: "規範已完整實施" },
      { level: 3, label: "定期更新規範，且近一年無職災" }
    ],
    noneLabel: "尚未訂定規範 / 職災尚未完成改善",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 3) return 100;     //[cite: 1]
      if (seqLevel === 2) return 60;      //[cite: 1]
      if (seqLevel === 1) return 30;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 10, type: "violation", prefix: "S5",
    title: "去年度是否曾因強迫勞動、工時薪資違反而受主管機關裁罰？",
    safeLabel: "無受罰紀錄", violationLabel: "曾受主管機關裁罰",
    subOptions: [
      { value: 'improved', label: '已提出改善計畫' },
      { value: 'not-improved', label: '未提出改善計畫' }
    ],
    noneLabel: "不清楚",
    calculateScore: ({ safeChecked, violationSub, isNone }) => {
      if (safeChecked) return 100;                      //[cite: 1]
      if (violationSub === 'improved') return 60;       //[cite: 1]
      if (violationSub === 'not-improved') return 0;    //[cite: 1]
      if (isNone) return 30;                            //[cite: 1]
      return 0;
    }
  },
  {
    id: 11, type: "sequential", prefix: "S6",
    title: "貴公司對員工組織工會或集體談判權利，實際做法為何？",
    steps: [
      { level: 1, label: "允許員工自由籌組工會" },
      { level: 2, label: "保障權利且無任何限制" }
    ],
    noneLabel: "有限制員工組工會 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 2) return 100;     //[cite: 1]
      if (seqLevel === 1) return 60;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 12, type: "parallel", prefix: "S7",
    title: "貴公司員工申訴管道與滿意度調查，實際運作情形為何？",
    check1Label: "設有員工申訴管道", check2Label: "有定期執行滿意度調查",
    noneLabel: "兩者皆無 / 不清楚",
    calculateScore: ({ check1, check2, isNone }) => {
      if (check1 && check2) return 100;     //[cite: 1]
      if (check1 || check2) return 60;      //[cite: 1]
      if (isNone) return 30;                //[cite: 1]
      return 0;
    }
  },

  // --- E: 資源與環境管理 ---
  {
    id: 13, type: "sequential", prefix: "E1",
    title: "貴公司最近一次完整年度用電量統計是什麼時候？",
    steps: [
      { level: 1, label: "內部有統計用電量" },
      { level: 2, label: "資料為最近一年度且完整可提供" }
    ],
    noneLabel: "尚未系統化統計 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 2) return 100;     //[cite: 1]
      if (seqLevel === 1) return 60;      //[cite: 1]
      if (isNone) return 30;              //[cite: 1]
      return 0;
    }
  },
  {
    id: 14, type: "sequential", prefix: "E2",
    title: "貴公司目前再生能源使用情形為何？",
    steps: [
      { level: 1, label: "已開始規劃或評估" },
      { level: 2, label: "已實際使用再生能源 (購買或自發電)" },
      { level: 3, label: "持續追蹤使用比例" }
    ],
    noneLabel: "尚未考慮 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 3) return 100;     //[cite: 1]
      if (seqLevel === 2) return 60;      //[cite: 1]
      if (seqLevel === 1) return 30;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 15, type: "sequential", prefix: "E3",
    title: "貴公司最近一次完整年度用水量統計是什麼時候？",
    steps: [
      { level: 1, label: "內部有統計用水量" },
      { level: 2, label: "資料為最近一年度且完整可提供" }
    ],
    noneLabel: "尚未系統化統計 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 2) return 100;     //[cite: 1]
      if (seqLevel === 1) return 60;      //[cite: 1]
      if (isNone) return 30;              //[cite: 1]
      return 0;
    }
  },
  {
    id: 16, type: "sequential", prefix: "E4",
    title: "貴公司廢棄物處理紀錄，目前保存情形為何？",
    steps: [
      { level: 1, label: "有委託業者處理廢棄物" },
      { level: 2, label: "確定為合法業者" },
      { level: 3, label: "具備完整處理紀錄可提供" }
    ],
    noneLabel: "委外未追蹤 / 不確定是否合法 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 3) return 100;     //[cite: 1]
      if (seqLevel === 2) return 60;      //[cite: 1]
      if (seqLevel === 1) return 30;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },
  {
    id: 17, type: "violation", prefix: "E5",
    title: "貴公司近三年是否曾違反環境相關法規 (水污染、空污等)？",
    safeLabel: "無違反紀錄", violationLabel: "曾違反環境相關法規",
    subOptions: [
      { value: 'improved', label: '已改善結案' },
      { value: 'not-improved', label: '尚未結案或改善' }
    ],
    noneLabel: "不清楚",
    calculateScore: ({ safeChecked, violationSub, isNone }) => {
      if (safeChecked) return 100;                      //[cite: 1]
      if (violationSub === 'improved') return 60;       //[cite: 1]
      if (violationSub === 'not-improved') return 0;    //[cite: 1]
      if (isNone) return 30;                            //[cite: 1]
      return 0;
    }
  },
  {
    id: 18, type: "sequential", prefix: "E6",
    title: "貴公司溫室氣體 (GHG) 盤查目前進度為何？",
    steps: [
      { level: 1, label: "盤查規劃中" },
      { level: 2, label: "已完成內部盤查" },
      { level: 3, label: "已通過第三方查證 (含 ISO 14064)" }
    ],
    noneLabel: "尚未盤查 / 不清楚",
    calculateScore: ({ seqLevel, isNone }) => {
      if (seqLevel === 3) return 100;     //[cite: 1]
      if (seqLevel === 2) return 60;      //[cite: 1]
      if (seqLevel === 1) return 30;      //[cite: 1]
      if (isNone) return 0;               //[cite: 1]
      return 0;
    }
  },

  // --- 第 19 題: 不計分題 ---
  {
    id: 19, type: "sequential", prefix: "Q19",
    title: "貴公司目前是否使用數位化工具或 AI 技術輔助 ESG 管理？",
    steps: [
      { level: 1, label: "已開始規劃或評估" },
      { level: 2, label: "系統正在導入中" },
      { level: 3, label: "已經正式使用" }
    ],
    noneLabel: "尚未規劃 / 不清楚",
    calculateScore: () => 0 // 此題不計分[cite: 1]
  }
];