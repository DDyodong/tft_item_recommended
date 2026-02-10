let tftChampions = {};
let ItemMap = {};
// 챔피언 전역 선언



const TFT_CDN = 
{ version: '16.3.1',
    champion: (id) => `https://ddragon.leagueoflegends.com/cdn/${TFT_CDN.version}/img/tft-champion/${id}.png`,
    item: (id) => `https://ddragon.leagueoflegends.com/cdn/${TFT_CDN.version}/img/tft-item/${id}.png` };





// 페이지 로드 시 챔피언 데이터 가져오기
async function loadChampionData() {
    try {
        const response = await fetch(
          'https://ddragon.leagueoflegends.com/cdn/16.3.1/data/ko_KR/tft-champion.json'
        );
        const data = await response.json();

        tftChampions = data.data;

        // 여기서 정규화
        championMap = {};
        Object.values(tftChampions).forEach(champ => {
            championMap[champ.id] = champ;
        });

        console.log('챔피언 데이터 로드 완료', championMap);
    } catch (error) {
        console.error('챔피언 데이터 로드 실패:', error);
    }
}


// 26.02.05  -> 이거 티어, 설명은 필요 없고 어떤 챔피언이 있는지만 대충 하면 될듯. api에서 불러오는걸로
const metaDecks = [
    /*{_0
        name: "소환사 덱",
        champions: ["🧙‍♂️ 룰루", "🐉 노라", "🌟 신드라", "⚡ 리산드라", "🔮 오리아나"],
        recommendedItems: ["구인수", "주문력 검", "모렐로", "아이오니아 불꽃", "대천사의 지팡이", "쇼진의 창"]
    },*/
    {
        name: "공허 카이사 덱",
        champions: [
            { id: "Kaisa_0", name: "카이사"},
            { id:"BelVeth_0", name: "벨베스"},
            { id:"Ziggs_0", name: "직스"},
            { id:"Swain_0", name: "스웨인"}
        ],
        recommendedItems: ["구인수의 격노검", "마법공학총검", "수호자의 맹세", "태양불꽃망토", "보석 건틀릿", "공허의 지팡이"]
    },
    {
        name: "자운 워윅 덱",
        champions: [
            { id: "Warwick_0", name: "워윅"},
            { id:"Ziggs_0", name: "직스"},
            { id:"Singed_0", name: "신지드"},
            { id:"Seraphine_0", name: "세라핀"}
        ],
        recommendedItems: ["피바라기", "거인의 결의", "구인수의 격노검", "무한의 대검", "크라켄의 분노", "모렐로노미콘"]
    },
    {
        name: "타곤 아우렐리온솔 덱",
        champions: [
            { id:"AurelionSol_0", name: "아우렐리온솔"},
            { id:"Taric_0", name: "타릭"},
            { id: "Diana_0", name: "다이애나"},
            { id:"Swain_0", name: "스웨인"}
        ],
        recommendedItems: ["내셔의 이빨", "보석 건틀릿", "피바라기", "쇼진의 창", "구인수의 분노", "정령의 형상"]
    },
    {
        name: "필트오버 세라핀 덱",
        champions: [
            { id:"Seraphine_0", name: "세라핀"},
            { id:"Lissandra_0", name: "리산드라"},
            { id: "Braum_0", name: "브라움"},
            { id:"Loris_0", name: "로리스"}
        ],
        recommendedItems: ["보석 건틀릿", "내셔의 이빨", "쇼진의 창", "정령의 형상", "모렐로노미콘", "가시 갑옷"]
    },
    {
        name: "녹서스 스웨인 덱",
        champions: [
            { id:"Swain_0", name: "스웨인"},
            { id:"Mel_0", name: "멜"},
            { id: "Ambessa_0", name: "암베사"},
            { id:"Draven_0", name: "드레이븐"}
        ],
        recommendedItems: ["쇼진의 창", "보석 건틀릿", "공허의 지팡이", "정령의 형상", "정의의 손길", "밤의 끝자락"]
    },
    {
        name: "아이오니아 유나라 덱",
        champions: [
            { id: "Yunara_0", name: "유나라"},
            { id:"MonkeyKing_0", name: "오공"},
            { id:"Sett_0", name: "세트"},
            { id:"Shen_0", name: "쉔"}
        ],
        recommendedItems: ["구인수의 분노", "무한의 대검", "정령의 형상", "태양불꽃 망토", "보석 건틀릿", "저녁갑주"]
    }
];

const allItems = [
    { name: "무한의 대검", id: "TFT_Item_InfinityEdge" },
    { name: "구인수의 격노검", id: "TFT_Item_GuinsoosRageblade" },
    { name: "거인 학살자", id: "TFT_Item_MadredsBloodrazor" },
    { name: "피바라기", id: "TFT_Item_Bloodthirster" },
    { name: "밤의 끝자락", id: "TFT_Item_GuardianAngel" },
    { name: "최후의 속삭임", id: "TFT_Item_LastWhisper" },
    { name: "크라켄의 분노", id: "TFT_Item_RunaansHurricane" },
    { name: "라바돈의 죽음모자", id: "TFT_Item_RabadonsDeathcap" },
    { name: "마법공학 총검", id: "TFT_Item_HextechGunblade" },
    { name: "모렐로노미콘", id: "TFT_Item_Morellonomicon" },
    { name: "공허의 지팡이", id: "TFT_Item_StatikkShiv" },
    { name: "대천사의 지팡이", id: "TFT_Item_ArchangelsStaff" },
    { name: "쇼진의 창", id: "TFT_Item_SpearOfShojin" },
    { name: "워모그의 갑옷", id: "TFT_Item_WarmogsArmor" },
    { name: "덤불 조끼", id: "TFT_Item_BrambleVest" },
    { name: "태양불꽃 망토", id: "TFT_Item_RedBuff" },
    { name: "용의 발톱", id: "TFT_Item_DragonsClaw" },
    { name: "수호자의 맹세", id: "TFT_Item_FrozenHeart" },
    { name: "가고일 돌갑옷", id: "TFT_Item_GargoyleStoneplate" },
    { name: "스테락의 도전", id: "TFT_Item_SteraksGage" },
    { name: "거인의 결의", id: "TFT_Item_TitansResolve" },
    { name: "붉은 덩굴정령", id: "TFT_Item_RapidFireCannon" },
    { name: "죽음의 검", id: "TFT_Item_Deathblade" },
    { name: "도적의 장갑", id: "TFT_Item_ThiefsGloves" },
    { name: "보석 건틀릿", id: "TFT_Item_JeweledGauntlet" }
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
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                    ${deck.champions.map(champ => `
                        <div style="text-align: center;">
                            <img src="img/tft_champion/${champ.id}.jpg"
                                 alt="${champ.name}"
                                 style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"
                                 onerror="this.src='img/placeholder.png'">
                            <div style="font-size: 0.8em; margin-top: 5px;">${champ.name}</div>
                        </div>
                    `).join('')}
                </div>
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

/* function renderChampions() {
    const deck = metaDecks[currentDeck];
    const container = document.getElementById('championGrid');
    
    container.innerHTML = deck.champions.map((champ, index) => {
        const championData = tftChampions[champ.id];
        const imageName = championData?.image?.full;
        
        return `
            <div class="champion">
                    <img src="https://ddragon.leagueoflegends.com/cdn/16.3.1/img/tft-champion/${imageName}" 
                     alt="${champ.name}"
                     class="champion-icon"
                     onerror="this.src='img/placeholder.png'">
                <div>${champ.name}</div>
                <div class="champion-items" 
                     ondrop="drop(event, ${index})" 
                     ondragover="allowDrop(event)">
                    ${renderChampionItemSlots(index)}
                </div>
            </div>
        `;
    }).join('');
} */

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

// allItems
function renderItems() {
    const container = document.getElementById('itemsGrid');
    
    container.innerHTML = allItems.map((item, index) => `
        <div class="item" draggable="true" ondragstart="drag(event, '${item.name}')" id="item-${index}">
            <img src="${TFT_CDN.item(item.id)}" 
                 alt="${item.name}"
                 class="item-icon"
                 style="width: 50px; height: 50px; border-radius: 8px; margin: 0 auto 10px;"
                 onerror="this.src='img/placeholder.png'">
            <div class="item-name">${item.name}</div>
        </div>
    `).join('');
}
    /*
    container.innerHTML = itemsToShow.map((item, index) => `
        <div class="item" draggable="true" ondragstart="drag(event, '${item.name}')" id="item-${index}">
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
        </div>
    `).join('');
    */

/*function renderMetaDecks() {
    const container = document.getElementById('metaDecks');
    container.innerHTML = metaDecks.map((deck, index) => `
        <div class="deck-card ${currentDeck === index ? 'active' : ''}" onclick="selectDeck(${index})">
            <h3>${deck.name}</h3>
            <div style="margin-top: 10px;">
                <strong>추천 챔피언:</strong><br>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                    ${deck.champions.map(champ => {
                        const championData = championMap[champ.id];
                        const imageName = championData?.image?.full ?? 'placeholder.png';
                        return `
                            <div style="text-align: center;">
                                <img src="https://ddragon.leagueoflegends.com/cdn/16.3.1/img/tft-champion/${imageName}" 
                                     alt="${champ.name}"
                                     style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"
                                     onerror="this.src='img/placeholder.png'">
                                <div style="font-size: 0.8em; margin-top: 5px;">${champ.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `).join('');
}
*/

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

document.addEventListener('DOMContentLoaded', async () => {
    await loadChampionData(); // 먼저 데이터 로드
    renderMetaDecks();
    renderItems();
});
