import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pre_gram/screens/auth/instagram_auth_screen.dart';
import 'package:pre_gram/screens/home_screen.dart';
import 'package:pre_gram/screens/splash_screen.dart';
import 'package:pre_gram/screens/login_screen.dart';
import 'package:pre_gram/screens/connect_instagram_screen.dart';
import 'package:pre_gram/screens/feed_screen.dart';
import 'package:pre_gram/screens/settings_screen.dart';
import 'package:pre_gram/services/auth_service.dart';
import 'package:pre_gram/theme/app_theme.dart';
import 'package:pre_gram/services/instagram_service.dart';
import 'package:pre_gram/providers/auth_provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    print('Firebase 초기화 오류: $e');
  }

  // 상태바 스타일 설정
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  final prefs = await SharedPreferences.getInstance();
  final instagramService = InstagramService();
  final authService = AuthService();

  runApp(MyApp(
    prefs: prefs,
    instagramService: instagramService,
    authService: authService,
  ));
}

class MyApp extends StatelessWidget {
  final SharedPreferences prefs;
  final InstagramService instagramService;
  final AuthService authService;

  const MyApp({
    super.key,
    required this.prefs,
    required this.instagramService,
    required this.authService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(instagramService, prefs)..loadSavedAccount(),
        ),
        ChangeNotifierProvider.value(value: authService),
      ],
      child: MaterialApp(
        title: 'Pre-gram',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: Colors.black,
          primaryColor: const Color(0xFF0095F6),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF0095F6),
            secondary: Color(0xFF00D1F2),
          ),
        ),
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        initialRoute: '/login',
        routes: {
          '/': (context) => const SplashScreen(),
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
