import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/screens/splash_screen.dart';
import 'package:pre_gram/screens/login_screen.dart';
import 'package:pre_gram/screens/home_screen.dart';
import 'package:pre_gram/screens/connect_instagram_screen.dart';
import 'package:pre_gram/screens/feed_screen.dart';
import 'package:pre_gram/screens/settings_screen.dart';
import 'package:pre_gram/services/auth_service.dart';
import 'package:pre_gram/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 상태바 스타일 설정
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => AuthService())],
      child: MaterialApp(
        title: 'Pre-Gram',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        initialRoute: '/splash',
        routes: {
          '/splash': (context) => const SplashScreen(),
          '/login': (context) => const LoginScreen(),
          '/connect-instagram': (context) => const ConnectInstagramScreen(),
          '/feed': (context) => const FeedScreen(),
          '/home': (context) => const HomeScreen(),
          '/settings': (context) => const SettingsScreen(),
        },
      ),
    );
  }
}
