import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  SegmentedButtons,
  ActivityIndicator,
  Menu,
  Divider,
  Dialog,
  Portal,
  Surface,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { expenseAPI, categoryAPI } from '../services/api';
import DatePicker from '../components/DatePicker';

const AddExpenseScreen = ({ navigation, route }) => {
  const { transferData } = route.params || {};
  
  const [form, setForm] = useState({
    amount: transferData?.amount || '',
    category: '',
    note: transferData?.note || '',
    date: transferData?.date || new Date().toISOString().split('T')[0],
    method: transferData?.method || 'Cash',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Clear transfer data params when component mounts to avoid persistence
  useEffect(() => {
    if (transferData) {
      // Clear the transfer data from route params to prevent form pollution
      navigation.setParams({ transferData: undefined });
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      // Use the specific expense categories endpoint
      const response = await categoryAPI.getExpenseCategories();
      console.log('Expense categories response:', response);
      
      // Backend returns { categories: [...] }
      const categoriesArray = response.data.categories || [];
      
      const expenseCategories = categoriesArray.map((name, index) => ({
        _id: `expense_${index}_${name}`,
        name,
        type: 'expense'
      }));
      
      console.log('Processed expense categories:', expenseCategories);
      setCategories(expenseCategories);
      
      // Set first category as default if available
      if (expenseCategories.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: expenseCategories[0].name }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await categoryAPI.addExpenseCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategoryDialog(false);
      await loadCategories();
      setForm(prev => ({ ...prev, category: newCategoryName.trim() }));
      Alert.alert('Success', 'Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (!form.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const expenseData = {
        amount: parseFloat(form.amount),
        category: form.category,
        note: form.note || '',
        date: form.date,
        method: form.method,
      };

      await expenseAPI.create(expenseData);
      
      Alert.alert(
        'Success',
        'Expense added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form data but stay on the form
              setForm({
                amount: '',
                category: '',
                note: '',
                date: new Date().toISOString().split('T')[0],
                method: 'Bank',
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to add expense'
      );
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#1e293b" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Add Transaction</Text>
                <Text style={styles.headerSubtitle}>Track your finances</Text>
              </View>
            </View>
            <View style={styles.expenseIcon}>
              <Icon name="plus" size={24} color="#6366f1" />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Type Switch Card */}
          <Surface style={styles.typeSwitchCard}>
            <View style={styles.typeSwitchHeader}>
              <Text style={styles.typeSwitchLabel}>Transaction Type</Text>
            </View>
            <View style={styles.typeSwitch}>
              <TouchableOpacity
                style={[styles.typeSwitchButton, styles.typeSwitchActive]}
                disabled
              >
                <View style={styles.typeSwitchIconContainer}>
                  <Icon name="trending-down" size={18} color="white" />
                </View>
                <Text style={styles.typeSwitchActiveText}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeSwitchButton, styles.typeSwitchInactive]}
                onPress={() => {
                  if (loading) return;
                  // Navigate to Add Income screen with current form data
                  navigation.replace('AddIncome', { 
                    transferData: {
                      amount: form.amount,
                      note: form.note,
                      date: form.date,
                      method: form.method
                    }
                  });
                }}
                disabled={loading}
              >
                <View style={styles.typeSwitchIconContainerInactive}>
                  <Icon name="trending-up" size={18} color="#10b981" />
                </View>
                <Text style={styles.typeSwitchInactiveText}>Income</Text>
              </TouchableOpacity>
            </View>
          </Surface>
          {/* Amount Card */}
          <Surface style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <View style={styles.amountIconContainer}>
                <Icon name="currency-inr" size={20} color="#ef4444" />
              </View>
              <Text style={styles.amountLabel}>Amount</Text>
            </View>
            <TextInput
              value={form.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.amountInput}
              disabled={loading}
              placeholder="0.00"
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: '#ef4444',
                  outline: '#e2e8f0',
                }
              }}
            />
          </Surface>

          {/* Category Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Icon name="tag" size={18} color="#ef4444" />
              </View>
              <Text style={styles.fieldLabel}>Category</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={() => setShowCategoryDropdown(true)}
              disabled={loading}
            >
              <View style={styles.categoryDisplay}>
                <Text style={[
                  styles.categoryText,
                  !form.category && styles.placeholderText
                ]}>
                  {form.category || 'Select Category'}
                </Text>
                <Icon name="chevron-down" size={20} color="#64748b" />
              </View>
            </TouchableOpacity>
          </Surface>

          {/* Note Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Icon name="note-text" size={18} color="#ef4444" />
              </View>
              <Text style={styles.fieldLabel}>Note</Text>
              <Text style={styles.optionalLabel}>Optional</Text>
            </View>
            <TextInput
              value={form.note}
              onChangeText={(value) => handleInputChange('note', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.noteInput}
              disabled={loading}
              placeholder="Add a note for this expense..."
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: '#ef4444',
                  outline: '#e2e8f0',
                }
              }}
            />
          </Surface>

          {/* Date Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Icon name="calendar" size={18} color="#ef4444" />
              </View>
              <Text style={styles.fieldLabel}>Date</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
                style={[styles.input, { flex: 1, justifyContent: 'center', height: 56 }]}
              >
                <Text style={{ color: '#111', fontSize: 16 }}>
                  {form.date}
                </Text>
              </TouchableOpacity>
              <IconButton
                icon="calendar"
                size={28}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
                style={{ marginLeft: 0 }}
                color="#ef4444"
              />
            </View>
            {showDatePicker && (
              <DatePicker
                value={new Date(form.date)}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    handleInputChange('date', selectedDate.toISOString().split('T')[0]);
                  }
                }}
                mode="date"
              />
            )}
          </Surface>

          {/* Payment Method Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={styles.fieldIconContainer}>
                <Icon name="credit-card" size={18} color="#ef4444" />
              </View>
              <Text style={styles.fieldLabel}>Payment Method</Text>
            </View>
            
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  form.method === 'Bank' && styles.methodButtonActive
                ]}
                onPress={() => handleInputChange('method', 'Bank')}
                disabled={loading}
              >
                <View style={[
                  styles.methodIconContainer,
                  form.method === 'Bank' && styles.methodIconActive
                ]}>
                  <Icon 
                    name="bank" 
                    size={20} 
                    color={form.method === 'Bank' ? 'white' : '#64748b'} 
                  />
                </View>
                <Text style={[
                  styles.methodText,
                  form.method === 'Bank' && styles.methodTextActive
                ]}>
                  Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  form.method === 'Cash' && styles.methodButtonActive
                ]}
                onPress={() => handleInputChange('method', 'Cash')}
                disabled={loading}
              >
                <View style={[
                  styles.methodIconContainer,
                  form.method === 'Cash' && styles.methodIconActive
                ]}>
                  <Icon 
                    name="cash" 
                    size={20} 
                    color={form.method === 'Cash' ? 'white' : '#64748b'} 
                  />
                </View>
                <Text style={[
                  styles.methodText,
                  form.method === 'Cash' && styles.methodTextActive
                ]}>
                  Cash
                </Text>
              </TouchableOpacity>
            </View>
          </Surface>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Icon name="plus" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Add Expense</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Portal>
        <Dialog 
          visible={showCategoryDropdown} 
          onDismiss={() => setShowCategoryDropdown(false)}
          style={styles.categoryDialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Select Category</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <ScrollView style={styles.categoriesList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryOption,
                    form.category === category.name && styles.categoryOptionSelected
                  ]}
                  onPress={() => {
                    handleInputChange('category', category.name);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <View style={styles.categoryOptionContent}>
                    <View style={styles.categoryOptionIcon}>
                      <Icon name="tag" size={16} color="#ef4444" />
                    </View>
                    <Text style={[
                      styles.categoryOptionText,
                      form.category === category.name && styles.categoryOptionTextSelected
                    ]}>
                      {category.name}
                    </Text>
                    {form.category === category.name && (
                      <Icon name="check" size={16} color="#ef4444" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.addCategoryOption}
                onPress={() => {
                  setShowCategoryDropdown(false);
                  setShowAddCategoryDialog(true);
                }}
              >
                <View style={styles.categoryOptionContent}>
                  <View style={styles.addCategoryIcon}>
                    <Icon name="plus" size={16} color="#ef4444" />
                  </View>
                  <Text style={styles.addCategoryText}>Add New Category</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Add Category Dialog */}
      <Portal>
        <Dialog 
          visible={showAddCategoryDialog} 
          onDismiss={() => {
            setShowAddCategoryDialog(false);
            setNewCategoryName('');
          }}
          style={styles.addCategoryDialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Add New Category</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              mode="outlined"
              style={styles.categoryNameInput}
              autoFocus
              theme={{
                colors: {
                  primary: '#ef4444',
                  outline: '#e2e8f0',
                }
              }}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              onPress={() => {
                setShowAddCategoryDialog(false);
                setNewCategoryName('');
              }}
              textColor="#64748b"
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
              buttonColor="#ef4444"
            >
              Add Category
            </Button>
          </Dialog.Actions>
        </Dialog>
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
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  keyboardAvoid: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    backgroundColor: 'white',
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Type Switch Card Styles
  typeSwitchCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeSwitchHeader: {
    marginBottom: 16,
  },
  typeSwitchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  
  // Type Switch Styles
  typeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  typeSwitchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  typeSwitchActive: {
    backgroundColor: '#ef4444',
  },
  typeSwitchInactive: {
    backgroundColor: 'transparent',
  },
  typeSwitchIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSwitchIconContainerInactive: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSwitchActiveText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  typeSwitchInactiveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
  },
  
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // Amount Card
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amountLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  
  // Form Cards
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  optionalLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  // Category Selector
  categorySelector: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafbfc',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  
  // Input Styles
  input: {
    backgroundColor: 'transparent',
  },
  noteInput: {
    backgroundColor: 'transparent',
    minHeight: 80,
  },
  inputOutline: {
    borderRadius: 12,
  },
  
  // Payment Method
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fafbfc',
  },
  methodButtonActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  methodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodIconActive: {
    backgroundColor: '#ef4444',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  methodTextActive: {
    color: '#ef4444',
  },
  
  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Dialog Styles
  categoryDialog: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
  },
  addCategoryDialog: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  dialogContent: {
    paddingHorizontal: 0,
  },
  dialogActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  
  // Category List
  categoriesList: {
    maxHeight: 300,
  },
  categoryOption: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryOptionSelected: {
    backgroundColor: '#fef2f2',
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  categoryOptionTextSelected: {
    color: '#ef4444',
    fontWeight: '600',
  },
  addCategoryOption: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  addCategoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addCategoryText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    flex: 1,
  },
  categoryNameInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  
  bottomSpacing: {
    height: 32,
  },
});

export default AddExpenseScreen;
