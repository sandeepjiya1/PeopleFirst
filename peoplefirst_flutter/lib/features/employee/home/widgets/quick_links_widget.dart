import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../providers/employee/tasks_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/widget_entrance.dart';

class QuickLinksWidget extends ConsumerWidget {
  const QuickLinksWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final linksAsync = ref.watch(quickLinksProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Quick Links'),
        const SizedBox(height: 10),
        linksAsync.when(
          loading: () => Container(
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (links) => PfCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                Row(
                  children: List.generate(3, (i) {
                    return Expanded(
                      child: WidgetEntrance(
                        index: i,
                        child: _LinkCellInner(
                          data: links[i],
                          borderLeft: i > 0,
                          borderBottom: true,
                        ),
                      ),
                    );
                  }),
                ),
                Row(
                  children: List.generate(3, (i) {
                    return Expanded(
                      child: WidgetEntrance(
                        index: i + 3,
                        child: _LinkCellInner(
                          data: links[i + 3],
                          borderLeft: i > 0,
                          borderBottom: false,
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _LinkCellInner extends StatelessWidget {
  final Map<String, dynamic> data;
  final bool borderLeft;
  final bool borderBottom;

  const _LinkCellInner({
    required this.data,
    required this.borderLeft,
    required this.borderBottom,
  });

  @override
  Widget build(BuildContext context) {
    final color = Color(data['color'] as int);
    final icon = _mapIcon(data['icon'] as String);

    return GestureDetector(
      onTap: () {},
      child: Container(
        decoration: BoxDecoration(
          border: Border(
            left: borderLeft
                ? const BorderSide(color: AppColors.strokeMinimal)
                : BorderSide.none,
            bottom: borderBottom
                ? const BorderSide(color: AppColors.strokeMinimal)
                : BorderSide.none,
          ),
        ),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(height: 6),
            Text(
              data['label'] as String,
              style: AppTextStyles.captionMinimal.copyWith(
                fontSize: 11,
                color: AppColors.contentHeavy,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  IconData _mapIcon(String name) {
    switch (name) {
      case 'currency_rupee':
        return Icons.currency_rupee_rounded;
      case 'card_giftcard':
        return Icons.card_giftcard_rounded;
      case 'person_search':
        return Icons.person_search_rounded;
      case 'badge':
        return Icons.badge_rounded;
      case 'support_agent':
        return Icons.support_agent_rounded;
      case 'check_circle':
        return Icons.check_circle_rounded;
      default:
        return Icons.link_rounded;
    }
  }
}
