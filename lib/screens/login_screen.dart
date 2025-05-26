import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Consumer<AuthService>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          return SafeArea(
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
                    const SizedBox(height: 48),

                    // 에러 메시지
                    if (auth.error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Text(
                          auth.error!,
                          style: const TextStyle(
                            color: Colors.red,
                            fontSize: 14,
                          ),
                        ),
                      ),

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
                      onPressed: () async {
                        final result = await auth.signInWithGoogle(context);
                        if (result != null && context.mounted) {
                          Navigator.of(context)
                              .pushReplacementNamed('/connect-instagram');
                        }
                      },
                    ),
                    const SizedBox(height: 16),

                    // 애플 로그인 버튼
                    _buildSocialButton(
                      context: context,
                      text: 'Sign in with Apple',
                      icon: const Icon(Icons.apple, size: 24),
                      onPressed: () => auth.signInWithApple(context),
                    ),
                    const SizedBox(height: 16),

                    // 페이스북 로그인 버튼
                    _buildSocialButton(
                      context: context,
                      text: 'Sign in with Facebook',
                      icon: const Icon(Icons.facebook, size: 24),
                      onPressed: () => auth.signInWithFacebook(context),
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
                    const SizedBox(height: 24),

                    // 구분선과 게스트 로그인 버튼
                    Row(
                      children: [
                        const Expanded(
                          child: Divider(
                            color: Colors.grey,
                            thickness: 0.5,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'or',
                            style: TextStyle(
                              color: Colors.grey.shade400,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        const Expanded(
                          child: Divider(
                            color: Colors.grey,
                            thickness: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // 게스트 로그인 버튼
                    TextButton(
                      onPressed: () async {
                        // 게스트 로그인 경고 다이얼로그
                        final shouldContinue = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            backgroundColor: const Color(0xFF1E1E1E),
                            title: const Text(
                              '게스트 로그인',
                              style: TextStyle(color: Colors.white),
                            ),
                            content: const Text(
                              '게스트로 로그인하면 피드 편집 내용이 저장되지 않습니다. 인스타그램 계정 연동은 필수입니다.\n\n계속하시겠습니까?',
                              style: TextStyle(color: Colors.white),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () =>
                                    Navigator.of(context).pop(false),
                                child: const Text(
                                  '취소',
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                              TextButton(
                                onPressed: () =>
                                    Navigator.of(context).pop(true),
                                child: const Text(
                                  '계속하기',
                                  style: TextStyle(color: Colors.blue),
                                ),
                              ),
                            ],
                          ),
                        );

                        print('게스트 로그인 다이얼로그 결과: $shouldContinue');

                        if (shouldContinue == true && context.mounted) {
                          print('게스트 로그인 시작');
                          final success = await auth.signInAsGuest(context);
                          print('게스트 로그인 결과: $success');

                          if (success && context.mounted) {
                            print('인스타그램 연동 페이지로 이동');
                            Navigator.of(context)
                                .pushReplacementNamed('/connect-instagram');
                          }
                        }
                      },
                      child: Text(
                        'Continue as Guest',
                        style: TextStyle(
                          color: Colors.grey.shade400,
                          fontSize: 16,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
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
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          side: const BorderSide(color: Colors.white, width: 1),
        ),
        onPressed: onPressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            const SizedBox(width: 12),
            Text(
              text,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
