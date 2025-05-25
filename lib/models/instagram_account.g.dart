// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'instagram_account.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InstagramAccount _$InstagramAccountFromJson(Map<String, dynamic> json) =>
    InstagramAccount(
      id: json['id'] as String,
      username: json['username'] as String,
      accessToken: json['accessToken'] as String,
      tokenExpiry: DateTime.parse(json['tokenExpiry'] as String),
      profilePicture: json['profilePicture'] as String?,
    );

Map<String, dynamic> _$InstagramAccountToJson(InstagramAccount instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'accessToken': instance.accessToken,
      'tokenExpiry': instance.tokenExpiry.toIso8601String(),
      'profilePicture': instance.profilePicture,
    };
