let tftChampions = {};
let championMap = {};

// 챔피언 데이터 로드
async function loadChampionData() {
    try {
        const response = await fetch(
          'https://ddragon.leagueoflegends.com/cdn/16.3.1/data/ko_KR/tft-champion.json'
        );
        const data = await response.json();

        tftChampions = data.data;

        championMap = {};
        Object.values(tftChampions).forEach(champ => {
            championMap[champ.id] = champ;
        });

        console.log('챔피언 데이터 로드 완료', championMap);
    } catch (error) {
        console.error('챔피언 데이터 로드 실패:', error);
    }
}

// 티어별 메타 덱
const metaDecksByTier = {
    S: [
        {
            name: "공허 카이사",
            champions: [
                { id: "Kaisa_0", name: "카이사"},
                { id: "BelVeth_0", name: "벨베스"},
                { id: "Ziggs_0", name: "직스"},
                { id: "Swain_0", name: "스웨인"}
            ],
            recommendedItems: ["구인수", "마법공학총검", "수호자의 맹세"],
            winRate: "18.2%"
        },
        {
            name: "자운 워윅",
            champions: [
                { id: "Warwick_0", name: "워윅"},
                { id: "Singed_0", name: "신지드"},
                { id: "Ziggs_0", name: "직스"},
                { id: "Seraphine_0", name: "세라핀"}
            ],
            recommendedItems: ["피바라기", "타이탄의 결의", "구인수의 분노"],
            winRate: "17.5%"
        }
    ],
    A: [
        {
            name: "타곤 아우렐리온솔",
            champions: [
                { id: "Diana_0", name: "다이애나"},
                { id: "Taric_0", name: "타릭"},
                { id: "AurelionSol_0", name: "아우렐리온솔"},
                { id: "Swain_0", name: "스웨인"}
            ],
            recommendedItems: ["내셔의 이빨", "보석 건틀릿", "피바라기"],
            winRate: "16.8%"
        },
        {
            name: "필트오버 세라핀",
            champions: [
                { id: "Braum_0", name: "브라움"},
                { id: "Seraphine_0", name: "세라핀"},
                { id: "Lissandra_0", name: "리산드라"},
                { id: "Loris_0", name: "로리스"}
            ],
            recommendedItems: ["보석 건틀릿", "내셔의 이빨", "쇼진의 창"],
            winRate: "15.9%"
        }
    ],
    B: [
        {
            name: "녹서스 스웨인",
            champions: [
                { id: "Ambessa_0", name: "암베사"},
                { id: "Swain_0", name: "스웨인"},
                { id: "Mel_0", name: "멜"},
                { id: "Draven_0", name: "드레이븐"}
            ],
            recommendedItems: ["구인수의 분노", "태양불꽃 망토", "보석 건틀릿"],
            winRate: "14.2%"
        }
    ],
    C: [
        {
            name: "아이오니아 유나라",
            champions: [
                { id: "Yunara_0", name: "유나라"},
                { id: "Wukong_0", name: "오공"},
                { id: "Sett_0", name: "세트"},
                { id: "Shen_0", name: "쉔"}
            ],
            recommendedItems: ["구인수의 분노", "무한의 대검", "정령의 형상"],
            winRate: "12.8%"
        }
    ]
};

// 소환사 검색
async function searchSummoner() {
    const input = document.getElementById('summonerInput').value.trim();
    if (!input) {
        alert('소환사 이름을 입력해주세요.');
        return;
    }

    // 임시 데이터로 매치 히스토리 표시 (실제로는 Riot API 필요)
    displayMatches(generateMockMatches(20));
}

// 모의 매치 데이터 생성
function generateMockMatches(count) {
    const matches = [];
    const placements = [1, 2, 3, 4, 5, 6, 7, 8];
    
    for (let i = 0; i < count; i++) {
        const placement = placements[Math.floor(Math.random() * placements.length)];
        matches.push({
            placement: placement,
            date: new Date(Date.now() - i * 1000 * 60 * 30).toLocaleString('ko-KR'),
            composition: metaDecksByTier.S[Math.floor(Math.random() * metaDecksByTier.S.length)].name
        });
    }
    
    return matches;
}

// 매치 히스토리 표시
function displayMatches(matches) {
    const section = document.getElementById('matchesSection');
    const grid = document.getElementById('matchesGrid');
    const stats = document.getElementById('matchStats');
    
    section.style.display = 'block';
    
    // 통계 계산
    const top4 = matches.filter(m => m.placement <= 4).length;
    const wins = matches.filter(m => m.placement === 1).length;
    const avgPlacement = (matches.reduce((sum, m) => sum + m.placement, 0) / matches.length).toFixed(2);
    
    stats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${wins}</div>
            <div class="stat-label">우승</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${top4}</div>
            <div class="stat-label">TOP 4</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${avgPlacement}</div>
            <div class="stat-label">평균 순위</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${((top4/matches.length)*100).toFixed(1)}%</div>
            <div class="stat-label">TOP 4 비율</div>
        </div>
    `;
    
    grid.innerHTML = matches.map(match => `
        <div class="match-card placement-${match.placement}">
            <div class="match-placement">#${match.placement}</div>
            <div class="match-info">
                <div class="match-comp">${match.composition}</div>
                <div class="match-date">${match.date}</div>
            </div>
        </div>
    `).join('');
}

// 티어별 메타 덱 렌더링
function renderMetaDecksByTier() {
    Object.entries(metaDecksByTier).forEach(([tier, decks]) => {
        const container = document.getElementById(`metaDecks${tier}`);
        if (!container) return;
        
        container.innerHTML = decks.map(deck => `
            <div class="deck-card">
                <div class="deck-header">
                    <h3>${deck.name}</h3>
                    <div class="win-rate">${deck.winRate}</div>
                </div>
                <div class="deck-champions">
                    ${deck.champions.map(champ => {
                        const championData = championMap[champ.id];
                        const imageName = championData?.image?.full ?? 'img/placeholder.png';
                        return `
                            <div class="deck-champ">
                                <img src="img/tft_champions/${imageName}.jpg" 
                                     alt="${champ.name}"
                                     onerror="this.src='img/placeholder.png'">
                                <div class="champ-name">${champ.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="deck-items">
                    <strong>추천 아이템:</strong>
                    <div class="item-tags">
                        ${deck.recommendedItems.map(item => 
                            `<span class="item-tag">${item}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// 페이지 로드
document.addEventListener('DOMContentLoaded', async () => {
    await loadChampionData();
    renderMetaDecksByTier();
});
