let tftChampions = {};
let championMap = {};
let allChampions = [];
let currentFilter = 'all';

// 게임 보드 상태 (4x7 그리드)
let boardState = Array(28).fill(null);

// 선택된 챔피언과 아이템
let selectedChampion = null;
let selectedItem = null;

// 챔피언 데이터 로드
async function loadChampionData() {
    try {
        const response = await fetch(
          'https://ddragon.leagueoflegends.com/cdn/16.3.1/data/ko_KR/tft-champion.json'
        );
        const data = await response.json();

        tftChampions = data.data;

        championMap = {};
        allChampions = [];
        
        Object.values(tftChampions).forEach(champ => {
            championMap[champ.id] = champ;
            allChampions.push({
                id: champ.id,
                name: champ.name,
                cost: champ.tier || 1,
                image: champ.image?.full
            });
        });

        console.log('챔피언 데이터 로드 완료', allChampions.length);
        renderChampionPool();
    } catch (error) {
        console.error('챔피언 데이터 로드 실패:', error);
    }
}

// 아이템 목록
const allItems = [];

// 게임 보드 렌더링
function renderGameBoard() {
    const board = document.getElementById('gameBoard');
    const rows = 4;
    const cols = 7;
    
    board.innerHTML = '';
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.index = i;
        cell.onclick = () => placeChampion(i);
        
        if (boardState[i]) {
            const unit = boardState[i];
            cell.classList.add('occupied');
            
            const championData = championMap[unit.championId];
            const imageName = championData?.image?.full || 'placeholder.png';
            
            cell.innerHTML = `
                <img src="https://ddragon.leagueoflegends.com/cdn/16.3.1/img/tft-champion/${imageName}" 
                     alt="${unit.name}">
                <div class="unit-items">
                    ${unit.items.map(item => `<span class="mini-item">${item.icon}</span>`).join('')}
                </div>
                <button class="remove-unit" onclick="event.stopPropagation(); removeUnit(${i})">×</button>
            `;
        }
        
        board.appendChild(cell);
    }
}

// 챔피언 배치
function placeChampion(index) {
    if (!selectedChampion) {
        if (boardState[index]) {
            // 아이템 추가 모드
            if (selectedItem && boardState[index].items.length < 3) {
                boardState[index].items.push(selectedItem);
                selectedItem = null;
                renderGameBoard();
                renderItems();
            }
        }
        return;
    }
    
    if (boardState[index]) {
        alert('이미 챔피언이 배치되어 있습니다.');
        return;
    }
    
    boardState[index] = {
        championId: selectedChampion.id,
        name: selectedChampion.name,
        items: []
    };
    
    selectedChampion = null;
    renderGameBoard();
    renderChampionPool();
}

// 유닛 제거
function removeUnit(index) {
    boardState[index] = null;
    renderGameBoard();
}

// 보드 초기화
function clearBoard() {
    if (confirm('모든 배치를 초기화하시겠습니까?')) {
        boardState = Array(28).fill(null);
        renderGameBoard();
    }
}


// 코스트 필터
function filterByCost(cost) {
    currentFilter = cost;
    
    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.cost == cost) {
            btn.classList.add('active');
        }
    });
    
    renderChampionPool();
}

// 챔피언 풀 렌더링
function renderChampionPool() {
    const pool = document.getElementById('championPool');
    
    let championsToShow = allChampions;
    if (currentFilter !== 'all') {
        championsToShow = allChampions.filter(c => c.cost == currentFilter);
    }
    
    pool.innerHTML = championsToShow.map(champ => {
        const isSelected = selectedChampion?.id === champ.id;
        return `
            <div class="champion-card ${isSelected ? 'selected' : ''}" 
                 onclick="selectChampion('${champ.id}')">
                <img src="https://ddragon.leagueoflegends.com/cdn/16.3.1/img/tft-champion/${champ.image}" 
                     alt="${champ.name}"
                     onerror="this.src='placeholder.png'">
                <div class="champion-info">
                    <div class="champion-name">${champ.name}</div>
                    <div class="champion-cost">${champ.cost}코스트</div>
                </div>
            </div>
        `;
    }).join('');
}

// 챔피언 선택
function selectChampion(championId) {
    const champion = allChampions.find(c => c.id === championId);
    if (selectedChampion?.id === championId) {
        selectedChampion = null;
    } else {
        selectedChampion = champion;
    }
    renderChampionPool();
}

// 아이템 렌더링
function renderItems() {
    const grid = document.getElementById('itemsGrid');
    
    grid.innerHTML = allItems.map((item, index) => {
        const isSelected = selectedItem?.name === item.name;
        return `
            <div class="item ${isSelected ? 'selected' : ''}" 
                 onclick="selectItem(${index})">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
            </div>
        `;
    }).join('');
}

// 아이템 선택
function selectItem(index) {
    const item = allItems[index];
    if (selectedItem?.name === item.name) {
        selectedItem = null;
    } else {
        selectedItem = item;
    }
    renderItems();
}

// 페이지 로드
document.addEventListener('DOMContentLoaded', async () => {
    await loadChampionData();
    renderGameBoard();
    renderItems();
});
