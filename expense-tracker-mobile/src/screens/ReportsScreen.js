import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Dimensions, 
  TouchableOpacity,
  Animated,
  RefreshControl,
  Platform
} from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  ActivityIndicator, 
  SegmentedButtons, 
  Button, 
  Searchbar,
  Chip,
  Surface,
  Portal,
  Modal,
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { expenseAPI, incomeAPI } from '../services/api';
import { theme, isDarkMode } from '../utils/theme';
import {
  LineChart,
  BarChart,
  PieChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  parseISO, 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  isThisYear, 
  startOfDay, 
  endOfDay 
} from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('month'); // week, month, year
  const [allData, setAllData] = useState({ expenses: [], incomes: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    trendData: null,
    incomeData: null,
    categoryBreakdown: [],
    dailyActivity: [],
    topCategories: [],
    weeklyComparison: [],
  });

  // Date filter states
  const [dateFilterType, setDateFilterType] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const filterOptions = ['All', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Range'];

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allData, dateFilterType, fromDate, toDate, searchQuery, selectedCategories, timeframe]);

  useEffect(() => {
    // Start animations when data loads
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const [expenseResponse, incomeResponse] = await Promise.all([
        expenseAPI.getAll(),
        incomeAPI.getAll(),
      ]);

      const expenses = expenseResponse.data || [];
      const incomes = incomeResponse.data || [];

      setAllData({ expenses, incomes });
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filteredExpenses = [...allData.expenses];
    let filteredIncomes = [...allData.incomes];

    // Apply date filter
    if (dateFilterType === 'Today') {
      filteredExpenses = filteredExpenses.filter(expense => isToday(parseISO(expense.date)));
      filteredIncomes = filteredIncomes.filter(income => isToday(parseISO(income.date)));
    } else if (dateFilterType === 'This Week') {
      filteredExpenses = filteredExpenses.filter(expense => isThisWeek(parseISO(expense.date), { weekStartsOn: 1 }));
      filteredIncomes = filteredIncomes.filter(income => isThisWeek(parseISO(income.date), { weekStartsOn: 1 }));
    } else if (dateFilterType === 'This Month') {
      filteredExpenses = filteredExpenses.filter(expense => isThisMonth(parseISO(expense.date)));
      filteredIncomes = filteredIncomes.filter(income => isThisMonth(parseISO(income.date)));
    } else if (dateFilterType === 'This Year') {
      filteredExpenses = filteredExpenses.filter(expense => isThisYear(parseISO(expense.date)));
      filteredIncomes = filteredIncomes.filter(income => isThisYear(parseISO(income.date)));
    } else if (dateFilterType === 'Custom Range' && fromDate && toDate) {
      const fromDateTime = startOfDay(fromDate);
      const toDateTime = endOfDay(toDate);
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return expenseDate >= fromDateTime && expenseDate <= toDateTime;
      });
      filteredIncomes = filteredIncomes.filter(income => {
        const incomeDate = parseISO(income.date);
        return incomeDate >= fromDateTime && incomeDate <= toDateTime;
      });
    }

    // Apply search filter
    if (searchQuery) {
      filteredExpenses = filteredExpenses.filter(expense =>
        expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredIncomes = filteredIncomes.filter(income =>
        income.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filteredExpenses = filteredExpenses.filter(expense =>
        selectedCategories.includes(expense.category)
      );
      filteredIncomes = filteredIncomes.filter(income =>
        selectedCategories.includes(income.category)
      );
    }

    // Generate reports with filtered data
    const reports = generateReports(filteredExpenses, filteredIncomes, timeframe);
    
    // Calculate totals
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalIncome = filteredIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    setReportData({
      totalIncome,
      totalExpenses,
      balance,
      ...reports,
    });
  };

  const generateReports = (expenses, incomes, timeframe) => {
    const now = new Date();
    
    // Use last 30 days as default since we removed timeframe selector
    const startDate = subDays(now, 30);
    const endDate = now;

    // Filter data by date range (last 30 days)
    const filteredExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date >= startDate && date <= endDate;
    });

    const filteredIncomes = incomes.filter(i => {
      const date = new Date(i.date);
      return date >= startDate && date <= endDate;
    });

    // Category breakdown for expenses with unique colors
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const uniqueColors = getUniqueColors(categoryEntries.length);
    
    const categoryBreakdown = categoryEntries
      .map(([name, value], index) => ({
        name,
        value,
        color: uniqueColors[index],
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      }))
      .slice(0, 8); // Top 8 categories

    // Daily trend data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i); // Start from 6 days ago to today
      return date;
    });

    const dailyData = last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayExpenses = filteredExpenses
        .filter(e => {
          const expenseDate = format(new Date(e.date), 'yyyy-MM-dd');
          return expenseDate === dayStr;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      const dayIncomes = filteredIncomes
        .filter(i => {
          const incomeDate = format(new Date(i.date), 'yyyy-MM-dd');
          return incomeDate === dayStr;
        })
        .reduce((sum, i) => sum + i.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
        expenses: dayExpenses,
        income: dayIncomes,
        net: dayIncomes - dayExpenses,
      };
    });

    // Trend data for area chart - simpler structure
    const trendData = {
      labels: dailyData.map(d => d.date.split(' ')[1]), // Extract day numbers
      datasets: [
        {
          data: dailyData.map(d => d.expenses || 0),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
          strokeWidth: 2,
        }
      ]
    };

    // Income data for comparison
    const incomeData = {
      labels: dailyData.map(d => d.date.split(' ')[1]),
      datasets: [
        {
          data: dailyData.map(d => d.income || 0),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for income
          strokeWidth: 2,
        }
      ]
    };

    // Add some debugging
    console.log('Chart Data:', {
      labels: trendData.labels,
      expenseData: trendData.datasets[0].data,
      incomeData: incomeData.datasets[0].data,
      dailyDataCount: dailyData.length
    });

    // Top categories
    const topCategories = categoryBreakdown.slice(0, 5);

    // Weekly comparison (bar chart) - Average spending by day of week
    const weeklyComparison = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: Array(7).fill(0).map((_, dayOfWeek) => {
            // Calculate average spending for each day of the week
            const dayExpenses = filteredExpenses.filter(e => {
              const expenseDay = new Date(e.date).getDay();
              const adjustedDay = expenseDay === 0 ? 6 : expenseDay - 1; // Convert Sunday=0 to Sunday=6
              return adjustedDay === dayOfWeek;
            });
            const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            const weekCount = Math.ceil(filteredExpenses.length / 7) || 1;
            return Math.round(totalExpenses / weekCount);
          }),
        },
      ],
    };

    return {
      trendData,
      incomeData,
      categoryBreakdown,
      dailyActivity: dailyData,
      topCategories,
      weeklyComparison,
    };
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF8A80', '#C9CBCF',
      '#8BC34A', '#FFC107', '#E91E63', '#009688',
      '#3F51B5', '#FF5722', '#795548', '#607D8B'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getUniqueColors = (count) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF8A80', '#C9CBCF',
      '#8BC34A', '#FFC107', '#E91E63', '#009688',
      '#3F51B5', '#FF5722', '#795548', '#607D8B'
    ];
    
    // Shuffle colors to ensure randomness but uniqueness
    const shuffled = [...colors].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleFilterPress = (filter) => {
    if (filter === 'Custom Range') {
      setShowFilterModal(false);
      const today = new Date();
      setFromDate(today);
      setToDate(today);
      setShowDateModal(true);
    } else {
      setDateFilterType(filter);
      setShowFilterModal(false);
    }
  };

  const applyCustomDateFilter = () => {
    if (fromDate && toDate) {
      setDateFilterType('Custom Range');
      setShowDateModal(false);
    }
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const getAllCategories = () => {
    const expenseCategories = allData.expenses.map(e => e.category).filter(Boolean);
    const incomeCategories = allData.incomes.map(i => i.category).filter(Boolean);
    return [...new Set([...expenseCategories, ...incomeCategories])];
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDateFilterType('All');
    setSelectedCategories([]);
  };

  const getMostUsedMethod = () => {
    const allTransactions = [...allData.expenses, ...allData.incomes];
    const methodCounts = {};
    allTransactions.forEach(t => {
      methodCounts[t.method] = (methodCounts[t.method] || 0) + 1;
    });
    const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];
    return topMethod ? topMethod[0] : 'None';
  };

  const getLastActivityDays = () => {
    const allTransactions = [...allData.expenses, ...allData.incomes];
    if (allTransactions.length === 0) return 0;
    const lastTransaction = allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const daysDiff = Math.floor((new Date() - new Date(lastTransaction.date)) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={isDarkMode ? [theme.background, theme.surface] : ['#ffffff', '#f8fafc']}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Generating financial insights...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={isDarkMode ? [theme.background, theme.surface] : ['#ffffff', '#f8fafc']}
        style={styles.headerGradient}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Financial Reports</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Enhanced Filters Section */}
      <View style={[styles.filtersContainer, { backgroundColor: theme.background }]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search categories, notes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#6366f1"
            inputStyle={styles.searchInput}
          />
        </View>
        
        {/* Filter Pills Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterPillsContainer}
          contentContainerStyle={styles.filterPillsContent}
        >
          {/* Date Filter */}
          <TouchableOpacity
            style={[styles.filterPill, styles.dateFilterPill]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="calendar-outline" size={16} color="#6366f1" />
            <Text style={styles.filterPillText}>{dateFilterType}</Text>
            <Ionicons name="chevron-down" size={14} color="#6366f1" />
          </TouchableOpacity>
          
          {/* Category Filters */}
          {getAllCategories().slice(0, 5).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterPill,
                selectedCategories.includes(category) && styles.activeFilterPill
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text style={[
                styles.filterPillText,
                selectedCategories.includes(category) && styles.activeFilterPillText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
          
          {getAllCategories().length > 5 && (
            <TouchableOpacity style={styles.moreFilterPill}>
              <Text style={styles.filterPillText}>+{getAllCategories().length - 5} more</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        
        {/* Active Filters Display */}
        {(dateFilterType !== 'All' || searchQuery || selectedCategories.length > 0) && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersLabel}>Active filters:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.activeFiltersList}>
                {dateFilterType !== 'All' && (
                  <View style={styles.activeFilterTag}>
                    <Text style={styles.activeFilterTagText}>{dateFilterType}</Text>
                    <TouchableOpacity onPress={() => setDateFilterType('All')}>
                      <Ionicons name="close" size={12} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                )}
                {searchQuery && (
                  <View style={styles.activeFilterTag}>
                    <Text style={styles.activeFilterTagText}>Search: {searchQuery}</Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close" size={12} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedCategories.map((category) => (
                  <View key={category} style={styles.activeFilterTag}>
                    <Text style={styles.activeFilterTagText}>{category}</Text>
                    <TouchableOpacity onPress={() => toggleCategory(category)}>
                      <Ionicons name="close" size={12} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Summary Stats with Animation */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
            <LinearGradient
              colors={isDarkMode ? [theme.card, theme.surface] : ['#ffffff', '#f8fafc']}
              style={styles.statCard}
            >
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                </View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Income</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>₹{reportData.totalIncome.toLocaleString()}</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={isDarkMode ? [theme.card, theme.surface] : ['#ffffff', '#f8fafc']}
              style={styles.statCard}
            >
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trending-down" size={24} color="#ef4444" />
                </View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Expenses</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>₹{reportData.totalExpenses.toLocaleString()}</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={isDarkMode ? [theme.card, theme.surface] : ['#ffffff', '#f8fafc']}
              style={styles.statCard}
            >
              <View style={styles.statContent}>
                <View style={styles.statIconContainer}>
                  <Ionicons 
                    name={reportData.balance >= 0 ? "wallet" : "warning"} 
                    size={24} 
                    color={reportData.balance >= 0 ? "#6366f1" : "#f59e0b"}
                  />
                </View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Net Balance</Text>
                <Text style={[
                  styles.statValue,
                  { color: reportData.balance >= 0 ? "#10b981" : "#ef4444" }
                ]}>₹{reportData.balance.toLocaleString()}</Text>
              </View>
            </LinearGradient>
          </ScrollView>
        </Animated.View>

        {/* Quick Insights Cards */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={[styles.insightsCard, { backgroundColor: theme.card }]} elevation={4}>
            <View style={styles.insightsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Insights</Text>
              <View style={styles.insightsIcon}>
                <Ionicons name="bulb" size={20} color={theme.primary} />
              </View>
            </View>
            <View style={styles.insightsGrid}>
              <View style={styles.insightItem}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="calendar-outline" size={16} color="#10b981" />
                </View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Avg Daily</Text>
                <Text style={[styles.insightValue, { color: theme.text }]}>
                  ₹{Math.round(reportData.totalExpenses / 30).toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="trending-up" size={16} color="#ef4444" />
                </View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Highest</Text>
                <Text style={[styles.insightValue, { color: theme.text }]}>
                  ₹{Math.max(...(allData.expenses.map(e => e.amount) || [0])).toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="card" size={16} color={theme.primary} />
                </View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Top Method</Text>
                <Text style={[styles.insightValue, { color: theme.text }]}>
                  {getMostUsedMethod()}
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="time" size={16} color="#f59e0b" />
                </View>
                <Text style={[styles.insightLabel, { color: theme.textSecondary }]}>Last Activity</Text>
                <Text style={[styles.insightValue, { color: theme.text }]}>
                  {getLastActivityDays()} days
                </Text>
              </View>
            </View>
          </Surface>
        </Animated.View>

        {/* Income vs Expenses Trend */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={[styles.chartCard, { backgroundColor: theme.card }]} elevation={4}>
            <LinearGradient
              colors={isDarkMode ? [theme.card, theme.surface] : ['#f8fafc', '#e2e8f0']}
              style={styles.chartGradient}
            >
              <View style={styles.chartHeader}>
                <View>
                  <Title style={[styles.chartTitle, { color: theme.text }]}>Expense Trend (Last 7 Days)</Title>
                </View>
                <View style={styles.chartIcon}>
                  <Ionicons name="analytics" size={24} color="#ef4444" />
                </View>
              </View>
              {reportData.trendData && reportData.trendData.labels && reportData.trendData.labels.length > 0 ? (
                <LineChart
                  data={reportData.trendData}
                  width={screenWidth - 60}
                  height={160}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                    labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                    propsForBackgroundLines: {
                      stroke: theme.border,
                    },
                  }}
                  style={styles.chart}
                  withDots={true}
                  withShadow={false}
                  withInnerLines={false}
                  bezier
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="bar-chart-outline" size={32} color={theme.border} />
                  <Text style={[styles.noDataText, { color: theme.textSecondary }]}>No expense data</Text>
                </View>
              )}
            </LinearGradient>
          </Surface>
        </Animated.View>

        {/* Income Trend */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={styles.chartCard} elevation={4}>
            <LinearGradient
              colors={['#f8fafc', '#e2e8f0']}
              style={styles.chartGradient}
            >
              <View style={styles.chartHeader}>
                <View>
                  <Title style={styles.chartTitle}>Income Trend (Last 7 Days)</Title>
                </View>
                <View style={styles.chartIcon}>
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                </View>
              </View>
              {reportData.incomeData && reportData.incomeData.labels && reportData.incomeData.labels.length > 0 ? (
                <LineChart
                  data={reportData.incomeData}
                  width={screenWidth - 60}
                  height={160}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  }}
                  style={styles.chart}
                  withDots={true}
                  withShadow={false}
                  withInnerLines={false}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="trending-up-outline" size={32} color="#e5e7eb" />
                  <Text style={styles.noDataText}>No income data</Text>
                </View>
              )}
            </LinearGradient>
          </Surface>
        </Animated.View>

        {/* Category Breakdown */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={styles.chartCard} elevation={4}>
            <LinearGradient
              colors={['#f8fafc', '#e2e8f0']}
              style={styles.chartGradient}
            >
              <View style={styles.chartHeader}>
                <View>
                  <Title style={styles.chartTitle}>Expense Categories</Title>
                </View>
                <View style={styles.chartIcon}>
                  <Ionicons name="pie-chart" size={24} color="#6366f1" />
                </View>
              </View>
              {reportData.categoryBreakdown.length > 0 ? (
                <PieChart
                  data={reportData.categoryBreakdown}
                  width={screenWidth - 60}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="value"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                  hasLegend={true}
                  avoidFalseZero={true}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="pie-chart-outline" size={32} color="#e5e7eb" />
                  <Text style={styles.noDataText}>No category data</Text>
                </View>
              )}
            </LinearGradient>
          </Surface>
        </Animated.View>

        {/* Top Categories List */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={styles.chartCard} elevation={4}>
            <LinearGradient
              colors={['#f8fafc', '#e2e8f0']}
              style={styles.chartGradient}
            >
              <View style={styles.chartHeader}>
                <View>
                  <Title style={styles.chartTitle}>Top Expense Categories</Title>
                </View>
                <View style={styles.chartIcon}>
                  <Ionicons name="list" size={24} color="#6366f1" />
                </View>
              </View>
              {reportData.topCategories.map((category, index) => (
                <View key={category.name} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryAmountContainer}>
                    <Text style={styles.categoryAmount}>₹{category.value.toLocaleString()}</Text>
                    <Text style={styles.categoryPercentage}>
                      {((category.value / reportData.totalExpenses) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
              {reportData.topCategories.length === 0 && (
                <View style={styles.noDataContainer}>
                  <Ionicons name="document-text-outline" size={48} color="#e5e7eb" />
                  <Text style={styles.noDataText}>No category data available</Text>
                </View>
              )}
            </LinearGradient>
          </Surface>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={styles.actionsCard} elevation={4}>
            <View style={styles.actionsHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsIcon}>
                <Ionicons name="flash" size={20} color="#6366f1" />
              </View>
            </View>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Transactions')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="list-outline" size={20} color="#6366f1" />
                </View>
                <Text style={styles.actionText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  // Navigate to comparison view (you can implement this later)
                  Alert.alert('Coming Soon', 'Month comparison feature will be added soon');
                }}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="swap-horizontal" size={20} color="#10b981" />
                </View>
                <Text style={styles.actionText}>Compare Months</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Categories')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="apps" size={20} color="#ef4444" />
                </View>
                <Text style={styles.actionText}>Manage Categories</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Filter Selection Modal */}
      <Portal>
        <Modal 
          visible={showFilterModal} 
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Date</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setShowFilterModal(false)}
              />
            </View>
            
            <View style={styles.modalBody}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOptionButton,
                    dateFilterType === filter && styles.filterOptionButtonActive
                  ]}
                  onPress={() => handleFilterPress(filter)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    dateFilterType === filter && styles.filterOptionTextActive
                  ]}>
                    {filter}
                  </Text>
                  {dateFilterType === filter && (
                    <Ionicons name="checkmark" size={20} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Custom Date Range Modal */}
      <Portal>
        <Modal 
          visible={showDateModal} 
          onDismiss={() => setShowDateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setShowDateModal(false)}
              />
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6366f1" />
                  <Text style={styles.datePickerText}>
                    {format(fromDate, 'MMM dd, yyyy')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>To Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#6366f1" />
                  <Text style={styles.datePickerText}>
                    {format(toDate, 'MMM dd, yyyy')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowDateModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={applyCustomDateFilter}
                  style={[styles.modalButton, { backgroundColor: '#6366f1' }]}
                >
                  Apply
                </Button>
              </View>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onFromDateChange}
          maximumDate={new Date()}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onToDateChange}
          minimumDate={fromDate}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  
  // Header Styles
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerText: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  timeframeSelectorContainer: {
    width: '100%',
  },
  timeframeSelector: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  
  // Filters Section
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  
  // Filter Pills
  filterPillsContainer: {
    marginBottom: 12,
  },
  filterPillsContent: {
    paddingRight: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateFilterPill: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  activeFilterPill: {
    backgroundColor: '#6366f110',
    borderColor: '#6366f1',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginHorizontal: 4,
  },
  activeFilterPillText: {
    color: '#6366f1',
  },
  moreFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  
  // Active Filters
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  activeFiltersLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
    fontWeight: '500',
  },
  activeFiltersList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  activeFilterTagText: {
    fontSize: 12,
    color: '#475569',
    marginRight: 4,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    marginLeft: 8,
  },
  clearAllText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  
  // Stats Container
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsRow: {
    paddingVertical: 8,
  },
  statCard: {
    marginRight: 16,
    minWidth: 180,
    borderRadius: 16,
    marginVertical: 8,
  },
  statContent: {
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  
  // Chart Styles
  chartCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chartGradient: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  noDataSubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  
  // Category Row Styles
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Insights Section
  insightsCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },

  // Actions Section
  actionsCard: {
    margin: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 20,
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  
  // Export Section
  exportGradient: {
    padding: 20,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  exportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  
  bottomSpacing: {
    height: 80,
  },
  
  // Modal Styles
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
  },
  filterOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  filterOptionButtonActive: {
    backgroundColor: '#f0f0ff',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#6366f1',
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  datePickerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});

export default ReportsScreen;
