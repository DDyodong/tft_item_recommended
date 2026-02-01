from django.db import models

class Player(models.Model):
    puuid = models.CharField(max_length=100, unique= True)
    summoner_name = models.CharField(max_length=50)
    tier = models.CharField(max_length=20)
    rank = models.IntegerField()

class Match(models.Model):
    matchid = models.CharField(max_length=100, unique= True)
    game_datetime = models.DateTimeField()
    set_number = models.CharField(max_length=10) 
    
    class Meta:
        unique_together = ['match', 'player']

class Placement(models.Model):
    match = models.ForeignKey(Match, on_delete= models.CASCADE)
    player = models.ForeignKey(Player, on_delete= models.CASCADE)
    placement = models.IntegerField()
    level = models.IntegerField()

class Unit(models.Model):
    character_id = models.CharField(max_length=50)  # 챔피언 ID
    name = models.CharField(max_length=50)
    cost = models.IntegerField()
    
class DeckComposition(models.Model):
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    tier = models.IntegerField()  # 별 개수
    items = models.JSONField()  # 해당 유닛의 아이템 리스트
    
class ItemUsage(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    item_id = models.CharField(max_length=50)
    usage_count = models.IntegerField(default=0)
    top4_count = models.IntegerField(default=0)  # 상위4위 횟수
    
    class Meta:
        unique_together = ['unit', 'item_id']    