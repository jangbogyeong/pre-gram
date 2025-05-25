import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:pre_gram/models/instagram_account.dart';
import 'package:pre_gram/models/instagram_post.dart';

class InstagramService {
  static const String _baseUrl = 'https://graph.instagram.com/v12.0';

  // Facebook 개발자 콘솔에서 받은 앱 ID와 시크릿
  static const String _appId = 'YOUR_APP_ID';
  static const String _appSecret = 'YOUR_APP_SECRET';

  // OAuth 인증 URL
  static String get authorizationUrl {
    final redirectUri = 'YOUR_REDIRECT_URI'; // 앱의 OAuth 리다이렉트 URI
    return 'https://api.instagram.com/oauth/authorize?'
        'client_id=$_appId'
        '&redirect_uri=$redirectUri'
        '&scope=user_profile,user_media'
        '&response_type=code';
  }

  // 액세스 토큰 교환
  Future<InstagramAccount> exchangeCodeForToken(String code) async {
    final response = await http.post(
      Uri.parse('https://api.instagram.com/oauth/access_token'),
      body: {
        'client_id': _appId,
        'client_secret': _appSecret,
        'grant_type': 'authorization_code',
        'redirect_uri': 'YOUR_REDIRECT_URI',
        'code': code,
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to exchange code for token');
    }

    final tokenData = json.decode(response.body);

    // 장기 액세스 토큰으로 교환
    final longLivedToken = await _getLongLivedToken(tokenData['access_token']);

    // 사용자 프로필 정보 가져오기
    final userInfo = await getUserInfo(longLivedToken);

    return InstagramAccount(
      id: userInfo['id'],
      username: userInfo['username'],
      accessToken: longLivedToken,
      tokenExpiry: DateTime.now().add(const Duration(days: 60)),
      profilePicture: userInfo['profile_picture'],
    );
  }

  // 장기 액세스 토큰 발급
  Future<String> _getLongLivedToken(String shortLivedToken) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/access_token'
          '?grant_type=ig_exchange_token'
          '&client_secret=$_appSecret'
          '&access_token=$shortLivedToken'),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to get long-lived token');
    }

    final data = json.decode(response.body);
    return data['access_token'];
  }

  // 사용자 정보 가져오기
  Future<Map<String, dynamic>> getUserInfo(String accessToken) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/me?fields=id,username&access_token=$accessToken'),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to get user info');
    }

    return json.decode(response.body);
  }

  // 미디어 목록 가져오기
  Future<List<InstagramPost>> getMediaList(String accessToken) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/me/media'
          '?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_url}'
          '&access_token=$accessToken'),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to get media list');
    }

    final data = json.decode(response.body);
    final List<dynamic> mediaItems = data['data'];

    return mediaItems.map((item) {
      List<String>? childrenMediaUrls;
      if (item['media_type'] == 'CAROUSEL_ALBUM' && item['children'] != null) {
        childrenMediaUrls = (item['children']['data'] as List)
            .map((child) => child['media_url'] as String)
            .toList();
      }

      return InstagramPost(
        id: item['id'],
        mediaUrl: item['media_url'] ?? item['thumbnail_url'],
        caption: item['caption'],
        mediaType: item['media_type'],
        timestamp: DateTime.parse(item['timestamp']),
        permalink: item['permalink'],
        childrenMediaUrls: childrenMediaUrls,
      );
    }).toList();
  }
}
