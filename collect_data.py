import django, os, time, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TFT.settings')
django.setup()

from service.tft_analyzer import TFTAnalyzer
from django.conf import settings

# ── 설정 ────────────────────────────────────────────────────────────────────
TARGET_PLAYERS  = 100   # 수집할 플레이어 수
MATCHES_PER_PLAYER = 20 # 플레이어당 매치 수

# Riot 개발 키 기준 rate limit
REQ_INTERVAL    = 0.12  # 요청 사이 최소 대기 (초) → 초당 ~8req (20req 버킷 여유)
BUCKET_LIMIT    = 90    # 2분당 최대 요청 수 (100에서 여유 10 뺌)
BUCKET_WINDOW   = 121   # 2분 + 1초 여유

# ── Rate Limit 추적기 ────────────────────────────────────────────────────────
class RateLimiter:
    def __init__(self, bucket_limit, bucket_window, req_interval):
        self.bucket_limit  = bucket_limit
        self.bucket_window = bucket_window
        self.req_interval  = req_interval
        self.bucket_start  = time.time()
        self.bucket_count  = 0

    def wait(self):
        now = time.time()

        # 2분 버킷 리셋
        if now - self.bucket_start >= self.bucket_window:
            self.bucket_start = now
            self.bucket_count = 0

        # 버킷 한도 초과 시 남은 시간 대기
        if self.bucket_count >= self.bucket_limit:
            wait_sec = self.bucket_window - (now - self.bucket_start) + 1
            print(f"\n  ⏳ Rate limit 도달 — {wait_sec:.0f}초 대기 중...", end='', flush=True)
            time.sleep(max(wait_sec, 0))
            self.bucket_start = time.time()
            self.bucket_count = 0
            print(" 재개!")

        time.sleep(self.req_interval)
        self.bucket_count += 1

# ── 메인 수집 로직 ───────────────────────────────────────────────────────────
def main():
    if not settings.RIOT_API_KEY:
        print("❌ RIOT_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")
        sys.exit(1)

    rl       = RateLimiter(BUCKET_LIMIT, BUCKET_WINDOW, REQ_INTERVAL)
    analyzer = TFTAnalyzer(api_key=settings.RIOT_API_KEY)

    # ── 1. 챌린저 플레이어 목록 ─────────────────────────────────────────────
    print("📋 챌린저 플레이어 목록 수집 중...")
    rl.wait()
    try:
        players = analyzer.get_summoner_info()
    except Exception as e:
        print(f"❌ 플레이어 목록 수집 실패: {e}")
        sys.exit(1)

    targets = players[:TARGET_PLAYERS]
    print(f"✅ {len(targets)}명 대상 확정\n")

    # ── 2. 플레이어별 매치 수집 ─────────────────────────────────────────────
    total_matches  = 0
    total_saved    = 0
    failed_players = []

    for idx, player in enumerate(targets, 1):
        puuid = player['puuid']
        name  = player.get('summonerName', puuid[:8])

        print(f"[{idx:>3}/{len(targets)}] {name[:16]:<16}", end=' ', flush=True)

        try:
            # 매치 ID 수집
            rl.wait()
            match_ids = analyzer.get_match_ids(puuid, count=MATCHES_PER_PLAYER)

            # 매치 상세 수집
            top4_matches = []
            for match_id in match_ids:
                rl.wait()
                try:
                    detail = analyzer.get_match_detail(match_id)
                    if not detail or 'info' not in detail:
                        continue
                    for participant in detail['info']['participants']:
                        if participant['puuid'] == puuid and participant['placement'] <= 4:
                            top4_matches.append({
                                'match_id':  match_id,
                                'placement': participant['placement'],
                                'units':     participant['units'],
                                'traits':    participant['traits'],
                            })
                except Exception:
                    continue  # 단일 매치 실패는 스킵

            # DB 저장
            if top4_matches:
                item_status = analyzer.analyze_item_usage(top4_matches)
                analyzer.save_to_db(top4_matches, item_status)
                total_matches += len(top4_matches)
                total_saved   += 1
                print(f"→ TOP4 {len(top4_matches):>2}게임 저장 ✓")
            else:
                print("→ TOP4 데이터 없음 (스킵)")

        except Exception as e:
            failed_players.append(name)
            print(f"→ ❌ 오류: {e}")

    # ── 3. 결과 요약 ─────────────────────────────────────────────────────────
    print("\n" + "═" * 50)
    print(f"✅ 수집 완료!")
    print(f"   처리한 플레이어 : {total_saved} / {len(targets)}명")
    print(f"   저장된 TOP4 게임 : {total_matches}개")
    if failed_players:
        print(f"   실패 ({len(failed_players)}명): {', '.join(failed_players[:5])}")
    print("═" * 50)
    print("\n👉 확인: http://127.0.0.1:8000/api/meta/tier_list/")
    print("👉 확인: http://127.0.0.1:8000/api/units/popular/")


if __name__ == '__main__':
    main()