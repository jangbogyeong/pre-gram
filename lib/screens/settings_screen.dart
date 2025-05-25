import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _selectedTheme = '다크 모드';
  String _selectedLanguage = '한국어';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          '설정',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        children: [
          _buildUserInfoSection(),
          const Divider(color: Color(0xFF2C2C2C), height: 1),
          _buildSettingItem(
            icon: Icons.link,
            title: '연결된 계정',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => const ConnectedAccountsScreen()),
            ),
          ),
          _buildSettingItem(
            icon: Icons.payment_outlined,
            title: '결제 내역',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()),
            ),
          ),
          _buildSettingItem(
            icon: Icons.color_lens_outlined,
            title: '앱 컬러',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ThemeSettingsScreen()),
            ),
          ),
          _buildSettingItem(
            icon: Icons.language,
            title: '언어',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const LanguageSettingsScreen()),
            ),
          ),
          _buildSettingItem(
            icon: Icons.privacy_tip_outlined,
            title: '이용약관 및 개인정보처리방침',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()),
            ),
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFF2C2C2C), height: 1),
          _buildSettingItem(
            icon: Icons.logout,
            title: '로그아웃',
            textColor: Colors.red,
            onTap: () => _logout(),
          ),
          const SizedBox(height: 32),
          Center(
            child: Text(
              'Version 1.0.0',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildUserInfoSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFF121212),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '계정 정보',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(
                Icons.email_outlined,
                color: Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 12),
              Text(
                'user@example.com',
                style: TextStyle(
                  color: Colors.grey.shade300,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
                child: const Center(
                  child: Text(
                    'G',
                    style: TextStyle(
                      color: Colors.red,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '구글 계정으로 로그인',
                style: TextStyle(
                  color: Colors.grey.shade300,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? textColor,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Icon(
              icon,
              color: textColor ?? Colors.white,
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  color: textColor ?? Colors.white,
                  fontSize: 16,
                ),
              ),
            ),
            if (title != '로그아웃') ...[
              Icon(
                Icons.arrow_forward_ios,
                color: Colors.grey.shade600,
                size: 16,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: const Text(
          '로그아웃',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          '정말 로그아웃 하시겠습니까?',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text(
              '취소',
              style: TextStyle(color: Colors.grey),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pushReplacementNamed('/login');
            },
            child: const Text(
              '로그아웃',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

// 연결된 계정 화면
class ConnectedAccountsScreen extends StatefulWidget {
  const ConnectedAccountsScreen({super.key});

  @override
  State<ConnectedAccountsScreen> createState() =>
      _ConnectedAccountsScreenState();
}

class _ConnectedAccountsScreenState extends State<ConnectedAccountsScreen> {
  bool _hasConnectedAccount = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          '연결된 계정',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _hasConnectedAccount ? _buildConnectedView() : _buildEmptyView(),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SizedBox(
          height: 50,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  _hasConnectedAccount ? Colors.blue : Colors.white,
              foregroundColor:
                  _hasConnectedAccount ? Colors.white : Colors.black,
            ),
            onPressed: () {
              _showFeatureInDevelopmentMessage();
            },
            child: Text(
              _hasConnectedAccount ? '계정 추가하기' : '인스타그램 계정 연결하기',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildConnectedView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          '사용 중인 계정: 1/1',
          style: TextStyle(
            color: Colors.grey.shade300,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          height: 6,
          decoration: BoxDecoration(
            color: Colors.grey.shade800,
            borderRadius: BorderRadius.circular(3),
          ),
          child: FractionallySizedBox(
            widthFactor: 1.0, // 100% 사용 중
            child: Container(
              decoration: BoxDecoration(
                color: Colors.blue,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Instagram 계정',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        _buildConnectedAccount(),
        const SizedBox(height: 24),
        const Text(
          '계정 정보',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        _buildInfoItem('현재 1개의 계정이 있습니다'),
        const SizedBox(height: 12),
        _buildInfoItem('1개의 계정 중 1개를 사용 중입니다'),
        const SizedBox(height: 12),
        _buildInfoItem('추가 계정 비용은 ₩9,900입니다 (1회 결제)'),
        const SizedBox(height: 40),
      ],
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  Color(0xFFFCAF45),
                  Color(0xFFE1306C),
                  Color(0xFF5851DB)
                ],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
            ),
            child: const Icon(
              Icons.camera_alt,
              color: Colors.white,
              size: 40,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            '연결된 인스타그램 계정이 없습니다',
            style: TextStyle(
              color: Colors.grey.shade300,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '인스타그램 계정을 연결하여 피드를 관리해보세요',
            style: TextStyle(
              color: Colors.grey.shade500,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildConnectedAccount() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF2C2C2C),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  Color(0xFFFCAF45),
                  Color(0xFFE1306C),
                  Color(0xFF5851DB)
                ],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
            ),
            child: const Icon(
              Icons.camera_alt,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '@your_username',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  '연결됨',
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              // 연결 해제 기능
              setState(() {
                _hasConnectedAccount = false;
              });
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text(
              '연결 해제',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String text) {
    return Row(
      children: [
        const Icon(
          Icons.check_circle_outline,
          color: Colors.blue,
          size: 18,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }

  void _showFeatureInDevelopmentMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('이 기능은 현재 개발 중입니다.'),
        backgroundColor: Color(0xFF333333),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

// 결제 내역 화면
class PaymentHistoryScreen extends StatelessWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          '결제 내역',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.receipt_long_outlined,
              color: Colors.grey.shade600,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              '결제 내역이 없습니다',
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '계정 구매 시 이곳에 표시됩니다',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SizedBox(
          height: 50,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
            ),
            onPressed: () {
              // 계정 추가 기능 (추후 구현)
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('이 기능은 현재 개발 중입니다.'),
                  backgroundColor: Color(0xFF333333),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: const Text(
              '계정 추가하기 (₩9,900)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
        ),
      ),
    );
  }
}

// 개인정보처리방침 화면
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          '개인정보처리방침',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            '개인정보처리방침',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildPolicySection(
            '1. 개인정보의 처리 목적',
            '회사는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.\n- 회원 가입 및 관리\n- 서비스 제공 및 운영\n- 맞춤형 컨텐츠 제공\n- 서비스 이용 통계',
          ),
          _buildPolicySection(
            '2. 개인정보의 처리 및 보유 기간',
            '회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.',
          ),
          _buildPolicySection(
            '3. 정보주체와 법정대리인의 권리·의무 및 그 행사방법',
            '이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.\n- 개인정보 열람 요구\n- 오류 등이 있을 경우 정정 요구\n- 삭제 요구\n- 처리정지 요구',
          ),
          _buildPolicySection(
            '4. 처리하는 개인정보의 항목',
            '회사는 다음의 개인정보 항목을 처리하고 있습니다.\n- 필수항목: 이메일, 소셜 로그인 정보\n- 선택항목: 이름, 프로필 사진\n- 자동수집항목: 접속 IP, 쿠키, 서비스 이용 기록',
          ),
          _buildPolicySection(
            '5. 개인정보의 파기',
            '회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다.\n- 파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.',
          ),
          _buildPolicySection(
            '6. 개인정보 보호책임자',
            '회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n▶ 개인정보 보호책임자\n성명: 홍길동\n직책: 개인정보 보호책임자\n연락처: privacy@pregram.com',
          ),
          const SizedBox(height: 32),
          const Text(
            '시행일자: 2023년 10월 1일',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildPolicySection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              color: Colors.grey.shade300,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

// 앱 컬러 설정 화면
class ThemeSettingsScreen extends StatefulWidget {
  const ThemeSettingsScreen({super.key});

  @override
  State<ThemeSettingsScreen> createState() => _ThemeSettingsScreenState();
}

class _ThemeSettingsScreenState extends State<ThemeSettingsScreen> {
  String _selectedTheme = '다크 모드';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          '앱 컬러',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            '앱의 전반적인 테마를 설정할 수 있습니다.',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          _buildThemeOption('다크 모드', Icons.dark_mode),
          const SizedBox(height: 12),
          _buildThemeOption('라이트 모드', Icons.light_mode),
          const SizedBox(height: 12),
          _buildThemeOption('시스템 설정', Icons.settings_suggest),
        ],
      ),
    );
  }

  Widget _buildThemeOption(String theme, IconData icon) {
    final isSelected = _selectedTheme == theme;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedTheme = theme;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$theme 설정이 저장되었습니다.'),
            backgroundColor: const Color(0xFF333333),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.blue : const Color(0xFF2C2C2C),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 24),
            const SizedBox(width: 16),
            Text(
              theme,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Colors.blue,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}

// 언어 설정 화면
class LanguageSettingsScreen extends StatefulWidget {
  const LanguageSettingsScreen({super.key});

  @override
  State<LanguageSettingsScreen> createState() => _LanguageSettingsScreenState();
}

class _LanguageSettingsScreenState extends State<LanguageSettingsScreen> {
  String _selectedLanguage = '한국어';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          '언어',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            '앱에서 사용할 언어를 선택해주세요.',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          _buildLanguageOption('한국어', '🇰🇷'),
          const SizedBox(height: 12),
          _buildLanguageOption('English', '🇺🇸'),
          const SizedBox(height: 12),
          _buildLanguageOption('日本語', '🇯🇵'),
          const SizedBox(height: 12),
          _buildLanguageOption('中文', '🇨🇳'),
        ],
      ),
    );
  }

  Widget _buildLanguageOption(String language, String flag) {
    final isSelected = _selectedLanguage == language;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedLanguage = language;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('언어가 $language(으)로 변경되었습니다.'),
            backgroundColor: const Color(0xFF333333),
            behavior: SnackBarBehavior.floating,
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.blue : const Color(0xFF2C2C2C),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Text(flag, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 16),
            Text(
              language,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Colors.blue,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}
