import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Surface,
  Avatar,
  List,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { expenseAPI, incomeAPI } from '../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    transactionCount: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    favoriteCategory: 'None',
    lastActivity: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileStats();
  }, []);

  const loadProfileStats = async () => {
    try {
      setLoading(true);
      
      const [expenseResponse, incomeResponse] = await Promise.all([
        expenseAPI.getAll(),
        incomeAPI.getAll(),
      ]);

      const expenses = expenseResponse.data || [];
      const incomes = incomeResponse.data || [];

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
      const transactionCount = expenses.length + incomes.length;

      // Monthly stats
      const currentMonth = new Date();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const monthlyExpenses = expenses
        .filter(e => {
          const date = new Date(e.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const monthlyIncome = incomes
        .filter(i => {
          const date = new Date(i.date);
          return date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      // Favorite category
      const categoryTotals = {};
      expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });
      const favoriteCategory = Object.keys(categoryTotals).length > 0
        ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
        : 'None';

      // Last activity
      const allTransactions = [...expenses, ...incomes];
      const lastActivity = allTransactions.length > 0
        ? allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
        : null;

      setStats({
        totalExpenses,
        totalIncome,
        transactionCount,
        monthlyExpenses,
        monthlyIncome,
        favoriteCategory,
        lastActivity,
      });
    } catch (error) {
      console.error('Error loading profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.getParent()?.replace('Login');
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getAccountAge = () => {
    // This would typically come from user creation date
    return 'New User';
  };

  const getActivityLevel = () => {
    if (stats.transactionCount === 0) return { level: 'Inactive', color: '#6b7280' };
    if (stats.transactionCount < 10) return { level: 'Beginner', color: '#f59e0b' };
    if (stats.transactionCount < 50) return { level: 'Active', color: '#10b981' };
    return { level: 'Expert', color: '#6366f1' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activityLevel = getActivityLevel();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
        >
          {/* Profile Header */}
          <Surface style={styles.profileCard} elevation={4}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.profileGradient}
            >
              <View style={styles.profileHeader}>
                <Avatar.Text
                  size={80}
                  label={user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                  <View style={styles.badgeContainer}>
                    <Chip
                      style={[styles.roleBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                      textStyle={styles.roleBadgeText}
                    >
                      {user?.role || 'User'}
                    </Chip>
                    <Chip
                      style={[styles.activityBadge, { backgroundColor: `${activityLevel.color}15` }]}
                      textStyle={[styles.activityBadgeText, { color: activityLevel.color }]}
                    >
                      {activityLevel.level}
                    </Chip>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Surface>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard} elevation={2}>
              <View style={styles.statContent}>
                <Ionicons name="trending-down" size={24} color="#ef4444" />
                <Text style={styles.statValue}>{formatCurrency(stats.totalExpenses)}</Text>
                <Text style={styles.statLabel}>Total Expenses</Text>
              </View>
            </Surface>

            <Surface style={styles.statCard} elevation={2}>
              <View style={styles.statContent}>
                <Ionicons name="trending-up" size={24} color="#10b981" />
                <Text style={styles.statValue}>{formatCurrency(stats.totalIncome)}</Text>
                <Text style={styles.statLabel}>Total Income</Text>
              </View>
            </Surface>

            <Surface style={styles.statCard} elevation={2}>
              <View style={styles.statContent}>
                <Ionicons name="swap-horizontal" size={24} color="#6366f1" />
                <Text style={styles.statValue}>{stats.transactionCount}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
            </Surface>
          </View>

          {/* Monthly Overview */}
          <Surface style={styles.monthlyCard} elevation={2}>
            <View style={styles.monthlyHeader}>
              <Text style={styles.sectionTitle}>This Month</Text>
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
            </View>
            <View style={styles.monthlyStats}>
              <View style={styles.monthlyStat}>
                <View style={styles.monthlyStatIcon}>
                  <Ionicons name="trending-up" size={16} color="#10b981" />
                </View>
                <View style={styles.monthlyStatContent}>
                  <Text style={styles.monthlyStatValue}>{formatCurrency(stats.monthlyIncome)}</Text>
                  <Text style={styles.monthlyStatLabel}>Income</Text>
                </View>
              </View>
              <View style={styles.monthlyStat}>
                <View style={styles.monthlyStatIcon}>
                  <Ionicons name="trending-down" size={16} color="#ef4444" />
                </View>
                <View style={styles.monthlyStatContent}>
                  <Text style={styles.monthlyStatValue}>{formatCurrency(stats.monthlyExpenses)}</Text>
                  <Text style={styles.monthlyStatLabel}>Expenses</Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* Profile Details */}
          <Surface style={styles.detailsCard} elevation={2}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            
            <List.Item
              title="Account Type"
              description={user?.role || 'User'}
              left={(props) => <List.Icon {...props} icon="account-outline" />}
            />
            
            <List.Item
              title="Member Since"
              description={getAccountAge()}
              left={(props) => <List.Icon {...props} icon="calendar-check" />}
            />
            
            <List.Item
              title="Favorite Category"
              description={stats.favoriteCategory}
              left={(props) => <List.Icon {...props} icon="heart-outline" />}
            />
            
            <List.Item
              title="Last Activity"
              description={stats.lastActivity ? format(new Date(stats.lastActivity), 'MMM dd, yyyy') : 'No activity'}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
          </Surface>

          {/* Quick Actions */}
          <Surface style={styles.actionsCard} elevation={2}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="settings-outline" size={20} color="#6366f1" />
                <Text style={styles.actionText}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('Reports')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="analytics-outline" size={20} color="#10b981" />
                <Text style={styles.actionText}>View Reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#f59e0b" />
                <Text style={styles.actionText}>About App</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleLogout}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={[styles.actionText, { color: '#ef4444' }]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Surface>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  
  // Profile Header
  profileCard: {
    margin: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 20,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Monthly Card
  monthlyCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 20,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthlyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  monthlyStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  monthlyStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  monthlyStatContent: {
    flex: 1,
  },
  monthlyStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // Details and Actions Cards
  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
