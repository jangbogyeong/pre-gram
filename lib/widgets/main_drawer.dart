import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MainDrawer extends StatefulWidget {
  const MainDrawer({super.key});

  @override
  State<MainDrawer> createState() => _MainDrawerState();
}

class _MainDrawerState extends State<MainDrawer> {
  String? _username;
  String? _email;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _username = prefs.getString('registered_username') ?? '사용자';
      _email = prefs.getString('registered_email') ?? '이메일 정보 없음';
    });
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);

    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // 드로어 헤더
          UserAccountsDrawerHeader(
            accountName: Text(_username ?? '사용자'),
            accountEmail: Text(_email ?? '이메일 정보 없음'),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                (_username?.isNotEmpty ?? false)
                    ? _username![0].toUpperCase()
                    : 'U',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),

          // 메뉴 항목들
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text('홈'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushReplacementNamed('/home');
            },
          ),

          ListTile(
            leading: const Icon(Icons.edit),
            title: const Text('피드 편집'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushNamed('/edit');
            },
          ),

          ListTile(
            leading: const Icon(Icons.compare),
            title: const Text('비교 보기'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushNamed('/compare');
            },
          ),

          ListTile(
            leading: const Icon(Icons.add_circle_outline),
            title: const Text('새 게시물 만들기'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushNamed('/editor');
            },
          ),

          const Divider(),

          ListTile(
            leading: const Icon(Icons.link),
            title: const Text('인스타그램 계정 연결'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushNamed('/connect-instagram');
            },
          ),

          ListTile(
            leading: const Icon(Icons.refresh),
            title: const Text('피드 가져오기'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushNamed('/fetch-feed');
            },
          ),

          const Divider(),

          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('설정'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              Navigator.of(context).pushNamed('/settings');
            },
          ),

          ListTile(
            leading: const Icon(Icons.help_outline),
            title: const Text('도움말'),
            onTap: () {
              Navigator.of(context).pop(); // 드로어 닫기
              // 도움말 화면 또는 다이얼로그 표시
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('도움말'),
                  content: const Text(
                    'Pre-Gram은 인스타그램 피드를 미리보고 편집할 수 있는 앱입니다.',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('확인'),
                    ),
                  ],
                ),
              );
            },
          ),

          if (authService.isLoggedIn)
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('로그아웃'),
              onTap: () async {
                Navigator.of(context).pop(); // 드로어 닫기

                // 로그아웃 확인 다이얼로그
                final shouldLogout = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('로그아웃'),
                    content: const Text('정말 로그아웃하시겠습니까?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        child: const Text('취소'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        child: const Text('로그아웃'),
                      ),
                    ],
                  ),
                );

                if (shouldLogout == true) {
                  await authService.logout();
                  if (context.mounted) {
                    Navigator.of(context).pushReplacementNamed('/login');
                  }
                }
              },
            ),
        ],
      ),
    );
  }
}
