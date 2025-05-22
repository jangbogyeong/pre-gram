import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'Settings',
          style: TextStyle(color: Colors.white),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        children: [
          _buildSection(
            title: 'Profile Settings',
            children: [
              _buildListTile(
                icon: Icons.person,
                title: 'Account Information',
                subtitle: 'Manage your personal information and login details',
                onTap: () {
                  // TODO: 프로필 설정 화면으로 이동
                },
              ),
              _buildListTile(
                icon: Icons.security,
                title: 'Privacy & Security',
                subtitle: 'Manage your privacy settings and security options',
                onTap: () {
                  // TODO: 개인정보 보호 설정 화면으로 이동
                },
              ),
            ],
          ),
          _buildSection(
            title: 'Connected Accounts',
            children: [
              _buildListTile(
                icon: Icons.camera_alt,
                title: 'Instagram Accounts',
                subtitle: 'Manage your connected Instagram accounts',
                onTap: () {
                  Navigator.of(context).pushNamed('/connect-instagram');
                },
              ),
            ],
          ),
          _buildSection(
            title: 'Subscription',
            children: [
              _buildListTile(
                icon: Icons.account_circle,
                title: 'Account Slots',
                subtitle: 'Manage your Instagram account slots',
                onTap: () {
                  // TODO: 계정 슬롯 관리 화면으로 이동
                },
              ),
              _buildListTile(
                icon: Icons.payment,
                title: 'Payment History',
                subtitle: 'View your payment history',
                onTap: () {
                  // TODO: 결제 내역 화면으로 이동
                },
              ),
            ],
          ),
          _buildSection(
            title: 'Preferences',
            children: [
              _buildListTile(
                icon: Icons.palette,
                title: 'Appearance',
                subtitle: 'Customize how InstaPreview looks on your device',
                onTap: () {
                  // TODO: 테마 설정 화면으로 이동
                },
              ),
              _buildListTile(
                icon: Icons.language,
                title: 'Language',
                subtitle: 'Choose your preferred language',
                onTap: () {
                  // TODO: 언어 설정 화면으로 이동
                },
              ),
              _buildListTile(
                icon: Icons.notifications,
                title: 'Notifications',
                subtitle: 'Manage your notification preferences',
                onTap: () {
                  // TODO: 알림 설정 화면으로 이동
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection(
      {required String title, required List<Widget> children}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        ...children,
        const Divider(color: Colors.grey),
      ],
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.white),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(color: Colors.grey),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }
}
