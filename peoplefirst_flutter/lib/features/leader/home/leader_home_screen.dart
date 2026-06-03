import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../providers/persona_provider.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/screens/chat_screen.dart';
import '../../../shared/widgets/widget_entrance.dart';
import 'widgets/ai_briefing_widget.dart';
import 'widgets/performance_widget.dart';
import 'widgets/expense_budget_widget.dart';
import 'widgets/action_items_widget.dart';
import 'widgets/team_snapshot_widget.dart';
import 'widgets/recruitment_widget.dart';
import 'widgets/bookings_widget.dart';
import 'widgets/news_widget.dart';

class LeaderHomeScreen extends ConsumerWidget {
  const LeaderHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final persona = ref.watch(personaProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceSubtle,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: AppHeader(
              name: persona.name,
              initials: persona.initials,
              onSearch: () {},
              onBell: () {},
              onProfile: () => context.go('/more'),
              badgeCount: 3,
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                WidgetEntrance(index: 0, child: const AiBriefingWidget()),
                const SizedBox(height: 20),
                WidgetEntrance(index: 1, child: const BookingsWidget()),
                const SizedBox(height: 20),
                WidgetEntrance(index: 2, child: const ActionItemsWidget()),
                const SizedBox(height: 20),
                WidgetEntrance(index: 3, child: const TeamSnapshotWidget()),
                const SizedBox(height: 20),
                WidgetEntrance(
                  index: 4,
                  child: PerformanceWidget(
                    onReports: () => context.go('/leader/reports'),
                  ),
                ),
                const SizedBox(height: 20),
                WidgetEntrance(index: 5, child: const ExpenseBudgetWidget()),
                const SizedBox(height: 20),
                WidgetEntrance(index: 6, child: const RecruitmentWidget()),
                const SizedBox(height: 20),
                WidgetEntrance(index: 7, child: const NewsWidget()),
                const SizedBox(height: 100),
              ]),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => const ChatScreen(),
          );
        },
        backgroundColor: AppColors.skyBase,
        foregroundColor: Colors.white,
        elevation: 4,
        child: const Icon(Icons.auto_awesome),
      ),
    );
  }
}
