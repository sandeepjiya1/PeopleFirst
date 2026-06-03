import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/attendance.dart';
import '../../../../providers/employee/attendance_provider.dart';
import '../../../../providers/toast_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/widget_entrance.dart';
import '../../../../core/utils/formatters.dart';

class AttendanceWidget extends ConsumerWidget {
  final VoidCallback? onHistory;

  const AttendanceWidget({super.key, this.onHistory});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(attendanceProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Attendance',
          action: 'History',
          onAction: onHistory,
        ),
        const SizedBox(height: 10),
        attendanceAsync.when(
          loading: () => Container(
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (record) => PfCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: WidgetEntrance(
                    index: 0,
                    child: _AttendanceCell(
                      label: 'Mark In',
                      value: record.markedIn != null
                          ? Formatters.timeOfDay(record.markedIn!)
                          : '--',
                      isActive: record.status == AttendanceStatus.out,
                      onTap: record.status == AttendanceStatus.out
                          ? () {
                              ref
                                  .read(attendanceProvider.notifier)
                                  .markIn();
                              ref
                                  .read(toastProvider.notifier)
                                  .show('Marked in at ${Formatters.timeOfDay(DateTime.now())}');
                            }
                          : null,
                    ),
                  ),
                ),
                Container(
                  width: 1,
                  height: 48,
                  color: AppColors.strokeMinimal,
                ),
                Expanded(
                  child: WidgetEntrance(
                    index: 1,
                    child: _AttendanceCell(
                      label: 'Mark Out',
                      value: record.markedOut != null
                          ? Formatters.timeOfDay(record.markedOut!)
                          : record.status == AttendanceStatus.in_
                              ? 'Tap to mark'
                              : '--',
                      isActive: record.status == AttendanceStatus.in_,
                      onTap: record.status == AttendanceStatus.in_
                          ? () {
                              ref
                                  .read(attendanceProvider.notifier)
                                  .markOut();
                              ref
                                  .read(toastProvider.notifier)
                                  .show('Marked out at ${Formatters.timeOfDay(DateTime.now())}');
                            }
                          : null,
                    ),
                  ),
                ),
                Container(
                  width: 1,
                  height: 48,
                  color: AppColors.strokeMinimal,
                ),
                Expanded(
                  child: WidgetEntrance(
                    index: 2,
                    child: _DurationCell(record: record),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AttendanceCell extends StatelessWidget {
  final String label;
  final String value;
  final bool isActive;
  final VoidCallback? onTap;

  const _AttendanceCell({
    required this.label,
    required this.value,
    required this.isActive,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: isActive
            ? BoxDecoration(
                color: AppColors.relianceBase.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
              )
            : null,
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        child: Column(
          children: [
            Text(label, style: AppTextStyles.captionMinimal),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: isActive
                    ? AppColors.relianceBase
                    : AppColors.contentHeavy,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _DurationCell extends StatelessWidget {
  final AttendanceRecord record;

  const _DurationCell({required this.record});

  @override
  Widget build(BuildContext context) {
    final dur = record.duration;
    final label = dur == Duration.zero
        ? '--'
        : Formatters.duration(dur);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      child: Column(
        children: [
          Text('Duration', style: AppTextStyles.captionMinimal),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.contentHeavy,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
            textAlign: TextAlign.center,
          ),
          if (record.status == AttendanceStatus.done)
            const Icon(
              Icons.check_circle_rounded,
              color: AppColors.positive,
              size: 14,
            ),
        ],
      ),
    );
  }
}
