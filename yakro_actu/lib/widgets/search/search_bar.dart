import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../services/search/search_service.dart';

class SearchBar extends StatefulWidget {
  final Function(String)? onSearch;
  final bool showSuggestions;

  const SearchBar({
    super.key,
    this.onSearch,
    this.showSuggestions = true,
  });

  @override
  State<SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<SearchBar> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _showSuggestions = false;
  List<String> _suggestions = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    if (_focusNode.hasFocus && _controller.text.isNotEmpty) {
      _showSuggestions = true;
      _loadSuggestions();
    } else {
      _showSuggestions = false;
    }
    setState(() {});
  }

  Future<void> _loadSuggestions() async {
    setState(() => _isLoading = true);
    final searchService = Provider.of<SearchService>(context, listen: false);
    _suggestions = await searchService.getSearchSuggestions(_controller.text);
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).colorScheme.shadow.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            decoration: InputDecoration(
              hintText: 'Rechercher des articles, flash info...',
              hintStyle: GoogleFonts.poppins(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
              ),
              prefixIcon: Icon(
                Icons.search,
                color: Theme.of(context).colorScheme.primary,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            style: GoogleFonts.poppins(
              color: Theme.of(context).colorScheme.onSurface,
            ),
            onChanged: (value) {
              if (value.isEmpty) {
                _showSuggestions = false;
              } else {
                _showSuggestions = true;
                _loadSuggestions();
              }
              setState(() {});
            },
            onSubmitted: (value) {
              if (widget.onSearch != null) {
                widget.onSearch!(value);
              }
            },
          ),
        ),
        if (_showSuggestions && !_isLoading)
          Container(
            margin: const EdgeInsets.only(top: 8),
            child: ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _suggestions.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(
                    _suggestions[index],
                    style: GoogleFonts.poppins(),
                  ),
                  onTap: () {
                    _controller.text = _suggestions[index];
                    if (widget.onSearch != null) {
                      widget.onSearch!(_suggestions[index]);
                    }
                    _focusNode.unfocus();
                  },
                );
              },
            ),
          )
        else if (_isLoading)
          Container(
            margin: const EdgeInsets.only(top: 8),
            height: 100,
            child: ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 5,
              itemBuilder: (context, index) {
                return Shimmer.fromColors(
                  baseColor: Theme.of(context).colorScheme.surface.withOpacity(0.5),
                  highlightColor: Theme.of(context).colorScheme.surface.withOpacity(0.8),
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
