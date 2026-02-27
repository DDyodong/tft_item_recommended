# TFT 아이템 추천 시스템 REST API

## 설치 및 실행

### 1. 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. 마이그레이션 (최초 1회)
```bash
python manage.py migrate
```

### 3. 서버 실행
```bash
python manage.py runserver
```

서버는 `http://127.0.0.1:8000/`에서 실행됩니다.

---

## API 엔드포인트

### 기본 URL
모든 API는 `/api/` 경로 아래에 있습니다.

### 1. 플레이어 API

#### 플레이어 목록 조회
```
GET /api/players/
```

#### 플레이어 생성
```
POST /api/players/
```
Body:
```json
{
  "puuid": "player_uuid_123",
  "summoner_name": "Hide on bush",
  "tier": "CHALLENGER",
  "rank": 1
}
```

#### 특정 플레이어 조회
```
GET /api/players/{id}/
```

#### 특정 플레이어의 매치 기록
```
GET /api/players/{id}/matches/
```

---

### 2. 유닛(챔피언) API

#### 유닛 목록 조회
```
GET /api/units/
```

#### 유닛 생성
```
POST /api/units/
```
Body:
```json
{
  "character_id": "TFT16_Ahri",
  "name": "아리",
  "cost": 3
}
```

#### 특정 유닛의 추천 아이템
```
GET /api/units/{id}/recommended_items/
```

#### 인기 유닛 TOP 10
```
GET /api/units/popular/
```

---

### 3. 아이템 사용 통계 API

#### 아이템 사용 통계 조회
```
GET /api/item-usages/
```

#### 가장 성공적인 아이템 TOP 20
```
GET /api/item-usages/top_items/
```

#### 특정 유닛에 대한 아이템 추천
```
POST /api/item-usages/recommend/
```
Body:
```json
{
  "unit_id": "TFT13_Ahri",
  "current_items": ["item_BFSword", "item_NeedlesslyLargeRod"]
}
```

Response:
```json
[
  {
    "unit_name": "아리",
    "item_id": "TFT_Item_Deathblade",
    "usage_count": 156,
    "top4_count": 98,
    "win_rate": 62.82,
    "priority": 1
  },
  {
    "unit_name": "아리",
    "item_id": "TFT_Item_RabadonsDeathcap",
    "usage_count": 142,
    "top4_count": 87,
    "win_rate": 61.27,
    "priority": 2
  }
]
```

---

### 4. 매치 API

#### 매치 목록 조회
```
GET /api/matches/
```

#### 매치 생성
```
POST /api/matches/
```
Body:
```json
{
  "matchid": "KR_12345678",
  "game_datetime": "2025-02-01T14:30:00Z",
  "set_number": "13"
}
```

#### 특정 매치의 순위 정보
```
GET /api/matches/{id}/placements/
```

---

### 5. 순위(Placement) API

#### 순위 목록 조회
```
GET /api/placements/
```

#### 상위권 성적 조회 (TOP 4)
```
GET /api/placements/top_performers/
```

---

### 6. 메타 분석 API

#### 유닛 티어 리스트 (승률 기반)
```
GET /api/meta/tier_list/
```

Response:
```json
[
  {
    "unit_id": "TFT13_Ahri",
    "unit_name": "아리",
    "cost": 3,
    "usage_count": 523,
    "top4_count": 312,
    "win_rate": 59.66
  }
]
```

#### 인기 있는 덱 조합
```
GET /api/meta/popular_comps/
```

---

## 페이지네이션

대부분의 목록 API는 페이지네이션이 적용되어 있습니다.

- 기본 페이지 사이즈: 10개
- 페이지 파라미터: `?page=2`

예시:
```
GET /api/players/?page=2
```

---

## API 테스트

### Browsable API
브라우저에서 직접 API를 테스트할 수 있습니다:
```
http://127.0.0.1:8000/api/
```

### cURL 예시
```bash
# 유닛 목록 조회
curl http://127.0.0.1:8000/api/units/

# 아이템 추천
curl -X POST http://127.0.0.1:8000/api/item-usages/recommend/ \
  -H "Content-Type: application/json" \
  -d '{"unit_id": "TFT13_Ahri"}'
```

### Python 예시
```python
import requests

# 유닛 목록 조회
response = requests.get('http://127.0.0.1:8000/api/units/')
units = response.json()

# 아이템 추천
data = {
    'unit_id': 'TFT13_Ahri',
    'current_items': ['item_BFSword']
}
response = requests.post(
    'http://127.0.0.1:8000/api/item-usages/recommend/',
    json=data
)
recommendations = response.json()
```

---

## 주요 모델 구조

### Player (플레이어)
- `puuid`: 플레이어 고유 ID
- `summoner_name`: 소환사명
- `tier`: 티어 (CHALLENGER, MASTER 등)
- `rank`: 랭크

### Unit (유닛/챔피언)
- `character_id`: 챔피언 ID
- `name`: 챔피언 이름
- `cost`: 코스트 (1~5)

### ItemUsage (아이템 사용 통계)
- `unit`: 유닛
- `item_id`: 아이템 ID
- `usage_count`: 총 사용 횟수
- `top4_count`: 상위 4위 안에 든 횟수
- `win_rate`: 승률 (계산된 필드)

### Match (매치)
- `matchid`: 매치 고유 ID
- `game_datetime`: 게임 일시
- `set_number`: 시즌 번호

### Placement (순위)
- `match`: 매치
- `player`: 플레이어
- `placement`: 순위 (1~8)
- `level`: 레벨

---

## 추가 기능

### CORS 설정 (프론트엔드 연동시)
```bash
pip install django-cors-headers
```

settings.py 수정:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React 개발 서버
    "http://localhost:8080",  # Vue 개발 서버
]
```
