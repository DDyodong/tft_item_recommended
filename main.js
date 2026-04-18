const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const apiHandler = require('./backend/api-handler');

// 설정 저장소 초기화
const store = new Store();

let mainWindow;
let tray;

// 개발 모드 확인
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    backgroundColor: '#0a0e27',
    show: false, // 준비될 때까지 숨김
    autoHideMenuBar: true, // 메뉴바 자동 숨김
    frame: true
  });

  // 메인 페이지 로드
  mainWindow.loadFile('index.html');

  // 창 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 개발자 도구 (개발 모드에서만)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 창 닫기 처리
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // 첫 최소화 시 알림
      if (!store.get('minimizeNotified')) {
        showNotification('TFT Tracker가 시스템 트레이에서 실행 중입니다.');
        store.set('minimizeNotified', true);
      }
    }
    return false;
  });

  // 창이 완전히 닫힐 때
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 시스템 트레이 생성
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'TFT Tracker 열기',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: '설정',
      click: () => {
        // TODO: 설정 창 열기
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('TFT Tracker');
  tray.setContextMenu(contextMenu);
  
  // 트레이 아이콘 클릭 시 창 표시
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 알림 표시
function showNotification(message) {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    new Notification({
      title: 'TFT Tracker',
      body: message,
      icon: path.join(__dirname, 'assets/icon.png')
    }).show();
  }
}

// 앱 준비
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// 모든 창이 닫힐 때
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱 종료 전
app.on('before-quit', () => {
  app.isQuitting = true;
});

// ==================== IPC 핸들러 ====================

// Riot API - 소환사 조회
ipcMain.handle('fetch-summoner', async (event, gameName, tagLine) => {
  try {
    console.log(`Fetching summoner: ${gameName}#${tagLine}`);
    const data = await apiHandler.fetchSummoner(gameName, tagLine);
    return { success: true, data };
  } catch (error) {
    console.error('Fetch summoner error:', error);
    return { success: false, error: error.message };
  }
});

// Riot API - 매치 목록 조회
ipcMain.handle('fetch-matches', async (event, puuid, count = 20) => {
  try {
    console.log(`Fetching ${count} matches for: ${puuid}`);
    const data = await apiHandler.fetchMatches(puuid, count);
    return { success: true, data };
  } catch (error) {
    console.error('Fetch matches error:', error);
    return { success: false, error: error.message };
  }
});

// Riot API - 매치 상세 조회
ipcMain.handle('fetch-match-detail', async (event, matchId) => {
  try {
    const data = await apiHandler.fetchMatchDetail(matchId);
    return { success: true, data };
  } catch (error) {
    console.error('Fetch match detail error:', error);
    return { success: false, error: error.message };
  }
});

// 설정 저장
ipcMain.handle('save-config', (event, key, value) => {
  try {
    store.set(key, value);
    return { success: true };
  } catch (error) {
    console.error('Save config error:', error);
    return { success: false, error: error.message };
  }
});

// 설정 불러오기
ipcMain.handle('load-config', (event, key, defaultValue = null) => {
  try {
    const value = store.get(key, defaultValue);
    return { success: true, data: value };
  } catch (error) {
    console.error('Load config error:', error);
    return { success: false, error: error.message };
  }
});

// 덱 빌더 저장
ipcMain.handle('save-board', (event, boardData) => {
  try {
    const boards = store.get('savedBoards', []);
    boards.push({
      ...boardData,
      timestamp: Date.now()
    });
    store.set('savedBoards', boards);
    return { success: true };
  } catch (error) {
    console.error('Save board error:', error);
    return { success: false, error: error.message };
  }
});

// 저장된 덱 불러오기
ipcMain.handle('load-boards', (event) => {
  try {
    const boards = store.get('savedBoards', []);
    return { success: true, data: boards };
  } catch (error) {
    console.error('Load boards error:', error);
    return { success: false, error: error.message };
  }
});

// 저장된 덱 삭제
ipcMain.handle('delete-board', (event, timestamp) => {
  try {
    const boards = store.get('savedBoards', []);
    const filtered = boards.filter(b => b.timestamp !== timestamp);
    store.set('savedBoards', filtered);
    return { success: true };
  } catch (error) {
    console.error('Delete board error:', error);
    return { success: false, error: error.message };
  }
});

// API 키 설정 (암호화 권장)
ipcMain.handle('set-api-key', (event, apiKey) => {
  try {
    store.set('riotApiKey', apiKey);
    apiHandler.setApiKey(apiKey);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// API 키 확인
ipcMain.handle('get-api-key', (event) => {
  try {
    const apiKey = store.get('riotApiKey', '');
    return { success: true, data: apiKey };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 앱 버전 정보
ipcMain.handle('get-app-info', (event) => {
  return {
    success: true,
    data: {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform
    }
  };
});

console.log('TFT Tracker Electron app started');
