import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/decision.dart';
import '../../../../providers/leader/decisions_provider.dart';
import '../../../../providers/toast_provider.dart';
import '../../../../shared/widgets/pf_button.dart';
import '../../../../shared/widgets/signal_badge.dart';

class AiBriefingWidget extends ConsumerStatefulWidget {
  const AiBriefingWidget({super.key});

  @override
  ConsumerState<AiBriefingWidget> createState() => _AiBriefingWidgetState();
}

class _AiBriefingWidgetState extends ConsumerState<AiBriefingWidget>
    with TickerProviderStateMixin {
  bool _autoExpanded = false;

  late final AnimationController _entranceCtrl;
  late final Animation<double> _entranceFade;
  late final Animation<double> _entranceScale;

  late final AnimationController _pulseCtrl;
  late final Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();

    _entranceCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _entranceFade = CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOut);
    _entranceScale = Tween<double>(begin: 0.96, end: 1.0).animate(
      CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutCubic),
    );

    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat(reverse: true);
    _pulseAnim = CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut);

    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _entranceCtrl.forward();
    });
  }

  @override
  void dispose() {
    _entranceCtrl.dispose();
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final decisionsAsync = ref.watch(decisionsProvider);

    return decisionsAsync.when(
      loading: () => const _BriefingShimmer(),
      error: (e, _) => const SizedBox.shrink(),
      data: (decisions) {
        final unresolved = decisions.where((d) => !d.resolved).toList();
        final allResolved = unresolved.isEmpty;

        return FadeTransition(
          opacity: _entranceFade,
          child: ScaleTransition(
            scale: _entranceScale,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceMinimal,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x0A0F172A),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              clipBehavior: Clip.hardEdge,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sky header band
                  Container(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF1A5C8A), Color(0xFF2F8FD4)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                    ),
                    child: Row(
                      children: [
                        AnimatedBuilder(
                          animation: _pulseAnim,
                          builder: (_, child) {
                            return Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.white.withOpacity(
                                      0.1 + _pulseAnim.value * 0.35,
                                    ),
                                    blurRadius: 8 + _pulseAnim.value * 8,
                                    spreadRadius: _pulseAnim.value * 2,
                                  ),
                                ],
                              ),
                              child: child,
                            );
                          },
                          child: const Icon(
                            Icons.auto_awesome,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'PeopleFirst AI',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                'Overnight brief · updated 8:47am',
                                style: TextStyle(
                                  color: Color(0xCCFFFFFF),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!allResolved)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              '${unresolved.length} critical',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (allResolved)
                          _ClearedState()
                        else ...[
                          Text(
                            '${unresolved.length} critical items for today',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.skyInk,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...unresolved.map((d) => _DecisionCard(
                                decision: d,
                                onPrimary: () {
                                  ref
                                      .read(decisionsProvider.notifier)
                                      .resolve(d.id);
                                  ref.read(toastProvider.notifier).show(
                                        '${d.primaryCta} action taken',
                                      );
                                },
                                onSecondary: () {
                                  ref
                                      .read(decisionsProvider.notifier)
                                      .resolve(d.id);
                                  ref.read(toastProvider.notifier).show(
                                        'Opening ${d.secondaryCta}...',
                                      );
                                },
                              )),
                        ],

                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 8),

                        // Auto-approved section
                        GestureDetector(
                          onTap: () {
                            setState(() => _autoExpanded = !_autoExpanded);
                          },
                          behavior: HitTestBehavior.opaque,
                          child: Row(
                            children: [
                              const Icon(
                                Icons.check_circle_rounded,
                                color: AppColors.positive,
                                size: 16,
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                'Auto approved requests · 29',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.contentModerate,
                                ),
                              ),
                              const Spacer(),
                              Icon(
                                _autoExpanded
                                    ? Icons.expand_less_rounded
                                    : Icons.expand_more_rounded,
                                size: 18,
                                color: AppColors.contentMinimal,
                              ),
                            ],
                          ),
                        ),

                        if (_autoExpanded) ...[
                          const SizedBox(height: 10),
                          _AutoApproveRow(label: 'Approvals', count: 14),
                          _AutoApproveRow(label: 'Expenses', count: 9),
                          _AutoApproveRow(label: 'Calendar', count: 6),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _DecisionCard extends StatelessWidget {
  final Decision decision;
  final VoidCallback onPrimary;
  final VoidCallback onSecondary;

  const _DecisionCard({
    required this.decision,
    required this.onPrimary,
    required this.onSecondary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.strokeMinimal),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 4),
                decoration: BoxDecoration(
                  color: signalDotColor(decision.tone),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  decision.title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.contentHeavy,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(left: 16),
            child: Text(
              decision.detail,
              style: AppTextStyles.caption,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              PfButton(
                label: decision.primaryCta,
                onPressed: onPrimary,
                variant: PfButtonVariant.primary,
                compact: true,
              ),
              const SizedBox(width: 8),
              PfButton(
                label: decision.secondaryCta,
                onPressed: onSecondary,
                variant: PfButtonVariant.secondary,
                compact: true,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ClearedState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.positiveLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle_rounded,
            color: AppColors.positive,
            size: 22,
          ),
          const SizedBox(width: 10),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'You\'re clear for the review.',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.positive,
                  ),
                ),
                Text(
                  'All critical decisions resolved.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.positive,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AutoApproveRow extends StatelessWidget {
  final String label;
  final int count;

  const _AutoApproveRow({required this.label, required this.count});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          const SizedBox(width: 22),
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.caption,
            ),
          ),
          Text(
            '$count',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.contentHeavy,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}

class _BriefingShimmer extends StatelessWidget {
  const _BriefingShimmer();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        color: AppColors.surfaceModerate,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}
