from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q

from .models import Player, Match, Placement, Unit, DeckComposition, ItemUsage
from .serializers import (
    PlayerSerializer, MatchSerializer, PlacementSerializer,
    UnitSerializer, DeckCompositionSerializer, ItemUsageSerializer,
    ItemRecommendationSerializer, ItemRecommendationResponseSerializer
)


class PlayerViewSet(viewsets.ModelViewSet):
    """
    플레이어 CRUD API
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    
    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """특정 플레이어의 매치 기록 조회"""
        player = self.get_object()
        placements = Placement.objects.filter(player=player).select_related('match')
        serializer = PlacementSerializer(placements, many=True)
        return Response(serializer.data)


class MatchViewSet(viewsets.ModelViewSet):
    """
    매치 CRUD API
    """
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    
    @action(detail=True, methods=['get'])
    def placements(self, request, pk=None):
        """특정 매치의 순위 정보 조회"""
        match = self.get_object()
        placements = Placement.objects.filter(match=match).select_related('player')
        serializer = PlacementSerializer(placements, many=True)
        return Response(serializer.data)


class UnitViewSet(viewsets.ModelViewSet):
    """
    유닛(챔피언) CRUD API
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    
    @action(detail=True, methods=['get'])
    def recommended_items(self, request, pk=None):
        """특정 유닛의 추천 아이템 조회"""
        unit = self.get_object()
        item_usages = ItemUsage.objects.filter(unit=unit).order_by('-top4_count')
        serializer = ItemUsageSerializer(item_usages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """가장 많이 사용되는 유닛 조회"""
        units = Unit.objects.annotate(
            usage_count=Count('deckcomposition')
        ).order_by('-usage_count')[:10]
        serializer = self.get_serializer(units, many=True)
        return Response(serializer.data)


class PlacementViewSet(viewsets.ModelViewSet):
    """
    배치/순위 CRUD API
    """
    queryset = Placement.objects.all().select_related('match', 'player')
    serializer_class = PlacementSerializer
    
    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """상위권 성적 조회"""
        top_placements = Placement.objects.filter(
            placement__lte=4
        ).select_related('match', 'player')[:20]
        serializer = self.get_serializer(top_placements, many=True)
        return Response(serializer.data)


class DeckCompositionViewSet(viewsets.ModelViewSet):
    """
    덱 구성 CRUD API
    """
    queryset = DeckComposition.objects.all().select_related('placement', 'unit')
    serializer_class = DeckCompositionSerializer


class ItemUsageViewSet(viewsets.ModelViewSet):
    """
    아이템 사용 통계 API
    """
    queryset = ItemUsage.objects.all().select_related('unit')
    serializer_class = ItemUsageSerializer
    
    @action(detail=False, methods=['get'])
    def top_items(self, request):
        """가장 성공적인 아이템 조합 조회"""
        top_items = ItemUsage.objects.filter(
            usage_count__gte=10  # 최소 10회 이상 사용
        ).order_by('-top4_count')[:20]
        serializer = self.get_serializer(top_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def recommend(self, request):
        """
        특정 유닛에 대한 아이템 추천
        POST 데이터: {"unit_id": "TFT_Champion_Ahri", "current_items": ["item1", "item2"]}
        """
        serializer = ItemRecommendationSerializer(data=request.data)
        if serializer.is_valid():
            unit_id = serializer.validated_data['unit_id']
            current_items = serializer.validated_data.get('current_items', [])
            
            try:
                unit = Unit.objects.get(character_id=unit_id)
                
                # 해당 유닛의 추천 아이템 조회
                recommendations = ItemUsage.objects.filter(
                    unit=unit,
                    usage_count__gte=5  # 최소 5회 이상 사용된 아이템만
                ).order_by('-top4_count')[:10]
                
                results = []
                for idx, item_usage in enumerate(recommendations):
                    win_rate = 0
                    if item_usage.usage_count > 0:
                        win_rate = (item_usage.top4_count / item_usage.usage_count) * 100
                    
                    results.append({
                        'unit_name': unit.name,
                        'item_id': item_usage.item_id,
                        'usage_count': item_usage.usage_count,
                        'top4_count': item_usage.top4_count,
                        'win_rate': round(win_rate, 2),
                        'priority': idx + 1
                    })
                
                return Response(results)
                
            except Unit.DoesNotExist:
                return Response(
                    {'error': f'Unit with character_id {unit_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MetaAnalysisViewSet(viewsets.ViewSet):
    """
    메타 분석 API (읽기 전용)
    """
    
    @action(detail=False, methods=['get'])
    def tier_list(self, request):
        """유닛 티어 리스트 (승률 기반)"""
        units_stats = Unit.objects.annotate(
            total_usage=Count('deckcomposition'),
            top4_usage=Count(
                'deckcomposition',
                filter=Q(deckcomposition__placement__placement__lte=4)
            )
        ).filter(total_usage__gte=10)
        
        results = []
        for unit in units_stats:
            win_rate = 0
            if unit.total_usage > 0:
                win_rate = (unit.top4_usage / unit.total_usage) * 100
            
            results.append({
                'unit_id': unit.character_id,
                'unit_name': unit.name,
                'cost': unit.cost,
                'usage_count': unit.total_usage,
                'top4_count': unit.top4_usage,
                'win_rate': round(win_rate, 2)
            })
        
        # 승률 순으로 정렬
        results.sort(key=lambda x: x['win_rate'], reverse=True)
        
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def popular_comps(self, request):
        """인기 있는 덱 조합 분석"""
        # 가장 많이 사용된 유닛 조합 찾기
        popular_units = Unit.objects.annotate(
            usage_count=Count('deckcomposition')
        ).order_by('-usage_count')[:15]
        
        serializer = UnitSerializer(popular_units, many=True)
        return Response(serializer.data)
