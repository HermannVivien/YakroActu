class Interview {
  final int id;
  final String title;
  final String slug;
  final String summary;
  final String intervieweeName;
  final String? intervieweeTitle;
  final String? intervieweePhoto;
  final String? intervieweeBio;
  final List<InterviewQuestion> questions;
  final String? coverImage;
  final String? videoUrl;
  final String? audioUrl;
  final int? categoryId;
  final String? categoryName;
  final int? authorId;
  final String? authorName;
  final String status;
  final bool isFeatured;
  final int viewCount;
  final DateTime? publishedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String>? tags;

  Interview({
    required this.id,
    required this.title,
    required this.slug,
    required this.summary,
    required this.intervieweeName,
    this.intervieweeTitle,
    this.intervieweePhoto,
    this.intervieweeBio,
    required this.questions,
    this.coverImage,
    this.videoUrl,
    this.audioUrl,
    this.categoryId,
    this.categoryName,
    this.authorId,
    this.authorName,
    required this.status,
    this.isFeatured = false,
    this.viewCount = 0,
    this.publishedAt,
    required this.createdAt,
    required this.updatedAt,
    this.tags,
  });

  factory Interview.fromJson(Map<String, dynamic> json) {
    return Interview(
      id: json['id'],
      title: json['title'],
      slug: json['slug'],
      summary: json['summary'],
      intervieweeName: json['intervieweeName'],
      intervieweeTitle: json['intervieweeTitle'],
      intervieweePhoto: json['intervieweePhoto'],
      intervieweeBio: json['intervieweeBio'],
      questions: json['questions'] != null
          ? List<InterviewQuestion>.from(
              json['questions'].map((q) => InterviewQuestion.fromJson(q)))
          : [],
      coverImage: json['coverImage'],
      videoUrl: json['videoUrl'],
      audioUrl: json['audioUrl'],
      categoryId: json['categoryId'],
      categoryName: json['category']?['name'],
      authorId: json['authorId'],
      authorName: json['author']?['name'],
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
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'summary': summary,
      'intervieweeName': intervieweeName,
      'intervieweeTitle': intervieweeTitle,
      'intervieweePhoto': intervieweePhoto,
      'intervieweeBio': intervieweeBio,
      'questions': questions.map((q) => q.toJson()).toList(),
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

class InterviewQuestion {
  final String question;
  final String answer;

  InterviewQuestion({required this.question, required this.answer});

  factory InterviewQuestion.fromJson(Map<String, dynamic> json) {
    return InterviewQuestion(
      question: json['question'],
      answer: json['answer'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'question': question, 'answer': answer};
  }
}
