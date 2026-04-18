const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API만 렌더러 프로세스에 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // Riot API 호출
  fetchSummoner: (gameName, tagLine) => 
    ipcRenderer.invoke('fetch-summoner', gameName, tagLine),
  
  fetchMatches: (puuid, count) => 
    ipcRenderer.invoke('fetch-matches', puuid, count),
  
  fetchMatchDetail: (matchId) => 
    ipcRenderer.invoke('fetch-match-detail', matchId),

  // 설정 관리
  saveConfig: (key, value) => 
    ipcRenderer.invoke('save-config', key, value),
  
  loadConfig: (key, defaultValue) => 
    ipcRenderer.invoke('load-config', key, defaultValue),

  // 덱 빌더
  saveBoard: (boardData) => 
    ipcRenderer.invoke('save-board', boardData),
  
  loadBoards: () => 
    ipcRenderer.invoke('load-boards'),

  deleteBoard: (timestamp) =>
    ipcRenderer.invoke('delete-board', timestamp),

  // API 키 관리
  setApiKey: (apiKey) =>
    ipcRenderer.invoke('set-api-key', apiKey),

  getApiKey: () =>
    ipcRenderer.invoke('get-api-key'),

  // 앱 정보
  getAppInfo: () =>
    ipcRenderer.invoke('get-app-info'),

  // 플랫폼 정보
  platform: process.platform,
  
  // Electron 환경 여부
  isElectron: true
});

console.log('Preload script loaded');
