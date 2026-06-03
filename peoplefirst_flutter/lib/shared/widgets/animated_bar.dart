import 'package:flutter/material.dart';

class AnimatedBar extends StatefulWidget {
  final double fraction; // 0.0 to 1.0
  final Color color;
  final double height;
  final BorderRadius? borderRadius;
  final Duration duration;

  const AnimatedBar({
    super.key,
    required this.fraction,
    required this.color,
    this.height = 8,
    this.borderRadius,
    this.duration = const Duration(milliseconds: 900),
  });

  @override
  State<AnimatedBar> createState() => _AnimatedBarState();
}

class _AnimatedBarState extends State<AnimatedBar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: widget.duration);
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final br = widget.borderRadius ?? BorderRadius.circular(999);
    return LayoutBuilder(
      builder: (_, constraints) {
        return AnimatedBuilder(
          animation: _anim,
          builder: (_, __) {
            return Container(
              height: widget.height,
              width: constraints.maxWidth * widget.fraction * _anim.value,
              decoration: BoxDecoration(color: widget.color, borderRadius: br),
            );
          },
        );
      },
    );
  }
}
