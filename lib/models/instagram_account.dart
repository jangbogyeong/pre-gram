import 'package:json_annotation/json_annotation.dart';

part 'instagram_account.g.dart';

@JsonSerializable()
class InstagramAccount {
  final String id;
  final String username;
  final String accessToken;
  final DateTime tokenExpiry;
  final String? profilePicture;

  InstagramAccount({
    required this.id,
    required this.username,
    required this.accessToken,
    required this.tokenExpiry,
    this.profilePicture,
  });

  factory InstagramAccount.fromJson(Map<String, dynamic> json) =>
      _$InstagramAccountFromJson(json);

  Map<String, dynamic> toJson() => _$InstagramAccountToJson(this);
}
