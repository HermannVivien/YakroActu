class Article {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final String category;
  final String publishedAt;
  final int views;
  final List<String> tags;
  final bool isFeatured;
  final bool isBookmarked;

  Article({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.publishedAt,
    required this.views,
    this.tags = const [],
    this.isFeatured = false,
    this.isBookmarked = false,
  });

  factory Article.fromJson(Map<String, dynamic> json) {
    return Article(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      imageUrl: json['imageUrl'],
      category: json['category'],
      publishedAt: json['publishedAt'],
      views: json['views'],
      tags: List<String>.from(json['tags'] ?? []),
      isFeatured: json['isFeatured'] ?? false,
      isBookmarked: json['isBookmarked'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'category': category,
      'publishedAt': publishedAt,
      'views': views,
      'tags': tags,
      'isFeatured': isFeatured,
      'isBookmarked': isBookmarked,
    };
  }
}
