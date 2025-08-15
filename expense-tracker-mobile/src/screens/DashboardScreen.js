import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {
  Text,
  Button,
  ActivityIndicator,
  Surface,
  Avatar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import usePermissions from '../hooks/usePermissions';
import { expenseAPI, incomeAPI } from '../services/api';
import { format } from 'date-fns';

const DashboardScreen = ({ navigation, route }) => {
  console.log('DashboardScreen rendered');
  
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    recentTransactions: [],
    monthlyExpenses: 0,
    monthlyIncome: 0,
    cashBalance: 0,
    bankBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const { canAdd, canAccessReports } = usePermissions();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  console.log('User in dashboard:', user);

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  // Add focus effect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard focused, refreshing data...');
      // Add a small delay to ensure the screen is fully focused
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 100);
      
      return () => clearTimeout(timer);
    }, [])
  );

  // Also add navigation listener for additional safety
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Dashboard navigation focus event triggered');
      loadDashboardData();
    });

    return unsubscribe;
  }, [navigation]);

  // Add tab focus listener for when switching between tabs
  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener('tabPress', (e) => {
      if (e.target?.includes('Dashboard')) {
        console.log('Dashboard tab pressed, refreshing data...');
        setTimeout(() => {
          loadDashboardData();
        }, 100);
      }
    });

    return unsubscribe || (() => {});
  }, [navigation]);

  // Listen for route params to trigger refresh
  useEffect(() => {
    if (route.params?.refresh) {
      console.log('Dashboard refresh requested via params');
      loadDashboardData();
      // Clear the refresh param to avoid repeated refreshes
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh, route.params?.timestamp]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...');
      setLoading(true);
      
      let expenses = [];
      let incomes = [];
      
      try {
        const [expenseResponse, incomeResponse] = await Promise.all([
          expenseAPI.getAll(),
          incomeAPI.getAll(),
        ]);

        console.log('Dashboard API responses:', { expenseResponse, incomeResponse });
        expenses = expenseResponse.data || [];
        incomes = incomeResponse.data || [];
      } catch (apiError) {
        console.log('API Error:', apiError.message);
        expenses = [];
        incomes = [];
      }

      console.log('Processing dashboard data...', { expenseCount: expenses.length, incomeCount: incomes.length });

      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
      const balance = totalIncome - totalExpenses;

      // Calculate monthly data
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyExpenses = expenses
        .filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
        
      const monthlyIncome = incomes
        .filter(i => {
          const incomeDate = new Date(i.date);
          return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
        })
        .reduce((sum, income) => sum + (income.amount || 0), 0);

      // Calculate balance by method
      const cashTransactions = [...expenses.filter(e => e.method === 'Cash'), ...incomes.filter(i => i.method === 'Cash')];
      const bankTransactions = [...expenses.filter(e => e.method === 'Bank'), ...incomes.filter(i => i.method === 'Bank')];
      
      const cashBalance = cashTransactions.reduce((sum, t) => {
        return expenses.includes(t) ? sum - t.amount : sum + t.amount;
      }, 0);
      
      const bankBalance = bankTransactions.reduce((sum, t) => {
        return expenses.includes(t) ? sum - t.amount : sum + t.amount;
      }, 0);

      // Get recent transactions (last 5)
      const allTransactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' })),
        ...incomes.map(i => ({ ...i, type: 'income' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      const finalStats = {
        totalExpenses,
        totalIncome,
        balance,
        monthlyExpenses,
        monthlyIncome,
        cashBalance,
        bankBalance,
        recentTransactions: allTransactions,
      };

      console.log('Setting dashboard stats:', finalStats);
      setStats(finalStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const fallbackStats = {
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        monthlyExpenses: 0,
        monthlyIncome: 0,
        cashBalance: 0,
        bankBalance: 0,
        recentTransactions: [],
      };
      console.log('Using fallback stats:', fallbackStats);
      setStats(fallbackStats);
    } finally {
      console.log('Dashboard loading complete');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
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

  // Check if user is available
  if (!user) {
    console.log('No user found, showing login prompt');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view dashboard</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Login')}>
          Go to Login
        </Button>
      </View>
    );
  }

  if (loading) {
    console.log('Dashboard is loading...');
    return (
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </LinearGradient>
    );
  }

  console.log('Rendering dashboard with stats:', stats);
  
  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <Animated.ScrollView
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={44}
                label={user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Good {getTimeOfDay()}</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Enhanced Balance Card with Animation */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={
              stats.balance >= 0 
                ? ['#ffffff', '#f8fafc'] 
                : ['#ffffff', '#f8fafc']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Ionicons 
                name={stats.balance >= 0 ? "trending-up" : "trending-down"} 
                size={24} 
                color="white" 
              />
            </View>
            <Text style={[
              styles.balanceAmount,
              { color: stats.balance >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatCurrency(stats.balance)}
            </Text>
            
            {/* Income and Expense below balance */}
            <View style={styles.balanceBreakdown}>
              <View style={styles.balanceItem}>
                <View style={styles.balanceItemIcon}>
                  <Ionicons name="trending-up" size={16} color="#10b981" />
                </View>
                <View style={styles.balanceItemContent}>
                  <Text style={styles.balanceItemLabel}>Total Income</Text>
                  <Text style={styles.balanceItemAmount}>
                    {formatCurrency(stats.totalIncome)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.balanceItem}>
                <View style={styles.balanceItemIcon}>
                  <Ionicons name="trending-down" size={16} color="#ef4444" />
                </View>
                <View style={styles.balanceItemContent}>
                  <Text style={styles.balanceItemLabel}>Total Expenses</Text>
                  <Text style={styles.balanceItemAmount}>
                    {formatCurrency(stats.totalExpenses)}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.balanceSubtext}>
              {stats.balance >= 0 ? 'You\'re doing great!' : 'Keep track of expenses'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Method Balance Cards */}
        <View style={styles.methodsContainer}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.methodCard}
          >
            <View style={styles.methodHeader}>
              <Ionicons name="wallet-outline" size={24} color="#10b981" />
              <Text style={styles.methodTitle}>Cash</Text>
            </View>
            <Text style={styles.methodAmount}>
              {formatCurrency(stats.cashBalance)}
            </Text>
            <TouchableOpacity 
              style={styles.methodButton}
              onPress={() => navigation.navigate('Transactions', { screen: 'CashTransactions' })}
            >
              <Text style={styles.methodButtonText}>View Details</Text>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.methodCard}
          >
            <View style={styles.methodHeader}>
              <Ionicons name="card-outline" size={24} color="#6366f1" />
              <Text style={styles.methodTitle}>Bank</Text>
            </View>
            <Text style={styles.methodAmount}>
              {formatCurrency(stats.bankBalance)}
            </Text>
            <TouchableOpacity 
              style={styles.methodButton}
              onPress={() => navigation.navigate('Transactions', { screen: 'BankTransactions' })}
            >
              <Text style={styles.methodButtonText}>View Details</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Monthly Overview */}
        <Surface style={styles.monthlyCard} elevation={2}>
          <View style={styles.monthlyHeader}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.monthlyIconContainer}>
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
            </View>
          </View>
          <View style={styles.monthlyStats}>
            <View style={styles.monthlyStat}>
              <View style={styles.monthlyStatIcon}>
                <Ionicons name="trending-up" size={20} color="#10b981" />
              </View>
              <View style={styles.monthlyStatContent}>
                <Text style={styles.monthlyStatLabel}>Income</Text>
                <Text style={styles.monthlyIncomeAmount}>
                  {formatCurrency(stats.monthlyIncome)}
                </Text>
              </View>
            </View>
            <View style={styles.monthlyStat}>
              <View style={styles.monthlyStatIcon}>
                <Ionicons name="trending-down" size={20} color="#ef4444" />
              </View>
              <View style={styles.monthlyStatContent}>
                <Text style={styles.monthlyStatLabel}>Expenses</Text>
                <Text style={styles.monthlyExpenseAmount}>
                  {formatCurrency(stats.monthlyExpenses)}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Quick Actions with Dynamic Grid Layout based on Permissions */}
        <Surface style={styles.actionsCard} elevation={2}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {/* Top Row - Add Actions (always available for basic functionality) */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Transactions', { screen: 'AddExpense' })}
                style={styles.actionWrapper}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionItem}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="remove-circle" size={28} color="#ef4444" />
                  </View>
                  <Text style={styles.actionLabel}>Add Expense</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Transactions', { screen: 'AddIncome' })}
                style={styles.actionWrapper}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionItem}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="add-circle" size={28} color="#10b981" />
                  </View>
                  <Text style={styles.actionLabel}>Add Income</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Bottom Row - View Actions */}
            <View style={styles.actionsRow}>
              {/* Reports - only if user has permission */}
              {canAccessReports() && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Reports')}
                  style={styles.actionWrapper}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionItem}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons name="bar-chart" size={28} color="#6366f1" />
                    </View>
                    <Text style={styles.actionLabel}>Reports</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Categories - always available for viewing */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Categories')}
                style={styles.actionWrapper}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionItem}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="list" size={28} color="#8b5cf6" />
                  </View>
                  <Text style={styles.actionLabel}>Categories</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Transactions - always available for viewing */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Transactions')}
                style={styles.actionWrapper}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionItem}
                >
                  <View style={styles.actionIcon}>
                    <Ionicons name="list-outline" size={28} color="#6b7280" />
                  </View>
                  <Text style={styles.actionLabel}>View All</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Surface>

        {/* Recent Transactions with Enhanced Design */}
        <Surface style={styles.recentCard} elevation={2}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
            >
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.viewAllGradient}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#6366f1" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {stats.recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#e5e7eb" />
              <Text style={styles.emptyText}>No recent transactions</Text>
              <Text style={styles.emptySubText}>Start adding expenses and income!</Text>
            </View>
          ) : (
            <Animated.View 
              style={[
                styles.transactionsList,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {stats.recentTransactions.map((transaction, index) => (
                <TouchableOpacity key={index} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: transaction.type === 'income' ? '#10b98115' : '#ef444415' }
                    ]}>
                      <Ionicons 
                        name={transaction.type === 'income' ? 'add-circle' : 'remove-circle'} 
                        size={20} 
                        color={transaction.type === 'income' ? '#10b981' : '#ef4444'} 
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionMethod}>
                          {transaction.method}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {format(new Date(transaction.date), 'MMM dd')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </Surface>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </LinearGradient>
  );

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6366f120',
    marginRight: 12,
  },
  avatarLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#6366f110',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  balanceItemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  balanceItemContent: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  balanceItemAmount: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  methodsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  methodCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  methodAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  methodButton: {
    backgroundColor: '#6366f110',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  monthlyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthlyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f110',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  monthlyStatContent: {
    flex: 1,
  },
  monthlyStatLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  monthlyIncomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  monthlyExpenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  actionsGrid: {
    marginTop: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  actionItem: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 80,
    justifyContent: 'center',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  recentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DashboardScreen;