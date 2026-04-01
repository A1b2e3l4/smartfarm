import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/providers.dart';

/// Admin Dashboard Screen
class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final adminProvider = context.read<AdminProvider>();
    await adminProvider.fetchDashboardStats();
  }

  Future<void> _refresh() async {
    await _loadData();
  }

  @override
  Widget build(BuildContext context) {
    final adminProvider = context.watch<AdminProvider>();
    final stats = adminProvider.dashboardStats;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              Text(
                'Welcome, Admin',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 4),
              Text(
                'Here\'s what\'s happening today',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 24),

              // Stats Grid
              if (stats != null) ...[
                _StatsGrid(stats: stats),
                const SizedBox(height: 24),

                // Pending Approvals Section
                if (stats.pendingCrops > 0 || stats.pendingAlerts > 0) ...[
                  _PendingApprovalsCard(stats: stats),
                  const SizedBox(height: 24),
                ],

                // Quick Actions
                _QuickActionsGrid(),
                const SizedBox(height: 24),

                // Recent Activity
                _RecentActivitySection(),
              ] else ...[
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Stats Grid
class _StatsGrid extends StatelessWidget {
  final dynamic stats;

  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _StatCard(
          title: 'Total Users',
          value: stats.totalUsers.toString(),
          icon: Icons.people,
          color: AppColors.primary,
        ),
        _StatCard(
          title: 'Farmers',
          value: stats.totalFarmers.toString(),
          icon: Icons.agriculture,
          color: AppColors.secondary,
        ),
        _StatCard(
          title: 'Total Crops',
          value: stats.totalCrops.toString(),
          icon: Icons.grass,
          color: AppColors.success,
        ),
        _StatCard(
          title: 'Total Orders',
          value: stats.totalOrders.toString(),
          icon: Icons.shopping_bag,
          color: AppColors.warning,
        ),
      ],
    );
  }
}

/// Stat Card
class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 28),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: color,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: color.withOpacity(0.8),
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Pending Approvals Card
class _PendingApprovalsCard extends StatelessWidget {
  final dynamic stats;

  const _PendingApprovalsCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.warning.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.warning.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.pending_actions,
                color: AppColors.warning,
              ),
              const SizedBox(width: 8),
              Text(
                'Pending Approvals',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (stats.pendingCrops > 0)
            _PendingItem(
              title: 'Crops Pending Approval',
              count: stats.pendingCrops,
              onTap: () {
                // Navigate to pending crops
              },
            ),
          if (stats.pendingAlerts > 0)
            _PendingItem(
              title: 'Alerts Pending Approval',
              count: stats.pendingAlerts,
              onTap: () {
                // Navigate to pending alerts
              },
            ),
        ],
      ),
    );
  }
}

/// Pending Item
class _PendingItem extends StatelessWidget {
  final String title;
  final int count;
  final VoidCallback onTap;

  const _PendingItem({
    required this.title,
    required this.count,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.warning,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              count.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_forward_ios, size: 16),
        ],
      ),
      onTap: onTap,
    );
  }
}

/// Quick Actions Grid
class _QuickActionsGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final actions = [
      _QuickAction(
        icon: Icons.person_add,
        label: 'Add User',
        onTap: () {},
      ),
      _QuickAction(
        icon: Icons.add_circle,
        label: 'Add Crop',
        onTap: () {},
      ),
      _QuickAction(
        icon: Icons.campaign,
        label: 'Send Alert',
        onTap: () {},
      ),
      _QuickAction(
        icon: Icons.event,
        label: 'Add Event',
        onTap: () {},
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: actions.map((action) {
            return GestureDetector(
              onTap: action.onTap,
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      action.icon,
                      color: AppColors.primary,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    action.label,
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

/// Quick Action
class _QuickAction {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  _QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
  });
}

/// Recent Activity Section
class _RecentActivitySection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Activity',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 12),
        const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Column(
              children: [
                Icon(
                  Icons.history,
                  size: 48,
                  color: AppColors.textHint,
                ),
                SizedBox(height: 8),
                Text(
                  'No recent activity',
                  style: TextStyle(
                    color: AppColors.textSecondary,
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
