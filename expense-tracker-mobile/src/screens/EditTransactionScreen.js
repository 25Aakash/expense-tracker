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
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  SegmentedButtons,
  ActivityIndicator,
  Dialog,
  Portal,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { expenseAPI, incomeAPI, categoryAPI } from '../services/api';
import { theme } from '../utils/theme';

const EditTransactionScreen = ({ route, navigation }) => {
  const { transaction } = route.params || {};
  
  const [form, setForm] = useState({
    amount: '',
    category: '',
    note: '',
    date: '',
    method: 'Bank',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const isExpense = transaction?.type === 'expense';
  const primaryColor = isExpense ? '#ef4444' : '#10b981';
  const backgroundColor = isExpense ? '#fef2f2' : '#f0fdf4';

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount.toString(),
        category: transaction.category || '',
        note: transaction.note || '',
        date: transaction.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        method: transaction.method || 'Bank',
      });
    }
    loadCategories();
  }, [transaction]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryAPI.getAll();
      const filteredCategories = (response.data || []).filter(cat => 
        cat.type === transaction?.type
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
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
      
      const transactionData = {
        amount: parseFloat(form.amount),
        category: form.category,
        note: form.note || '',
        date: form.date,
        method: form.method,
      };

      if (transaction.type === 'expense') {
        await expenseAPI.update(transaction._id, transactionData);
      } else {
        await incomeAPI.update(transaction._id, transactionData);
      }
      
      Alert.alert(
        'Success',
        'Transaction updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update transaction'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconContainer}>
              <Icon name="alert-circle" size={48} color="#ef4444" />
            </View>
            <Text style={styles.errorTitle}>Transaction Not Found</Text>
            <Text style={styles.errorText}>No transaction data was provided</Text>
            <TouchableOpacity 
              style={styles.errorButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color="white" />
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (categoriesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={primaryColor} />
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
                <Text style={styles.headerTitle}>
                  Edit {isExpense ? 'Expense' : 'Income'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  Update transaction details
                </Text>
              </View>
            </View>
            <View style={[styles.transactionIcon, { backgroundColor }]}>
              <Icon 
                name={isExpense ? 'trending-down' : 'trending-up'} 
                size={24} 
                color={primaryColor} 
              />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount Card */}
          <Surface style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <View style={[styles.amountIconContainer, { backgroundColor }]}>
                <Icon name="currency-inr" size={20} color={primaryColor} />
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
                  primary: primaryColor,
                  outline: '#e2e8f0',
                }
              }}
            />
          </Surface>

          {/* Category Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIconContainer, { backgroundColor }]}>
                <Icon name="tag" size={18} color={primaryColor} />
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
              <View style={[styles.fieldIconContainer, { backgroundColor }]}>
                <Icon name="note-text" size={18} color={primaryColor} />
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
              placeholder="Add a note for this transaction..."
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: primaryColor,
                  outline: '#e2e8f0',
                }
              }}
            />
          </Surface>

          {/* Date Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIconContainer, { backgroundColor }]}>
                <Icon name="calendar" size={18} color={primaryColor} />
              </View>
              <Text style={styles.fieldLabel}>Date</Text>
            </View>
            <TextInput
              value={form.date}
              onChangeText={(value) => handleInputChange('date', value)}
              mode="outlined"
              style={styles.input}
              disabled={loading}
              placeholder="YYYY-MM-DD"
              outlineStyle={styles.inputOutline}
              theme={{
                colors: {
                  primary: primaryColor,
                  outline: '#e2e8f0',
                }
              }}
            />
          </Surface>

          {/* Payment Method Card */}
          <Surface style={styles.formCard}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIconContainer, { backgroundColor }]}>
                <Icon name="credit-card" size={18} color={primaryColor} />
              </View>
              <Text style={styles.fieldLabel}>Payment Method</Text>
            </View>
            
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  form.method === 'Bank' && { ...styles.methodButtonActive, borderColor: primaryColor, backgroundColor }
                ]}
                onPress={() => handleInputChange('method', 'Bank')}
                disabled={loading}
              >
                <View style={[
                  styles.methodIconContainer,
                  form.method === 'Bank' && { backgroundColor: primaryColor }
                ]}>
                  <Icon 
                    name="bank" 
                    size={20} 
                    color={form.method === 'Bank' ? 'white' : '#64748b'} 
                  />
                </View>
                <Text style={[
                  styles.methodText,
                  form.method === 'Bank' && { color: primaryColor }
                ]}>
                  Bank
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  form.method === 'Cash' && { ...styles.methodButtonActive, borderColor: primaryColor, backgroundColor }
                ]}
                onPress={() => handleInputChange('method', 'Cash')}
                disabled={loading}
              >
                <View style={[
                  styles.methodIconContainer,
                  form.method === 'Cash' && { backgroundColor: primaryColor }
                ]}>
                  <Icon 
                    name="cash" 
                    size={20} 
                    color={form.method === 'Cash' ? 'white' : '#64748b'} 
                  />
                </View>
                <Text style={[
                  styles.methodText,
                  form.method === 'Cash' && { color: primaryColor }
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
              style={[styles.submitButton, { backgroundColor: primaryColor }, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Update</Text>
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
                    form.category === category.name && { backgroundColor }
                  ]}
                  onPress={() => {
                    handleInputChange('category', category.name);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <View style={styles.categoryOptionContent}>
                    <View style={[styles.categoryOptionIcon, { backgroundColor }]}>
                      <Icon name="tag" size={16} color={primaryColor} />
                    </View>
                    <Text style={[
                      styles.categoryOptionText,
                      form.category === category.name && { color: primaryColor, fontWeight: '600' }
                    ]}>
                      {category.name}
                    </Text>
                    {form.category === category.name && (
                      <Icon name="check" size={16} color={primaryColor} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 300,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    gap: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 2,
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
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
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
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  dialogContent: {
    paddingHorizontal: 0,
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
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
  
  bottomSpacing: {
    height: 32,
  },
});

export default EditTransactionScreen;
