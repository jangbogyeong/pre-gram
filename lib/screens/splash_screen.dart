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
    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    final authService = Provider.of<AuthService>(context, listen: false);
    final authProvider =
        Provider.of<instagram_auth.AuthProvider>(context, listen: false);
    final firebaseUser = FirebaseAuth.instance.currentUser;

    if (firebaseUser == null) {
      // Firebase에 로그인되지 않은 경우
      Navigator.of(context).pushReplacementNamed('/login');
    } else if (!authProvider.isAuthenticated) {
      // Firebase 로그인은 되어있지만 인스타그램 연동이 안된 경우
      Navigator.of(context).pushReplacementNamed('/connect-instagram');
    } else {
      // 모든 인증이 완료된 경우
      Navigator.of(context).pushReplacementNamed('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Image.asset(
          'assets/images/pregram_logo.png',
          width: 200,
          height: 50,
          errorBuilder: (context, error, stackTrace) {
            print('Error loading logo: $error');
            return const Text(
              'Pre-gram',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            );
          },
        ),
      ),
    );
  }
}
