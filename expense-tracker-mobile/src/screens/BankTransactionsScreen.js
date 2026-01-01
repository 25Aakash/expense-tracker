import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Searchbar,
  Chip,
  Button,
  Portal,
  Surface,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { expenseAPI, incomeAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, parseISO, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { theme, isDarkMode } from '../utils/theme';

const BankTransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    bankTotal: 0,
  });

  // Enhanced date filtering state (same as TransactionsScreen)
  const [dateFilterType, setDateFilterType] = useState('All'); // Default to All
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const filterOptions = ['All', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Range'];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyDateFilter();
  }, [allTransactions, dateFilterType, fromDate, toDate]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, filterType]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const [expenseResponse, incomeResponse] = await Promise.all([
        expenseAPI.getAll(),
        incomeAPI.getAll(),
      ]);

      const expenses = (expenseResponse.data || [])
        .filter(expense => expense.method === 'Bank')
        .map(expense => ({
          ...expense,
          type: 'expense',
          displayAmount: `-₹${expense.amount}`,
          color: '#ef4444',
          icon: 'remove-circle',
        }));

      const incomes = (incomeResponse.data || [])
        .filter(income => income.method === 'Bank')
        .map(income => ({
          ...income,
          type: 'income',
          displayAmount: `+₹${income.amount}`,
          color: '#10b981',
          icon: 'add-circle',
        }));

      const allTransactions = [...expenses, ...incomes].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setAllTransactions(allTransactions);
      calculateStats(incomes, expenses);
    } catch (error) {
      console.error('Error loading bank transactions:', error);
      Alert.alert('Error', 'Failed to load bank transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (incomes, expenses) => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const bankTotal = totalIncome - totalExpenses;

    setStats({
      totalIncome,
      totalExpenses,
      bankTotal,
    });
  };

  const applyDateFilter = () => {
    let filtered = [...allTransactions];

    if (dateFilterType === 'Today') {
      filtered = allTransactions.filter(tx => isToday(parseISO(tx.date)));
    } else if (dateFilterType === 'This Week') {
      filtered = allTransactions.filter(tx => isThisWeek(parseISO(tx.date), { weekStartsOn: 1 }));
    } else if (dateFilterType === 'This Month') {
      filtered = allTransactions.filter(tx => isThisMonth(parseISO(tx.date)));
    } else if (dateFilterType === 'This Year') {
      filtered = allTransactions.filter(tx => isThisYear(parseISO(tx.date)));
    } else if (dateFilterType === 'Custom Range' && fromDate && toDate) {
      const fromDateTime = startOfDay(fromDate);
      const toDateTime = endOfDay(toDate);
      filtered = allTransactions.filter(tx => {
        const txDate = parseISO(tx.date);
        return txDate >= fromDateTime && txDate <= toDateTime;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(filtered);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by search query (including amount)
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery)
      );
    }

    setFilteredTransactions(filtered);
  };

  // Enhanced date filter functions
  const setQuickDateFilter = (type) => {
    const now = new Date();
    setDateFilterType(type);
    
    switch (type) {
      case 'all':
      case 'All':
        // Set a very wide date range to show all transactions
        setDateFilterType('All');
        break;
      case 'today':
      case 'Today':
        setDateFilterType('Today');
        break;
      case 'week':
      case 'This Week':
        setDateFilterType('This Week');
        break;
      case 'month':
      case 'This Month':
        setDateFilterType('This Month');
        break;
      case 'year':
      case 'This Year':
        setDateFilterType('This Year');
        break;
      case 'custom':
      case 'Custom Range':
        setDateFilterType('Custom Range');
        break;
    }
  };

  const handleFilterPress = (filter) => {
    if (filter === 'Custom Range') {
      setShowFilterModal(false);
      // Reset to current date when opening custom range
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadTransactions().then(() => setRefreshing(false));
  }, []);

  const handleDeleteTransaction = async (transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${transaction.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (transaction.type === 'expense') {
                await expenseAPI.delete(transaction._id);
              } else {
                await incomeAPI.delete(transaction._id);
              }
              loadTransactions();
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const renderTransaction = (transaction) => (
    <TouchableOpacity
      key={transaction._id}
      onLongPress={() => handleDeleteTransaction(transaction)}
      style={[styles.transactionItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: transaction.color }]}>
            <Ionicons
              name={transaction.icon}
              size={16}
              color="white"
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionCategory, { color: theme.text }]} numberOfLines={1}>
              {transaction.category}
            </Text>
            <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.transactionAmount, { color: transaction.color }]}>
              {transaction.displayAmount}
            </Text>
          </View>
        </View>
        {transaction.note && (
          <Text style={[styles.transactionNote, { color: theme.textSecondary }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading bank transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Search and Filters */}
      <View style={styles.filterSection}>
        <Searchbar
          placeholder="Search by category, note, or amount..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.surface }]}
          inputStyle={[styles.searchInput, { color: theme.text }]}
          iconColor={theme.primary}
          placeholderTextColor={theme.textSecondary}
        />
        
        {/* Filter Pills Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterPillsContainer}
          contentContainerStyle={styles.filterPillsContent}
        >
          {/* Date Filter */}
          <TouchableOpacity
            style={[styles.filterPill, styles.dateFilterPill, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={theme.primary} />
            <Text style={[styles.filterPillText, { color: theme.text }]}>
              {dateFilterType === 'All' ? 'All' :
               dateFilterType === 'Today' ? 'Today' :
               dateFilterType === 'This Week' ? 'This Week' :
               dateFilterType === 'This Month' ? 'This Month' :
               dateFilterType === 'This Year' ? 'This Year' :
               dateFilterType === 'Custom Range' ? 'Custom Range' : 'All'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.primary} />
          </TouchableOpacity>
          
          {/* Type Filters */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              { borderColor: theme.border, backgroundColor: theme.surface },
              filterType === 'all' && { backgroundColor: isDarkMode ? theme.primary + '20' : '#6366f120', borderColor: theme.primary }
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[
              styles.filterPillText,
              { color: theme.textSecondary },
              filterType === 'all' && { color: theme.primary }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterPill,
              { borderColor: theme.border, backgroundColor: theme.surface },
              filterType === 'income' && { backgroundColor: '#10b98110', borderColor: '#10b981' }
            ]}
            onPress={() => setFilterType('income')}
          >
            <Ionicons 
              name="add-circle" 
              size={14} 
              color={filterType === 'income' ? '#10b981' : theme.textSecondary} 
            />
            <Text style={[
              styles.filterPillText,
              { color: theme.textSecondary },
              filterType === 'income' && { color: '#10b981' }
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterPill,
              { borderColor: theme.border, backgroundColor: theme.surface },
              filterType === 'expense' && { backgroundColor: '#ef444410', borderColor: '#ef4444' }
            ]}
            onPress={() => setFilterType('expense')}
          >
            <Ionicons 
              name="remove-circle" 
              size={14} 
              color={filterType === 'expense' ? '#ef4444' : theme.textSecondary} 
            />
            <Text style={[
              styles.filterPillText,
              { color: theme.textSecondary },
              filterType === 'expense' && { color: '#ef4444' }
            ]}>
              Expenses
            </Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Active Filters Display */}
        {(dateFilterType !== 'All' || filterType !== 'all' || searchQuery) && (
          <View style={[styles.activeFiltersContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <Text style={[styles.activeFiltersLabel, { color: theme.textSecondary }]}>Active filters:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.activeFiltersList}>
                {dateFilterType !== 'All' && (
                  <View style={[styles.activeFilterTag, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.activeFilterTagText, { color: theme.text }]}>
                      {dateFilterType === 'Today' ? 'Today' :
                       dateFilterType === 'This Week' ? 'This Week' :
                       dateFilterType === 'This Month' ? 'This Month' :
                       dateFilterType === 'This Year' ? 'This Year' :
                       dateFilterType === 'Custom Range' ? 'Custom Range' : dateFilterType}
                    </Text>
                    <TouchableOpacity onPress={() => setQuickDateFilter('All')}>
                      <Ionicons name="close" size={12} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {filterType !== 'all' && (
                  <View style={[styles.activeFilterTag, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.activeFilterTagText, { color: theme.text }]}>
                      {filterType === 'income' ? 'Income' : 'Expenses'}
                    </Text>
                    <TouchableOpacity onPress={() => setFilterType('all')}>
                      <Ionicons name="close" size={12} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
                {searchQuery && (
                  <View style={[styles.activeFilterTag, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.activeFilterTagText, { color: theme.text }]}>"{searchQuery}"</Text>
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close" size={12} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
            
            {/* Clear All Filters */}
            <TouchableOpacity
              style={[styles.clearFiltersButton, { backgroundColor: isDarkMode ? theme.primary + '20' : '#fee2e2' }]}
              onPress={() => {
                setSearchQuery('');
                setFilterType('all');
                setQuickDateFilter('All');
              }}
            >
              <Text style={[styles.clearFiltersText, { color: isDarkMode ? theme.primary : '#ef4444' }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Stats Bar */}
      {filteredTransactions.length > 0 && (
        <View style={[styles.quickStatsBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Showing</Text>
            <Text style={[styles.quickStatValue, { color: theme.text }]}>{filteredTransactions.length}</Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Total Amount</Text>
            <Text style={[styles.quickStatValue, { color: theme.text }]}>
              ₹{filteredTransactions.reduce((sum, t) => 
                t.type === 'income' ? sum + t.amount : sum - t.amount, 0
              ).toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Bank Balance</Text>
            <Text style={[
              styles.quickStatValue,
              { color: filteredTransactions.reduce((sum, t) => 
                t.type === 'income' ? sum + t.amount : sum - t.amount, 0) >= 0 ? '#10b981' : '#ef4444' 
              }
            ]}>
              ₹{Math.abs(filteredTransactions.reduce((sum, t) => 
                t.type === 'income' ? sum + t.amount : sum - t.amount, 0
              )).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      )}

      {/* Transactions List */}
      <ScrollView
        style={[styles.content, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="card-outline" size={48} color={theme.border} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Bank Transactions</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {searchQuery || dateFilterType !== 'All' || filterType !== 'all'
                  ? 'No transactions match your current filters'
                  : 'Start adding bank transactions to see them here'}
              </Text>
              {(searchQuery || dateFilterType !== 'All' || filterType !== 'all') && (
                <TouchableOpacity
                  style={[styles.clearAllFiltersButton, { backgroundColor: isDarkMode ? theme.primary + '20' : '#fee2e2' }]}
                  onPress={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setQuickDateFilter('All');
                  }}
                >
                  <Text style={[styles.clearAllFiltersText, { color: isDarkMode ? theme.primary : '#ef4444' }]}>Clear all filters</Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.transactionsList}>
            <View style={styles.transactionsHeader}>
              <Text style={[styles.transactionsCount, { color: theme.text }]}>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {filteredTransactions.map(renderTransaction)}
          </View>
        )}
      </ScrollView>

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

      {/* Filter Selection Modal */}
      <Portal>
        <Modal 
          visible={showFilterModal} 
          onDismiss={() => setShowFilterModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={[styles.modalContent, { backgroundColor: theme.card }]} elevation={4}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filter by Date</Text>
              <IconButton
                icon="close"
                size={20}
                iconColor={theme.text}
                onPress={() => setShowFilterModal(false)}
              />
            </View>
            
            <View style={styles.modalBody}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOptionButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    dateFilterType === filter && { backgroundColor: isDarkMode ? theme.primary + '20' : '#6366f110', borderColor: theme.primary }
                  ]}
                  onPress={() => handleFilterPress(filter)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: theme.text },
                    dateFilterType === filter && { color: theme.primary }
                  ]}>
                    {filter}
                  </Text>
                  {dateFilterType === filter && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
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
          <Surface style={[styles.modalContent, { backgroundColor: theme.card }]} elevation={4}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date Range</Text>
              <IconButton
                icon="close"
                size={20}
                iconColor={theme.text}
                onPress={() => setShowDateModal(false)}
              />
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.dateInputContainer}>
                <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>From Date</Text>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                  <Text style={[styles.datePickerText, { color: theme.text }]}>
                    {format(fromDate, 'MMM dd, yyyy')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateInputContainer}>
                <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>To Date</Text>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                  <Text style={[styles.datePickerText, { color: theme.text }]}>
                    {format(toDate, 'MMM dd, yyyy')}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  textColor={theme.text}
                  onPress={() => setShowDateModal(false)}
                  style={[styles.modalButton, { borderColor: theme.border }]}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={applyCustomDateFilter}
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                >
                  Apply
                </Button>
              </View>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Enhanced Stats Section
  statsContainer: {
    paddingVertical: 20,
  },
  statsContent: {
    paddingHorizontal: 16,
  },
  statCard: {
    marginRight: 16,
    minWidth: 160,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  incomeCard: {
    backgroundColor: '#10b981',
  },
  expenseCard: {
    backgroundColor: '#ef4444',
  },
  balanceCard: {
    backgroundColor: '#6366f1',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },

  // Enhanced Filter Section
  filterSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },

  // Filter Pills
  filterPillsContainer: {
    marginBottom: 8,
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

  // Active Filters
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
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
  clearFiltersButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#6366f1',
    borderRadius: 12,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick Stats
  quickStatsBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },

  // Content Section
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsHeader: {
    marginBottom: 16,
  },
  transactionsCount: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },

  // Simple Transaction List Items
  transactionItem: {
    backgroundColor: 'white',
    marginBottom: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  transactionNote: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 44,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Empty State
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 50,
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  clearAllFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 20,
    marginTop: 16,
  },
  clearAllFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  filterOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterOptionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#6366f1',
    fontWeight: '600',
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

export default BankTransactionsScreen;
