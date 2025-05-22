import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pre_gram/services/auth_service.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _pageController = PageController();
  String _selectedAccount = '@your_username';
  int _currentBoardIndex = 0;
  final List<String> _existingPosts =
      List.generate(21, (index) => 'post_$index');
  List<String> _newPosts = [];
  final List<List<String>> _boards = [
    [], // 보드 1 (새 게시물)
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _showAddPhotoOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Color(0xFF2C2C2E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.grey[600],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            _buildOptionButton(
              icon: Icons.camera_alt,
              label: '사진 찍기',
              onTap: () => _pickImage(ImageSource.camera),
            ),
            _buildOptionButton(
              icon: Icons.photo_library,
              label: '사진첩',
              onTap: () => _pickImages(),
            ),
            _buildOptionButton(
              icon: Icons.folder,
              label: '파일',
              onTap: () => _pickImages(),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImages() async {
    Navigator.pop(context);
    final picker = ImagePicker();
    final pickedFiles = await picker.pickMultiImage();

    if (pickedFiles.isNotEmpty) {
      setState(() {
        // 선택한 순서 그대로 유지하되, 리스트는 역순으로 추가
        final newImages = pickedFiles.map((file) => file.path).toList();
        // 리스트를 반전시켜서 첫 번째 선택한 이미지가 맨 앞에 오도록 함
        newImages.reversed.forEach((path) {
          _newPosts.insert(0, path);
        });

        // 현재 활성화된 보드에 새 이미지 추가
        _boards[_currentBoardIndex] = _newPosts;
      });
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    Navigator.pop(context);
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source);

    if (pickedFile != null) {
      setState(() {
        // 새 이미지를 맨 앞에 추가
        _newPosts.insert(0, pickedFile.path);

        // 현재 활성화된 보드에 새 이미지 추가
        _boards[_currentBoardIndex] = _newPosts;
      });
    }
  }

  void _duplicateBoard() {
    setState(() {
      // 현재 보드의 내용을 복제
      final boardCopy = List<String>.from(_boards[_currentBoardIndex]);
      _boards.add(boardCopy);

      // 새 보드로 이동
      final newIndex = _boards.length - 1;
      _pageController.animateToPage(
        newIndex,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    });
  }

  void _deleteBoard() {
    if (_boards.length > 1) {
      setState(() {
        _boards.removeAt(_currentBoardIndex);

        // 현재 보드 인덱스 조정
        if (_currentBoardIndex >= _boards.length) {
          _currentBoardIndex = _boards.length - 1;
          _pageController.jumpToPage(_currentBoardIndex);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        automaticallyImplyLeading: false,
        title: Align(
          alignment: Alignment.centerLeft,
          child: DropdownButton<String>(
            value: _selectedAccount,
            dropdownColor: Colors.grey[900],
            style: const TextStyle(color: Colors.white),
            icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
            underline: Container(),
            items: [
              DropdownMenuItem(
                value: '@your_username',
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(_selectedAccount),
                  ],
                ),
              ),
            ],
            onChanged: (String? newValue) {
              // TODO: 계정 변경 로직 구현
            },
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () {
              Navigator.of(context).pushNamed('/settings');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Colors.grey[900],
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(_boards.length, (index) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: _buildBoardTab(index, 'Board ${index + 1}'),
                  );
                }),
              ),
            ),
          ),
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentBoardIndex = index;
                  _newPosts = _boards[index];
                });
              },
              itemCount: _boards.length,
              itemBuilder: (context, index) {
                return _buildBoard();
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        color: Colors.black,
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildActionButton(
              Icons.add_photo_alternate,
              '새 게시물',
              onTap: _showAddPhotoOptions,
            ),
            _buildActionButton(
              Icons.copy,
              '보드 복제',
              onTap: _duplicateBoard,
            ),
            _buildActionButton(
              Icons.delete,
              '보드 삭제',
              onTap: _deleteBoard,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBoard() {
    final allPosts = [..._newPosts, ..._existingPosts];

    return GridView.builder(
      padding: const EdgeInsets.all(1),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 1,
        mainAxisSpacing: 1,
        childAspectRatio: 0.75,
      ),
      itemCount: allPosts.length,
      itemBuilder: (context, index) {
        final isNewPost = index < _newPosts.length;
        final post = allPosts[index];

        if (isNewPost) {
          return DragTarget<int>(
            onAccept: (data) {
              setState(() {
                final item = _newPosts.removeAt(data);
                _newPosts.insert(index, item);

                // 보드에 변경사항 반영
                _boards[_currentBoardIndex] = _newPosts;
              });
            },
            builder: (context, candidateData, rejectedData) {
              return Draggable<int>(
                data: index,
                feedback: Container(
                  width: 100,
                  height: 133,
                  decoration: BoxDecoration(
                    color: Colors.grey[900],
                    image: DecorationImage(
                      image: FileImage(File(post)),
                      fit: BoxFit.cover,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.5),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                ),
                childWhenDragging: Container(
                  color: Colors.grey[800],
                  child: const Icon(Icons.image, color: Colors.grey),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[900],
                    image: DecorationImage(
                      image: FileImage(File(post)),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              );
            },
          );
        } else {
          // 기존 게시물은 드래그 불가능
          return Container(
            color: Colors.grey[900],
            child: const Icon(Icons.image, color: Colors.grey),
          );
        }
      },
    );
  }

  Widget _buildBoardTab(int index, String title) {
    final isSelected = _currentBoardIndex == index;
    return GestureDetector(
      onTap: () {
        _pageController.animateToPage(
          index,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildOptionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 24),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label,
      {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
