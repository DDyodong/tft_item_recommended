import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TFT.settings')
django.setup()

from service.tft_analyzer import TFTAnalyzer
from django.conf import settings

analyzer = TFTAnalyzer(api_key=settings.RIOT_API_KEY)

print("챌린저 플레이어 수집 중...")
players = analyzer.get_summoner_info()

# 처음엔 3명만 테스트
for player in players[:3]:
    puuid = player['puuid']
    name = player.get('summonerName', puuid[:8])
    print(f"  {name} 처리 중...")
    
    top4_matches = analyzer.get_top4_players(puuid, count=10)
    print(f"  → 상위4위 매치 {len(top4_matches)}개 수집")
    
    item_status = analyzer.analyze_item_usage(top4_matches)
    analyzer.save_to_db(top4_matches, item_status)

print("완료! 브라우저에서 확인하세요 → http://127.0.0.1:8000/api/units/")