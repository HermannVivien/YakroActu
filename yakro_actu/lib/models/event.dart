class Event {
  final int id;
  final String title;
  final String description;
  final String location;
  final DateTime date;
  final String time;
  final String? imageUrl;
  final String category;
  final String organizer;
  final int capacity;
  final String price;

  Event({
    required this.id,
    required this.title,
    required this.description,
    required this.location,
    required this.date,
    required this.time,
    this.imageUrl,
    required this.category,
    required this.organizer,
    required this.capacity,
    required this.price,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      date: DateTime.parse(json['date']),
      time: json['time'] ?? '',
      imageUrl: json['imageUrl'],
      category: json['category'] ?? '',
      organizer: json['organizer'] ?? '',
      capacity: json['capacity'] ?? 0,
      price: json['price'] ?? 'Gratuit',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'location': location,
      'date': date.toIso8601String(),
      'time': time,
      'imageUrl': imageUrl,
      'category': category,
      'organizer': organizer,
      'capacity': capacity,
      'price': price,
    };
  }
}
