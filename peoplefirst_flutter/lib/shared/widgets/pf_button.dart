import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum PfButtonVariant { primary, secondary, skyPrimary, skyGhost }

class PfButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final PfButtonVariant variant;
  final String? icon;
  final bool fullWidth;
  final bool compact;

  const PfButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = PfButtonVariant.primary,
    this.icon,
    this.fullWidth = false,
    this.compact = false,
  });

  @override
  State<PfButton> createState() => _PfButtonState();
}

class _PfButtonState extends State<PfButton> {
  bool _pressed = false;

  void _handleTapDown(TapDownDetails _) => setState(() => _pressed = true);
  void _handleTapUp(TapUpDetails _) {
    setState(() => _pressed = false);
    widget.onPressed();
  }
  void _handleTapCancel() => setState(() => _pressed = false);

  @override
  Widget build(BuildContext context) {
    final height = widget.compact ? 32.0 : 40.0;
    final fontSize = widget.compact ? 12.0 : 13.0;
    final hPad = widget.compact ? 12.0 : 16.0;

    Widget button;
    switch (widget.variant) {
      case PfButtonVariant.primary:
        button = ElevatedButton(
          onPressed: widget.onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.relianceBase,
            foregroundColor: Colors.white,
            minimumSize: Size(widget.fullWidth ? double.infinity : 0, height),
            padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(999),
            ),
            elevation: 0,
          ),
          child: _buildLabel(Colors.white, fontSize),
        );
        break;
      case PfButtonVariant.secondary:
        button = OutlinedButton(
          onPressed: widget.onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.contentHeavy,
            minimumSize: Size(widget.fullWidth ? double.infinity : 0, height),
            padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(999),
            ),
            side: const BorderSide(color: AppColors.strokeHeavy),
          ),
          child: _buildLabel(AppColors.contentHeavy, fontSize),
        );
        break;
      case PfButtonVariant.skyPrimary:
        button = ElevatedButton(
          onPressed: widget.onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.skyBase,
            foregroundColor: Colors.white,
            minimumSize: Size(widget.fullWidth ? double.infinity : 0, height),
            padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(999),
            ),
            elevation: 0,
          ),
          child: _buildLabel(Colors.white, fontSize),
        );
        break;
      case PfButtonVariant.skyGhost:
        button = OutlinedButton(
          onPressed: widget.onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.skyBase,
            minimumSize: Size(widget.fullWidth ? double.infinity : 0, height),
            padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 0),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(999),
            ),
            side: const BorderSide(color: AppColors.skyBorder),
          ),
          child: _buildLabel(AppColors.skyBase, fontSize),
        );
        break;
    }

    Widget scaled = AnimatedScale(
      scale: _pressed ? 0.96 : 1.0,
      duration: const Duration(milliseconds: 100),
      child: button,
    );

    Widget gestured = GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: scaled,
    );

    if (widget.fullWidth) {
      return SizedBox(width: double.infinity, child: gestured);
    }
    return gestured;
  }

  Widget _buildLabel(Color color, double fontSize) {
    if (widget.icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.auto_awesome, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            widget.label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      );
    }
    return Text(
      widget.label,
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        color: color,
      ),
    );
  }
}
