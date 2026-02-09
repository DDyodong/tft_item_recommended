// 라이엇 ddragon 연결 
const TFT_CDN = {
    version : '16.3.1',
    champion : (id) => `https://ddragon.leagueoflegends.com/cdn/${TFT_CDN.version}/img/tft-champion/${id}.png`,
    item: (id) => `https://ddragon.leagueoflegends.com/cdn/${TFT_CDN.version}/img/tft-item/${id}.png`
}

// 26.02.05  -> 이거 티어, 설명은 필요 없고 어떤 챔피언이 있는지만 대충 하면 될듯. api에서 불러오는걸로
const metaDecks = [
    /*{
        name: "소환사 덱",
        champions: ["🧙‍♂️ 룰루", "🐉 노라", "🌟 신드라", "⚡ 리산드라", "🔮 오리아나"],
        recommendedItems: ["구인수", "주문력 검", "모렐로", "아이오니아 불꽃", "대천사의 지팡이", "쇼진의 창"]
    },*/
    {
        name: "공허 카이사 덱",
        description: "크립에 2코스트 공허 기물을 먹었을 때 하기 좋아요!",
        champions: [
            { id: "TFT16_Kaisa", name: "카이사"},
            { id:" TFT16_Bel'beth", name: "벨베스"},
            { id:"TFT16_ZIGGS", name: "직스"},
            { id:"TFT16_SWAIN", name: "스웨인"}
        ],
        recommendedItems: ["구인수", "마법공학총검", "수호자의 맹세", "태양불꽃망토", "보석 건틀릿", "공허의 지팡이"]
    },
    {
        name: "브루저 덱",
        description: "높은 생존력과 지속 딜을 갖춘 조합",
        champions: ["⚔️ 가렌", "🛡️ 세주아니", "🔨 바이", "💪 올라프", "🌊 일라오이"],
        recommendedItems: ["워모그", "가시갑옷", "태양불꽃", "거인학살자", "스테락의 도전", "타이탄의 결의"]
    },
    {
        name: "타곤 아우렐리온솔",
        description: "빠른 기동성과 폭발적인 딜로 후방 킬",
        champions: ["🗡️ 카타리나", "⚡ 제드", "🌙 아칼리", "💀 카직스", "🎭 샤코"],
        recommendedItems: ["무한의 대검", "최후의 속삭임", "피바라기", "헤르메스의 발걸음", "밤의 끝자락", "수호 천사"]
    },
    {
        name: "저격수 덱",
        description: "원거리에서 안정적인 딜을 넣는 조합",
        champions: ["🏹 애쉬", "🎯 징크스", "⚡ 트위치", "🔫 케이틀린", "🌟 이즈리얼"],
        recommendedItems: ["거인학살자", "루난의 허리케인", "속삭임", "도적의 장갑", "거대한 구슬", "구인수"]
    },
    {
        name: "탱커 덱",
        description: "최전방에서 딜을 받아주는 철벽 수비",
        champions: ["🛡️ 쉔", "⚓ 브라움", "🌳 마오카이", "🔥 잭스", "💎 말파이트"],
        recommendedItems: ["워모그", "가시갑옷", "태양불꽃", "용의 발톱", "얼어붙은 심장", "가고일 돌갑옷"]
    },
    {
        name: "마법사 덱",
        description: "강력한 마법 폭딜로 적을 녹이는 조합",
        champions: ["🔥 베이가", "❄️ 애니비아", "⚡ 빅토르", "🌟 라이즈", "💜 신드라"],
        recommendedItems: ["라바돈의 죽음모자", "주문력 검", "아이오니아 불꽃", "모렐로", "대천사", "쇼진"]
    }
];

const allItems = [
    { name: "무한의 대검", icon: "⚔️", tags: ["AD", "크리티컬"] },
    { name: "구인수", icon: "🗡️", tags: ["공속", "마나"] },
    { name: "거인학살자", icon: "🔪", tags: ["AD", "체력"] },
    { name: "피바라기", icon: "🩸", tags: ["AD", "흡혈"] },
    { name: "수호 천사", icon: "👼", tags: ["AD", "방어"] },
    { name: "최후의 속삭임", icon: "🌪️", tags: ["AD", "관통"] },
    { name: "루난의 허리케인", icon: "🌀", tags: ["공속", "멀티"] },
    { name: "라바돈의 죽음모자", icon: "🎩", tags: ["AP", "주문력"] },
    { name: "주문력 검", icon: "✨", tags: ["AP", "주문력"] },
    { name: "모렐로", icon: "🔥", tags: ["AP", "화상"] },
    { name: "아이오니아 불꽃", icon: "💫", tags: ["AP", "마나"] },
    { name: "대천사의 지팡이", icon: "🪄", tags: ["AP", "마나"] },
    { name: "쇼진의 창", icon: "🔱", tags: ["AP", "마나"] },
    { name: "워모그", icon: "❤️", tags: ["체력", "회복"] },
    { name: "가시갑옷", icon: "🦔", tags: ["방어", "반사"] },
    { name: "태양불꽃", icon: "☀️", tags: ["방어", "화상"] },
    { name: "용의 발톱", icon: "🐲", tags: ["방어", "마법저항"] },
    { name: "얼어붙은 심장", icon: "❄️", tags: ["방어", "둔화"] },
    { name: "가고일 돌갑옷", icon: "🗿", tags: ["방어", "저항"] },
    { name: "스테락의 도전", icon: "💪", tags: ["체력", "방어"] },
    { name: "타이탄의 결의", icon: "🛡️", tags: ["체력", "방어"] },
    { name: "헤르메스의 발걸음", icon: "👟", tags: ["공속", "이속"] },
    { name: "밤의 끝자락", icon: "🌙", tags: ["AD", "보호막"] },
    { name: "도적의 장갑", icon: "🧤", tags: ["크리티컬", "회피"] },
    { name: "거대한 구슬", icon: "🔮", tags: ["AP", "사거리"] },
    { name: "속삭임", icon: "💨", tags: ["AD", "관통"] },
    { name: "대천사", icon: "😇", tags: ["AP", "마나"] },
    { name: "쇼진", icon: "⚡", tags: ["AP", "마나"] }
];

let currentDeck = null;
let championItems = {};

function renderMetaDecks() {
    const container = document.getElementById('metaDecks');
    container.innerHTML = metaDecks.map((deck, index) => `
        <div class="deck-card ${currentDeck === index ? 'active' : ''}" onclick="selectDeck(${index})">
            <h3>${deck.name}</h3>
            <div style="margin-top: 10px;">
                <strong>추천 챔피언:</strong><br>
                ${deck.champions.join(', ')}
            </div>
        </div>
    `).join('');
}

function selectDeck(index) {
    currentDeck = index;
    championItems = {};
    renderMetaDecks();
    renderChampions();
    renderItems();
    document.getElementById('championsSection').style.display = 'block';
}

function renderChampions() {
  // 기존: <div class="champion-icon">${champ.split(' ')[0]}</div>
  
  // ✅ 변경:
  container.innerHTML = deck.champions.map((champ, index) => `
    <div class="champion">
      <img src="${TFT_CDN.champion(champ.id)}" 
           alt="${champ.name}"
           class="champion-icon"
           onerror="this.src='placeholder.png'">  <!-- 이미지 로드 실패 시 -->
      <div>${champ.name}</div>
      ...
    </div>
  `);
}


function renderChampionItems() {
    //<img src="${TFT_CDN.item(item.id)}" alt="${item.name}">
  container.innerHTML = deck.champions.map((item, index) => `
    <div class="champion">
      <img src="${TFT_CDN.item(itemm.id)}" 
           alt="${item.name}"
           class="champion_itemm_icon"
           onerror="this.src='placeholder.png'">  <!-- 이미지 로드 실패 시 -->
      <div>${item.name}</div>
      ...
    </div>
  `);
}

function renderItems() {
    const container = document.getElementById('itemsGrid');
    let itemsToShow = allItems;
    
    if (currentDeck !== null) {
        const deck = metaDecks[currentDeck];
        itemsToShow = allItems.filter(item => 
            deck.recommendedItems.includes(item.name)
        );
    }
    
    container.innerHTML = itemsToShow.map((item, index) => `
        <div class="item" draggable="true" ondragstart="drag(event, '${item.name}')" id="item-${index}">
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
        </div>
    `).join('');
}


function drag(event, itemName) {
    event.dataTransfer.setData("itemName", itemName);
    event.target.classList.add('dragging');
}

function allowDrop(event) {
    event.preventDefault();
    const target = event.target.closest('.champion-items');
    if (target) {
        target.querySelectorAll('.item-slot').forEach(slot => {
            slot.classList.add('drag-over');
        });
    }
}

function drop(event, champIndex) {
    event.preventDefault();
    const itemName = event.dataTransfer.getData("itemName");
    
    if (!championItems[champIndex]) {
        championItems[champIndex] = [];
    }
    
    if (championItems[champIndex].length < 3) {
        championItems[champIndex].push(itemName);
        renderChampions();
    } else {
        alert('챔피언은 최대 3개의 아이템만 장착할 수 있습니다!');
    }
    
    const target = event.target.closest('.champion-items');
    if (target) {
        target.querySelectorAll('.item-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
    }
}

function removeItem(champIndex, itemIndex) {
    championItems[champIndex].splice(itemIndex, 1);
    renderChampions();
}



function clearAll() {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
        currentDeck = null;
        championItems = {};
        renderMetaDecks();
        renderItems();
        document.getElementById('championsSection').style.display = 'none';
    }
}

document.addEventListener('dragend', (e) => {
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('dragging');
    });
    document.querySelectorAll('.item-slot').forEach(slot => {
        slot.classList.remove('drag-over');
    });
});

// 페이지 로드시 초기화
renderMetaDecks();
renderItems();
