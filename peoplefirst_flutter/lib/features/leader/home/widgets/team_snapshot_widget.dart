import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../providers/leader/decisions_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/animated_count.dart';
import '../../../../shared/widgets/animated_bar.dart';

class TeamSnapshotWidget extends ConsumerWidget {
  const TeamSnapshotWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final snapshotAsync = ref.watch(teamSnapshotProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Team Snapshot',
          action: 'View team',
          onAction: () => context.go('/leader/team'),
        ),
        const SizedBox(height: 10),
        snapshotAsync.when(
          loading: () => Container(
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (snapshot) {
            final total = (snapshot['total'] ?? 0) as int;
            final present = (snapshot['present'] ?? 0) as int;
            final onLeave = (snapshot['onLeave'] ?? 0) as int;
            final notIn = (snapshot['notIn'] ?? 0) as int;
            final woPh = (snapshot['woPh'] ?? 0) as int;
            final presentFrac = total > 0 ? present / total : 0.0;

            return PfCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AnimatedCount(
                              target: total.toDouble(),
                              style: AppTextStyles.bigNumber,
                            ),
                            Text('Total org', style: AppTextStyles.caption),
                          ],
                        ),
                      ),
                      // Presence bar
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '$present in office',
                              style: AppTextStyles.caption,
                            ),
                            const SizedBox(height: 4),
                            Stack(
                              children: [
                                Container(
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceModerate,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                ),
                                AnimatedBar(
                                  fraction: presentFrac,
                                  color: AppColors.positive,
                                  height: 8,
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${(presentFrac * 100).toInt()}% present',
                              style: AppTextStyles.captionMinimal,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(height: 1),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _SnapCell(
                        label: 'Present',
                        value: present.toDouble(),
                        color: AppColors.positive,
                      ),
                      _divider(),
                      _SnapCell(
                        label: 'On leave',
                        value: onLeave.toDouble(),
                        color: AppColors.warning,
                      ),
                      _divider(),
                      _SnapCell(
                        label: 'Not in',
                        value: notIn.toDouble(),
                        color: AppColors.negative,
                      ),
                      _divider(),
                      _SnapCell(
                        label: 'WO/PH',
                        value: woPh.toDouble(),
                        color: AppColors.contentMinimal,
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _divider() => Container(
        width: 1,
        height: 36,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        color: AppColors.strokeMinimal,
      );
}

class _SnapCell extends StatelessWidget {
  final String label;
  final double value;
  final Color color;

  const _SnapCell({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          AnimatedCount(
            target: value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
          Text(
            label,
            style: AppTextStyles.captionMinimal.copyWith(fontSize: 10),
          ),
        ],
      ),
    );
  }
}
