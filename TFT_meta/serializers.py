from rest_framework import serializers
from .models import Player, Match, Placement, Unit, DeckComposition, ItemUsage


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'puuid', 'summoner_name', 'tier', 'rank']


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['id', 'matchid', 'game_datetime', 'set_number']


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'character_id', 'name', 'cost']


class DeckCompositionSerializer(serializers.ModelSerializer):
    unit = UnitSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(), 
        source='unit', 
        write_only=True
    )
    
    class Meta:
        model = DeckComposition
        fields = ['id', 'placement', 'unit', 'unit_id', 'tier', 'items']


class PlacementSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    match = MatchSerializer(read_only=True)
    deck_compositions = DeckCompositionSerializer(
        many=True, 
        read_only=True, 
        source='deckcomposition_set'
    )
    
    class Meta:
        model = Placement
        fields = ['id', 'match', 'player', 'placement', 'level', 'deck_compositions']


class ItemUsageSerializer(serializers.ModelSerializer):
    unit = UnitSerializer(read_only=True)
    win_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemUsage
        fields = ['id', 'unit', 'item_id', 'usage_count', 'top4_count', 'win_rate']
    
    def get_win_rate(self, obj):
        if obj.usage_count > 0:
            return round((obj.top4_count / obj.usage_count) * 100, 2)
        return 0.0


# 아이템 추천용 시리얼라이저
class ItemRecommendationSerializer(serializers.Serializer):
    unit_id = serializers.CharField(max_length=50)
    current_items = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        default=list
    )


class ItemRecommendationResponseSerializer(serializers.Serializer):
    unit_name = serializers.CharField()
    item_id = serializers.CharField()
    usage_count = serializers.IntegerField()
    top4_count = serializers.IntegerField()
    win_rate = serializers.FloatField()
    priority = serializers.IntegerField()
