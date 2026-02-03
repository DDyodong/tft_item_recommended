from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlayerViewSet, MatchViewSet, UnitViewSet,
    PlacementViewSet, DeckCompositionViewSet,
    ItemUsageViewSet, MetaAnalysisViewSet
)

# Router 설정
router = DefaultRouter()
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'units', UnitViewSet, basename='unit')
router.register(r'placements', PlacementViewSet, basename='placement')
router.register(r'deck-compositions', DeckCompositionViewSet, basename='deckcomposition')
router.register(r'item-usages', ItemUsageViewSet, basename='itemusage')
router.register(r'meta', MetaAnalysisViewSet, basename='meta')

urlpatterns = [
    path('api/', include(router.urls)),
]
