import 'package:flutter/material.dart';

class ConnectInstagramScreen extends StatelessWidget {
  const ConnectInstagramScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // 상단 시계 및 상태바 영역
            const SizedBox(height: 60),

            // 로고
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Image.asset(
                'assets/images/pregram_logo.png',
                width: 180,
                height: 45,
              ),
            ),

            const Spacer(flex: 1),

            // 중앙 텍스트
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                'Which Instagram account would you\nlike to preview your feed on?',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                ),
              ),
            ),

            const Spacer(flex: 1),

            // 연동 버튼
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: ElevatedButton(
                onPressed: () {
                  // 피드 미리보기 화면으로 이동
                  Navigator.of(context).pushNamed('/feed');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt_outlined, size: 24),
                    SizedBox(width: 12),
                    Text(
                      'Connect Instagram Account',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(flex: 2),

            // 하단 저작권 텍스트
            const Padding(
              padding: EdgeInsets.only(bottom: 20),
              child: Text(
                '© 2023 Pre-gram. Not affiliated with Instagram.',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
