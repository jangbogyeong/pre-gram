import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';

class FeedGrid extends StatelessWidget {
  const FeedGrid({super.key});

  @override
  Widget build(BuildContext context) {
    // 실제 앱에서는 API나 저장소에서 데이터를 가져와야 함
    // 여기서는 예시 데이터 사용
    final posts = _getDummyPosts();

    return GridView.builder(
      padding: const EdgeInsets.all(2),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1.0,
        crossAxisSpacing: 2,
        mainAxisSpacing: 2,
      ),
      itemCount: posts.length,
      itemBuilder: (context, index) {
        final post = posts[index];
        return GestureDetector(
          onTap: () {
            // 게시물 상세 화면으로 이동
            Navigator.of(context).pushNamed('/preview', arguments: post);
          },
          child:
              post.imageUrl.isNotEmpty
                  ? CachedNetworkImage(
                    imageUrl: post.imageUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => _buildShimmer(),
                    errorWidget:
                        (context, url, error) => const Center(
                          child: Icon(Icons.error_outline, color: Colors.red),
                        ),
                  )
                  : Container(
                    color: Colors.grey[300],
                    child: const Center(
                      child: Icon(
                        Icons.image_not_supported,
                        color: Colors.grey,
                      ),
                    ),
                  ),
        );
      },
    );
  }

  // 로딩 상태 위젯
  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Container(color: Colors.white),
    );
  }

  // 더미 데이터 생성 (실제 앱에서는 API 호출로 대체)
  List<Post> _getDummyPosts() {
    return [
      Post(
        id: '1',
        imageUrl: 'https://picsum.photos/id/1/500/500',
        caption: '첫 번째 게시물',
        likes: 123,
        comments: 45,
      ),
      Post(
        id: '2',
        imageUrl: 'https://picsum.photos/id/2/500/500',
        caption: '두 번째 게시물',
        likes: 88,
        comments: 12,
      ),
      Post(
        id: '3',
        imageUrl: 'https://picsum.photos/id/3/500/500',
        caption: '세 번째 게시물',
        likes: 256,
        comments: 67,
      ),
      Post(
        id: '4',
        imageUrl: 'https://picsum.photos/id/4/500/500',
        caption: '네 번째 게시물',
        likes: 432,
        comments: 91,
      ),
      Post(
        id: '5',
        imageUrl: 'https://picsum.photos/id/5/500/500',
        caption: '다섯 번째 게시물',
        likes: 77,
        comments: 23,
      ),
      Post(
        id: '6',
        imageUrl: 'https://picsum.photos/id/6/500/500',
        caption: '여섯 번째 게시물',
        likes: 321,
        comments: 56,
      ),
      Post(
        id: '7',
        imageUrl: 'https://picsum.photos/id/7/500/500',
        caption: '일곱 번째 게시물',
        likes: 198,
        comments: 34,
      ),
      Post(
        id: '8',
        imageUrl: 'https://picsum.photos/id/8/500/500',
        caption: '여덟 번째 게시물',
        likes: 543,
        comments: 87,
      ),
      Post(
        id: '9',
        imageUrl: 'https://picsum.photos/id/9/500/500',
        caption: '아홉 번째 게시물',
        likes: 111,
        comments: 22,
      ),
    ];
  }
}

// 게시물 모델
class Post {
  final String id;
  final String imageUrl;
  final String caption;
  final int likes;
  final int comments;
  final DateTime? createdAt;

  Post({
    required this.id,
    required this.imageUrl,
    required this.caption,
    required this.likes,
    required this.comments,
    this.createdAt,
  });
}
