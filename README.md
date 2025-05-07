## 디렉토리 구조

```
src/
├── assets/            # 이미지, 폰트 등 정적 파일
│   ├── images/        # 이미지 리소스 (워치 이미지, 아이콘 등)
│   └── fonts/         # 폰트 파일
├── components/        # 재사용 가능한 컴포넌트
│   ├── common/        # 공통 컴포넌트 (Modal, Header 등)
│   └── ui/            # UI 컴포넌트 (Button, Slider, Switch, Text 등)
├── navigation/        # 네비게이션 관련 파일
│   ├── AppNavigator.js     # 메인 내비게이션 설정
│   └── AuthNavigator.js    # 인증 관련 내비게이션
├── screens/           # 화면 컴포넌트
│   ├── HomeScreen.js       # 홈 화면
│   ├── SettingScreen.js    # 설정 화면
│   ├── GiftScreen.js       # 기프티콘 화면
│   └── AuthScreen.js       # 인증 화면
├── services/          # API 및 외부 서비스 연동
│   ├── api.js              # API 호출 관련 함수
│   └── auth.js             # 인증 관련 서비스
├── store/             # 상태 관리 (Redux/Zustand)
│   ├── actions/            # 액션 타입 및 생성 함수
│   ├── reducers/           # 리듀서 함수
│   └── index.js            # 스토어 설정
├── utils/             # 유틸리티 함수
│   ├── helpers.js          # 헬퍼 함수
│   ├── formatters.js       # 포맷팅 유틸
│   └── validators.js       # 유효성 검증 유틸
├── constants/         # 상수 정의
│   ├── colors.js           # 색상 상수
│   └── config.js           # 설정 상수
├── hooks/             # 커스텀 훅
│   ├── useAuth.js          # 인증 관련 훅
│   └── useNotification.js  # 알림 관련 훅
└── theme/             # 앱 테마 설정
    └── index.js            # 테마 설정 (색상, 폰트 등)
```
