class SportConfig {
  final int id;
  final String name;
  final String apiProvider;
  final String apiKey;
  final String? apiUrl;
  final Map<String, dynamic>? settings;
  final bool isActive;
  final DateTime? lastSyncAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  SportConfig({
    required this.id,
    required this.name,
    required this.apiProvider,
    required this.apiKey,
    this.apiUrl,
    this.settings,
    this.isActive = false,
    this.lastSyncAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SportConfig.fromJson(Map<String, dynamic> json) {
    return SportConfig(
      id: json['id'],
      name: json['name'],
      apiProvider: json['apiProvider'],
      apiKey: json['apiKey'],
      apiUrl: json['apiUrl'],
      settings: json['settings'],
      isActive: json['isActive'] ?? false,
      lastSyncAt: json['lastSyncAt'] != null
          ? DateTime.parse(json['lastSyncAt'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'apiProvider': apiProvider,
      'apiKey': apiKey,
      'apiUrl': apiUrl,
      'settings': settings,
      'isActive': isActive,
      'lastSyncAt': lastSyncAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class SportMatch {
  final int id;
  final String homeTeam;
  final String awayTeam;
  final String? homeTeamLogo;
  final String? awayTeamLogo;
  final int? homeScore;
  final int? awayScore;
  final String status;
  final String? league;
  final String? leagueLogo;
  final DateTime matchDate;
  final String? venue;
  final Map<String, dynamic>? details;

  SportMatch({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    this.homeTeamLogo,
    this.awayTeamLogo,
    this.homeScore,
    this.awayScore,
    required this.status,
    this.league,
    this.leagueLogo,
    required this.matchDate,
    this.venue,
    this.details,
  });

  factory SportMatch.fromJson(Map<String, dynamic> json) {
    return SportMatch(
      id: json['id'] ?? json['fixture']?['id'],
      homeTeam: json['homeTeam'] ?? json['teams']?['home']?['name'],
      awayTeam: json['awayTeam'] ?? json['teams']?['away']?['name'],
      homeTeamLogo: json['homeTeamLogo'] ?? json['teams']?['home']?['logo'],
      awayTeamLogo: json['awayTeamLogo'] ?? json['teams']?['away']?['logo'],
      homeScore: json['homeScore'] ?? json['goals']?['home'],
      awayScore: json['awayScore'] ?? json['goals']?['away'],
      status: json['status'] ?? json['fixture']?['status']?['short'] ?? 'NS',
      league: json['league'] ?? json['league']?['name'],
      leagueLogo: json['leagueLogo'] ?? json['league']?['logo'],
      matchDate: json['matchDate'] != null
          ? DateTime.parse(json['matchDate'])
          : DateTime.parse(json['fixture']?['date']),
      venue: json['venue'] ?? json['fixture']?['venue']?['name'],
      details: json['details'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'homeTeam': homeTeam,
      'awayTeam': awayTeam,
      'homeTeamLogo': homeTeamLogo,
      'awayTeamLogo': awayTeamLogo,
      'homeScore': homeScore,
      'awayScore': awayScore,
      'status': status,
      'league': league,
      'leagueLogo': leagueLogo,
      'matchDate': matchDate.toIso8601String(),
      'venue': venue,
      'details': details,
    };
  }

  bool get isLive => status == 'LIVE' || status == '1H' || status == '2H';
  bool get isFinished => status == 'FT' || status == 'AET' || status == 'PEN';
  bool get isScheduled => status == 'NS' || status == 'TBD';
}
