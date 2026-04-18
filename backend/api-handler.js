const axios = require('axios');

class RiotAPIHandler {
  constructor() {
    // API 키는 환경변수 또는 설정에서 가져오기
    this.apiKey = process.env.RIOT_API_KEY || '';
    this.region = 'kr';
    this.routing = 'asia';
    
    this.baseURL = {
      account: `https://${this.routing}.api.riotgames.com`,
      match: `https://${this.routing}.api.riotgames.com`
    };

    // 요청 제한 관리 (Rate Limiting)
    this.requestQueue = [];
    this.isProcessing = false;
  }

  // API 키 설정
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    console.log('Riot API key updated');
  }

  // API 요청 헬퍼
  async makeRequest(url, params = {}) {
    if (!this.apiKey) {
      throw new Error('API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 입력해주세요.');
    }

    try {
      const response = await axios.get(url, {
        params,
        headers: {
          'X-Riot-Token': this.apiKey
        },
        timeout: 10000 // 10초 타임아웃
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // API 응답 에러
        switch (error.response.status) {
          case 401:
            throw new Error('API 키가 유효하지 않습니다. 설정을 확인해주세요.');
          case 403:
            throw new Error('API 키 권한이 없습니다.');
          case 404:
            throw new Error('요청한 데이터를 찾을 수 없습니다.');
          case 429:
            throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
          case 500:
          case 502:
          case 503:
            throw new Error('Riot 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(`API 오류 (${error.response.status}): ${error.response.statusText}`);
        }
      } else if (error.request) {
        // 네트워크 에러
        throw new Error('네트워크 연결을 확인해주세요.');
      } else {
        // 기타 에러
        throw new Error(`요청 실패: ${error.message}`);
      }
    }
  }

  // 소환사 정보 조회
  async fetchSummoner(gameName, tagLine) {
    console.log(`API Request: Summoner ${gameName}#${tagLine}`);
    
    const url = `${this.baseURL.account}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    
    try {
      const data = await this.makeRequest(url);
      console.log(`Summoner found: ${data.puuid}`);
      return data;
    } catch (error) {
      console.error('Fetch summoner failed:', error.message);
      throw error;
    }
  }

  // 매치 목록 조회
  async fetchMatches(puuid, count = 20) {
    console.log(`API Request: ${count} matches for ${puuid}`);
    
    const url = `${this.baseURL.match}/tft/match/v1/matches/by-puuid/${puuid}/ids`;
    
    try {
      const data = await this.makeRequest(url, { 
        start: 0, 
        count: Math.min(count, 20) // 최대 20개
      });
      console.log(`Found ${data.length} matches`);
      return data;
    } catch (error) {
      console.error('Fetch matches failed:', error.message);
      throw error;
    }
  }

  // 매치 상세 정보 조회
  async fetchMatchDetail(matchId) {
    console.log(`API Request: Match detail ${matchId}`);
    
    const url = `${this.baseURL.match}/tft/match/v1/matches/${matchId}`;
    
    try {
      const data = await this.makeRequest(url);
      console.log(`Match detail loaded: ${matchId}`);
      return data;
    } catch (error) {
      console.error('Fetch match detail failed:', error.message);
      throw error;
    }
  }

  // 여러 매치 상세 정보 배치 조회 (Rate Limit 고려)
  async fetchMultipleMatches(matchIds, onProgress = null) {
    const results = [];
    const total = matchIds.length;
    
    for (let i = 0; i < matchIds.length; i++) {
      try {
        const matchData = await this.fetchMatchDetail(matchIds[i]);
        results.push(matchData);
        
        if (onProgress) {
          onProgress(i + 1, total);
        }

        // Rate limit 방지를 위한 지연 (100ms)
        if (i < matchIds.length - 1) {
          await this.sleep(100);
        }
      } catch (error) {
        console.error(`Failed to fetch match ${matchIds[i]}:`, error.message);
        // 실패한 매치는 건너뛰기
        results.push(null);
      }
    }

    return results.filter(r => r !== null);
  }

  // 유틸: 대기
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // API 키 유효성 검사
  async validateApiKey() {
    if (!this.apiKey) {
      return { valid: false, message: 'API 키가 설정되지 않았습니다.' };
    }

    try {
      // 테스트 요청 (간단한 버전 확인)
      await axios.get('https://ddragon.leagueoflegends.com/api/versions.json', {
        timeout: 5000
      });
      
      return { valid: true, message: 'API 키가 유효합니다.' };
    } catch (error) {
      return { valid: false, message: 'API 키 검증에 실패했습니다.' };
    }
  }
}

// 싱글톤 인스턴스
const apiHandler = new RiotAPIHandler();

module.exports = apiHandler;
