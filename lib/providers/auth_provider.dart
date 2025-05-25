import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pre_gram/models/instagram_account.dart';
import 'package:pre_gram/services/instagram_service.dart';

class AuthProvider extends ChangeNotifier {
  static const String _tokenKey = 'instagram_token';
  static const String _userIdKey = 'instagram_user_id';
  static const String _usernameKey = 'instagram_username';
  static const String _tokenExpiryKey = 'instagram_token_expiry';

  final InstagramService _instagramService;
  final SharedPreferences _prefs;

  InstagramAccount? _currentAccount;
  bool _isLoading = false;

  AuthProvider(this._instagramService, this._prefs);

  InstagramAccount? get currentAccount => _currentAccount;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentAccount != null;

  // 저장된 계정 정보 로드
  Future<void> loadSavedAccount() async {
    final token = _prefs.getString(_tokenKey);
    final userId = _prefs.getString(_userIdKey);
    final username = _prefs.getString(_usernameKey);
    final expiryStr = _prefs.getString(_tokenExpiryKey);

    if (token != null &&
        userId != null &&
        username != null &&
        expiryStr != null) {
      final expiry = DateTime.parse(expiryStr);
      if (expiry.isAfter(DateTime.now())) {
        _currentAccount = InstagramAccount(
          id: userId,
          username: username,
          accessToken: token,
          tokenExpiry: expiry,
        );
        notifyListeners();
      } else {
        // 토큰이 만료되었으면 로그아웃
        await logout();
      }
    }
  }

  // 인증 코드로 로그인
  Future<void> handleAuthorizationCode(String code) async {
    try {
      _isLoading = true;
      notifyListeners();

      final account = await _instagramService.exchangeCodeForToken(code);

      // 계정 정보 저장
      await _prefs.setString(_tokenKey, account.accessToken);
      await _prefs.setString(_userIdKey, account.id);
      await _prefs.setString(_usernameKey, account.username);
      await _prefs.setString(
          _tokenExpiryKey, account.tokenExpiry.toIso8601String());

      _currentAccount = account;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // 로그아웃
  Future<void> logout() async {
    await _prefs.remove(_tokenKey);
    await _prefs.remove(_userIdKey);
    await _prefs.remove(_usernameKey);
    await _prefs.remove(_tokenExpiryKey);

    _currentAccount = null;
    notifyListeners();
  }
}
