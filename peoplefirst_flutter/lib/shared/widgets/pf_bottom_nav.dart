import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/persona_provider.dart';
import '../../providers/leader/approvals_provider.dart';
import '../../providers/employee/tasks_provider.dart';
import '../../data/models/persona.dart';

class PfBottomNav extends ConsumerWidget {
  const PfBottomNav({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLeader = ref.watch(isLeaderProvider);

    if (isLeader) {
      return _LeaderBottomNav();
    } else {
      return _EmployeeBottomNav();
    }
  }
}

class _LeaderBottomNav extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).uri.toString();
    final pendingCount = ref.watch(approvalsListProvider.notifier).pendingCount;

    int currentIndex = 0;
    if (location.startsWith('/leader/team')) currentIndex = 1;
    if (location.startsWith('/leader/approvals')) currentIndex = 2;
    if (location.startsWith('/leader/reports')) currentIndex = 3;
    if (location.startsWith('/more')) currentIndex = 4;

    return _NavBar(
      currentIndex: currentIndex,
      items: [
        const _NavItem(icon: Icons.home_rounded, label: 'Home'),
        const _NavItem(icon: Icons.people_rounded, label: 'Team'),
        _NavItem(
          icon: Icons.check_circle_outline_rounded,
          label: 'Approvals',
          badge: pendingCount > 0 ? pendingCount : null,
        ),
        const _NavItem(icon: Icons.bar_chart_rounded, label: 'Reports'),
        const _NavItem(icon: Icons.more_horiz_rounded, label: 'More'),
      ],
      onTap: (i) {
        switch (i) {
          case 0:
            context.go('/');
            break;
          case 1:
            context.go('/leader/team');
            break;
          case 2:
            context.go('/leader/approvals');
            break;
          case 3:
            context.go('/leader/reports');
            break;
          case 4:
            context.go('/more');
            break;
        }
      },
    );
  }
}

class _EmployeeBottomNav extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).uri.toString();
    final openCount = ref.watch(tasksProvider.notifier).openTodayCount;

    int currentIndex = 0;
    if (location.startsWith('/employee/tasks')) currentIndex = 1;
    if (location.startsWith('/employee/attendance')) currentIndex = 2;
    if (location.startsWith('/employee/pay')) currentIndex = 3;
    if (location.startsWith('/more')) currentIndex = 4;

    return _NavBar(
      currentIndex: currentIndex,
      items: [
        const _NavItem(icon: Icons.home_rounded, label: 'Home'),
        _NavItem(
          icon: Icons.task_alt_rounded,
          label: 'Tasks',
          badge: openCount > 0 ? openCount : null,
        ),
        const _NavItem(icon: Icons.access_time_rounded, label: 'Attendance'),
        const _NavItem(icon: Icons.account_balance_wallet_rounded, label: 'Pay'),
        const _NavItem(icon: Icons.more_horiz_rounded, label: 'More'),
      ],
      onTap: (i) {
        switch (i) {
          case 0:
            context.go('/');
            break;
          case 1:
            context.go('/employee/tasks');
            break;
          case 2:
            context.go('/employee/attendance');
            break;
          case 3:
            context.go('/employee/pay');
            break;
          case 4:
            context.go('/more');
            break;
        }
      },
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final int? badge;

  const _NavItem({required this.icon, required this.label, this.badge});
}

class _NavBar extends StatelessWidget {
  final int currentIndex;
  final List<_NavItem> items;
  final ValueChanged<int> onTap;

  const _NavBar({
    required this.currentIndex,
    required this.items,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surfaceMinimal,
        border: Border(top: BorderSide(color: AppColors.strokeMinimal)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: List.generate(items.length, (i) {
              final item = items[i];
              final isActive = i == currentIndex;
              return Expanded(
                child: GestureDetector(
                  onTap: () => onTap(i),
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            item.icon,
                            size: 24,
                            color: isActive
                                ? AppColors.relianceBase
                                : AppColors.contentMinimal,
                          ),
                          if (item.badge != null)
                            Positioned(
                              top: -4,
                              right: -6,
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 300),
                                transitionBuilder: (child, anim) =>
                                    ScaleTransition(
                                  scale: CurvedAnimation(
                                    parent: anim,
                                    curve: Curves.elasticOut,
                                  ),
                                  child: child,
                                ),
                                child: Container(
                                  key: ValueKey(item.badge),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                    vertical: 1,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.badgeRed,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    '${item.badge}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: isActive
                              ? AppColors.relianceBase
                              : AppColors.contentMinimal,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
