/**
 * CHAESTRO Demo — 미니 리포트 HTML 생성
 */

function generateReport(summary) {
  const { totalAnswered, vulnerableCount, avgScore, attackSuccessRate, pValue,
          featureScores, comboResults, topScenarios } = summary;

  const pSig = pValue < 0.05;
  const pLabel = pSig ? "통계적으로 유의" : "유의하지 않음";
  const pColor = pSig ? "var(--rd)" : "var(--fg5)";

  // ─── Section 1: 핵심 수치 ───
  const section1 = `
    <div class="report-section">
      <h2 class="report-title">진단 결과 요약</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">취약 패턴</div>
          <div class="kpi-value rd">${vulnerableCount}<span class="kpi-unit">/${totalAnswered}</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">공격 성공률</div>
          <div class="kpi-value rd">${attackSuccessRate}<span class="kpi-unit">%</span></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">평균 위험 점수</div>
          <div class="kpi-value ${avgScore >= 5 ? 'rd' : avgScore >= 3 ? 'gl' : 'gn'}">${avgScore}<span class="kpi-unit">/10</span></div>
        </div>
      </div>
      <p class="p-value" style="color:${pColor}">p-value = ${pValue} (${pLabel})</p>
    </div>`;

  // ─── Section 2: Feature 조합 테이블 ───
  const comboRows = comboResults.map(r => {
    const cls = r.vulnerable ? "row-danger" : (r.score >= 3 ? "row-warn" : "row-safe");
    const icon = r.vulnerable ? "⚠" : "✓";
    return `<tr class="${cls}">
      <td>${r.combo}</td>
      <td class="score-cell">${r.score}/10</td>
      <td class="verdict-cell">${icon}</td>
    </tr>`;
  }).join("");

  const section2 = `
    <div class="report-section">
      <h2 class="report-title">Feature 조합별 위험도</h2>
      <div class="table-wrap">
        <table class="combo-table">
          <thead><tr><th>Feature 조합</th><th>위험 점수</th><th>판정</th></tr></thead>
          <tbody>${comboRows}</tbody>
        </table>
      </div>
      <p class="mosaic-note">* Feature 이름은 모자이크 처리되어 있습니다.</p>
    </div>`;

  // ─── Section 3: 위험 시나리오 상위 2개 ───
  const scenarioCards = topScenarios.map(s => {
    const patternsHtml = s.patterns_found.map(p => `<span class="pattern-tag">${p}</span>`).join("");
    const truncResp = s.response.length > 200 ? s.response.slice(0, 200) + "..." : s.response;
    return `
      <div class="scenario-card">
        <div class="scenario-header">
          <span class="scenario-score rd">${s.score}/10</span>
          <span class="scenario-cat">${categoryLabel(s.category)}</span>
        </div>
        <div class="scenario-query"><strong>공격 질문:</strong> ${escapeHtml(s.query)}</div>
        <div class="scenario-response"><strong>AI 응답:</strong> ${escapeHtml(truncResp)}</div>
        <div class="scenario-patterns">${patternsHtml}</div>
      </div>`;
  }).join("");

  const section3 = `
    <div class="report-section">
      <h2 class="report-title">위험 시나리오 TOP 2</h2>
      ${scenarioCards}
    </div>`;

  // ─── Section 4: Feature 기여도 차트 ───
  const featureBars = featureScores.map(f => {
    const barWidth = Math.max(5, Math.abs(f.delta) * 20);
    const barColor = f.delta > 0 ? "var(--rd)" : "var(--gn)";
    return `
      <div class="feature-bar-row">
        <span class="feature-label">${f.label}</span>
        <div class="feature-bar-track">
          <div class="feature-bar" style="width:${barWidth}%;background:${barColor}"></div>
        </div>
        <span class="feature-delta" style="color:${barColor}">${f.delta > 0 ? '+' : ''}${f.delta}</span>
      </div>`;
  }).join("");

  const section4 = `
    <div class="report-section">
      <h2 class="report-title">Feature별 위험 기여도</h2>
      <div class="feature-chart">${featureBars}</div>
      <p class="mosaic-note">* 정밀 진단에서 실제 Feature 이름과 상세 분석을 제공합니다.</p>
    </div>`;

  // ─── Section 5: CTA ───
  const section5 = `
    <div class="report-section cta-section">
      <div class="cta-box">
        <h2>이 결과는 미니 진단입니다.</h2>
        <p class="cta-desc">정밀 진단에서는:</p>
        <ul class="cta-list">
          <li>Feature 이름 공개 (모자이크 해제)</li>
          <li>50쿼리 Full STRIDE 분해</li>
          <li>방어 패치 처방</li>
        </ul>
        <a href="https://calendly.com/chaestro/coffee-chat" target="_blank" class="btn btn-cta">커피챗 예약하기 &rarr;</a>
      </div>
    </div>`;

  return section1 + section2 + section3 + section4 + section5;
}

// ─── 유틸 ───

function categoryLabel(cat) {
  const map = {
    critical_hallucination: "심각한 환각",
    hallucination: "환각",
    mild_risk: "경미한 위험",
    safe: "안전",
  };
  return map[cat] || cat;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
