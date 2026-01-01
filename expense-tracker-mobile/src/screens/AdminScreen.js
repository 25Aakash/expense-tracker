import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
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
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';
import { adminAPI } from '../services/api';

const AdminScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    managerCount: 0,
    userCount: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const usersData = response.data || [];
      setUsers(usersData);
      calculateStats(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const stats = {
      totalUsers: usersData.length,
      adminCount: usersData.filter(u => u.role === 'admin').length,
      managerCount: usersData.filter(u => u.role === 'manager').length,
      userCount: usersData.filter(u => u.role === 'user').length,
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

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
    loadUsers().then(() => setRefreshing(false));
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${userName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteUser(userId);
              loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleChangeRole = async (userId, currentRole, userName) => {
    const roles = ['user', 'manager', 'admin'];
    const roleOptions = roles.map(role => ({
      text: role.charAt(0).toUpperCase() + role.slice(1),
      onPress: async () => {
        if (role === currentRole) return;
        
        try {
          await adminAPI.updateUserRole(userId, role);
          loadUsers();
          Alert.alert('Success', `User role updated to ${role}`);
        } catch (error) {
          console.error('Error updating role:', error);
          Alert.alert('Error', 'Failed to update user role');
        }
      },
    }));

    Alert.alert(
      'Change Role',
      `Select new role for "${userName}":`,
      [...roleOptions, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'manager': return '#f59e0b';
      case 'user': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderUser = (userData) => (
    <Card key={userData._id} style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            {userData.mobile && (
              <Text style={styles.userMobile}>{userData.mobile}</Text>
            )}
          </View>
          <Chip
            style={[styles.roleChip, { backgroundColor: getRoleColor(userData.role) }]}
            textStyle={styles.roleChipText}
          >
            {userData.role?.toUpperCase()}
          </Chip>
        </View>
        
        <View style={styles.userActions}>
          <Button
            mode="outlined"
            onPress={() => handleChangeRole(userData._id, userData.role, userData.name)}
            style={styles.actionButton}
            compact
          >
            Change Role
          </Button>
          {userData._id !== user?.id && (
            <Button
              mode="outlined"
              onPress={() => handleDeleteUser(userData._id, userData.name)}
              style={[styles.actionButton, styles.deleteButton]}
              textColor="#ef4444"
              compact
            >
              Delete
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Access Denied</Title>
              <Text style={styles.errorText}>Admin access required</Text>
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
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <Card style={[styles.statCard, { backgroundColor: '#6366f1' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Admins</Text>
            <Text style={styles.statValue}>{stats.adminCount}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Managers</Text>
            <Text style={styles.statValue}>{stats.managerCount}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Card.Content>
            <Text style={styles.statLabel}>Users</Text>
            <Text style={styles.statValue}>{stats.userCount}</Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Title style={styles.sectionTitle}>All Users</Title>
        {filteredUsers.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No users found</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredUsers.map(renderUser)
        )}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    marginRight: 12,
    minWidth: 120,
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  userMobile: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  roleChip: {
    marginLeft: 12,
  },
  roleChipText: {
    color: 'white',
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 100,
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  card: {
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyCard: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AdminScreen;
