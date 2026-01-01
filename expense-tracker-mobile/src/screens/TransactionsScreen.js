import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  Searchbar,
  Menu,
  Divider,
  ActivityIndicator,
  Surface,
  Portal,
  Modal,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, isToday, isThisWeek, isThisMonth, isThisYear, startOfDay, endOfDay } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { expenseAPI, incomeAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import usePermissions from '../hooks/usePermissions';
import { theme, isDarkMode } from '../utils/theme';

const TransactionsScreen = ({ navigation }) => {
  const { canEdit, canDelete } = usePermissions();
  
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [filterMethod, setFilterMethod] = useState('all'); // all, bank, cash
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Date filter states (same as CategoryTransactionsScreen)
  const [dateFilterType, setDateFilterType] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  
  // Date picker states
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    bankTotal: 0,
    cashTotal: 0,
  });

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

  // Refresh transactions when screen comes into focus (e.g., after editing)
  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const [expenseResponse, incomeResponse] = await Promise.all([
        expenseAPI.getAll(),
        incomeAPI.getAll(),
      ]);

      const expenses = (expenseResponse.data || []).map(expense => ({
        ...expense,
        type: 'expense',
        displayAmount: `-₹${expense.amount}`,
        color: '#ef4444',
        icon: 'remove-circle',
      }));

      const incomes = (incomeResponse.data || []).map(income => ({
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
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (incomes, expenses) => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const bankTransactions = [...incomes, ...expenses].filter(t => t.method === 'Bank');
    const cashTransactions = [...incomes, ...expenses].filter(t => t.method === 'Cash');
    
    const bankTotal = bankTransactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
    
    const cashTotal = cashTransactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);

    setStats({
      totalIncome,
      totalExpenses,
      bankTotal,
      cashTotal,
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

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery)
      );
    }

    setFilteredTransactions(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction),
        },
      ]
    );
  };

  const deleteTransaction = async (transaction) => {
    try {
      if (transaction.type === 'expense') {
        await expenseAPI.delete(transaction._id);
      } else {
        await incomeAPI.delete(transaction._id);
      }
      await loadTransactions();
      Alert.alert('Success', 'Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderTransaction = (transaction) => (
    <TouchableOpacity
      key={transaction._id}
      onPress={() => navigation.navigate('EditTransaction', { transaction })}
      activeOpacity={0.7}
    >
      <Surface style={[styles.transactionCard, { backgroundColor: theme.card }]} elevation={2}>
        <View style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: `${transaction.color}15` }
            ]}>
              <Ionicons 
                name={transaction.icon} 
                size={20} 
                color={transaction.color}
              />
            </View>
            <View style={styles.transactionDetails}>
              <View style={styles.categoryRow}>
                <Text style={[styles.categoryName, { color: theme.text }]}>{transaction.category}</Text>
                <View style={[
                  styles.methodBadge,
                  {
                    backgroundColor: transaction.method === 'Bank' ? (isDarkMode ? '#3730a320' : '#e0e7ff') : (isDarkMode ? '#92400e20' : '#fef3c7'),
                    borderColor: transaction.method === 'Bank' ? '#6366f1' : '#f59e0b'
                  }
                ]}>
                  <Ionicons
                    name={transaction.method === 'Bank' ? 'card' : 'cash'}
                    size={10}
                    color={transaction.method === 'Bank' ? '#6366f1' : '#f59e0b'}
                  />
                  <Text style={[
                    styles.methodText,
                    { color: transaction.method === 'Bank' ? '#6366f1' : '#f59e0b' }
                  ]}>
                    {transaction.method}
                  </Text>
                </View>
              </View>
              
              {transaction.note && (
                <Text style={[styles.transactionNote, { color: theme.textSecondary }]} numberOfLines={1}>
                  {transaction.note}
                </Text>
              )}
              
              <View style={styles.dateTimeRow}>
                <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                <Text style={styles.transactionDate}>
                  {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.transactionRight}>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.color }
            ]}>
              {transaction.displayAmount}
            </Text>
            
            <View style={styles.actionButtons}>
              {/* Edit button - only show if user can edit */}
              {canEdit() && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('EditTransaction', { transaction });
                  }}
                >
                  <Ionicons name="pencil" size={16} color="#6366f1" />
                </TouchableOpacity>
              )}
              
              {/* Delete button - only show if user can delete */}
              {canDelete() && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteTransaction(transaction);
                  }}
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
              
              {/* If no edit/delete permissions, show a view-only indicator */}
              {!canEdit() && !canDelete() && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    // Just show transaction details or do nothing
                  }}
                >
                  <Ionicons name="eye" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: theme.card }]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search by category, note, or amount..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: isDarkMode ? theme.surface : '#f9fafb' }]}
            iconColor={theme.primary}
            inputStyle={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
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
            style={[styles.filterPill, styles.dateFilterPill, { borderColor: theme.primary, backgroundColor: isDarkMode ? theme.surface : '#ffffff' }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={theme.primary} />
            <Text style={[styles.filterPillText, { color: theme.primary }]}>{dateFilterType}</Text>
            <Ionicons name="chevron-down" size={14} color={theme.primary} />
          </TouchableOpacity>
          
          {/* Type Filters */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              { backgroundColor: isDarkMode ? theme.surface : '#ffffff', borderColor: theme.border },
              filterType === 'all' && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
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
              { backgroundColor: isDarkMode ? theme.surface : '#ffffff', borderColor: theme.border },
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
              { backgroundColor: isDarkMode ? theme.surface : '#ffffff', borderColor: theme.border },
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
        
        {/* Quick Navigation Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickNavContainer}
          contentContainerStyle={styles.quickNavContent}
        >
          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => navigation.navigate('BankTransactions')}
          >
            <Ionicons name="card" size={16} color="#6366f1" />
            <Text style={styles.quickNavText}>Bank Transactions</Text>
            <Ionicons name="arrow-forward" size={14} color="#6366f1" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickNavPill}
            onPress={() => navigation.navigate('CashTransactions')}
          >
            <Ionicons name="cash" size={16} color="#f59e0b" />
            <Text style={styles.quickNavText}>Cash Transactions</Text>
            <Ionicons name="arrow-forward" size={14} color="#f59e0b" />
          </TouchableOpacity>
        </ScrollView>
        
        {/* Active Filters Display */}
        {(dateFilterType !== 'All' || filterType !== 'all') && (
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
                {filterType !== 'all' && (
                  <View style={styles.activeFilterTag}>
                    <Text style={styles.activeFilterTagText}>{filterType}</Text>
                    <TouchableOpacity onPress={() => setFilterType('all')}>
                      <Ionicons name="close" size={12} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Quick Stats Bar */}
      {filteredTransactions.length > 0 && (
        <View style={[styles.quickStatsBar, { backgroundColor: theme.card }]}>
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Showing</Text>
            <Text style={[styles.quickStatValue, { color: theme.text }]}>{filteredTransactions.length}</Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Total Amount</Text>
            <Text style={[styles.quickStatValue, { color: theme.text }]}>
              ₹{filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      )}

      {/* Transactions List */}
      <ScrollView
        style={[styles.transactionsList, { backgroundColor: theme.background }]}
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
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="receipt-outline" size={64} color={theme.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No transactions found</Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
              {searchQuery || filterType !== 'all' || dateFilterType !== 'All'
                ? 'Try adjusting your filters to see more results'
                : 'Start by adding your first transaction'
              }
            </Text>
            {(searchQuery || filterType !== 'all' || dateFilterType !== 'All') && (
              <TouchableOpacity
                style={[styles.clearFiltersButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setDateFilterType('All');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            {filteredTransactions.map(renderTransaction)}
            <View style={styles.bottomSpacing} />
          </View>
        )}
      </ScrollView>

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
                    { backgroundColor: isDarkMode ? theme.surface : '#f9fafb' },
                    dateFilterType === filter && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Header Section
  headerSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
  },
  
  // Filters Section
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchContainer: {
    marginBottom: 12,
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
  
  // Quick Navigation
  quickNavContainer: {
    marginTop: 8,
  },
  quickNavContent: {
    paddingRight: 16,
  },
  quickNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickNavText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginHorizontal: 8,
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
  
  // Transactions List
  transactionsList: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  transactionContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  viewButton: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 20,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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

export default TransactionsScreen;
