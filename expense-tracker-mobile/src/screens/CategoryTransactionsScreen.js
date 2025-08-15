import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Surface,
  Text,
  IconButton,
  ActivityIndicator,
  Button,
  Portal,
  Modal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format, parseISO, isToday, isThisWeek, isThisMonth, isThisYear, startOfDay, endOfDay } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

const CategoryTransactionsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryName, categoryType } = route.params;
  
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filterType, setFilterType] = useState('All');
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
    applyFilter();
  }, [allTransactions, filterType, fromDate, toDate]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions based on type
      const endpoint = categoryType === 'income' ? '/incomes' : '/expenses';
      const response = await api.get(endpoint);
      
      // Filter transactions for this specific category
      const filteredTransactions = response.data.filter(
        tx => tx.category === categoryName
      );
      
      // Add display properties
      const processedTransactions = filteredTransactions.map(tx => ({
        ...tx,
        displayAmount: categoryType === 'income' 
          ? `+₹${tx.amount}` 
          : `-₹${tx.amount}`,
        color: categoryType === 'income' ? '#10b981' : '#ef4444',
        icon: categoryType === 'income' ? 'add-circle' : 'remove-circle',
      }));
      
      setAllTransactions(processedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...allTransactions];

    if (filterType === 'Today') {
      filtered = allTransactions.filter(tx => isToday(parseISO(tx.date)));
    } else if (filterType === 'This Week') {
      filtered = allTransactions.filter(tx => isThisWeek(parseISO(tx.date), { weekStartsOn: 1 }));
    } else if (filterType === 'This Month') {
      filtered = allTransactions.filter(tx => isThisMonth(parseISO(tx.date)));
    } else if (filterType === 'This Year') {
      filtered = allTransactions.filter(tx => isThisYear(parseISO(tx.date)));
    } else if (filterType === 'Custom Range' && fromDate && toDate) {
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

  const handleFilterPress = (filter) => {
    if (filter === 'Custom Range') {
      setShowFilterModal(false);
      // Reset to current date when opening custom range
      const today = new Date();
      setFromDate(today);
      setToDate(today);
      setShowDateModal(true);
    } else {
      setFilterType(filter);
      setShowFilterModal(false);
    }
  };

  const applyCustomDateFilter = () => {
    if (fromDate && toDate) {
      setFilterType('Custom Range');
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

  const getTotalAmount = () => {
    return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  };

  const renderTransactionItem = (item) => (
    <Surface key={item._id} style={styles.transactionItem} elevation={1}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionLeft}>
          <View style={styles.transactionRow}>
            <Ionicons 
              name={item.icon} 
              size={16} 
              color={item.color}
              style={styles.transactionIcon}
            />
            <Text style={styles.transactionDate}>
              {format(parseISO(item.date), 'MMM dd, yyyy')}
            </Text>
          </View>
          <Text style={styles.transactionNote}>
            {item.note || 'No note'}
          </Text>
          <View style={[
            styles.methodBadge, 
            { 
              backgroundColor: item.method === 'Bank' ? '#e0e7ff' : '#fef3c7',
              borderColor: item.method === 'Bank' ? '#6366f1' : '#f59e0b'
            }
          ]}>
            <Text style={[
              styles.methodText,
              { color: item.method === 'Bank' ? '#6366f1' : '#f59e0b' }
            ]}>
              {item.method}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: item.color }
          ]}>
            {item.displayAmount}
          </Text>
        </View>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#6366f1" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const headerColor = categoryType === 'income' ? '#10b981' : '#ef4444';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={headerColor} barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="white"
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSubtitle}>
            {categoryType === 'income' ? 'Income' : 'Expense'} Category
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterMainButton, { borderColor: headerColor }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={16} color={headerColor} />
          <Text style={[styles.filterMainButtonText, { color: headerColor }]}>
            {filterType}
          </Text>
          <Ionicons name="chevron-down" size={16} color={headerColor} />
        </TouchableOpacity>
        
        {filterType === 'Custom Range' && fromDate && toDate && (
          <View style={styles.dateRangeDisplay}>
            <Text style={styles.dateRangeText}>
              {format(fromDate, 'MMM dd')} - {format(toDate, 'MMM dd, yyyy')}
            </Text>
          </View>
        )}
      </View>

      {/* Summary Card */}
      <View style={styles.summaryContainer}>
        <Surface style={styles.summaryCard} elevation={2}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryLabel}>Total Transactions</Text>
              <Text style={styles.summaryCount}>{transactions.length}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={[styles.summaryAmount, { color: headerColor }]}>
                {categoryType === 'income' ? '+' : '-'}₹{getTotalAmount().toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Surface>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>
              No transactions found for this category
            </Text>
          </View>
        ) : (
          transactions.map(renderTransactionItem)
        )}
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
              <Text style={styles.modalTitle}>Filter Transactions</Text>
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
                    filterType === filter && [styles.filterOptionButtonActive, { backgroundColor: `${headerColor}15` }]
                  ]}
                  onPress={() => handleFilterPress(filter)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterType === filter && [styles.filterOptionTextActive, { color: headerColor }]
                  ]}>
                    {filter}
                  </Text>
                  {filterType === filter && (
                    <Ionicons name="checkmark" size={20} color={headerColor} />
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
                  style={[styles.modalButton, { backgroundColor: headerColor }]}
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
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  filterMainButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
  },
  filterOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  filterOptionButtonActive: {
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  filterOptionTextActive: {
    fontWeight: '600',
  },
  dateRangeDisplay: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dateRangeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLeft: {
    alignItems: 'center',
  },
  summaryRight: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  transactionContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionIcon: {
    marginRight: 8,
  },
  transactionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionNote: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal styles
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
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
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    minWidth: 80,
  },
});

export default CategoryTransactionsScreen;
