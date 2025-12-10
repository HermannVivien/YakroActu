class Video {
  final int id;
  final String title;
  final String? description;
  final String thumbnailUrl;
  final String videoUrl;
  final String categoryName;
  final String type; // 'article', 'reportage', 'interview', 'livestream'
  final int viewCount;
  final int likeCount;
  final String duration; // Format "03:45"
  final DateTime publishedAt;
  final String? authorName;
  final bool isLive;

  Video({
    required this.id,
    required this.title,
    this.description,
    required this.thumbnailUrl,
    required this.videoUrl,
    required this.categoryName,
    required this.type,
    this.viewCount = 0,
    this.likeCount = 0,
    required this.duration,
    required this.publishedAt,
    this.authorName,
    this.isLive = false,
  });

  factory Video.fromJson(Map<String, dynamic> json) {
    return Video(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String,
      videoUrl: json['video_url'] as String,
      categoryName: json['category_name'] as String,
      type: json['type'] as String,
      viewCount: json['view_count'] as int? ?? 0,
      likeCount: json['like_count'] as int? ?? 0,
      duration: json['duration'] as String,
      publishedAt: DateTime.parse(json['published_at'] as String),
      authorName: json['author_name'] as String?,
      isLive: json['is_live'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'thumbnail_url': thumbnailUrl,
      'video_url': videoUrl,
      'category_name': categoryName,
      'type': type,
      'view_count': viewCount,
      'like_count': likeCount,
      'duration': duration,
      'published_at': publishedAt.toIso8601String(),
      'author_name': authorName,
      'is_live': isLive,
    };
  }
}
