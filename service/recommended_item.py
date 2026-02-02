def recommend_item_usage(current_items, board_units):
    """
    남은 아이템으로 무엇을 만들지 추천
    
    Args:
        current_items: 현재 보유 아이템 리스트
        board_units: 현재 보드의 유닛 리스트
    """
    recommendations = []
    
    # 조합 가능한 완성 아이템 계산
    possible_combinations = calculate_combinations(current_items)
    
    for unit in board_units:
        # 해당 유닛의 추천 아이템 가져오기
        recommended_items = get_top_items_for_unit(unit.character_id)
        
        # 만들 수 있는 아이템 중 매칭
        for item in possible_combinations:
            if item in recommended_items:
                recommendations.append({
                    'unit': unit,
                    'item': item,
                    'priority': recommended_items.index(item)
                })
    
    return sorted(recommendations, key=lambda x: x['priority'])