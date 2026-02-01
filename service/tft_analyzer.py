import requests, time
from collections import defaultdict

class TFTAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        self.headers = {'X-Riot-Token': api_key}

    def get_summoner_info(self):
        url = "https://kr.api.riotgames.com/tft/league/v1/challenger" # 챌린저 티어 소환사 정보 가져오기
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()['entries']
    
    def get_match_ids(self, puuid, count=20):
        url = f"https://asia.api.riotgames.com/tft/match/v1/matches/by-puuid/{puuid}/ids?count={count}" # 매치 ID 리스트 가져오기
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_match_detail(self, match_id):
        url = f"https://asia.api.riotgames.com/tft/match/v1/matches/{match_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        time.sleep(0.1) # API 호출 제한을 피하기 위해 잠시 대기
        return response.json()    

    def get_top4_players(self, puuid, count=20):
        match_ids = self.get_match_ids(puuid, count) # 매치 ID 리스트 가져오기


        top4_matches = []
        for match_id in match_ids:
            match_data = self.get_match_detail(match_id) # 매치 상세 정보 가져오기
            if not match_data or 'info' not in match_data:
                continue

            for participant in match_data['info']['participants']:
                if participant['puuid'] == puuid and participant['placement'] <= 4: # 상위 4위 플레이어 필터링.
                    top4_matches.append({
                        'match_id': match_id,
                        'placement': participant['placement'],
                        'units': participant['units'],
                        'traits': participant['traits']
                    })
        return top4_matches # 상위 4위 매치 리스트 반환
    
    def analyze_item_usage(self, top4_matches):
        
        item_status = defaultdict(lambda: defaultdict(int)) # 아이템 사용 통계 초기화

        for match in top4_matches:          # 각 순방 매치에서 아이템 사용 통계 집계
            for unit in match['units']:
                unit_id = unit['character_id']

                for item_id in unit['item_ids']:
                    item_status[unit_id][item_id] += 1
        
        return item_status # 아이템 사용 통계 반환