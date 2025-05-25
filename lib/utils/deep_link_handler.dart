import 'dart:async';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/providers/auth_provider.dart';

class DeepLinkHandler {
  static const platform = MethodChannel('com.example.pre_gram/deep_link');

  static Future<void> handleIncomingLink(
      String link, BuildContext context) async {
    try {
      final uri = Uri.parse(link);

      // Instagram OAuth 리다이렉트 처리
      if (uri.path.contains('/oauth/callback')) {
        final code = uri.queryParameters['code'];
        if (code != null) {
          final authProvider =
              Provider.of<AuthProvider>(context, listen: false);
          await authProvider.handleAuthorizationCode(code);
        }
      }
    } catch (e) {
      print('Deep link handling error: $e');
    }
  }

  static Future<void> configureDeepLinks(BuildContext context) async {
    // 앱이 실행 중일 때 딥링크 수신
    platform.setMethodCallHandler((call) async {
      if (call.method == 'handleDeepLink') {
        final String link = call.arguments as String;
        await handleIncomingLink(link, context);
      }
    });

    try {
      // 앱이 종료된 상태에서 딥링크로 실행된 경우
      final initialLink = await platform.invokeMethod<String>('getInitialLink');
      if (initialLink != null) {
        await handleIncomingLink(initialLink, context);
      }
    } on PlatformException catch (e) {
      print('Failed to get initial link: $e');
    }
  }
}
