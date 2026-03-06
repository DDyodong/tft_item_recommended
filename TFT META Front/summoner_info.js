// ── 설정 ────────────────────────────────────────────────────────────────────
const API_BASE   = 'http://127.0.0.1:8000/api';
const DDragon    = 'https://ddragon.leagueoflegends.com/cdn';
let   DD_VERSION = '14.24.1';   // 최신 버전으로 교체 가능

// ── DDragon 최신 버전 자동 취득 ─────────────────────────────────────────────
async function fetchDDragonVersion() {
    try {
        const res  = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const vers = await res.json();
        DD_VERSION = vers[0];
    } catch {
        console.warn('DDragon 버전 취득 실패, 기본값 사용:', DD_VERSION);
    }
}

// ── 유틸 ────────────────────────────────────────────────────────────────────
function champImgUrl(imageFull) {
    return `${DDragon}/${DD_VERSION}/img/tft-champion/${imageFull}`;
}

function itemImgUrl(imageFull) {
    return `${DDragon}/${DD_VERSION}/img/tft-item/${imageFull}`;
}

function placementColor(p) {
    if (p === 1) return '#f1c40f';
    if (p === 2) return '#bdc3c7';
    if (p === 3) return '#cd7f32';
    if (p <= 4)  return '#3498db';
    return '#e74c3c';
}

function placementLabel(p) {
    return `${p}위`;
}

function formatDate(ts) {
    const d = new Date(ts);
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${MM}/${DD} ${hh}:${mm}`;
}

// ── API 호출 헬퍼 ────────────────────────────────────────────────────────────
async function apiFetch(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

// ── 로딩 / 에러 UI ──────────────────────────────────────────────────────────
function showLoading(msg = '불러오는 중...') {
    getOrCreate('summonerResult').innerHTML = `
        <div class="loading-wrap">
            <div class="spinner"></div>
            <p class="loading-msg">${msg}</p>
        </div>`;
}

function showError(msg) {
    getOrCreate('summonerResult').innerHTML = `
        <div class="error-box">
            <span class="error-icon">⚠</span>
            <p>${msg}</p>
        </div>`;
}

function getOrCreate(id) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        document.querySelector('.container').appendChild(el);
    }
    return el;
}

// ── 통계 계산 ────────────────────────────────────────────────────────────────
function calcStats(matches) {
    if (!matches.length) return null;
    const placements = matches.map(m => m.placement);
    const avg = (placements.reduce((a, b) => a + b, 0) / placements.length).toFixed(2);
    const top4 = placements.filter(p => p <= 4).length;
    const top1 = placements.filter(p => p === 1).length;
    const top4Rate = ((top4 / placements.length) * 100).toFixed(1);
    const top1Rate = ((top1 / placements.length) * 100).toFixed(1);
    return { avg, top4, top1, top4Rate, top1Rate, total: matches.length };
}

// ── 트레이트 이름 간략화 ─────────────────────────────────────────────────────
function traitDisplay(traits) {
    if (!traits || !traits.length) return '';
    return traits
        .filter(t => t.tier_current > 0)
        .sort((a, b) => b.tier_current - a.tier_current)
        .slice(0, 4)
        .map(t => {
            const name = t.name.replace(/^TFT\d+_/, '').replace(/_/g, ' ');
            return `<span class="trait-tag tier-${t.tier_current}">${name}</span>`;
        })
        .join('');
}

// ── 챔피언 아이콘 HTML ───────────────────────────────────────────────────────
async function buildUnitIcons(units, champMap) {
    if (!units || !units.length) return '<span class="no-units">유닛 정보 없음</span>';
    return units
        .sort((a, b) => (b.rarity || 0) - (a.rarity || 0))
        .slice(0, 8)
        .map(unit => {
            const id     = unit.character_id || '';
            const champ  = champMap[id] || {};
            const imgUrl = champ.image?.full
                ? champImgUrl(champ.image.full)
                : `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${id.replace('TFT16_','').replace('TFT15_','').replace('TFT14_','').replace('TFT13_','')}_0.jpg`;
            const stars  = '★'.repeat(Math.min(unit.tier || 1, 3));
            const cost   = champ.tier || '';
            return `
            <div class="unit-icon cost-${cost}">
                <img src="${imgUrl}" alt="${id}" onerror="this.src='placeholder.png'">
                <span class="unit-stars">${stars}</span>
            </div>`;
        }).join('');
}

// ── 랭크 배지 ────────────────────────────────────────────────────────────────
function rankBadge(rankData) {
    if (!rankData || !rankData.length) {
        return `<div class="rank-badge unranked">
                    <span class="rank-emblem">?</span>
                    <span class="rank-text">언랭크</span>
                </div>`;
    }
    const r = rankData[0];
    const tierColors = {
        CHALLENGER: '#f1c40f', GRANDMASTER: '#e74c3c', MASTER: '#9b59b6',
        DIAMOND: '#3498db',    EMERALD: '#2ecc71',    PLATINUM: '#1abc9c',
        GOLD: '#f39c12',       SILVER: '#95a5a6',     BRONZE: '#cd7f32',
        IRON: '#7f8c8d'
    };
    const color = tierColors[r.tier] || '#95a5a6';
    return `
        <div class="rank-badge" style="border-color:${color}">
            <span class="rank-emblem" style="color:${color}">${r.tier?.charAt(0) || '?'}</span>
            <div class="rank-details">
                <span class="rank-tier" style="color:${color}">${r.tier} ${r.rank}</span>
                <span class="rank-lp">${r.leaguePoints} LP</span>
                <span class="rank-wl">${r.wins}승 ${r.losses}패</span>
            </div>
        </div>`;
}

// ── 메인 렌더링 ──────────────────────────────────────────────────────────────
async function renderSummonerPage(gameName, tagLine) {
    // DDragon 챔피언 데이터 미리 로드
    await fetchDDragonVersion();
    let champMap = {};
    try {
        const champRes = await fetch(`${DDragon}/${DD_VERSION}/data/ko_KR/tft-champion.json`);
        const champData = await champRes.json();
        champMap = champData.data || {};
    } catch {
        console.warn('챔피언 데이터 로드 실패');
    }

    // 1. PUUID 조회
    showLoading('소환사 정보 조회 중...');
    let puuidData;
    try {
        puuidData = await apiFetch(`/summoner/puuid/?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
    } catch (e) {
        showError(`소환사를 찾을 수 없습니다: ${e.message}`);
        return;
    }
    const { puuid } = puuidData;

    // 2. summonerId → 랭크 정보
    showLoading('랭크 정보 조회 중...');
    let rankData = [];
    try {
        const summonerInfo = await apiFetch(`/summoner/info/?puuid=${puuid}`);
        rankData = await apiFetch(`/summoner/rank/?summonerId=${summonerInfo.id}`);
    } catch {
        console.warn('랭크 정보 취득 실패');
    }

    // 3. 매치 ID 목록
    showLoading('매치 기록 불러오는 중...');
    let matchIds = [];
    try {
        matchIds = await apiFetch(`/summoner/matches/?puuid=${puuid}&count=20`);
    } catch (e) {
        showError(`매치 기록을 불러올 수 없습니다: ${e.message}`);
        return;
    }

    // 4. 매치 상세 (순차 요청, API 부하 방지)
    const matchDetails = [];
    for (let i = 0; i < Math.min(matchIds.length, 20); i++) {
        showLoading(`매치 상세 정보 불러오는 중... (${i + 1}/${Math.min(matchIds.length, 20)})`);
        try {
            const detail = await apiFetch(`/summoner/match_detail/?matchId=${matchIds[i]}`);
            const me = detail?.info?.participants?.find(p => p.puuid === puuid);
            if (me) {
                matchDetails.push({
                    matchId:   matchIds[i],
                    placement: me.placement,
                    level:     me.level,
                    units:     me.units || [],
                    traits:    me.traits || [],
                    datetime:  detail.info?.game_datetime || 0,
                    setNumber: detail.info?.tft_set_number || '',
                });
            }
        } catch {
            console.warn(`매치 ${matchIds[i]} 로드 실패`);
        }
        // API rate limit 방지
        await new Promise(r => setTimeout(r, 80));
    }

    // 5. 렌더링
    const stats   = calcStats(matchDetails);
    const result  = getOrCreate('summonerResult');

    // 유닛 HTML 비동기 빌드
    const unitIconsArr = await Promise.all(
        matchDetails.map(m => buildUnitIcons(m.units, champMap))
    );

    result.innerHTML = `
    <!-- 소환사 헤더 -->
    <div class="summoner-header">
        <div class="summoner-identity">
            <div class="summoner-avatar">
                <span class="avatar-letter">${gameName.charAt(0).toUpperCase()}</span>
            </div>
            <div class="summoner-name-block">
                <h2 class="summoner-name">${gameName}<span class="tag">#${tagLine}</span></h2>
                <p class="set-info">TFT 세트 ${matchDetails[0]?.setNumber || '?'}</p>
            </div>
        </div>
        ${rankBadge(rankData)}
    </div>

    <!-- 통계 요약 -->
    ${stats ? `
    <div class="stats-row">
        <div class="stat-card">
            <span class="stat-num">${stats.total}</span>
            <span class="stat-lbl">최근 게임</span>
        </div>
        <div class="stat-card highlight">
            <span class="stat-num">${stats.avg}</span>
            <span class="stat-lbl">평균 순위</span>
        </div>
        <div class="stat-card">
            <span class="stat-num">${stats.top4Rate}%</span>
            <span class="stat-lbl">TOP 4율</span>
        </div>
        <div class="stat-card gold">
            <span class="stat-num">${stats.top1Rate}%</span>
            <span class="stat-lbl">1위율</span>
        </div>
    </div>` : ''}

    <!-- 매치 리스트 -->
    <div class="matches-header">
        <h3 class="section-title">최근 매치 기록</h3>
    </div>
    <div class="match-list">
        ${matchDetails.length === 0
            ? '<p class="empty-msg">최근 매치 기록이 없습니다.</p>'
            : matchDetails.map((m, i) => `
            <div class="match-row placement-${m.placement <= 4 ? (m.placement <= 1 ? 'gold' : 'blue') : 'red'}">
                <div class="match-placement" style="color:${placementColor(m.placement)}">
                    ${placementLabel(m.placement)}
                </div>
                <div class="match-units">${unitIconsArr[i]}</div>
                <div class="match-traits">${traitDisplay(m.traits)}</div>
                <div class="match-meta">
                    <span class="match-level">Lv.${m.level}</span>
                    <span class="match-date">${formatDate(m.datetime)}</span>
                </div>
            </div>`).join('')}
    </div>`;

    // 인라인 스타일 주입 (summoner_info.html 전용)
    injectStyles();
}

// ── CSS 인젝션 ────────────────────────────────────────────────────────────────
function injectStyles() {
    if (document.getElementById('si-styles')) return;
    const style = document.createElement('style');
    style.id = 'si-styles';
    style.textContent = `
    /* 로딩 */
    .loading-wrap { display:flex; flex-direction:column; align-items:center; padding:4rem; gap:1.5rem; }
    .spinner { width:48px; height:48px; border:4px solid rgba(26,188,156,.2); border-top-color:#1abc9c;
               border-radius:50%; animation:spin .9s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .loading-msg { color:#95a5a6; font-size:1rem; }

    /* 에러 */
    .error-box { display:flex; align-items:center; gap:1rem; background:rgba(231,76,60,.15);
                 border:1px solid rgba(231,76,60,.4); border-radius:12px; padding:1.5rem 2rem; margin-top:1rem; }
    .error-icon { font-size:1.8rem; }

    /* 소환사 헤더 */
    #summonerResult { margin-top:2rem; }
    .summoner-header { display:flex; justify-content:space-between; align-items:center;
                       background:rgba(20,30,48,.7); border:1px solid rgba(26,188,156,.2);
                       border-radius:20px; padding:2rem; margin-bottom:1.5rem; flex-wrap:wrap; gap:1.5rem; }
    .summoner-identity { display:flex; align-items:center; gap:1.5rem; }
    .summoner-avatar { width:72px; height:72px; background:linear-gradient(135deg,#1abc9c,#3498db);
                       border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .avatar-letter { font-family:'Orbitron',sans-serif; font-size:2rem; font-weight:900; color:#fff; }
    .summoner-name { font-family:'Orbitron',sans-serif; font-size:1.6rem; font-weight:700; color:#ecf0f1; }
    .summoner-name .tag { font-size:1rem; color:#95a5a6; margin-left:.4rem; }
    .set-info { color:#95a5a6; font-size:.9rem; margin-top:.3rem; }

    /* 랭크 배지 */
    .rank-badge { display:flex; align-items:center; gap:1rem; padding:1rem 1.5rem;
                  background:rgba(30,40,60,.6); border:2px solid; border-radius:15px; }
    .rank-badge.unranked { border-color:rgba(149,165,166,.3); }
    .rank-emblem { font-family:'Orbitron',sans-serif; font-size:2.5rem; font-weight:900; }
    .rank-details { display:flex; flex-direction:column; gap:.2rem; }
    .rank-tier { font-family:'Orbitron',sans-serif; font-weight:700; font-size:1rem; }
    .rank-lp, .rank-wl { font-size:.85rem; color:#95a5a6; }

    /* 통계 */
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { background:rgba(20,30,48,.7); border:1px solid rgba(26,188,156,.2);
                 border-radius:15px; padding:1.5rem; text-align:center; }
    .stat-card.highlight { border-color:rgba(52,152,219,.5); background:rgba(52,152,219,.1); }
    .stat-card.gold      { border-color:rgba(241,196,15,.5); background:rgba(241,196,15,.08); }
    .stat-num { display:block; font-family:'Orbitron',sans-serif; font-size:2rem; font-weight:900; color:#1abc9c; }
    .stat-card.highlight .stat-num { color:#3498db; }
    .stat-card.gold .stat-num      { color:#f1c40f; }
    .stat-lbl { font-size:.8rem; color:#95a5a6; text-transform:uppercase; letter-spacing:1px; }

    /* 매치 리스트 */
    .matches-header { margin-bottom:1rem; }
    .match-list { display:flex; flex-direction:column; gap:.8rem; }
    .match-row { display:grid; grid-template-columns:80px 1fr auto auto;
                 align-items:center; gap:1.2rem;
                 background:rgba(20,30,48,.6); border-radius:14px;
                 padding:1rem 1.5rem; border-left:4px solid transparent;
                 transition:transform .2s, box-shadow .2s; }
    .match-row:hover { transform:translateX(4px); box-shadow:0 4px 20px rgba(0,0,0,.3); }
    .match-row.placement-gold { border-left-color:#f1c40f; background:rgba(241,196,15,.06); }
    .match-row.placement-blue { border-left-color:#3498db; }
    .match-row.placement-red  { border-left-color:#e74c3c; }

    .match-placement { font-family:'Orbitron',sans-serif; font-size:1.5rem; font-weight:900; text-align:center; }
    .match-units { display:flex; gap:.4rem; flex-wrap:wrap; }

    /* 유닛 아이콘 */
    .unit-icon { position:relative; width:44px; flex-shrink:0; }
    .unit-icon img { width:44px; height:44px; border-radius:8px; object-fit:cover;
                     border:2px solid rgba(255,255,255,.15); display:block; }
    .unit-icon.cost-1 img { border-color:#95a5a6; }
    .unit-icon.cost-2 img { border-color:#2ecc71; }
    .unit-icon.cost-3 img { border-color:#3498db; }
    .unit-icon.cost-4 img { border-color:#9b59b6; }
    .unit-icon.cost-5 img { border-color:#f1c40f; }
    .unit-stars { position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
                  font-size:.6rem; color:#f1c40f; white-space:nowrap; }
    .no-units { color:#95a5a6; font-size:.85rem; }

    /* 트레이트 */
    .match-traits { display:flex; gap:.4rem; flex-wrap:wrap; }
    .trait-tag { padding:.25rem .6rem; border-radius:6px; font-size:.75rem; font-weight:700;
                 background:rgba(30,40,60,.8); color:#95a5a6; border:1px solid rgba(255,255,255,.1); }
    .trait-tag.tier-1 { color:#cd7f32; border-color:rgba(205,127,50,.4); }
    .trait-tag.tier-2 { color:#95a5a6; border-color:rgba(149,165,166,.4); }
    .trait-tag.tier-3 { color:#f1c40f; border-color:rgba(241,196,15,.4); }
    .trait-tag.tier-4 { color:#1abc9c; border-color:rgba(26,188,156,.5); background:rgba(26,188,156,.1); }

    /* 매치 메타 */
    .match-meta { display:flex; flex-direction:column; align-items:flex-end; gap:.3rem; min-width:90px; }
    .match-level { font-size:.85rem; color:#3498db; font-weight:700; }
    .match-date  { font-size:.8rem;  color:#95a5a6; }

    .empty-msg { color:#95a5a6; text-align:center; padding:3rem; }

    /* 반응형 */
    @media (max-width:768px) {
        .stats-row { grid-template-columns:repeat(2,1fr); }
        .match-row { grid-template-columns:60px 1fr; grid-template-rows:auto auto; }
        .match-traits,.match-meta { grid-column:1/-1; }
    }
    `;
    document.head.appendChild(style);
}

// ── 소환사 검색 (script.js에서 공유 사용 가능) ──────────────────────────────
function searchSummoner() {
    const input = document.getElementById('summonerInput')?.value.trim();
    if (!input) { alert('소환사 이름을 입력해주세요.'); return; }
    const [gameName, tagLine] = input.split('#');
    if (!tagLine) { alert('닉네임#태그 형식으로 입력해주세요. 예) Hide on bush#KR1'); return; }
    window.location.href = `summoner_info.html?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`;
}

// ── 페이지 초기화 ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const params   = new URLSearchParams(window.location.search);
    const gameName = params.get('gameName');
    const tagLine  = params.get('tagLine');

    if (gameName && tagLine) {
        // 검색창에 현재 소환사 이름 미리 채우기
        const input = document.getElementById('summonerInput');
        if (input) input.value = `${gameName}#${tagLine}`;

        await renderSummonerPage(gameName, tagLine);
    }
});