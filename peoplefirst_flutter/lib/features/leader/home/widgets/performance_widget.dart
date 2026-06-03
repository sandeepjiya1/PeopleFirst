import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/performance_metric.dart';
import '../../../../data/models/decision.dart';
import '../../../../providers/leader/decisions_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/signal_badge.dart';
import '../../../../shared/widgets/trend_badge.dart';
import '../../../../shared/widgets/animated_count.dart';

class PerformanceWidget extends ConsumerWidget {
  final VoidCallback? onReports;

  const PerformanceWidget({super.key, this.onReports});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(performanceProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Performance',
          action: 'Reports',
          onAction: onReports,
        ),
        const SizedBox(height: 10),
        asyncData.when(
          loading: () => Container(
            height: 160,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (data) => PfCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${data.headline} · ${data.period}',
                  style: AppTextStyles.caption,
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    AnimatedCount(
                      target: data.mainValue,
                      suffix: '%',
                      style: AppTextStyles.bigNumber,
                    ),
                    const SizedBox(width: 8),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: TrendBadge(value: data.trendPoints),
                    ),
                    const Spacer(),
                    SizedBox(
                      width: 80,
                      height: 40,
                      child: _AnimatedSparkline(data: data.sparkline),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 12),
                ...data.subMetrics.map(
                  (m) => _SubMetricRow(metric: m),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AnimatedSparkline extends StatefulWidget {
  final List<double> data;

  const _AnimatedSparkline({required this.data});

  @override
  State<_AnimatedSparkline> createState() => _AnimatedSparklineState();
}

class _AnimatedSparklineState extends State<_AnimatedSparkline>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
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
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => CustomPaint(
        painter: _SparklinePainter(widget.data, _anim.value),
      ),
    );
  }
}

class _SubMetricRow extends StatelessWidget {
  final PerformanceSubMetric metric;

  const _SubMetricRow({required this.metric});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 3,
            height: 32,
            decoration: BoxDecoration(
              color: signalStripeColor(metric.tone),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(metric.label, style: AppTextStyles.caption),
                Text(
                  metric.value,
                  style: AppTextStyles.tabularNumbers.copyWith(fontSize: 16),
                ),
              ],
            ),
          ),
          SignalBadge(tone: metric.tone, compact: true),
        ],
      ),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  final List<double> data;
  final double progress;

  _SparklinePainter(this.data, this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    if (data.length < 2) return;

    final min = data.reduce((a, b) => a < b ? a : b);
    final max = data.reduce((a, b) => a > b ? a : b);
    final range = max - min == 0 ? 1.0 : max - min;

    final paint = Paint()
      ..color = AppColors.relianceBase
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          AppColors.relianceBase.withOpacity(0.2),
          AppColors.relianceBase.withOpacity(0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;

    final path = Path();
    final fillPath = Path();

    for (int i = 0; i < data.length; i++) {
      final x = (i / (data.length - 1)) * size.width;
      final y = size.height - ((data[i] - min) / range) * size.height;
      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, size.height);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }

    fillPath.lineTo(size.width, size.height);
    fillPath.close();

    // Animate via PathMetrics
    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      final extracted = metric.extractPath(0, metric.length * progress);
      canvas.drawPath(extracted, paint);
    }

    // Animate fill too
    if (progress >= 1.0) {
      canvas.drawPath(fillPath, fillPaint);
    }

    // Dot at last point (only when fully drawn)
    if (progress >= 0.98) {
      final lastX = size.width;
      final lastY = size.height - ((data.last - min) / range) * size.height;
      canvas.drawCircle(
        Offset(lastX, lastY),
        3,
        Paint()..color = AppColors.relianceBase,
      );
    }
  }

  @override
  bool shouldRepaint(_SparklinePainter old) =>
      old.data != data || old.progress != progress;
}
