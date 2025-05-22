# Pre-Gram

인스타그램 피드 미리보기 및 편집 앱

## 소개

Pre-Gram은 인스타그램 피드를 미리 보고 편집할 수 있는 앱입니다. 이 앱을 통해 사용자는 인스타그램 게시물을 게시하기 전에 전체 피드가 어떻게 보일지 미리 확인하고 조정할 수 있습니다.

## 주요 기능

- 인스타그램 계정 연결 및 기존 피드 가져오기
- 새 게시물 미리보기 및 피드 레이아웃 시각화
- 이미지 편집 및 필터 적용
- 게시물 순서 변경 및 레이아웃 조정
- 게시물 분석 및 통계

## 설치 방법

### 요구사항

- Flutter 3.0.0 이상
- Dart 3.0.0 이상
- Android Studio 또는 VS Code
- iOS 개발을 위한 Xcode (Mac OS에서만 해당)

### 설치 단계

1. 저장소 클론
```
git clone https://github.com/yourusername/pre-gram.git
cd pre-gram
```

2. 의존성 설치
```
flutter pub get
```

3. 앱 실행
```
flutter run
```

## 개발 환경 설정

### Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Android와 iOS 앱 추가
3. 다운로드한 `google-services.json` 파일을 `/android/app/`에 추가
4. 다운로드한 `GoogleService-Info.plist` 파일을 `/ios/Runner/`에 추가

### 인스타그램 API 설정

1. [Meta for Developers](https://developers.facebook.com/) 페이지에서 앱 생성
2. Instagram Graph API 설정
3. `lib/constants/api_keys.dart` 파일에 클라이언트 ID와 시크릿 추가

## 기여 방법

1. 저장소 포크
2. 새 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요. 