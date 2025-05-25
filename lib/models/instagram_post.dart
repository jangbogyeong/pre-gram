import 'package:json_annotation/json_annotation.dart';

part 'instagram_post.g.dart';

@JsonSerializable()
class InstagramPost {
  final String id;
  final String mediaUrl;
  final String? caption;
  final String mediaType; // IMAGE, VIDEO, CAROUSEL_ALBUM
  final DateTime timestamp;
  final String permalink;
  final List<String>? childrenMediaUrls; // For carousel albums

  InstagramPost({
    required this.id,
    required this.mediaUrl,
    this.caption,
    required this.mediaType,
    required this.timestamp,
    required this.permalink,
    this.childrenMediaUrls,
  });

  factory InstagramPost.fromJson(Map<String, dynamic> json) =>
      _$InstagramPostFromJson(json);

  Map<String, dynamic> toJson() => _$InstagramPostToJson(this);
}
