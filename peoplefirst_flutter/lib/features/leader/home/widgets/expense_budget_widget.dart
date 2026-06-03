import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math' as math;
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/expense_category.dart';
import '../../../../data/models/decision.dart';
import '../../../../providers/leader/decisions_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/signal_badge.dart';
import '../../../../shared/widgets/animated_bar.dart';
import '../../../../core/utils/formatters.dart';

class ExpenseBudgetWidget extends ConsumerWidget {
  const ExpenseBudgetWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(expenseBudgetProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Expense By Category'),
        const SizedBox(height: 10),
        asyncData.when(
          loading: () => Container(
            height: 240,
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
                // Donut + summary
                Row(
                  children: [
                    SizedBox(
                      width: 90,
                      height: 90,
                      child: _AnimatedDonut(
                        categories: data.categories,
                        spendPercent: data.spendPercent,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Q2 spend ',
                                  style: AppTextStyles.caption,
                                ),
                                TextSpan(
                                  text: Formatters.rupeesLakhs(data.spendLakhs),
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.contentHeavy,
                                    fontFeatures: [FontFeature.tabularFigures()],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            'of ${Formatters.rupeesLakhs(data.budgetLakhs)}',
                            style: AppTextStyles.captionMinimal,
                          ),
                          const SizedBox(height: 8),
                          // Animated progress bar
                          Stack(
                            children: [
                              Container(
                                height: 6,
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceModerate,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                              AnimatedBar(
                                fraction: (data.spendLakhs / data.budgetLakhs).clamp(0.0, 1.0),
                                color: AppColors.warning,
                                height: 6,
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Pace ${data.pacePercent.toInt()}%',
                            style: AppTextStyles.captionMinimal,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // AI insight pill
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 7,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.skyLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.skyBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.auto_awesome,
                        size: 13,
                        color: AppColors.skyBase,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          data.aiInsight,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.skyInk,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 10),

                // Category rows
                ...data.categories.map(
                  (cat) => _CategoryRow(category: cat, maxSpend: 35),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AnimatedDonut extends StatefulWidget {
  final List<ExpenseCategory> categories;
  final double spendPercent;

  const _AnimatedDonut({
    required this.categories,
    required this.spendPercent,
  });

  @override
  State<_AnimatedDonut> createState() => _AnimatedDonutState();
}

class _AnimatedDonutState extends State<_AnimatedDonut>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
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
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => CustomPaint(
        painter: _DonutPainter(widget.categories, _anim.value),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${widget.spendPercent.toInt()}%',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.contentHeavy,
                ),
              ),
              const Text(
                'spent',
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.contentMinimal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  final ExpenseCategory category;
  final double maxSpend;

  const _CategoryRow({required this.category, required this.maxSpend});

  @override
  Widget build(BuildContext context) {
    final barFrac = (category.spendLakhs / maxSpend).clamp(0.0, 1.0);
    final isOver = category.variancePercent > 0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: signalDotColor(category.tone),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  category.name,
                  style: AppTextStyles.body.copyWith(fontSize: 13),
                ),
              ),
              if (isOver)
                Text(
                  '+${category.variancePercent.toInt()}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: signalDotColor(category.tone),
                  ),
                ),
              const SizedBox(width: 8),
              Text(
                Formatters.rupeesLakhs(category.spendLakhs),
                style: AppTextStyles.tabularNumbers.copyWith(fontSize: 13),
              ),
              const SizedBox(width: 8),
              SignalBadge(tone: category.tone, compact: true),
            ],
          ),
          const SizedBox(height: 5),
          Stack(
            children: [
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.surfaceModerate,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              AnimatedBar(
                fraction: barFrac,
                color: signalDotColor(category.tone),
                height: 4,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  final List<ExpenseCategory> categories;
  final double progress;

  _DonutPainter(this.categories, this.progress);

  static const List<Color> _colors = [
    AppColors.negative,
    AppColors.warning,
    AppColors.positive,
    AppColors.skyBase,
  ];

  @override
  void paint(Canvas canvas, Size size) {
    final total = categories.fold(0.0, (s, c) => s + c.spendLakhs);
    if (total == 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    const strokeWidth = 14.0;
    final rect = Rect.fromCircle(center: center, radius: radius - strokeWidth / 2);

    double startAngle = -math.pi / 2;

    for (int i = 0; i < categories.length; i++) {
      final sweep = (categories[i].spendLakhs / total) * 2 * math.pi * progress;
      final paint = Paint()
        ..color = _colors[i % _colors.length]
        ..strokeWidth = strokeWidth
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.butt;

      final gap = progress >= 1.0 ? 0.05 : 0.0;
      canvas.drawArc(rect, startAngle, sweep - gap, false, paint);
      startAngle += (categories[i].spendLakhs / total) * 2 * math.pi * progress;
    }
  }

  @override
  bool shouldRepaint(_DonutPainter old) =>
      old.categories != categories || old.progress != progress;
}
