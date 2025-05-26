import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';
import 'package:pre_gram/providers/auth_provider.dart' as instagram_auth;
import 'package:firebase_auth/firebase_auth.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeAndNavigate();
  }

  Future<void> _initializeAndNavigate() async {
    if (!mounted) return;

    final authService = Provider.of<AuthService>(context, listen: false);

    // 완전한 로그아웃 수행
    await authService.completeLogout();

    // 2초 지연
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    // 로그인 화면으로 이동
    Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 앱 로고
            Image(
              image: AssetImage('assets/images/pregram_logo.png'),
              width: 200,
              height: 50,
            ),
            SizedBox(height: 24),
            // 로딩 인디케이터
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
