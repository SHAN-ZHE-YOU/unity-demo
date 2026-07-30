export const AXIS_NAMES = [
  '治理',
  '職場',
  '環境',
  '數位',
];

export const AXIS_LEVELS = ['起步', '建置中', '已成形', '成熟'];

export const AXIS_GUIDANCE = [
  {
    name: AXIS_NAMES[0],
    levels: {
      起步: '先把資安、ESG 與反賄賂的基本制度建立起來，並指定責任人。',
      建置中: '把制度落到人員訓練、會議紀錄與供應商要求，讓管理可被追蹤。',
      已成形: '補齊稽核、查核與供應鏈管理，將成果固定成例行流程。',
      成熟: '持續優化查核與揭露，讓制度、執行與佐證形成穩定閉環。',
    },
  },
  {
    name: AXIS_NAMES[1],
    levels: {
      起步: '先確認勞動、人權與職安衛的基本風險，建立最小可行的管理機制。',
      建置中: '把申訴、教育訓練與改善紀錄做完整，讓管理不只停在口頭。',
      已成形: '強化勞資溝通、人權盡職調查與職災改善追蹤。',
      成熟: '將員工關懷與人權管理納入日常治理，並持續留存查核證據。',
    },
  },
  {
    name: AXIS_NAMES[2],
    levels: {
      起步: '先把能資源、廢棄物與氣候風險的現況盤點完成。',
      建置中: '把統計資料與委外處理紀錄補齊，讓數據可以被查驗。',
      已成形: '開始把再生能源、盤查與風險辨識串進營運決策。',
      成熟: '持續提升揭露品質，讓環境管理有明確的改善節奏。',
    },
  },
  {
    name: AXIS_NAMES[3],
    levels: {
      起步: '先建立資料蒐集的固定流程，避免資訊零散。',
      建置中: '把電、水、燃料與 GHG 資料整合成可追蹤的管理表。',
      已成形: '導入系統化工具或自動化流程，提升資料一致性。',
      成熟: '讓數位工具支援查證、分析與對外揭露，形成穩定作業模式。',
    },
  },
];

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

export const normalizeAxisScores = (axisScores) => {
  const baseScores = Array.isArray(axisScores) ? axisScores : [];

  return AXIS_NAMES.map((_, index) => clampScore(baseScores[index]));
};

export const getAxisLevel = (score) => {
  const normalized = clampScore(score);

  if (normalized <= 25) return '起步';
  if (normalized <= 50) return '建置中';
  if (normalized <= 75) return '已成形';
  return '成熟';
};

export const getAxisGuide = (axisIndex, score) => {
  const profile = AXIS_GUIDANCE[axisIndex];
  if (!profile) return '';

  const level = getAxisLevel(score);
  return profile.levels[level] || '';
};

const getChildrenMap = (nodes = []) => {
  return nodes.reduce((map, node) => {
    const parentKey = node.parentId ?? '__root__';
    const bucket = map.get(parentKey) || [];
    bucket.push(node);
    map.set(parentKey, bucket);
    return map;
  }, new Map());
};

const getNodeMap = (nodes = []) => {
  return nodes.reduce((map, node) => map.set(node.id, node), new Map());
};

const getSelectedLeafNode = (question, answer) => {
  const nodes = question?.nodes || [];
  const nodeMap = getNodeMap(nodes);
  const path = Array.isArray(answer?.path) ? answer.path : [];
  const lastNodeId = path[path.length - 1];
  return lastNodeId ? nodeMap.get(lastNodeId) || null : null;
};

export const buildAxisScores = (answersByCode, questionBank) => {
  const axisTotals = AXIS_NAMES.map(() => ({ weightedScore: 0, weightedMax: 0 }));

  questionBank.forEach((question) => {
    if (question.kind !== 'score') return;

    const answer = answersByCode?.[question.code] || {};
    const selectedNode = getSelectedLeafNode(question, answer);
    const score = clampScore(selectedNode?.score);
    const axisIndex = question.axisIndex;
    const weight = Number(question.weight) || 0;

    if (axisIndex === undefined || axisIndex === null || axisIndex < 0 || axisIndex >= axisTotals.length) return;

    axisTotals[axisIndex].weightedScore += score * weight;
    axisTotals[axisIndex].weightedMax += 100 * weight;
  });

  return axisTotals.map(({ weightedScore, weightedMax }) => {
    if (weightedMax <= 0) return 0;
    return Math.round((weightedScore / weightedMax) * 100);
  });
};

export const buildComplianceResults = (answersByCode, questionBank) => {
  return questionBank
    .filter((question) => question.kind === 'compliance')
    .map((question) => {
      const answer = answersByCode?.[question.code] || {};
      const selectedNode = getSelectedLeafNode(question, answer);
      const lamp = selectedNode?.lamp || selectedNode?.score || '灰燈';

      const descriptionByLamp = {
        綠燈: '目前未見異常，建議持續維持現有管理。',
        黃燈: '已有改善基礎，建議持續追蹤並保留佐證。',
        紅燈: '需優先處理，建議儘速完成改善。',
        灰燈: '資訊未確認，建議先補齊現況資料。',
      };

      return {
        code: question.code,
        title: question.title,
        lamp,
        description: descriptionByLamp[lamp] || descriptionByLamp.灰燈,
      };
    });
};

export const buildSignalSummary = (answersByCode, questionBank) => {
  const signalQuestions = questionBank.filter((question) => question.kind === 'signal');

  return signalQuestions.map((question) => {
    const answer = answersByCode?.[question.code] || {};
    const selectedIds = Array.isArray(answer.selectedIds) ? answer.selectedIds : [];
    const selectedNodes = (question.nodes || []).filter((node) => selectedIds.includes(node.id));
    const total = selectedNodes.reduce((sum, node) => sum + clampScore(node.score), 0);

    return {
      code: question.code,
      title: question.title,
      score: total,
      selectedIds,
    };
  });
};

export const buildReportSummary = (answersByCode, questionBank) => {
  const axisScores = buildAxisScores(answersByCode, questionBank);
  const axisLevels = normalizeAxisScores(axisScores).map((score) => getAxisLevel(score));
  const complianceResults = buildComplianceResults(answersByCode, questionBank);
  const signalSummary = buildSignalSummary(answersByCode, questionBank);

  return {
    axisScores,
    axisLevels,
    complianceResults,
    signalSummary,
  };
};