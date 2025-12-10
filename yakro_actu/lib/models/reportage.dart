class Reportage {
  final int id;
  final String title;
  final String slug;
  final String summary;
  final String content;
  final String? coverImage;
  final String? videoUrl;
  final String? audioUrl;
  final int? categoryId;
  final String? categoryName;
  final int? authorId;
  final String? authorName;
  final String? authorAvatar;
  final String status;
  final bool isFeatured;
  final int viewCount;
  final DateTime? publishedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String>? tags;
  final List<MediaItem>? gallery;

  Reportage({
    required this.id,
    required this.title,
    required this.slug,
    required this.summary,
    required this.content,
    this.coverImage,
    this.videoUrl,
    this.audioUrl,
    this.categoryId,
    this.categoryName,
    this.authorId,
    this.authorName,
    this.authorAvatar,
    required this.status,
    this.isFeatured = false,
    this.viewCount = 0,
    this.publishedAt,
    required this.createdAt,
    required this.updatedAt,
    this.tags,
    this.gallery,
  });

  factory Reportage.fromJson(Map<String, dynamic> json) {
    return Reportage(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      summary: json['summary'],
      content: json['content'],
      coverImage: json['coverImage'],
      videoUrl: json['videoUrl'],
      audioUrl: json['audioUrl'],
      categoryId: json['categoryId'],
      categoryName: json['category']?['name'],
      authorId: json['authorId'],
      authorName: json['author']?['name'],
      authorAvatar: json['author']?['avatar'],
      status: json['status'],
      isFeatured: json['isFeatured'] ?? false,
      viewCount: json['viewCount'] ?? 0,
      publishedAt: json['publishedAt'] != null
          ? DateTime.parse(json['publishedAt'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      tags: json['tags'] != null
          ? List<String>.from(json['tags'].map((t) => t['name']))
          : null,
      gallery: json['gallery'] != null
          ? List<MediaItem>.from(
              json['gallery'].map((m) => MediaItem.fromJson(m)))
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'summary': summary,
      'content': content,
      'coverImage': coverImage,
      'videoUrl': videoUrl,
      'audioUrl': audioUrl,
      'categoryId': categoryId,
      'status': status,
      'isFeatured': isFeatured,
      'viewCount': viewCount,
      'publishedAt': publishedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class MediaItem {
  final String url;
  final String type;
  final String? caption;

  MediaItem({required this.url, required this.type, this.caption});

  factory MediaItem.fromJson(Map<String, dynamic> json) {
    return MediaItem(
      url: json['url'],
      type: json['type'],
      caption: json['caption'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'url': url, 'type': type, 'caption': caption};
  }
}
