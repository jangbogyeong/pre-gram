// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'instagram_post.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InstagramPost _$InstagramPostFromJson(Map<String, dynamic> json) =>
    InstagramPost(
      id: json['id'] as String,
      mediaUrl: json['mediaUrl'] as String,
      caption: json['caption'] as String?,
      mediaType: json['mediaType'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      permalink: json['permalink'] as String,
      childrenMediaUrls: (json['childrenMediaUrls'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$InstagramPostToJson(InstagramPost instance) =>
    <String, dynamic>{
      'id': instance.id,
      'mediaUrl': instance.mediaUrl,
      'caption': instance.caption,
      'mediaType': instance.mediaType,
      'timestamp': instance.timestamp.toIso8601String(),
      'permalink': instance.permalink,
      'childrenMediaUrls': instance.childrenMediaUrls,
    };
