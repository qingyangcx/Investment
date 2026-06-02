export const STATUS_PASS = "pass";
export const STATUS_FAIL = "fail";
export const STATUS_NA = "na";

export function computeScore(criteria, scorecard) {
  const total = criteria.length;
  let passed = 0;
  let failed = 0;
  let na = 0;
  for (const c of criteria) {
    const s = scorecard?.[c.id]?.status;
    if (s === STATUS_PASS) passed++;
    else if (s === STATUS_FAIL) failed++;
    else if (s === STATUS_NA) na++;
  }
  const answered = passed + failed;
  const untouched = total - passed - failed - na;
  const ratio = answered > 0 ? passed / answered : null;
  return { total, passed, failed, na, untouched, ratio };
}

export function scoreColor(ratio, colors) {
  if (ratio == null) return colors.textDim;
  if (ratio >= 0.8) return colors.green;
  if (ratio >= 0.5) return colors.gold;
  return colors.red;
}

export const KIND_FUNDAMENTAL = "fundamental";
export const KIND_TECHNICAL = "technical";

export function getKind(c) {
  return c.kind === KIND_TECHNICAL ? KIND_TECHNICAL : KIND_FUNDAMENTAL;
}

export function splitByKind(criteria) {
  const fundamental = [];
  const technical = [];
  for (const c of criteria) {
    if (getKind(c) === KIND_TECHNICAL) technical.push(c);
    else fundamental.push(c);
  }
  return { fundamental, technical };
}

export function computeScoreByKind(criteria, scorecard) {
  const { fundamental, technical } = splitByKind(criteria);
  return {
    fundamental: computeScore(fundamental, scorecard),
    technical: computeScore(technical, scorecard),
  };
}
