import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../data/models/booking.dart';
import '../../../../providers/employee/tasks_provider.dart';
import '../../../../shared/widgets/section_header.dart';
import '../../../../shared/widgets/pf_card.dart';
import '../../../../shared/widgets/widget_entrance.dart';

class BookingsEmpWidget extends ConsumerWidget {
  const BookingsEmpWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(employeeBookingsProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Upcoming Bookings'),
        const SizedBox(height: 10),
        bookingsAsync.when(
          loading: () => Container(
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.surfaceModerate,
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (bookings) => SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(bookings.length, (i) {
                return Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: WidgetEntrance(
                    index: i,
                    child: _BookingCard(booking: bookings[i]),
                  ),
                );
              }),
            ),
          ),
        ),
      ],
    );
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;

  const _BookingCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceMinimal,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A0F172A),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: _typeColor(booking.type).withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              booking.dateLabel,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: _typeColor(booking.type),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            booking.title,
            style: AppTextStyles.body.copyWith(fontSize: 13),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 3),
          Text(
            booking.timeLabel,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.contentHeavy,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
          const SizedBox(height: 4),
          if (booking.location != null)
            Text(
              booking.location!,
              style: AppTextStyles.captionMinimal.copyWith(fontSize: 11),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          const SizedBox(height: 6),
          Text(
            booking.timeAway,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.contentMinimal,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Color _typeColor(BookingType type) {
    switch (type) {
      case BookingType.gym:
        return AppColors.positive;
      case BookingType.teamMeet:
        return AppColors.relianceBase;
      case BookingType.oneOnOne:
        return AppColors.skyBase;
      case BookingType.meeting:
        return AppColors.relianceBase;
      case BookingType.conference:
        return AppColors.warning;
    }
  }
}
