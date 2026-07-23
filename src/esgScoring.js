export const AXIS_NAMES = [
  '公司治理與誠信',
  '資安與供應鏈',
  '勞動人權',
  '職場友善與多元',
  '資源使用管理',
  '氣候與法規遵循',
];

const AXIS_INDEX_BY_PREFIX = {
  G1: 1,
  G2: 0,
  G3: 0,
  G4: 0,
  G5: 1,
  S1: 2,
  S2: 3,
  S3: 2,
  S4: 3,
  S5: 2,
  S6: 2,
  S7: 3,
  E1: 4,
  E2: 4,
  E3: 4,
  E4: 5,
  E5: 5,
  E6: 5,
};

export const normalizeAxisScores = (axisScores) => {
  const baseScores = Array.isArray(axisScores) ? axisScores : [];

  return AXIS_NAMES.map((_, index) => {
    const value = baseScores[index];
    return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  });
};

export const buildAxisScores = (answers, questionBank) => {
  const axisTotals = AXIS_NAMES.map(() => ({ sum: 0, count: 0 }));

  questionBank.forEach((question, index) => {
    const axisIndex = AXIS_INDEX_BY_PREFIX[question.prefix];
    if (axisIndex === undefined) return;

    const answer = answers?.[index] || {};
    const rawScore = question.calculateScore ? question.calculateScore(answer) : 0;
    const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;

    axisTotals[axisIndex].sum += score;
    axisTotals[axisIndex].count += 1;
  });

  return axisTotals.map(({ sum, count }) => (count > 0 ? Math.round(sum / count) : 0));
};