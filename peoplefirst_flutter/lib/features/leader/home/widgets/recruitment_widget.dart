import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/recruitment_role.dart';
import '../../../../data/models/decision.dart';
import '../../../../providers/leader/decisions_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/signal_badge.dart';
import '../../../../shared/widgets/trend_badge.dart';
import '../../../../shared/widgets/animated_count.dart';
import '../../../../shared/widgets/animated_bar.dart';

class RecruitmentWidget extends ConsumerWidget {
  const RecruitmentWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(recruitmentProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Recruitment'),
        const SizedBox(height: 10),
        asyncData.when(
          loading: () => Container(
            height: 180,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (summary) => PfCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // CVs summary
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            AnimatedCount(
                              target: summary.totalCvs.toDouble(),
                              style: AppTextStyles.bigNumber.copyWith(
                                fontSize: 28,
                              ),
                            ),
                            Text(
                              ' / ${summary.targetCvs}',
                              style: AppTextStyles.caption,
                            ),
                          ],
                        ),
                        Text('CVs in pipeline', style: AppTextStyles.caption),
                        const SizedBox(height: 6),
                        SizedBox(
                          width: 120,
                          child: Stack(
                            children: [
                              Container(
                                height: 4,
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceModerate,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                              AnimatedBar(
                                fraction: (summary.totalCvs / (summary.targetCvs > 0 ? summary.targetCvs : 1)).clamp(0.0, 1.0),
                                color: AppColors.positive,
                                height: 4,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    TrendBadge(value: summary.trendPercent, suffix: '%'),
                    const Spacer(),
                    if (summary.urgentCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.negativeLight,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${summary.urgentCount} urgent',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.negative,
                          ),
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: 14),
                const Divider(height: 1),
                const SizedBox(height: 10),

                ...summary.roles.map((role) => _RoleRow(role: role)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _RoleRow extends StatelessWidget {
  final RecruitmentRole role;

  const _RoleRow({required this.role});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  role.title,
                  style: AppTextStyles.body.copyWith(fontSize: 13),
                ),
              ),
              SignalBadge(tone: role.tone, compact: true),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(
                '${role.openPositions} open · ${role.applicants} applicants',
                style: AppTextStyles.captionMinimal,
              ),
            ],
          ),
          if (role.aiTip != null) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.skyLight,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.auto_awesome,
                    size: 11,
                    color: AppColors.skyBase,
                  ),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      role.aiTip!,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.skyInk,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
