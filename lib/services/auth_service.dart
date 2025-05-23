import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;
  String? _currentUser;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _currentUser != null;
  String? get error => _error;
  String? get currentUser => _currentUser;

  AuthService() {
    _init();
  }

  Future<void> _init() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _currentUser = prefs.getString('user_email');
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
        _currentUser = email;
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
  Future<void> signInWithGoogle(BuildContext context) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: 실제 구글 로그인 구현
      await Future.delayed(const Duration(seconds: 1)); // 임시 지연
      _currentUser = 'google_user@example.com';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _currentUser!);

      if (context.mounted) {
        Navigator.of(context).pushReplacementNamed('/connect-instagram');
      }
    } catch (e) {
      _error = '구글 로그인 중 오류가 발생했습니다.';
      print('구글 로그인 오류: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // 애플 로그인
  Future<void> signInWithApple(BuildContext context) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // TODO: 실제 애플 로그인 구현
      await Future.delayed(const Duration(seconds: 1)); // 임시 지연
      _currentUser = 'apple_user@example.com';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _currentUser!);

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
      _currentUser = 'facebook_user@example.com';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _currentUser!);

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
      _currentUser = 'guest_user';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', _currentUser!);

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
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_email');
      _currentUser = null;
    } catch (e) {
      _error = '로그아웃 중 오류가 발생했습니다.';
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
      _currentUser = email;
      await prefs.setString('user_email', email);

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
}
