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
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  List,
  Chip,
  Button,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  TextInput,
  Checkbox,
  Surface,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { managerAPI } from '../services/api';
import { format } from 'date-fns';

const PERMISSIONS = [
  { key: 'canAdd', label: 'Can Add', icon: 'add-circle-outline' },
  { key: 'canEdit', label: 'Can Edit', icon: 'create-outline' },
  { key: 'canDelete', label: 'Can Delete', icon: 'trash-outline' },
  { key: 'canViewTeam', label: 'Can View Team', icon: 'people-outline' },
  { key: 'canManageUsers', label: 'Can Manage Users', icon: 'person-add-outline' },
  { key: 'canExport', label: 'Can Export', icon: 'download-outline' },
  { key: 'canAccessReports', label: 'Can Access Reports', icon: 'analytics-outline' },
];

const { width: screenWidth } = Dimensions.get('window');

const ManagerDashboardScreen = () => {
  const [teamUsers, setTeamUsers] = useState([]);
  const [teamTransactions, setTeamTransactions] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    permissions: Object.fromEntries(PERMISSIONS.map(p => [p.key, false]))
  });
  const [stats, setStats] = useState({
    totalTeamMembers: 0,
    totalTeamExpenses: 0,
    totalTeamIncome: 0,
    activeUsers: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'manager') {
      loadManagerData();
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [teamUsers, searchQuery]);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      const [usersResponse, transactionsResponse] = await Promise.all([
        managerAPI.getTeamUsers(),
        managerAPI.getTeamTransactions(),
      ]);

      const users = usersResponse.data || [];
      const transactionData = transactionsResponse.data || {};
      
      // Extract incomes and expenses from the response
      const incomes = transactionData.incomes || [];
      const expenses = transactionData.expenses || [];
      
      // Combine into a single transactions array with type field
      const transactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' })),
        ...incomes.map(i => ({ ...i, type: 'income' }))
      ];

      setTeamUsers(users);
      setTeamTransactions(transactions);
      calculateStats(users, transactions);
    } catch (error) {
      console.error('Error loading manager data:', error);
      Alert.alert('Error', 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (users, transactions) => {
    // Ensure transactions is an array
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    
    const expenses = transactionsArray.filter(t => t.type === 'expense');
    const incomes = transactionsArray.filter(t => t.type === 'income');
    
    const stats = {
      totalTeamMembers: users.length,
      totalTeamExpenses: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      totalTeamIncome: incomes.reduce((sum, i) => sum + (i.amount || 0), 0),
      activeUsers: users.filter(u => u.isActive !== false).length,
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = teamUsers;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadManagerData().then(() => setRefreshing(false));
  }, []);

  const handleAddMember = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email, Password)');
      return;
    }

    try {
      setAddingUser(true);
      await managerAPI.addUserUnderManager(formData);
      Alert.alert('Success', 'Team member added successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
        permissions: Object.fromEntries(PERMISSIONS.map(p => [p.key, false]))
      });
      
      setShowAddDialog(false);
      loadManagerData(); // Refresh the data
    } catch (error) {
      console.error('Error adding team member:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add team member';
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingUser(false);
    }
  };

  const handleCancelAdd = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      permissions: Object.fromEntries(PERMISSIONS.map(p => [p.key, false]))
    });
    setShowAddDialog(false);
  };

  const handleViewUserDetails = async (userId, userName) => {
    try {
      const [userResponse, expensesResponse, incomesResponse] = await Promise.all([
        managerAPI.getManagedUser(userId),
        managerAPI.getManagedUserExpenses(userId),
        managerAPI.getManagedUserIncomes(userId),
      ]);

      const userData = userResponse.data;
      const expenses = expensesResponse.data || [];
      const incomes = incomesResponse.data || [];

      const memberStats = {
        name: userName,
        role: userData.role || 'User',
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalIncome: incomes.reduce((sum, i) => sum + i.amount, 0),
        transactionCount: expenses.length + incomes.length,
        expenseCount: expenses.length,
        incomeCount: incomes.length,
        recentTransactions: [...expenses, ...incomes]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5),
        balance: incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0)
      };

      setSelectedMemberDetails(memberStats);
      setShowMemberDetails(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    Alert.alert(
      'Remove Team Member',
      `Are you sure you want to remove "${userName}" from your team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await managerAPI.deleteManagedUser(userId);
              loadManagerData();
              Alert.alert('Success', 'Team member removed successfully');
            } catch (error) {
              console.error('Error removing team member:', error);
              Alert.alert('Error', 'Failed to remove team member');
            }
          },
        },
      ]
    );
  };

  const renderTeamMemberGrid = (member) => (
    <Surface key={member._id} style={styles.memberGridCard} elevation={2}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.memberCardGradient}
      >
        <View style={styles.memberGridHeader}>
          <View style={styles.memberAvatarContainer}>
            <View style={[styles.memberAvatar, { backgroundColor: member.isActive !== false ? '#10b981' : '#6b7280' }]}>
              <Text style={styles.memberAvatarText}>
                {member.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Chip
              style={[styles.statusChipSmall, { 
                backgroundColor: member.isActive !== false ? '#dcfce7' : '#f3f4f6' 
              }]}
              textStyle={[styles.statusChipTextSmall, {
                color: member.isActive !== false ? '#166534' : '#6b7280'
              }]}
            >
              {member.isActive !== false ? 'Active' : 'Inactive'}
            </Chip>
          </View>
        </View>
        
        <View style={styles.memberGridInfo}>
          <Text style={styles.memberGridName} numberOfLines={1}>{member.name}</Text>
          <Text style={styles.memberGridEmail} numberOfLines={1}>{member.email}</Text>
          <Text style={styles.memberGridRole}>{member.role || 'User'}</Text>
        </View>
        
        <View style={styles.memberGridActions}>
          <TouchableOpacity 
            style={styles.gridActionButton}
            onPress={() => handleViewUserDetails(member._id, member.name)}
          >
            <Ionicons name="eye-outline" size={18} color="#6366f1" />
            <Text style={styles.gridActionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.gridActionButton, styles.deleteActionButton]}
            onPress={() => handleDeleteUser(member._id, member.name)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.deleteActionText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderTeamMember = (member) => (
    <Surface key={member._id} style={styles.memberCard} elevation={1}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.memberCardGradient}
      >
        <View style={styles.memberHeader}>
          <View style={styles.memberInfoContainer}>
            <View style={styles.memberAvatarRow}>
              <View style={[styles.memberAvatar, { backgroundColor: member.isActive !== false ? '#10b981' : '#6b7280' }]}>
                <Text style={styles.memberAvatarText}>
                  {member.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
                {member.mobile && (
                  <Text style={styles.memberMobile}>📱 {member.mobile}</Text>
                )}
                <View style={styles.memberMetaRow}>
                  <Text style={styles.memberRole}>👤 {member.role || 'User'}</Text>
                  <Chip
                    style={[styles.statusChip, { 
                      backgroundColor: member.isActive !== false ? '#dcfce7' : '#f3f4f6' 
                    }]}
                    textStyle={[styles.statusChipText, {
                      color: member.isActive !== false ? '#166534' : '#6b7280'
                    }]}
                  >
                    {member.isActive !== false ? 'Active' : 'Inactive'}
                  </Chip>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.memberActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewUserDetails(member._id, member.name)}
          >
            <Ionicons name="analytics-outline" size={20} color="#6366f1" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(member._id, member.name)}
          >
            <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Surface>
  );

  if (user?.role !== 'manager') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Access Denied</Title>
              <Text style={styles.errorText}>Manager access required</Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading team dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc', '#ffffff']}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Team Dashboard</Text>
              <Text style={styles.headerSubtitle}>Manage your team members</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={() => setShowAddDialog(true)}
            >
              <Ionicons name="person-add" size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <Surface style={[styles.statCard, styles.statCardMembers]} elevation={3}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons name="people" size={24} color="#fff" />
                  </View>
                  <Text style={styles.statLabel}>Team Members</Text>
                  <Text style={styles.statValue}>{stats.totalTeamMembers}</Text>
                </LinearGradient>
              </Surface>

              <Surface style={[styles.statCard, styles.statCardActive]} elevation={3}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  </View>
                  <Text style={styles.statLabel}>Active Users</Text>
                  <Text style={styles.statValue}>{stats.activeUsers}</Text>
                </LinearGradient>
              </Surface>

              <Surface style={[styles.statCard, styles.statCardExpenses]} elevation={3}>
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons name="trending-down" size={24} color="#fff" />
                  </View>
                  <Text style={styles.statLabel}>Team Expenses</Text>
                  <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                    ₹{stats.totalTeamExpenses.toLocaleString()}
                  </Text>
                </LinearGradient>
              </Surface>

              <Surface style={[styles.statCard, styles.statCardIncome]} elevation={3}>
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons name="trending-up" size={24} color="#fff" />
                  </View>
                  <Text style={styles.statLabel}>Team Income</Text>
                  <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                    ₹{stats.totalTeamIncome.toLocaleString()}
                  </Text>
                </LinearGradient>
              </Surface>
            </View>
          </View>

          {/* Search and View Toggle */}
          <View style={styles.controlsContainer}>
            <Searchbar
              placeholder="Search team members..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              icon={() => <Ionicons name="search" size={20} color="#6b7280" />}
              clearIcon={() => <Ionicons name="close" size={20} color="#6b7280" />}
            />
            <SegmentedButtons
              value={viewMode}
              onValueChange={setViewMode}
              buttons={[
                {
                  value: 'list',
                  label: 'List',
                  icon: 'format-list-bulleted',
                },
                {
                  value: 'grid',
                  label: 'Grid',
                  icon: 'grid',
                },
              ]}
              style={styles.viewToggle}
            />
          </View>

          {/* Team Members */}
          <ScrollView
            style={styles.membersContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Team Members</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredUsers.length} of {teamUsers.length} members
              </Text>
            </View>

            {filteredUsers.length === 0 ? (
              <Surface style={styles.emptyCard} elevation={1}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.emptyCardGradient}
                >
                  <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyTitle}>No Team Members Found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first team member'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity 
                      style={styles.emptyAction}
                      onPress={() => setShowAddDialog(true)}
                    >
                      <Text style={styles.emptyActionText}>Add Team Member</Text>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </Surface>
            ) : (
              <View style={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}>
                {filteredUsers.map(member => 
                  viewMode === 'grid' ? renderTeamMemberGrid(member) : renderTeamMember(member)
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      {/* FAB for adding team members */}
      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
        label="Add Member"
        color="#fff"
      />

      {/* Member Details Modal */}
      <Portal>
        <Dialog 
          visible={showMemberDetails} 
          onDismiss={() => setShowMemberDetails(false)}
          style={styles.memberDetailsDialog}
        >
          {selectedMemberDetails && (
            <View>
              <Dialog.Title style={styles.dialogTitle}>
                {selectedMemberDetails.name}'s Details
              </Dialog.Title>
              <Dialog.Content>
                <ScrollView style={styles.memberDetailsContent}>
                  {/* Balance Card */}
                  <Surface style={styles.balanceCard} elevation={2}>
                    <LinearGradient
                      colors={selectedMemberDetails.balance >= 0 ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
                      style={styles.balanceCardGradient}
                    >
                      <Text style={styles.balanceLabel}>Current Balance</Text>
                      <Text style={styles.balanceValue}>
                        ₹{Math.abs(selectedMemberDetails.balance).toLocaleString()}
                      </Text>
                      <Text style={styles.balanceStatus}>
                        {selectedMemberDetails.balance >= 0 ? 'Surplus' : 'Deficit'}
                      </Text>
                    </LinearGradient>
                  </Surface>

                  {/* Stats Grid */}
                  <View style={styles.memberStatsGrid}>
                    <Surface style={styles.memberStatCard} elevation={1}>
                      <View style={styles.memberStatContent}>
                        <Ionicons name="trending-down" size={24} color="#ef4444" />
                        <Text style={styles.memberStatValue}>₹{selectedMemberDetails.totalExpenses.toLocaleString()}</Text>
                        <Text style={styles.memberStatLabel}>Total Expenses</Text>
                        <Text style={styles.memberStatCount}>{selectedMemberDetails.expenseCount} transactions</Text>
                      </View>
                    </Surface>

                    <Surface style={styles.memberStatCard} elevation={1}>
                      <View style={styles.memberStatContent}>
                        <Ionicons name="trending-up" size={24} color="#10b981" />
                        <Text style={styles.memberStatValue}>₹{selectedMemberDetails.totalIncome.toLocaleString()}</Text>
                        <Text style={styles.memberStatLabel}>Total Income</Text>
                        <Text style={styles.memberStatCount}>{selectedMemberDetails.incomeCount} transactions</Text>
                      </View>
                    </Surface>

                    <Surface style={styles.memberStatCard} elevation={1}>
                      <View style={styles.memberStatContent}>
                        <Ionicons name="swap-horizontal" size={24} color="#6366f1" />
                        <Text style={styles.memberStatValue}>{selectedMemberDetails.transactionCount}</Text>
                        <Text style={styles.memberStatLabel}>Total Transactions</Text>
                        <Text style={styles.memberStatCount}>All time</Text>
                      </View>
                    </Surface>

                    <Surface style={styles.memberStatCard} elevation={1}>
                      <View style={styles.memberStatContent}>
                        <Ionicons name="person" size={24} color="#f59e0b" />
                        <Text style={styles.memberStatValue}>{selectedMemberDetails.role}</Text>
                        <Text style={styles.memberStatLabel}>Role</Text>
                        <Text style={styles.memberStatCount}>Access level</Text>
                      </View>
                    </Surface>
                  </View>

                  {/* Recent Transactions */}
                  {selectedMemberDetails.recentTransactions.length > 0 && (
                    <View style={styles.recentTransactionsSection}>
                      <Text style={styles.recentTransactionsTitle}>Recent Transactions</Text>
                      {selectedMemberDetails.recentTransactions.map((transaction, index) => (
                        <Surface key={index} style={styles.transactionItem} elevation={1}>
                          <View style={styles.transactionContent}>
                            <View style={styles.transactionLeft}>
                              <Ionicons 
                                name={transaction.type === 'expense' ? 'remove-circle' : 'add-circle'} 
                                size={20} 
                                color={transaction.type === 'expense' ? '#ef4444' : '#10b981'} 
                              />
                              <View style={styles.transactionInfo}>
                                <Text style={styles.transactionDescription} numberOfLines={1}>
                                  {transaction.description || transaction.category || 'Transaction'}
                                </Text>
                                <Text style={styles.transactionDate}>
                                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </Text>
                              </View>
                            </View>
                            <Text style={[
                              styles.transactionAmount,
                              { color: transaction.type === 'expense' ? '#ef4444' : '#10b981' }
                            ]}>
                              {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                            </Text>
                          </View>
                        </Surface>
                      ))}
                    </View>
                  )}
                </ScrollView>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowMemberDetails(false)}>Close</Button>
              </Dialog.Actions>
            </View>
          )}
        </Dialog>
      </Portal>

      {/* Add Member Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={handleCancelAdd} style={styles.addMemberDialog}>
          <Dialog.Title style={styles.dialogTitle}>Add Team Member</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogContent} showsVerticalScrollIndicator={false}>
              {/* Basic Information */}
              <Surface style={styles.formSection} elevation={1}>
                <Text style={styles.formSectionTitle}>Basic Information</Text>
                
                <TextInput
                  label="Full Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="account" />}
                />
                
                <TextInput
                  label="Email Address *"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                />
                
                <TextInput
                  label="Mobile Number"
                  value={formData.mobile}
                  onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
                
                <TextInput
                  label="Password *"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry
                  left={<TextInput.Icon icon="lock" />}
                />
              </Surface>

              {/* Permissions */}
              <Surface style={styles.formSection} elevation={1}>
                <Text style={styles.formSectionTitle}>Permissions</Text>
                <Text style={styles.formSectionSubtitle}>Select what this member can do</Text>
                
                <View style={styles.permissionsGrid}>
                  {PERMISSIONS.map((permission) => (
                    <TouchableOpacity
                      key={permission.key}
                      style={[
                        styles.permissionCard,
                        formData.permissions[permission.key] && styles.permissionCardSelected
                      ]}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [permission.key]: !formData.permissions[permission.key]
                          }
                        });
                      }}
                    >
                      <View style={styles.permissionCardContent}>
                        <Ionicons 
                          name={permission.icon} 
                          size={20} 
                          color={formData.permissions[permission.key] ? '#6366f1' : '#6b7280'} 
                        />
                        <Text style={[
                          styles.permissionLabel,
                          formData.permissions[permission.key] && styles.permissionLabelSelected
                        ]}>
                          {permission.label}
                        </Text>
                        <View style={[
                          styles.permissionCheckbox,
                          formData.permissions[permission.key] && styles.permissionCheckboxSelected
                        ]}>
                          {formData.permissions[permission.key] && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Surface>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={handleCancelAdd} textColor="#6b7280">Cancel</Button>
            <Button 
              onPress={handleAddMember} 
              loading={addingUser}
              disabled={addingUser || !formData.name || !formData.email || !formData.password}
              mode="contained"
              style={styles.addButton}
            >
              Add Member
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
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 64) / 2, // Account for padding and gap
    borderRadius: 16,
    height: 100,
  },
  statCardGradient: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  statIconContainer: {
    alignSelf: 'flex-end',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    fontWeight: '500',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Controls
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    elevation: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  viewToggle: {
    borderRadius: 8,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Members Container
  membersContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },

  // Member Cards - List View
  memberCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  memberCardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  memberHeader: {
    marginBottom: 16,
  },
  memberInfoContainer: {
    flex: 1,
  },
  memberAvatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberMobile: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberRole: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
    gap: 8,
  },
  actionButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },

  // Member Cards - Grid View
  memberGridCard: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  memberGridHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusChipSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusChipTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  memberGridInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  memberGridName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberGridEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberGridRole: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  memberGridActions: {
    flexDirection: 'row',
    gap: 8,
  },
  gridActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0ff',
    gap: 4,
  },
  gridActionText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteActionButton: {
    backgroundColor: '#fef2f2',
  },
  deleteActionText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  emptyCardGradient: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAction: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },

  // Dialogs
  addMemberDialog: {
    borderRadius: 16,
  },
  memberDetailsDialog: {
    borderRadius: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dialogContent: {
    paddingHorizontal: 0,
  },
  dialogActions: {
    paddingTop: 16,
  },
  addButton: {
    backgroundColor: '#6366f1',
  },

  // Form
  formSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  formSectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },

  // Permissions
  permissionsGrid: {
    gap: 8,
  },
  permissionCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  permissionCardSelected: {
    backgroundColor: '#f0f0ff',
    borderColor: '#6366f1',
  },
  permissionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  permissionLabelSelected: {
    color: '#6366f1',
  },
  permissionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionCheckboxSelected: {
    backgroundColor: '#6366f1',
  },

  // Member Details
  memberDetailsContent: {
    gap: 16,
  },
  balanceCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceCardGradient: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceStatus: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  memberStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  memberStatCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  memberStatContent: {
    alignItems: 'center',
  },
  memberStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  memberStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  memberStatCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  // Recent Transactions
  recentTransactionsSection: {
    marginTop: 8,
  },
  recentTransactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  transactionItem: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Legacy styles
  card: {
    margin: 16,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2937',
  },
});

export default ManagerDashboardScreen;
