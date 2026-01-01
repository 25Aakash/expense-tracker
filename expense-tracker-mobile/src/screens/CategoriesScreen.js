import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  FAB,
  List,
  ActivityIndicator,
  IconButton,
  Badge,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { categoryAPI, expenseAPI, incomeAPI } from '../services/api';
import { format, parseISO } from 'date-fns';
import { theme, isDarkMode } from '../utils/theme';

const { width } = Dimensions.get('window');

const CategoriesScreen = () => {
  const navigation = useNavigation();
  
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [allIncomes, setAllIncomes] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0); // 0 = Expenses, 1 = Income
  const [scrollViewRef, setScrollViewRef] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories and transactions in parallel
      const [categoriesResponse, incomesResponse, expensesResponse] = await Promise.all([
        categoryAPI.getAll(),
        incomeAPI.getAll(),
        expenseAPI.getAll()
      ]);
      
      const categories = categoriesResponse.data || [];
      
      // Process expenses with type and display format (same as TransactionsScreen)
      const processedExpenses = (expensesResponse.data || []).map(expense => ({
        ...expense,
        type: 'expense',
        displayAmount: `-₹${expense.amount}`,
        color: '#ef4444',
        icon: 'remove-circle',
      }));

      // Process incomes with type and display format (same as TransactionsScreen)
      const processedIncomes = (incomesResponse.data || []).map(income => ({
        ...income,
        type: 'income',
        displayAmount: `+₹${income.amount}`,
        color: '#10b981',
        icon: 'add-circle',
      }));
      
      setIncomeCategories(categories.filter(cat => cat.type === 'income'));
      setExpenseCategories(categories.filter(cat => cat.type === 'expense'));
      setAllIncomes(processedIncomes);
      setAllExpenses(processedExpenses);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionCount = (categoryName, type) => {
    const transactions = type === 'income' ? allIncomes : allExpenses;
    const filtered = transactions.filter(tx => tx.category === categoryName);
    return filtered.length;
  };

  const getTransactionsForCategory = (categoryName, type) => {
    const transactions = type === 'income' ? allIncomes : allExpenses;
    const filtered = transactions.filter(tx => tx.category === categoryName);
    return filtered;
  };

  const getTotalAmount = (categoryName, type) => {
    const transactions = getTransactionsForCategory(categoryName, type);
    return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  };

  const handleCategoryPress = (categoryName, type) => {
    
    // Navigate to CategoryTransactionsScreen
    navigation.navigate('CategoryTransactions', {
      categoryName: categoryName,
      categoryType: type,
    });
  };

  const switchTab = (tabIndex) => {
    setActiveTab(tabIndex);
    if (scrollViewRef) {
      scrollViewRef.scrollTo({
        x: tabIndex * width,
        animated: true,
      });
    }
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentTab = Math.round(offsetX / width);
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await categoryAPI.create({
        name: newCategory.trim(),
        type: categoryType,
      });
      
      setNewCategory('');
      setShowAddForm(false);
      await loadData();
      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(category),
        },
      ]
    );
  };

  const deleteCategory = async (category) => {
    try {
      await categoryAPI.delete(category);
      await loadData();
      Alert.alert('Success', 'Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  const renderCategoryItem = (category, type) => {
    const transactionCount = getTransactionCount(category.name, type);
    const totalAmount = getTotalAmount(category.name, type);
    const color = type === 'income' ? '#10b981' : '#ef4444';
    const icon = type === 'income' ? 'add-circle' : 'remove-circle';
    
    return (
      <TouchableOpacity
        key={category._id}
        onPress={() => handleCategoryPress(category.name, type)}
        activeOpacity={0.7}
      >
        <Surface style={[styles.categoryItem, { backgroundColor: theme.card }]} elevation={2}>
          <View style={styles.categoryContent}>
            <View style={styles.categoryLeft}>
              <View style={[
                styles.categoryIconContainer,
                { backgroundColor: `${color}15` }
              ]}>
                <Ionicons 
                  name={icon} 
                  size={24} 
                  color={color} 
                />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                <View style={styles.categoryStats}>
                  <Text style={[styles.categoryAmount, { color }]}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.transactionInfo}>
                    <Ionicons name="receipt-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.transactionCount, { color: theme.textSecondary }]}>
                      {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.categoryRight}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
              <View style={styles.chevronContainer}>
                <Ionicons name="chevron-forward" size={20} color={theme.border} />
              </View>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderTabContent = (categories, type, title) => {
    const totalTransactions = categories.reduce((sum, cat) => 
      sum + getTransactionCount(cat.name, type), 0
    );
    const totalAmount = categories.reduce((sum, cat) => 
      sum + getTotalAmount(cat.name, type), 0
    );
    
    return (
      <View style={styles.tabContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Statistics Card */}
          {categories.length > 0 && (
            <Surface style={styles.statsCard} elevation={2}>
              <View style={styles.statsContent}>
                <View style={styles.statItem}>
                  <View style={[
                    styles.statIconContainer,
                    { backgroundColor: type === 'income' ? '#f0fdf4' : '#fef2f2' }
                  ]}>
                    <Ionicons 
                      name={type === 'income' ? 'trending-up' : 'trending-down'} 
                      size={20} 
                      color={type === 'income' ? '#10b981' : '#ef4444'} 
                    />
                  </View>
                  <View style={styles.statDetails}>
                    <Text style={styles.statLabel}>Total Amount</Text>
                    <Text style={[
                      styles.statValue, 
                      { color: type === 'income' ? '#10b981' : '#ef4444' }
                    ]}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <View style={[
                    styles.statIconContainer,
                    { backgroundColor: '#f8fafc' }
                  ]}>
                    <Ionicons name="receipt" size={20} color="#64748b" />
                  </View>
                  <View style={styles.statDetails}>
                    <Text style={styles.statLabel}>Transactions</Text>
                    <Text style={styles.statValue}>
                      {totalTransactions}
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>
          )}
          
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: type === 'income' ? '#10b981' : '#ef4444' }]}>
              {title}
            </Text>
            <View style={styles.categoryCountContainer}>
              <Text style={styles.categoryCountLabel}>{categories.length}</Text>
              <Text style={styles.categoryCountText}>
                categor{categories.length === 1 ? 'y' : 'ies'}
              </Text>
            </View>
          </View>
          
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons 
                  name={type === 'income' ? 'add-circle-outline' : 'remove-circle-outline'} 
                  size={64} 
                  color="#e2e8f0" 
                />
              </View>
              <Text style={styles.emptyTitle}>No {title}</Text>
              <Text style={styles.emptyText}>
                Add your first {type} category to get started tracking your {type}s
              </Text>
              <TouchableOpacity
                style={[styles.addFirstButton, { borderColor: type === 'income' ? '#10b981' : '#ef4444' }]}
                onPress={() => {
                  setCategoryType(type);
                  setShowAddForm(true);
                }}
              >
                <Ionicons 
                  name="add" 
                  size={16} 
                  color={type === 'income' ? '#10b981' : '#ef4444'} 
                />
                <Text style={[styles.addFirstText, { color: type === 'income' ? '#10b981' : '#ef4444' }]}>
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.categoriesList}>
              {categories.map(category => renderCategoryItem(category, type))}
            </View>
          )}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Enhanced Tab Header */}
      <View style={[styles.tabHeaderContainer, { backgroundColor: theme.card }]}>
        <View style={styles.tabHeader}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              { backgroundColor: isDarkMode ? theme.surface : '#ffffff' },
              activeTab === 0 && { backgroundColor: isDarkMode ? '#7f1d1d20' : '#fef2f2', borderColor: '#ef4444' }
            ]}
            onPress={() => switchTab(0)}
          >
            <View style={[
              styles.tabIconContainer,
              { backgroundColor: activeTab === 0 ? '#ef4444' : (isDarkMode ? theme.card : '#f1f5f9') }
            ]}>
              <Ionicons 
                name="remove" 
                size={16} 
                color={activeTab === 0 ? 'white' : theme.textSecondary} 
              />
            </View>
            <View style={styles.tabTextContainer}>
              <Text style={[
                styles.tabButtonText,
                { color: theme.text },
                activeTab === 0 && { color: '#ef4444', fontWeight: '600' }
              ]}>
                Expenses
              </Text>
              <Text style={[styles.tabSubText, { color: theme.textSecondary }]}>
                {expenseCategories.length} categories
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 1 && styles.tabButtonActive,
              activeTab === 1 && { backgroundColor: '#f0fdf4', borderColor: '#10b981' }
            ]}
            onPress={() => switchTab(1)}
          >
            <View style={[
              styles.tabIconContainer,
              { backgroundColor: activeTab === 1 ? '#10b981' : '#f1f5f9' }
            ]}>
              <Ionicons 
                name="add" 
                size={16} 
                color={activeTab === 1 ? 'white' : '#64748b'} 
              />
            </View>
            <View style={styles.tabTextContainer}>
              <Text style={[
                styles.tabButtonText,
                activeTab === 1 && { color: '#10b981', fontWeight: '600' }
              ]}>
                Income
              </Text>
              <Text style={styles.tabSubText}>
                {incomeCategories.length} categories
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Enhanced Tab Indicator */}
        <View style={styles.tabIndicatorContainer}>
          <View style={[
            styles.tabIndicator,
            {
              left: activeTab === 0 ? '4%' : '54%',
              backgroundColor: activeTab === 0 ? '#ef4444' : '#10b981'
            }
          ]} />
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        ref={setScrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.tabContentContainer}
      >
        {/* Expense Categories Tab */}
        <View style={styles.tabPage}>
          {renderTabContent(expenseCategories, 'expense', 'Expense Categories')}
        </View>
        
        {/* Income Categories Tab */}
        <View style={styles.tabPage}>
          {renderTabContent(incomeCategories, 'income', 'Income Categories')}
        </View>
      </ScrollView>

      {/* Add Category Form Modal */}
      {showAddForm && (
        <View style={styles.modalOverlay}>
          <Surface style={styles.addFormModal} elevation={4}>
            <View style={styles.addFormHeader}>
              <Title>Add New Category</Title>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setShowAddForm(false)}
              />
            </View>
            
            <View style={styles.addFormContent}>
              <View style={styles.typeSelection}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    categoryType === 'expense' && styles.typeButtonActive
                  ]}
                  onPress={() => setCategoryType('expense')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    categoryType === 'expense' && styles.typeButtonTextActive
                  ]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    categoryType === 'income' && styles.typeButtonActive
                  ]}
                  onPress={() => setCategoryType('income')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    categoryType === 'income' && styles.typeButtonTextActive
                  ]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                mode="outlined"
                label="Category Name"
                value={newCategory}
                onChangeText={setNewCategory}
                style={styles.categoryInput}
              />

              <View style={styles.addFormActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowAddForm(false)}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddCategory}
                  style={styles.actionButton}
                >
                  Add Category
                </Button>
              </View>
            </View>
          </Surface>
        </View>
      )}

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddForm(true)}
        label="Add Category"
      />
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
  
  // Enhanced Tab Header Styles
  tabHeaderContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tabHeader: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  tabButtonActive: {
    borderWidth: 2,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tabTextContainer: {
    flex: 1,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  tabSubText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  tabIndicatorContainer: {
    height: 3,
    marginTop: 12,
    marginHorizontal: 16,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '42%',
    height: 3,
    borderRadius: 2,
  },
  
  // Tab Content Styles
  tabContentContainer: {
    flex: 1,
  },
  tabPage: {
    width: width,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Statistics Card
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statDetails: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryCountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  categoryCountLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 4,
  },
  categoryCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Category Items
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryStats: {
    flexDirection: 'column',
    gap: 4,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCount: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  chevronContainer: {
    padding: 4,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginHorizontal: 16,
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
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  addFirstText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  addFormModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxWidth: width * 0.9,
    width: '100%',
    maxHeight: '80%',
  },
  addFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addFormContent: {
    padding: 20,
  },
  addFormActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  
  // Type Selection
  typeSelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  typeButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#6366f1',
  },
  
  // Form Inputs
  categoryInput: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },
});

export default CategoriesScreen;
