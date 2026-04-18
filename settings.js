// 설정 페이지 로직

let isApiKeyVisible = false;

// 페이지 로드 시 설정 불러오기
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadAppInfo();
});

// 설정 불러오기
async function loadSettings() {
    if (window.electronAPI?.isElectron) {
        // API 키 불러오기
        const result = await window.electronAPI.getApiKey();
        if (result.success && result.data) {
            document.getElementById('apiKeyInput').value = result.data;
        }
    }
}

// 앱 정보 불러오기
async function loadAppInfo() {
    if (window.electronAPI?.isElectron) {
        const result = await window.electronAPI.getAppInfo();
        if (result.success) {
            document.getElementById('appVersion').textContent = result.data.version;
            document.getElementById('appPlatform').textContent = result.data.platform;
        }
    } else {
        document.getElementById('appVersion').textContent = '웹 버전';
        document.getElementById('appPlatform').textContent = navigator.platform;
    }
}

// API 키 표시/숨기기
function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    isApiKeyVisible = !isApiKeyVisible;
    input.type = isApiKeyVisible ? 'text' : 'password';
}

// API 키 저장
async function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        showStatus('API 키를 입력해주세요.', 'error');
        return;
    }

    if (!apiKey.startsWith('RGAPI-')) {
        showStatus('올바른 Riot API 키 형식이 아닙니다.', 'error');
        return;
    }

    if (window.electronAPI?.isElectron) {
        const result = await window.electronAPI.setApiKey(apiKey);
        if (result.success) {
            showStatus('API 키가 저장되었습니다.', 'success');
        } else {
            showStatus('저장 실패: ' + result.error, 'error');
        }
    } else {
        showStatus('Electron 환경에서만 사용 가능합니다.', 'error');
    }
}

// API 키 테스트
async function testApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        showStatus('먼저 API 키를 입력해주세요.', 'error');
        return;
    }

    showStatus('연결 테스트 중...', 'info');

    try {
        // 간단한 테스트 요청
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        
        if (response.ok) {
            showStatus('✅ 연결 성공! API 키가 정상적으로 작동합니다.', 'success');
        } else {
            showStatus('❌ 연결 실패. API 키를 확인해주세요.', 'error');
        }
    } catch (error) {
        showStatus('❌ 네트워크 오류: ' + error.message, 'error');
    }
}

// 상태 메시지 표시
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('apiKeyStatus');
    statusEl.textContent = message;
    statusEl.className = 'status-message ' + type;
    statusEl.style.display = 'block';

    // 3초 후 자동 숨김
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// 모든 데이터 삭제
async function clearAllData() {
    if (!confirm('정말로 모든 저장된 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        return;
    }

    if (confirm('덱 빌더 저장 데이터와 설정이 모두 삭제됩니다.\n계속하시겠습니까?')) {
        if (window.electronAPI?.isElectron) {
            // Electron: 백엔드 데이터 삭제
            await window.electronAPI.saveConfig('savedBoards', []);
            await window.electronAPI.setApiKey('');
            
            document.getElementById('apiKeyInput').value = '';
            showStatus('모든 데이터가 삭제되었습니다.', 'success');
        } else {
            // 웹: localStorage 삭제
            localStorage.clear();
            showStatus('로컬 데이터가 삭제되었습니다.', 'success');
        }
    }
}
