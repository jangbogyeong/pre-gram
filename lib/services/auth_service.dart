import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  bool _isLoading = false;
  String? _error;
  User? _currentUser;
  String? _userType;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _currentUser != null || _userType == 'guest';
  String? get error => _error;
  String? get currentUserEmail => _currentUser?.email;
  String? get userType => _userType;
  User? get currentUser => _currentUser;

  AuthService() {
    _init();
    // Firebase Auth 상태 변경 감지
    _auth.authStateChanges().listen((User? user) {
      _currentUser = user;
      notifyListeners();
    });
  }

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _userType = prefs.getString('user_type');
      _currentUser = _auth.currentUser;
    } catch (e) {
      _error = '자동 로그인 중 오류가 발생했습니다.';
      print('자동 로그인 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 구글 로그인
  Future<bool> signInWithGoogle(BuildContext context) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      // 구글 로그인 진행
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        _error = '구글 로그인이 취소되었습니다.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      // 구글 인증 정보 가져오기
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Firebase 인증 정보 생성
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Firebase 로그인
      final UserCredential userCredential =
          await _auth.signInWithCredential(credential);
      _currentUser = userCredential.user;

      // 사용자 타입 저장
      final prefs = await SharedPreferences.getInstance();
      _userType = 'google';
      await prefs.setString('user_type', 'google');

      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/connect-instagram');
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = '구글 로그인 중 오류가 발생했습니다.';
      print('구글 로그인 오류: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // 이메일/비밀번호 로그인
  Future<bool> loginWithEmail(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      _currentUser = userCredential.user;

      final prefs = await SharedPreferences.getInstance();
      _userType = 'email';
      await prefs.setString('user_type', 'email');

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _error = '이메일 또는 비밀번호가 일치하지 않습니다.';
      notifyListeners();
      return false;
    }
  }

  // 게스트 로그인
  Future<bool> signInAsGuest(BuildContext context) async {
    try {
      print('게스트 로그인 시작');
      _isLoading = true;
      _error = null;
      notifyListeners();

      // 게스트 사용자 정보 임시 저장
      final prefs = await SharedPreferences.getInstance();
      final guestId = DateTime.now().millisecondsSinceEpoch.toString();
      await prefs.setString('user_type', 'guest');
      await prefs.setString('guest_id', guestId);
      print('게스트 정보 저장 완료: $guestId');

      // 게스트 상태 설정
      _currentUser = null;
      _userType = 'guest';

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      print('게스트 로그인 오류 발생: $e');
      _error = '게스트 로그인 중 오류가 발생했습니다.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // 로그아웃
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _auth.signOut();
      if (_userType == 'google') {
        await _googleSignIn.signOut();
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_type');
      await prefs.remove('guest_id');

      _currentUser = null;
      _userType = null;
    } catch (e) {
      _error = '로그아웃 중 오류가 발생했습니다.';
      print('로그아웃 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 회원가입
  Future<bool> registerWithEmail(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      _currentUser = userCredential.user;

      final prefs = await SharedPreferences.getInstance();
      _userType = 'email';
      await prefs.setString('user_type', 'email');

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = '회원가입 중 오류가 발생했습니다.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
