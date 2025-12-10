class ForumCategory {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final String? icon;
  final String? color;
  final int order;
  final bool isActive;
  final int topicCount;
  final int postCount;
  final ForumTopic? latestTopic;
  final DateTime createdAt;
  final DateTime updatedAt;

  ForumCategory({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.icon,
    this.color,
    this.order = 0,
    this.isActive = true,
    this.topicCount = 0,
    this.postCount = 0,
    this.latestTopic,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ForumCategory.fromJson(Map<String, dynamic> json) {
    return ForumCategory(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      icon: json['icon'],
      color: json['color'],
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
      topicCount: json['_count']?['topics'] ?? 0,
      postCount: json['_count']?['posts'] ?? 0,
      latestTopic: json['latestTopic'] != null
          ? ForumTopic.fromJson(json['latestTopic'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'icon': icon,
      'color': color,
      'order': order,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class ForumTopic {
  final int id;
  final String title;
  final String slug;
  final String content;
  final int categoryId;
  final String? categoryName;
  final int authorId;
  final Author? author;
  final bool isPinned;
  final bool isLocked;
  final int viewCount;
  final int postCount;
  final DateTime? lastActivity;
  final DateTime createdAt;
  final DateTime updatedAt;

  ForumTopic({
    required this.id,
    required this.title,
    required this.slug,
    required this.content,
    required this.categoryId,
    this.categoryName,
    required this.authorId,
    this.author,
    this.isPinned = false,
    this.isLocked = false,
    this.viewCount = 0,
    this.postCount = 0,
    this.lastActivity,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ForumTopic.fromJson(Map<String, dynamic> json) {
    return ForumTopic(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      content: json['content'] ?? '',
      categoryId: json['categoryId'],
      categoryName: json['category']?['name'],
      authorId: json['authorId'],
      author: json['author'] != null ? Author.fromJson(json['author']) : null,
      isPinned: json['isPinned'] ?? false,
      isLocked: json['isLocked'] ?? false,
      viewCount: json['viewCount'] ?? 0,
      postCount: json['_count']?['posts'] ?? 0,
      lastActivity: json['lastActivity'] != null
          ? DateTime.parse(json['lastActivity'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'content': content,
      'categoryId': categoryId,
      'authorId': authorId,
      'isPinned': isPinned,
      'isLocked': isLocked,
      'viewCount': viewCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class Author {
  final int id;
  final String name;
  final String? avatar;

  Author({required this.id, required this.name, this.avatar});

  factory Author.fromJson(Map<String, dynamic> json) {
    return Author(
      id: json['id'],
      name: json['name'],
      avatar: json['avatar'],
    );
  }
}

class ForumPost {
  final int id;
  final String content;
  final int topicId;
  final int? parentId;
  final int authorId;
  final Author? author;
  final int upvotes;
  final int downvotes;
  final bool isEdited;
  final DateTime? editedAt;
  final List<ForumPost>? replies;
  final DateTime createdAt;
  final DateTime updatedAt;

  ForumPost({
    required this.id,
    required this.content,
    required this.topicId,
    this.parentId,
    required this.authorId,
    this.author,
    this.upvotes = 0,
    this.downvotes = 0,
    this.isEdited = false,
    this.editedAt,
    this.replies,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ForumPost.fromJson(Map<String, dynamic> json) {
    return ForumPost(
      id: json['id'],
      content: json['content'],
      topicId: json['topicId'],
      parentId: json['parentId'],
      authorId: json['authorId'],
      author: json['author'] != null ? Author.fromJson(json['author']) : null,
      upvotes: json['upvotes'] ?? 0,
      downvotes: json['downvotes'] ?? 0,
      isEdited: json['isEdited'] ?? false,
      editedAt: json['editedAt'] != null
          ? DateTime.parse(json['editedAt'])
          : null,
      replies: json['replies'] != null
          ? List<ForumPost>.from(
              json['replies'].map((r) => ForumPost.fromJson(r)))
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'topicId': topicId,
      'parentId': parentId,
      'upvotes': upvotes,
      'downvotes': downvotes,
      'isEdited': isEdited,
      'editedAt': editedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  int get totalVotes => upvotes - downvotes;
}
