import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Text,
  Surface,
  Searchbar,
  List,
  Chip,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HelpScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState({});

  const categories = ['All', 'Getting Started', 'Expenses', 'Reports', 'Account', 'Technical'];

  const faqData = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create my first expense?',
      answer: 'To create your first expense, go to the Transactions tab and tap the "+" button. Select "Add Expense", fill in the amount, choose a category, and add any notes. Tap "Save" to record your expense.',
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I set up categories?',
      answer: 'Go to the Categories tab to view all available categories. You can add new categories by tapping the "+" button. Categories help organize your expenses and make reporting easier.',
    },
    {
      id: 3,
      category: 'Expenses',
      question: 'Can I edit or delete expenses?',
      answer: 'Yes! Tap on any expense in your transaction list to edit it. You can modify the amount, category, date, or notes. To delete an expense, tap the delete button while editing.',
    },
    {
      id: 4,
      category: 'Expenses',
      question: 'What\'s the difference between Cash and Bank transactions?',
      answer: 'Cash transactions track physical money spending, while Bank transactions track card payments, online transfers, etc. This helps you monitor different payment methods separately.',
    },
    {
      id: 5,
      category: 'Reports',
      question: 'How do I view my spending reports?',
      answer: 'Go to the Reports tab to see detailed analytics. You can view charts, category breakdowns, and spending trends. Use filters to focus on specific time periods or categories.',
    },
    {
      id: 6,
      category: 'Reports',
      question: 'Can I export my data?',
      answer: 'Data export functionality will be available in a future update. Currently, you can view and analyze all your data within the app\'s Reports section.',
    },
    {
      id: 7,
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to Profile > Settings > Account Security. You can update your password there. Make sure to use a strong password to protect your financial data.',
    },
    {
      id: 8,
      category: 'Account',
      question: 'Is my financial data secure?',
      answer: 'Yes! We use bank-level encryption to protect your data. All information is stored securely and we never share your personal financial information with third parties.',
    },
    {
      id: 9,
      category: 'Technical',
      question: 'The app is running slowly. What can I do?',
      answer: 'Try closing and reopening the app. If issues persist, restart your device. For older devices, clearing some storage space can help improve performance.',
    },
    {
      id: 10,
      category: 'Technical',
      question: 'I\'m not receiving notifications. How do I fix this?',
      answer: 'Check your phone\'s notification settings for ExpenseTracker Pro. Also, go to Profile > Settings > Notifications to ensure they\'re enabled in the app.',
    },
  ];

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@expensetracker-pro.com?subject=Help Request');
  };

  const handleViewTutorials = () => {
    // In a real app, this might open tutorial videos or walkthroughs
    Linking.openURL('https://expensetracker-pro.com/tutorials');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & FAQ</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search help topics..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            icon={() => <Ionicons name="search" size={20} color="#6b7280" />}
            clearIcon={() => <Ionicons name="close" size={20} color="#6b7280" />}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
            >
              <Chip
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.selectedCategoryChipText
                ]}
              >
                {category}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <Surface style={styles.quickActionsCard} elevation={2}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.quickAction} onPress={handleContactSupport}>
              <View style={styles.quickActionLeft}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#6366f115' }]}>
                  <Ionicons name="mail" size={20} color="#6366f1" />
                </View>
                <View>
                  <Text style={styles.quickActionTitle}>Contact Support</Text>
                  <Text style={styles.quickActionSubtitle}>Get personalized help</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={handleViewTutorials}>
              <View style={styles.quickActionLeft}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#10b98115' }]}>
                  <Ionicons name="play-circle" size={20} color="#10b981" />
                </View>
                <View>
                  <Text style={styles.quickActionTitle}>Video Tutorials</Text>
                  <Text style={styles.quickActionSubtitle}>Watch step-by-step guides</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction} 
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.quickActionLeft}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b15' }]}>
                  <Ionicons name="information-circle" size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.quickActionTitle}>About App</Text>
                  <Text style={styles.quickActionSubtitle}>App info and version</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Surface>

          {/* FAQ Items */}
          <Surface style={styles.faqCard} elevation={2}>
            <Text style={styles.sectionTitle}>
              Frequently Asked Questions ({filteredFAQ.length})
            </Text>
            
            {filteredFAQ.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color="#e5e7eb" />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            ) : (
              filteredFAQ.map((item) => (
                <View key={item.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleExpanded(item.id)}
                  >
                    <View style={styles.faqQuestionContent}>
                      <Text style={styles.faqQuestionText}>{item.question}</Text>
                      <Chip style={styles.categoryTag} textStyle={styles.categoryTagText}>
                        {item.category}
                      </Chip>
                    </View>
                    <Ionicons 
                      name={expandedItems[item.id] ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                  
                  {expandedItems[item.id] && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </Surface>

          {/* Contact Section */}
          <Surface style={styles.contactCard} elevation={2}>
            <Text style={styles.sectionTitle}>Still Need Help?</Text>
            <Text style={styles.contactText}>
              Can't find what you're looking for? Our support team is here to help!
            </Text>
            
            <View style={styles.contactActions}>
              <Button
                mode="contained"
                style={styles.contactButton}
                contentStyle={styles.contactButtonContent}
                onPress={handleContactSupport}
              >
                Contact Support
              </Button>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactInfoItem}>
                <Ionicons name="mail" size={16} color="#6b7280" />
                <Text style={styles.contactInfoText}>support@expensetracker-pro.com</Text>
              </View>
              <View style={styles.contactInfoItem}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.contactInfoText}>Response within 24 hours</Text>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    elevation: 0,
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedCategoryChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryChipText: {
    color: '#64748b',
    fontSize: 14,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  
  // Quick Actions
  quickActionsCard: {
    margin: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 20,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  
  // FAQ
  faqCard: {
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
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 4,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  faqQuestionContent: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  faqAnswer: {
    paddingBottom: 16,
    paddingRight: 32,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Contact
  contactCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    padding: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactActions: {
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  contactButtonContent: {
    height: 44,
  },
  contactInfo: {
    gap: 8,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  bottomSpacing: {
    height: 20,
  },
});

export default HelpScreen;
