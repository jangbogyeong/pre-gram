import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  bool _isLoading = false;
  String? _error;
  User? _firebaseUser;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _firebaseUser != null;
  String? get error => _error;
  User? get currentUser => _firebaseUser;

  AuthService() {
    _init();
    // Firebase Auth 상태 변경 감지
    _auth.authStateChanges().listen((User? user) {
      _firebaseUser = user;
      notifyListeners();
    });
  }

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();

    try {
      _firebaseUser = _auth.currentUser;
    } catch (e) {
      _error = '자동 로그인 중 오류가 발생했습니다.';
      print('자동 로그인 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 이메일/비밀번호 로그인
  Future<bool> loginWithEmail(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // 실제 서버 인증 대신 임시로 저장된 사용자 정보와 비교
      final prefs = await SharedPreferences.getInstance();
      final savedEmail = prefs.getString('registered_email');
      final savedPassword = prefs.getString('registered_password');

      if (savedEmail == email && savedPassword == password) {
        _firebaseUser = _auth.currentUser;
        await prefs.setString('user_email', email);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        _error = '이메일 또는 비밀번호가 일치하지 않습니다.';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _error = '로그인 중 오류가 발생했습니다.';
      notifyListeners();
      return false;
    }
  }

  // 구글 로그인
  Future<UserCredential?> signInWithGoogle(BuildContext context) async {
    try {
      // 구글 로그인 다이얼로그 표시
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      // 구글 인증 정보 획득
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Firebase 인증 정보 생성
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Firebase 로그인 수행
      final userCredential = await _auth.signInWithCredential(credential);
      return userCredential;
    } catch (e) {
      print('Google sign in error: $e');
      return null;
    }
  }

  // 애플 로그인
  Future<void> signInWithApple(BuildContext context) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: 실제 애플 로그인 구현
      await Future.delayed(const Duration(seconds: 1)); // 임시 지연
      _firebaseUser = _auth.currentUser;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _firebaseUser!.email!);

      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/connect-instagram');
      }
    } catch (e) {
      _error = '애플 로그인 중 오류가 발생했습니다.';
      print('애플 로그인 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 페이스북 로그인
  Future<void> signInWithFacebook(BuildContext context) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: 실제 페이스북 로그인 구현
      await Future.delayed(const Duration(seconds: 1)); // 임시 지연
      _firebaseUser = _auth.currentUser;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _firebaseUser!.email!);

      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/connect-instagram');
      }
    } catch (e) {
      _error = '페이스북 로그인 중 오류가 발생했습니다.';
      print('페이스북 로그인 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 게스트 로그인
  Future<void> signInAsGuest(BuildContext context) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _firebaseUser = _auth.currentUser;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _firebaseUser!.email!);

      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/connect-instagram');
      }
    } catch (e) {
      _error = '게스트 로그인 중 오류가 발생했습니다.';
      print('게스트 로그인 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 로그아웃
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);
      _firebaseUser = null;
    } catch (e) {
      _error = '로그아웃 중 오류가 발생했습니다.';
      print('로그아웃 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 회원가입
  Future<bool> register(String email, String password, String username) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();

      // 이미 등록된 이메일인지 확인
      final existingEmail = prefs.getString('registered_email');
      if (existingEmail == email) {
        _isLoading = false;
        _error = '이미 사용 중인 이메일입니다.';
        notifyListeners();
        return false;
      }

      // 새로운 사용자 정보 저장
      await prefs.setString('registered_email', email);
      await prefs.setString('registered_password', password);
      await prefs.setString('registered_username', username);

      // 자동 로그인
      _firebaseUser = _auth.currentUser;
      await prefs.setString('user_email', _firebaseUser!.email!);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _error = '회원가입 중 오류가 발생했습니다.';
      notifyListeners();
      return false;
    }
  }

  // 인증 상태 스트림
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // 로그아웃
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }
}
