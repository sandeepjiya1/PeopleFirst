import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/task_item.dart';
import '../../../../providers/employee/tasks_provider.dart';
import '../../../../providers/toast_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/widget_entrance.dart';

class TasksWidget extends ConsumerWidget {
  const TasksWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsync = ref.watch(tasksProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'My Tasks',
          action: 'View all',
          onAction: () => context.go('/employee/tasks'),
        ),
        const SizedBox(height: 10),
        tasksAsync.when(
          loading: () => Container(
            height: 140,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (tasks) {
            final todayTasks = tasks
                .where((t) => t.due == TaskDue.today)
                .take(4)
                .toList();

            return PfCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  ...List.generate(todayTasks.length, (i) {
                    final task = todayTasks[i];
                    return Column(
                      children: [
                        WidgetEntrance(
                          index: i,
                          child: _TaskRow(task: task),
                        ),
                        if (i < todayTasks.length - 1)
                          const Divider(height: 1, indent: 48, endIndent: 16),
                      ],
                    );
                  }),
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    child: GestureDetector(
                      onTap: () {
                        ref.read(toastProvider.notifier).show(
                              'New task added',
                            );
                      },
                      child: Row(
                        children: [
                          const Icon(
                            Icons.add_circle_outline_rounded,
                            size: 18,
                            color: AppColors.relianceBase,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'New task',
                            style: AppTextStyles.link.copyWith(fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _TaskRow extends ConsumerWidget {
  final TaskItem task;

  const _TaskRow({required this.task});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              ref.read(tasksProvider.notifier).toggleTask(task.id);
            },
            child: Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: task.completed
                      ? AppColors.positive
                      : AppColors.strokeHeavy,
                  width: 2,
                ),
                color: task.completed ? AppColors.positive : Colors.transparent,
              ),
              alignment: Alignment.center,
              child: task.completed
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : null,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: task.completed
                        ? AppColors.contentMinimal
                        : AppColors.contentHeavy,
                    decoration:
                        task.completed ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    _PriorityChip(priority: task.priority),
                    const SizedBox(width: 6),
                    _SourceBadge(source: task.source),
                    const SizedBox(width: 6),
                    Text(
                      task.dueLabel,
                      style: AppTextStyles.captionMinimal.copyWith(
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PriorityChip extends StatelessWidget {
  final TaskPriority priority;

  const _PriorityChip({required this.priority});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    Color bg;

    switch (priority) {
      case TaskPriority.high:
        color = AppColors.negative;
        bg = AppColors.negativeLight;
        label = 'High';
        break;
      case TaskPriority.medium:
        color = AppColors.warning;
        bg = AppColors.warningLight;
        label = 'Med';
        break;
      case TaskPriority.low:
        color = AppColors.positive;
        bg = AppColors.positiveLight;
        label = 'Low';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _SourceBadge extends StatelessWidget {
  final TaskSource source;

  const _SourceBadge({required this.source});

  @override
  Widget build(BuildContext context) {
    final isAzure = source == TaskSource.azure;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: isAzure ? AppColors.skyLight : AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        isAzure ? 'Azure' : 'Self',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: isAzure ? AppColors.skyInk : AppColors.contentModerate,
        ),
      ),
    );
  }
}
