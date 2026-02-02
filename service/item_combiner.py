# services/item_combiner.py
from itertools import combinations
from collections import defaultdict

class ItemCombiner:
    
    # TFT 기본 아이템 (9개)
    BASE_ITEMS = {
        'BF_SWORD': 'BF 대검',
        'RECURVE_BOW': '곡궁',
        'NEEDLESSLY_LARGE_ROD': '쓸데없이 큰 지팡이',
        'TEAR_OF_GODDESS': '여신의 눈물',
        'CHAIN_VEST': '쇠사슬 조끼',
        'NEGATRON_CLOAK': '음전자 망토',
        'GIANTS_BELT': '거인의 허리띠',
        'SPARRING_GLOVES': '연습용 장갑'
    }
    
    # 조합 아이템 매핑 (기본 아이템 2개 -> 완성 아이템)
    ITEM_COMBINATIONS = {
        # BF 대검 조합
        ('BF_SWORD', 'BF_SWORD'): 'DEATHBLADE',  # 죽음의 검
        ('BF_SWORD', 'RECURVE_BOW'): 'GIANT_SLAYER',  # 거인 학살자
        ('BF_SWORD', 'NEEDLESSLY_LARGE_ROD'): 'HEXTECH_GUNBLADE',  # 마공검
        ('BF_SWORD', 'TEAR_OF_GODDESS'): 'SPEAR_OF_SHOJIN',  # 쇼진의 창
        ('BF_SWORD', 'CHAIN_VEST'): 'EDGE_OF_NIGHT',  # 밤의 끝자락
        ('BF_SWORD', 'NEGATRON_CLOAK'): 'BLOODTHIRSTER',  # 피바라기
        ('BF_SWORD', 'GIANTS_BELT'): 'STERAKS_GAGE',  # 스테락의 도전
        ('BF_SWORD', 'SPATULA'): 'TACTICIANS_CROWN',  # 전략가의 왕관
        ('BF_SWORD', 'SPARRING_GLOVES'): 'INFINITY_EDGE',  # 무한의 대검
        
        # 곡궁 조합
        ('RECURVE_BOW', 'RECURVE_BOW'): 'TITANS_RESOLVE',  # 거인의 결의
        ('RECURVE_BOW', 'NEEDLESSLY_LARGE_ROD'): 'GUINSOOS_RAGEBLADE',  # 구인수
        ('RECURVE_BOW', 'TEAR_OF_GODDESS'): 'STATIKK_SHIV',  # 스태틱
        ('RECURVE_BOW', 'CHAIN_VEST'): 'TITANS_RESOLVE',  # 타이탄
        ('RECURVE_BOW', 'NEGATRON_CLOAK'): 'RUNAANS_HURRICANE',  # 루난
        ('RECURVE_BOW', 'GIANTS_BELT'): 'PROTECTORS_VOW',  # 수호자의 맹세
        
        # ... 나머지 조합들
        # (실제로는 모든 조합을 다 작성해야 함)
    }
    
    def __init__(self):
        # 역매핑: 완성 아이템 -> 필요한 기본 아이템
        self.reverse_combinations = {}
        for components, item in self.ITEM_COMBINATIONS.items():
            self.reverse_combinations[item] = sorted(components)
    
    def get_possible_items(self, base_items):
        from collections import Counter
        
        item_count = Counter(base_items)
        possible_items = []
        
        # 모든 2개 조합 체크
        for combo, completed_item in self.ITEM_COMBINATIONS.items():
            component1, component2 = combo
            
            # 같은 아이템 2개 필요한 경우
            if component1 == component2:
                if item_count[component1] >= 2:
                    possible_items.append({
                        'item': completed_item,
                        'components': [component1, component2],
                        'priority': 0  # 나중에 우선순위 계산
                    })
            # 다른 아이템 조합
            else:
                if item_count[component1] >= 1 and item_count[component2] >= 1:
                    possible_items.append({
                        'item': completed_item,
                        'components': sorted([component1, component2]),
                        'priority': 0
                    })
        
        return possible_items
    
    def recommend_items_for_units(self, base_items, board_units):
        # 현재 덱에 맞는 아이템 추천
        from .meta_analyzer import MetaAnalyzer
        
        possible_items = self.get_possible_items(base_items)
        recommendations = []
        
        for unit in board_units:
            # 해당 유닛의 메타 아이템 가져오기
            meta_items = MetaAnalyzer.get_top_items_for_unit(
                unit['character_id']
            )
            
            meta_item_ids = [item.item_id for item in meta_items]
            
            # 만들 수 있는 아이템 중 메타 아이템과 매칭
            for possible in possible_items:
                if possible['item'] in meta_item_ids:
                    # 우선순위 = 메타 순위의 역순
                    priority = len(meta_item_ids) - meta_item_ids.index(possible['item'])
                    
                    recommendations.append({
                        'unit': unit['character_id'],
                        'item': possible['item'],
                        'components': possible['components'],
                        'priority': priority,
                        'win_rate': meta_items[meta_item_ids.index(possible['item'])].win_rate
                    })
        
        # 우선순위 높은 순으로 정렬
        return sorted(recommendations, key=lambda x: x['priority'], reverse=True)
    
    def optimize_item_usage(self, base_items, board_units, max_combinations=3):
        # 남은 아이템으로 최적의 조합 추천
        from collections import Counter
        
        recommendations = self.recommend_items_for_units(base_items, board_units)
        remaining_items = Counter(base_items)
        final_combinations = []
        
        # 우선순위 높은 것부터 조합
        for rec in recommendations:
            if len(final_combinations) >= max_combinations:
                break
            
            # 재료가 충분한지 확인
            component1, component2 = rec['components']
            
            can_make = False
            if component1 == component2:
                can_make = remaining_items[component1] >= 2
            else:
                can_make = (remaining_items[component1] >= 1 and 
                           remaining_items[component2] >= 1)
            
            if can_make:
                final_combinations.append(rec)
                remaining_items[component1] -= 1
                remaining_items[component2] -= 1
        
        return {
            'combinations': final_combinations,
            'remaining': dict(remaining_items)
        }