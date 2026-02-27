import requests, time
from collections import defaultdict
from django.conf import settings

class TFTAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        self.headers = {'X-Riot-Token': self.api_key}

    def get_summoner_info(self):
        url = "https://kr.api.riotgames.com/tft/league/v1/challenger"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()['entries']
    
    def get_match_ids(self, puuid, count=20):
        url = f"https://asia.api.riotgames.com/tft/match/v1/matches/by-puuid/{puuid}/ids?count={count}" # 매치 ID 리스트 가져오기
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_match_detail(self, match_id):
        url = f"https://asia.api.riotgames.com/tft/match/v1/matches/{match_id}" # 매치 상세 정보 가져오기
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
        item_status = defaultdict(lambda: defaultdict(int))

        for match in top4_matches:
            for unit in match['units']:
                unit_id = unit['character_id']
                for item_id in unit['itemNames']:
                    item_status[unit_id][item_id] += 1
        
        # defaultdict → 일반 dict로 변환
        return {k: dict(v) for k, v in item_status.items()}
    
    def save_to_db(self, top4_matches, item_status):
        from TFT_meta.models import Unit, ItemUsage
    
        RARITY_TO_COST = {0: 1, 1: 2, 2: 3, 4: 4, 6: 5}

        # top4_matches에서 유닛 rarity 추출
        units_info = {}
        for match in top4_matches:
            for unit in match['units']:
                units_info[unit['character_id']] = unit.get('rarity', 0)

        for character_id, items in item_status.items():
            rarity = units_info.get(character_id, 0)
            cost = RARITY_TO_COST.get(rarity, 1)

            unit, created = Unit.objects.get_or_create(
                character_id=character_id,
                defaults={'name': character_id, 'cost': cost}
            )
            if not created and unit.cost != cost:
                unit.cost = cost
                unit.save()

            for item_id, count in items.items():
                item_usage, _ = ItemUsage.objects.get_or_create(
                    unit=unit,
                    item_id=item_id,
                    defaults={'usage_count': 0, 'top4_count': 0}
                )
                item_usage.usage_count += count
                item_usage.top4_count += count
                item_usage.save()
        
        print("저장 완료!")