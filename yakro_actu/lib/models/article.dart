class Article {
  final int id;
  final String title;
  final String slug;
  final String description;
  final String content;
  final String coverImage;
  final int categoryId;
  final String? categoryName;
  final String? categoryColor;
  final int? subcategoryId;
  final String? subcategoryName;
  final int authorId;
  final String author;
  final String? authorAvatar;
  final bool isFeatured;
  final bool isBreaking;
  final bool isPublished;
  final int viewCount;
  final int commentCount;
  final List<String> tags;
  final DateTime publishedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Article({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    required this.content,
    required this.coverImage,
    required this.categoryId,
    this.categoryName,
    this.categoryColor,
    this.subcategoryId,
    this.subcategoryName,
    required this.authorId,
    required this.author,
    this.authorAvatar,
    this.isFeatured = false,
    this.isBreaking = false,
    this.isPublished = true,
    this.viewCount = 0,
    this.commentCount = 0,
    this.tags = const [],
    required this.publishedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      description: json['description'] ?? '',
      content: json['content'] ?? '',
      coverImage: json['coverImage'] ?? '',
      categoryId: json['categoryId'],
      categoryName: json['category']?['name'],
      categoryColor: json['category']?['color'],
      subcategoryId: json['subcategoryId'],
      subcategoryName: json['subcategory']?['name'],
      authorId: json['authorId'],
      author: json['author']?['name'] ?? 'Inconnu',
      authorAvatar: json['author']?['avatar'],
      isFeatured: json['isFeatured'] ?? false,
      isBreaking: json['isBreaking'] ?? false,
      isPublished: json['isPublished'] ?? true,
      viewCount: json['viewCount'] ?? 0,
      commentCount: json['_count']?['comments'] ?? 0,
      tags: json['tags'] != null 
          ? List<String>.from(json['tags'].map((t) => t is String ? t : t['name'])) 
          : [],
      publishedAt: json['publishedAt'] != null
          ? DateTime.parse(json['publishedAt'])
          : DateTime.now(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'description': description,
      'content': content,
      'coverImage': coverImage,
      'categoryId': categoryId,
      'subcategoryId': subcategoryId,
      'authorId': authorId,
      'isFeatured': isFeatured,
      'isBreaking': isBreaking,
      'isPublished': isPublished,
      'viewCount': viewCount,
      'tags': tags,
      'publishedAt': publishedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
