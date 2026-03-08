// ============================================================
// 競合リサーチアプリ — メインアプリケーション
// ============================================================

// ---------- State ----------
let currentSection = 'dashboard';
let currentSwotStore = 'kasakake';
let currentCompStore = 'kasakake';
let swotData = {};
let competitorData = {};
let actions = [];
let strategyMemo = '';

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderDashboard();
  renderComparison();
  renderMachineComparison();
  renderCompetitorTab();
  renderSwot();
  renderStrategy();
});

// ---------- Navigation ----------
function navigate(section) {
  currentSection = section;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`sec-${section}`).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-section="${section}"]`).classList.add('active');
  // close mobile nav
  document.getElementById('navLinks').classList.remove('open');
}

function toggleMobileNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ---------- LocalStorage ----------
const LS_KEYS = {
  swot: 'kyougou_swot',
  competitors: 'kyougou_competitors_v2',
  actions: 'kyougou_actions',
  memo: 'kyougou_memo',
};

function loadFromStorage() {
  const savedSwot = localStorage.getItem(LS_KEYS.swot);
  swotData = savedSwot ? JSON.parse(savedSwot) : JSON.parse(JSON.stringify(DEFAULT_SWOT));

  const savedComp = localStorage.getItem(LS_KEYS.competitors);
  competitorData = savedComp ? JSON.parse(savedComp) : JSON.parse(JSON.stringify(DEFAULT_COMPETITORS));

  const savedActions = localStorage.getItem(LS_KEYS.actions);
  actions = savedActions ? JSON.parse(savedActions) : [
    { id: Date.now(), text: '各競合ジムのGoogleマップ口コミ評価を確認する', completed: false },
    { id: Date.now() + 1, text: '各店舗のSNSフォロワー数を確認する', completed: false },
    { id: Date.now() + 2, text: '来月のキャンペーン戦略を策定する', completed: false },
    { id: Date.now() + 3, text: '高脅威競合ジムの料金・設備を詳細調査する', completed: false },
  ];

  strategyMemo = localStorage.getItem(LS_KEYS.memo) || '';
}

function saveSwot() {
  localStorage.setItem(LS_KEYS.swot, JSON.stringify(swotData));
}

function saveCompetitors() {
  localStorage.setItem(LS_KEYS.competitors, JSON.stringify(competitorData));
}

function saveActions() {
  localStorage.setItem(LS_KEYS.actions, JSON.stringify(actions));
}

function saveMemo() {
  localStorage.setItem(LS_KEYS.memo, strategyMemo);
}

// ---------- Dashboard ----------
function renderDashboard() {
  const totalMachines = STORES.reduce((sum, s) => {
    return sum + Object.values(s.machines).reduce((a, arr) => a + arr.length, 0);
  }, 0);

  const totalCompetitors = Object.values(competitorData).reduce((sum, arr) => sum + arr.length, 0);
  const highThreats = Object.values(competitorData).reduce((sum, arr) =>
    sum + arr.filter(c => c.threat === 'high').length, 0);

  const summaryEl = document.getElementById('summaryStats');
  summaryEl.innerHTML = `
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🏢</div>
      <div class="summary-stat-value" style="color:var(--accent-blue);">${STORES.length}</div>
      <div class="summary-stat-label">対象店舗</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">💴</div>
      <div class="summary-stat-value" style="color:var(--accent-emerald);">¥${STORES[0].pricing.monthlyFee.toLocaleString()}</div>
      <div class="summary-stat-label">月会費（共通）</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🏋️</div>
      <div class="summary-stat-value" style="color:var(--accent-orange);">${totalMachines}</div>
      <div class="summary-stat-label">マシン総数（2店合計）</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🎯</div>
      <div class="summary-stat-value" style="color:var(--accent-purple);">${totalCompetitors}</div>
      <div class="summary-stat-label">登録済み競合ジム</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🔥</div>
      <div class="summary-stat-value" style="color:var(--accent-red);">${highThreats}</div>
      <div class="summary-stat-label">高脅威の競合</div>
    </div>
  `;

  const cardsEl = document.getElementById('storeCards');
  cardsEl.innerHTML = STORES.map(store => {
    const machineCount = Object.values(store.machines).reduce((a, arr) => a + arr.length, 0);
    const badgeClass = store.id === 'kasakake' ? 'badge-blue' : 'badge-purple';
    const campaignClass = store.id === 'kasakake' ? 'kasakake' : 'maebashi';
    const accentClass = store.id === 'kasakake' ? 'highlight-blue' : 'highlight-purple';

    return `
      <div class="card store-card ${store.id === 'kasakake' ? 'kasakake' : 'maebashi'}">
        <div class="card-header">
          <div>
            <div class="store-name">${store.name}</div>
            <div class="store-area">${store.area}</div>
          </div>
          <span class="card-badge ${badgeClass}">${store.shortName}</span>
        </div>
        <div class="store-stats">
          <div class="stat-item">
            <div class="stat-label">月会費</div>
            <div class="stat-value ${accentClass}">¥${store.pricing.monthlyFee.toLocaleString()}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">マシン数</div>
            <div class="stat-value">${machineCount}種</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">DB上限</div>
            <div class="stat-value">${store.dumbbellMax}kg</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">セキュリティキー</div>
            <div class="stat-value">¥${store.pricing.securityKeyFee.toLocaleString()}</div>
          </div>
        </div>
        <div class="campaign-banner ${campaignClass}">
          <span class="campaign-icon">🎉</span>
          <span class="campaign-text">${store.campaign.title}</span>
          <span class="campaign-period">${store.campaign.period}</span>
        </div>
        <div class="store-links">
          <a href="${store.webUrl}" target="_blank" class="store-link">🌐 公式サイト</a>
          <a href="${store.mapUrl}" target="_blank" class="store-link">📍 地図</a>
          <a href="${store.reviewUrl ? store.reviewUrl : `https://www.google.com/maps/search/${encodeURIComponent(store.name + ' ' + (store.address || ''))}`}" target="_blank" class="store-link">⭐ 口コミ</a>
          <a href="tel:${store.phone.replace(/-/g, '')}" class="store-link">📞 ${store.phone}</a>
          ${store.tourUrl ? `<a href="${store.tourUrl}" target="_blank" class="store-link">🔍 バーチャルツアー</a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ---------- Comparison Table ----------
function renderComparison() {
  const s1 = STORES[0];
  const s2 = STORES[1];

  const rows = [
    { cat: '基本情報' },
    { label: '店舗名', v1: s1.name, v2: s2.name },
    { label: '所在地', v1: s1.area, v2: s2.area },
    { label: '電話番号', v1: s1.phone, v2: s2.phone },
    { cat: '料金' },
    { label: '月会費（税込）', v1: `¥${s1.pricing.monthlyFee.toLocaleString()}`, v2: `¥${s2.pricing.monthlyFee.toLocaleString()}` },
    { label: '月会費（税抜）', v1: `¥${s1.pricing.monthlyFeeExTax.toLocaleString()}`, v2: `¥${s2.pricing.monthlyFeeExTax.toLocaleString()}` },
    { label: 'セキュリティキー', v1: `¥${s1.pricing.securityKeyFee.toLocaleString()}`, v2: `¥${s2.pricing.securityKeyFee.toLocaleString()}` },
    { cat: 'キャンペーン（3月）' },
    { label: '概要', v1: s1.campaign.description, v2: s2.campaign.description },
    { label: '期間', v1: s1.campaign.period, v2: s2.campaign.period },
    { cat: '設備概要' },
    { label: 'マシンエリア', v1: `${s1.machines['マシンエリア'].length}種`, v2: `${s2.machines['マシンエリア'].length}種` },
    { label: '有酸素マシン', v1: `${s1.machines['有酸素マシンエリア'].length}種`, v2: `${s2.machines['有酸素マシンエリア'].length}種（台数明記）` },
    { label: 'フリーウェイト', v1: `${s1.machines['フリーウェイトエリア'].length}種`, v2: `${s2.machines['フリーウェイトエリア'].length}種` },
    { label: 'ファンクショナル', v1: s1.machines['ファンクショナルエリア'].length === 0 ? 'なし' : `${s1.machines['ファンクショナルエリア'].length}種`, v2: `${s2.machines['ファンクショナルエリア'].length}種` },
    { label: 'ダンベル上限', v1: `${s1.dumbbellMax}kg`, v2: `${s2.dumbbellMax}kg` },
    { label: 'バーチャルツアー', v1: '✅ 対応', v2: '❌ 未対応' },
    { label: '女性専用エリア', v1: '✅ あり', v2: '✅ あり' },
    { label: '自動販売機', v1: '—', v2: '✅ あり' },
  ];

  const table = document.getElementById('comparisonTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>項目</th>
        <th><span class="card-badge badge-blue">笠懸店</span></th>
        <th><span class="card-badge badge-purple">吉岡店</span></th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => {
    if (r.cat) {
      return `<tr class="cat-header"><td colspan="3">${r.cat}</td></tr>`;
    }
    return `
          <tr>
            <td class="item-label">${r.label}</td>
            <td>${r.v1}</td>
            <td>${r.v2}</td>
          </tr>
        `;
  }).join('')}
    </tbody>
  `;
}

// ---------- Machine Comparison ----------
function renderMachineComparison() {
  const container = document.getElementById('machineComparison');
  const areas = ['マシンエリア', '有酸素マシンエリア', 'フリーウェイトエリア', 'ファンクショナルエリア'];
  const s1 = STORES[0];
  const s2 = STORES[1];

  // Normalize machine names for comparison (remove spaces, ×台数, etc.)
  function normalize(name) {
    return name.replace(/[\s　・×＋]+/g, '').replace(/\d+台?$/, '').toLowerCase();
  }

  container.innerHTML = areas.map(area => {
    const list1 = s1.machines[area] || [];
    const list2 = s2.machines[area] || [];
    const norm1 = list1.map(normalize);
    const norm2 = list2.map(normalize);

    return `
      <div class="machine-section">
        <div class="machine-section-title">
          <span>🔧</span> ${area}
        </div>
        <div class="machine-grid">
          <div>
            <div class="machine-col-header kasakake">笠懸店（${list1.length}種）</div>
            <ul class="machine-list">
              ${list1.length === 0
        ? '<li style="color:var(--text-muted); font-style:italic;">設置なし</li>'
        : list1.map((m, i) => {
          const isUnique = !norm2.some(n => n === norm1[i] || n.includes(norm1[i]) || norm1[i].includes(n));
          return `<li class="${isUnique ? 'unique' : ''}">${m}</li>`;
        }).join('')
      }
            </ul>
          </div>
          <div>
            <div class="machine-col-header maebashi">吉岡店（${list2.length}種）</div>
            <ul class="machine-list">
              ${list2.length === 0
        ? '<li style="color:var(--text-muted); font-style:italic;">設置なし</li>'
        : list2.map((m, i) => {
          const isUnique = !norm1.some(n => n === norm2[i] || n.includes(norm2[i]) || norm2[i].includes(n));
          return `<li class="${isUnique ? 'unique' : ''}">${m}</li>`;
        }).join('')
      }
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- Competitor Info Tab ----------
function renderCompetitorTab() {
  // Store selector
  const selectorEl = document.getElementById('compStoreSelector');
  selectorEl.innerHTML = STORES.map(store => `
    <button class="swot-store-btn ${currentCompStore === store.id ? 'active' : ''}"
      onclick="switchCompStore('${store.id}')">
      ${store.name}（${(competitorData[store.id] || []).length}件）
    </button>
  `).join('');

  renderCompThreatSummary();
  renderCompetitorCards();
}

function switchCompStore(storeId) {
  currentCompStore = storeId;
  renderCompetitorTab();
}

function renderCompThreatSummary() {
  const comps = competitorData[currentCompStore] || [];
  const high = comps.filter(c => c.threat === 'high').length;
  const medium = comps.filter(c => c.threat === 'medium').length;
  const low = comps.filter(c => c.threat === 'low').length;

  const summaryEl = document.getElementById('compThreatSummary');
  summaryEl.innerHTML = `
    <div class="summary-stat-card">
      <div class="summary-stat-icon">📊</div>
      <div class="summary-stat-value" style="color:var(--text-primary);">${comps.length}</div>
      <div class="summary-stat-label">競合ジム総数</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🔴</div>
      <div class="summary-stat-value" style="color:var(--accent-red);">${high}</div>
      <div class="summary-stat-label">高脅威</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🟡</div>
      <div class="summary-stat-value" style="color:var(--accent-orange);">${medium}</div>
      <div class="summary-stat-label">中脅威</div>
    </div>
    <div class="summary-stat-card">
      <div class="summary-stat-icon">🟢</div>
      <div class="summary-stat-value" style="color:var(--accent-emerald);">${low}</div>
      <div class="summary-stat-label">低脅威</div>
    </div>
  `;
}

function renderCompetitorCards() {
  const comps = competitorData[currentCompStore] || [];
  const grid = document.getElementById('competitorGrid');

  if (comps.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted); font-size:14px; padding:8px 0;">競合ジムが登録されていません。下のボタンから追加してください。</p>';
    return;
  }

  // Sort by distance: closer -> farther
  const sorted = [...comps].sort((a, b) => {
    // 距離文字列 (例: "約1km") から数値部分を取り出す
    const distA = parseFloat(a.distance ? a.distance.replace(/[^\d.]/g, '') : '999') || 999;
    const distB = parseFloat(b.distance ? b.distance.replace(/[^\d.]/g, '') : '999') || 999;
    return distA - distB;
  });

  // Bulk HP check bar
  const urlComps = comps.filter(c => c.url);
  const bulkBar = urlComps.length > 0 ? `
    <div class="bulk-hp-bar">
      <span>🌐 HP登録済み: ${urlComps.length}件 — 公式サイトを一括で確認して情報を更新</span>
      <button class="btn-bulk-hp" onclick="bulkOpenHPs('${currentCompStore}')">一括HP確認（全タブ）</button>
    </div>
  ` : '';

  grid.innerHTML = bulkBar + sorted.map(comp => {
    const threatLabel = { high: '高', medium: '中', low: '低' }[comp.threat] || '中';
    const threatClass = `threat-${comp.threat || 'medium'}`;
    const origIndex = comps.indexOf(comp);
    const freshness = getFreshnessInfo(comp.lastChecked);

    return `
      <div class="card competitor-card threat-border-${comp.threat || 'medium'}" id="comp-card-${origIndex}">
        <button class="competitor-delete" onclick="deleteCompetitor('${currentCompStore}', ${origIndex})">✕</button>
        <div class="competitor-badges">
          <span class="threat-badge ${threatClass}">${threatLabel}</span>
          ${freshness.html}
        </div>
        <div class="card-header">
          <div>
            <div class="competitor-name">${escapeHtml(comp.name)}</div>
            ${comp.type ? `<div class="competitor-type">${escapeHtml(comp.type)}</div>` : ''}
            ${comp.distance ? `<div class="competitor-distance">📍 ${escapeHtml(comp.distance)}</div>` : ''}
            ${comp.address ? `<div class="competitor-address">${escapeHtml(comp.address)}</div>` : ''}
          </div>
        </div>
        <div class="competitor-details">
          ${comp.price ? `<div class="competitor-detail"><span class="competitor-detail-label">月額</span><span>${escapeHtml(comp.price)}</span></div>` : ''}
          ${comp.hours ? `<div class="competitor-detail"><span class="competitor-detail-label">営業時間</span><span>${escapeHtml(comp.hours)}</span></div>` : ''}
          ${comp.rating ? `<div class="competitor-detail"><span class="competitor-detail-label">評価</span><span>${escapeHtml(comp.rating)}</span></div>` : ''}
        </div>
        ${comp.notes ? `<div class="competitor-notes">${escapeHtml(comp.notes)}</div>` : ''}
        <div class="competitor-footer">
          <div class="competitor-updated">
            ${comp.lastChecked ? `最終確認: ${new Date(comp.lastChecked).toLocaleDateString('ja-JP')}` : '未確認'}
          </div>
          <div class="competitor-actions">
            ${comp.url ? `<button class="btn-sm btn-hp" onclick="openHPAndMark('${currentCompStore}', ${origIndex})">🌐 HP確認</button>` : ''}
            <button class="btn-sm btn-hp" onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(comp.name + ' ' + (comp.address || ''))}', '_blank')">⭐ 口コミ</button>
            <button class="btn-sm btn-edit" onclick="toggleEditForm('${currentCompStore}', ${origIndex})">✏️ 編集</button>
          </div>
        </div>
        <div class="edit-form-inline" id="edit-form-${origIndex}" style="display:none;">
          <div class="edit-field">
            <label>料金</label>
            <input type="text" id="edit-price-${origIndex}" value="${escapeAttr(comp.price || '')}">
          </div>
          <div class="edit-field">
            <label>営業時間</label>
            <input type="text" id="edit-hours-${origIndex}" value="${escapeAttr(comp.hours || '')}">
          </div>
          <div class="edit-field">
            <label>業態</label>
            <input type="text" id="edit-type-${origIndex}" value="${escapeAttr(comp.type || '')}">
          </div>
          <div class="edit-field">
            <label>脅威度</label>
            <select id="edit-threat-${origIndex}">
              <option value="high" ${comp.threat === 'high' ? 'selected' : ''}>高</option>
              <option value="medium" ${comp.threat === 'medium' ? 'selected' : ''}>中</option>
              <option value="low" ${comp.threat === 'low' ? 'selected' : ''}>低</option>
            </select>
          </div>
          <div class="edit-field">
            <label>評価</label>
            <input type="text" id="edit-rating-${origIndex}" value="${escapeAttr(comp.rating || '')}">
          </div>
          <div class="edit-field">
            <label>URL</label>
            <input type="text" id="edit-url-${origIndex}" value="${escapeAttr(comp.url || '')}">
          </div>
          <div class="edit-field full">
            <label>分析メモ</label>
            <textarea id="edit-notes-${origIndex}">${escapeHtml(comp.notes || '')}</textarea>
          </div>
          <div class="edit-form-actions">
            <button class="btn-sm btn-cancel" onclick="toggleEditForm('${currentCompStore}', ${origIndex})">キャンセル</button>
            <button class="btn-sm btn-save" onclick="saveCompetitorEdit('${currentCompStore}', ${origIndex})">💾 保存</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- HP Update System Helpers ---

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getFreshnessInfo(lastChecked) {
  if (!lastChecked) {
    return { html: '<span class="freshness-badge freshness-old">⚠ 未確認</span>', status: 'old' };
  }
  const now = new Date();
  const checked = new Date(lastChecked);
  const daysDiff = Math.floor((now - checked) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) {
    return { html: `<span class="freshness-badge freshness-fresh">✓ ${daysDiff}日前</span>`, status: 'fresh' };
  } else if (daysDiff <= 30) {
    return { html: `<span class="freshness-badge freshness-stale">△ ${daysDiff}日前</span>`, status: 'stale' };
  } else {
    return { html: `<span class="freshness-badge freshness-old">⚠ ${daysDiff}日前</span>`, status: 'old' };
  }
}

function openHPAndMark(storeId, index) {
  const comp = competitorData[storeId][index];
  if (comp.url) {
    window.open(comp.url, '_blank');
  }
  comp.lastChecked = new Date().toISOString();
  saveCompetitors();
  renderCompetitorCards();
}

function bulkOpenHPs(storeId) {
  const comps = competitorData[storeId] || [];
  let opened = 0;
  comps.forEach((comp, i) => {
    if (comp.url) {
      window.open(comp.url, '_blank');
      comp.lastChecked = new Date().toISOString();
      opened++;
    }
  });
  if (opened > 0) {
    saveCompetitors();
    renderCompetitorCards();
    alert(`${opened}件のHPを新しいタブで開きました。\n各サイトを確認後、変更があれば「✏️ 編集」ボタンで情報を更新してください。`);
  }
}

function toggleEditForm(storeId, index) {
  const form = document.getElementById(`edit-form-${index}`);
  form.style.display = form.style.display === 'none' ? 'grid' : 'none';
}

function saveCompetitorEdit(storeId, index) {
  const comp = competitorData[storeId][index];
  comp.price = document.getElementById(`edit-price-${index}`).value;
  comp.hours = document.getElementById(`edit-hours-${index}`).value;
  comp.type = document.getElementById(`edit-type-${index}`).value;
  comp.threat = document.getElementById(`edit-threat-${index}`).value;
  comp.rating = document.getElementById(`edit-rating-${index}`).value;
  comp.url = document.getElementById(`edit-url-${index}`).value;
  comp.notes = document.getElementById(`edit-notes-${index}`).value;
  comp.lastChecked = new Date().toISOString();

  saveCompetitors();
  renderCompetitorTab();
}

function saveCompetitors() {
  localStorage.setItem('kyougou_competitors_v2', JSON.stringify(competitorData));
}

function toggleAddCompetitorForm() {
  const form = document.getElementById('addCompetitorForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addCompetitor() {
  const name = document.getElementById('compName').value.trim();
  if (!name) return;

  if (!competitorData[currentCompStore]) competitorData[currentCompStore] = [];
  competitorData[currentCompStore].push({
    id: `c-custom-${Date.now()}`,
    name,
    type: document.getElementById('compType').value.trim(),
    price: document.getElementById('compPrice').value.trim(),
    hours: document.getElementById('compHours').value.trim(),
    distance: document.getElementById('compDistance').value.trim(),
    address: document.getElementById('compAddress').value.trim(),
    threat: document.getElementById('compThreat').value,
    rating: document.getElementById('compRating').value.trim(),
    notes: document.getElementById('compNotes').value.trim(),
  });

  // Clear form
  ['compName', 'compType', 'compPrice', 'compHours', 'compDistance', 'compAddress', 'compRating', 'compNotes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('compThreat').value = 'medium';

  toggleAddCompetitorForm();
  saveCompetitors();
  renderCompetitorTab();
  renderDashboard();
}

function deleteCompetitor(storeId, index) {
  competitorData[storeId].splice(index, 1);
  saveCompetitors();
  renderCompetitorTab();
  renderDashboard();
}

// ---------- SWOT Analysis ----------
function renderSwot() {
  const selectorEl = document.getElementById('swotSelector');
  selectorEl.innerHTML = STORES.map(store => `
    <button class="swot-store-btn ${currentSwotStore === store.id ? 'active' : ''}"
      onclick="switchSwotStore('${store.id}')">
      ${store.name}
    </button>
  `).join('');

  renderSwotGrid();
}

function switchSwotStore(storeId) {
  currentSwotStore = storeId;
  renderSwot();
}

function renderSwotGrid() {
  const data = swotData[currentSwotStore];
  if (!data) return;

  const categories = [
    { key: 'strengths', label: 'Strengths（強み）', cls: 'strengths', labelCls: 's', icon: '💪' },
    { key: 'weaknesses', label: 'Weaknesses（弱み）', cls: 'weaknesses', labelCls: 'w', icon: '⚠️' },
    { key: 'opportunities', label: 'Opportunities（機会）', cls: 'opportunities', labelCls: 'o', icon: '🚀' },
    { key: 'threats', label: 'Threats（脅威）', cls: 'threats', labelCls: 't', icon: '🔥' },
  ];

  const gridEl = document.getElementById('swotGrid');
  gridEl.innerHTML = categories.map(cat => `
    <div class="swot-card ${cat.cls}">
      <div class="swot-label ${cat.labelCls}">${cat.icon} ${cat.label}</div>
      <ul class="swot-items" id="swot-${cat.key}">
        ${(data[cat.key] || []).map((item, i) => `
          <li class="swot-item">
            <span class="swot-item-text">${escapeHtml(item)}</span>
            <button class="remove-btn" onclick="removeSwotItem('${cat.key}', ${i})">✕</button>
          </li>
        `).join('')}
      </ul>
      <div class="swot-add-form">
        <input class="swot-add-input" id="swot-input-${cat.key}"
          placeholder="項目を追加..."
          onkeydown="if(event.key==='Enter')addSwotItem('${cat.key}')">
        <button class="swot-add-btn" onclick="addSwotItem('${cat.key}')">＋</button>
      </div>
    </div>
  `).join('');
}

function addSwotItem(category) {
  const input = document.getElementById(`swot-input-${category}`);
  const text = input.value.trim();
  if (!text) return;

  if (!swotData[currentSwotStore][category]) swotData[currentSwotStore][category] = [];
  swotData[currentSwotStore][category].push(text);
  input.value = '';
  saveSwot();
  renderSwotGrid();
}

function removeSwotItem(category, index) {
  swotData[currentSwotStore][category].splice(index, 1);
  saveSwot();
  renderSwotGrid();
}

// ---------- Strategy & Actions ----------
function renderStrategy() {
  const memoEl = document.getElementById('strategyMemo');
  memoEl.value = strategyMemo;
  memoEl.addEventListener('input', () => {
    strategyMemo = memoEl.value;
    saveMemo();
  });

  renderActionList();
}

function renderActionList() {
  const listEl = document.getElementById('actionList');
  listEl.innerHTML = actions.map((action, i) => `
    <li class="action-item ${action.completed ? 'completed' : ''}">
      <input type="checkbox" class="action-checkbox"
        ${action.completed ? 'checked' : ''}
        onchange="toggleAction(${i})">
      <span class="action-text">${escapeHtml(action.text)}</span>
      <button class="action-delete" onclick="deleteAction(${i})">✕</button>
    </li>
  `).join('');
}

function addAction() {
  const input = document.getElementById('actionInput');
  const text = input.value.trim();
  if (!text) return;

  actions.push({ id: Date.now(), text, completed: false });
  input.value = '';
  saveActions();
  renderActionList();
}

function toggleAction(index) {
  actions[index].completed = !actions[index].completed;
  saveActions();
  renderActionList();
}

function deleteAction(index) {
  actions.splice(index, 1);
  saveActions();
  renderActionList();
}

// ---------- Utilities ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Data Management ----------
function exportData() {
  const data = {
    swot: swotData,
    competitors: competitorData,
    actions: actions,
    memo: strategyMemo
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `kyougou_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.swot) localStorage.setItem(LS_KEYS.swot, JSON.stringify(data.swot));
      if (data.competitors) localStorage.setItem(LS_KEYS.competitors, JSON.stringify(data.competitors));
      if (data.actions) localStorage.setItem(LS_KEYS.actions, JSON.stringify(data.actions));
      if (data.memo !== undefined) localStorage.setItem(LS_KEYS.memo, data.memo);

      alert('データの読み込みが完了しました。\nページを再読み込みして最新の状態を反映します。');
      location.reload();
    } catch (error) {
      alert('ファイルの読み込みに失敗しました。正しいバックアップファイルを選択してください。');
      console.error(error);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

function resetToDefault() {
  if (confirm("ブラウザに保存されているすべてのデータをリセットし、最新の基本データ（更新済みの競合リスト等）を読み込み直しますか？\n※手動で追加したメモや独自データは失われます。")) {
    localStorage.removeItem(LS_KEYS.swot);
    localStorage.removeItem(LS_KEYS.competitors);
    localStorage.removeItem(LS_KEYS.actions);
    localStorage.removeItem(LS_KEYS.memo);
    location.reload();
  }
}
