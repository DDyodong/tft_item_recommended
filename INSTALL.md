# TFT Tracker - Electron 클라이언트 실행 가이드

## 📦 설치 및 실행

### 1. 필수 요구사항
- Node.js 16 이상 (https://nodejs.org/)
- npm (Node.js와 함께 설치됨)

### 2. 프로젝트 구조
```
tft-tracker/
├── main.js                 # Electron 메인 프로세스
├── preload.js             # 보안 브릿지
├── package.json           # 프로젝트 설정
├── index.html            # 매치 히스토리 페이지
├── builder.html          # 덱 빌더 페이지
├── settings.html         # 설정 페이지
├── script.js             # 매치 히스토리 로직
├── builder.js            # 덱 빌더 로직
├── settings.js           # 설정 로직
├── style.css             # 스타일시트
├── backend/
│   └── api-handler.js    # Riot API 핸들러
└── assets/               # 아이콘 파일 (아래 참조)
    ├── icon.png
    ├── icon.ico          # Windows용 (선택)
    └── icon.icns         # Mac용 (선택)
```

### 3. 설치 방법

#### 1단계: 프로젝트 폴더 생성
```bash
mkdir tft-tracker
cd tft-tracker
```

#### 2단계: 모든 파일 복사
위의 파일들을 프로젝트 폴더에 복사합니다.

#### 3단계: backend 폴더 생성
```bash
mkdir backend
```
`api-handler.js`를 backend 폴더에 넣습니다.

#### 4단계: assets 폴더 및 아이콘 생성
```bash
mkdir assets
```

**간단한 아이콘 생성:**
- 512x512 PNG 이미지를 준비
- `icon.png`로 저장하여 assets 폴더에 넣기

**선택사항 (Windows/Mac 전용 아이콘):**
- Windows: https://convertio.co/png-ico/ 에서 .ico 생성
- Mac: https://cloudconvert.com/png-to-icns 에서 .icns 생성

#### 5단계: 의존성 설치
```bash
npm install
```

이 명령어는 다음 패키지들을 설치합니다:
- electron
- electron-builder
- axios
- electron-store
- cross-env

### 4. 실행 방법

#### 개발 모드 실행
```bash
npm start
```
또는
```bash
npm run dev
```

이렇게 하면 개발자 도구가 함께 열립니다.

#### 앱 사용하기
1. **설정 페이지**에서 Riot API 키 입력
   - https://developer.riotgames.com/ 에서 API 키 발급
   - Development API Key 복사
   - 설정 페이지에서 붙여넣기 후 저장

2. **매치 히스토리**에서 소환사 검색
   - 소환사명#태그 입력 (예: Hide on bush#KR1)
   - 최근 20경기 조회

3. **덱 빌더**에서 덱 구성
   - 챔피언 선택 및 배치
   - 아이템 장착
   - 저장 기능 사용

## 🏗️ 빌드 (배포용 실행 파일 생성)

### Windows용 빌드
```bash
npm run build:win
```
생성 위치: `dist/TFT Tracker Setup 1.0.0.exe`

### Mac용 빌드
```bash
npm run build:mac
```
생성 위치: `dist/TFT Tracker-1.0.0.dmg`

### Linux용 빌드
```bash
npm run build:linux
```
생성 위치: `dist/TFT Tracker-1.0.0.AppImage`

### 모든 플랫폼 빌드
```bash
npm run build
```

## ⚙️ 기본 사용법

### API 키 설정
1. 앱 실행
2. 설정 탭 클릭
3. API 키 입력 및 저장
4. "연결 테스트" 버튼으로 확인

### 소환사 검색
1. 매치 히스토리 탭
2. 소환사 이름 입력 (예: `Hide on bush#KR1`)
3. 검색 버튼 클릭
4. 최근 20경기 및 통계 확인

### 덱 빌더
1. 덱 빌더 탭
2. 왼쪽에서 챔피언 선택
3. 보드에 배치
4. 아이템 선택 및 장착
5. "배치 저장" 버튼으로 저장

## 🔧 문제 해결

### 앱이 실행되지 않는 경우
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### API 키 오류
- 설정 페이지에서 API 키 확인
- https://developer.riotgames.com/ 에서 새 키 발급
- Development Key는 24시간마다 갱신 필요

### 시스템 트레이 아이콘이 안 보이는 경우
- `assets/icon.png` 파일 존재 확인
- 512x512 PNG 파일인지 확인

### "소환사를 찾을 수 없습니다" 오류
- 소환사 이름과 태그 확인
- 태그 없이 입력 시 자동으로 #KR1 추가됨
- API 키 유효성 확인

## 📊 데이터 저장 위치

Electron Store 사용으로 다음 위치에 데이터 저장:

**Windows:**
```
C:\Users\<사용자명>\AppData\Roaming\tft-tracker\config.json
```

**Mac:**
```
~/Library/Application Support/tft-tracker/config.json
```

**Linux:**
```
~/.config/tft-tracker/config.json
```

## 🎨 커스터마이징

### 아이콘 변경
1. 512x512 PNG 이미지 준비
2. `assets/icon.png` 교체
3. 앱 재시작

### 테마 색상 변경
`style.css` 파일에서 색상 값 수정:
- 주 색상: `#1abc9c`
- 보조 색상: `#3498db`
- 배경: `#0a0e27`

## 🚀 고급 기능

### 개발자 도구 열기
개발 모드에서 자동으로 열림:
```bash
npm run dev
```

### 로그 확인
콘솔에서 앱 로그 확인 가능:
- API 요청/응답
- 오류 메시지
- 시스템 이벤트

## 📝 추가 정보

### Riot API Rate Limits
- Development Key: 
  - 분당 20 요청
  - 2분당 100 요청
- Production Key (신청 필요):
  - 더 높은 제한

### 시스템 요구사항
- **RAM**: 최소 4GB
- **디스크**: 200MB 여유 공간
- **OS**: 
  - Windows 10 이상
  - macOS 10.13 이상
  - Ubuntu 18.04 이상

## 🔐 보안

- API 키는 암호화되어 로컬에 저장됨
- 네트워크 요청은 HTTPS만 사용
- 소스코드에 API 키 노출 없음

## 📞 지원

문제가 발생하면:
1. GitHub Issues 작성
2. 로그 파일 첨부
3. 재현 방법 설명

---

**즐거운 TFT 되세요! 🎮**
