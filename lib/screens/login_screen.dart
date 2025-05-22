import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 앱 로고
                Image.asset(
                  'assets/images/pregram_logo.png',
                  width: 200,
                  height: 50,
                ),
                const SizedBox(height: 48),

                // 로그인 방법 안내 텍스트
                const Text(
                  'Sign in to continue',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Choose your preferred sign in method',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 48),

                // 구글 로그인 버튼
                _buildSocialButton(
                  context: context,
                  text: 'Sign in with Google',
                  icon: const Icon(Icons.g_mobiledata, size: 24),
                  onPressed: () =>
                      Provider.of<AuthService>(context, listen: false)
                          .signInWithGoogle(context),
                ),
                const SizedBox(height: 16),

                // 애플 로그인 버튼
                _buildSocialButton(
                  context: context,
                  text: 'Sign in with Apple',
                  icon: const Icon(Icons.apple, size: 24),
                  onPressed: () =>
                      Provider.of<AuthService>(context, listen: false)
                          .signInWithApple(context),
                ),
                const SizedBox(height: 16),

                // 페이스북 로그인 버튼
                _buildSocialButton(
                  context: context,
                  text: 'Sign in with Facebook',
                  icon: const Icon(Icons.facebook, size: 24),
                  onPressed: () =>
                      Provider.of<AuthService>(context, listen: false)
                          .signInWithFacebook(context),
                ),
                const SizedBox(height: 48),

                // 이용약관 동의 텍스트
                const Text(
                  'By signing in, you agree to our Terms of Service and\nPrivacy Policy',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required BuildContext context,
    required String text,
    required Widget icon,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 48,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.grey[900],
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            const SizedBox(width: 12),
            Text(text),
          ],
        ),
      ),
    );
  }
}
