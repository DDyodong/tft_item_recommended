# 핵심 기물 & 아이템 추출 쿼리
# 특정 유닛의 아이템 사용률 상위 3개
from django.db.models import Count, Q

def get_top_items_for_unit(unit_id, min_games=10):
    return ItemUsage.objects.filter(
        unit__character_id=unit_id,
        usage_count__gte=min_games
    ).annotate(
        win_rate=models.F('win_count') * 100.0 / models.F('usage_count')
    ).order_by('-win_rate')[:3]

# 가장 많이 사용되는 덱 조합 찾기
def get_meta_decks(placement_threshold=4):
    """상위4위 게임에서 자주 나오는 덱 조합"""
    from django.db.models import Count
    
    top_placements = Placement.objects.filter(
        placement__lte=placement_threshold
    )
    
    # 덱별 trait 조합으로 그룹화
    # (실제로는 traits 필드를 추가하고 분석해야 함)