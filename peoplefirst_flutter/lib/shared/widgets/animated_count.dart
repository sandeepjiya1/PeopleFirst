import 'package:flutter/material.dart';

class AnimatedCount extends StatefulWidget {
  final double target;
  final String prefix;
  final String suffix;
  final int decimals;
  final Duration duration;
  final TextStyle? style;

  const AnimatedCount({
    super.key,
    required this.target,
    this.prefix = '',
    this.suffix = '',
    this.decimals = 0,
    this.duration = const Duration(milliseconds: 1200),
    this.style,
  });

  @override
  State<AnimatedCount> createState() => _AnimatedCountState();
}

class _AnimatedCountState extends State<AnimatedCount>
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

  String _format(double v) {
    if (widget.decimals == 0) return v.round().toString();
    return v.toStringAsFixed(widget.decimals);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) {
        final val = _anim.value * widget.target;
        return Text(
          '${widget.prefix}${_format(val)}${widget.suffix}',
          style: widget.style,
        );
      },
    );
  }
}
