import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';
import usePermissions from '../hooks/usePermissions';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryTransactionsScreen from '../screens/CategoryTransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BankTransactionsScreen from '../screens/BankTransactionsScreen';
import CashTransactionsScreen from '../screens/CashTransactionsScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddIncomeScreen from '../screens/AddIncomeScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import AdminScreen from '../screens/AdminScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import HelpScreen from '../screens/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Transactions and related screens
const TransactionsStack = () => {
  const { canEdit } = usePermissions();
  
  return (
    <Stack.Navigator initialRouteName="TransactionsMain">
      <Stack.Screen 
        name="TransactionsMain" 
        component={TransactionsScreen}
        options={{ title: 'All Transactions' }}
      />
      <Stack.Screen 
        name="BankTransactions" 
        component={BankTransactionsScreen}
        options={{ title: 'Bank Transactions' }}
      />
      <Stack.Screen 
        name="CashTransactions" 
        component={CashTransactionsScreen}
        options={{ title: 'Cash Transactions' }}
      />
      
      {/* Add screens - always available (core functionality) */}
      <Stack.Screen 
        name="AddExpense" 
        component={AddExpenseScreen}
        options={{ 
          title: 'Add Expense',
          headerShown: false  // We're handling the header in the screen itself
        }}
      />
      <Stack.Screen 
        name="AddIncome" 
        component={AddIncomeScreen}
        options={{ 
          title: 'Add Income',
          headerShown: false  // We're handling the header in the screen itself
        }}
      />
      
      {/* Edit screen - only available if user can edit */}
      {canEdit() && (
        <Stack.Screen 
          name="EditTransaction" 
          component={EditTransactionScreen}
          options={{ 
            title: 'Edit Transaction',
            headerShown: false  // We're handling the header in the screen itself
          }}
        />
      )}
    </Stack.Navigator>
  );
};

// Stack navigator for Categories and related screens
const CategoriesStack = () => (
  <Stack.Navigator initialRouteName="CategoriesMain">
    <Stack.Screen 
      name="CategoriesMain" 
      component={CategoriesScreen}
      options={{ title: 'Categories' }}
    />
    <Stack.Screen 
      name="CategoryTransactions" 
      component={CategoryTransactionsScreen}
      options={{ 
        title: 'Category Transactions',
        headerShown: false  // We're handling the header in the screen itself
      }}
    />
  </Stack.Navigator>
);

// Stack navigator for Profile and admin screens
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="About" 
      component={AboutScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Help" 
      component={HelpScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Admin" 
      component={AdminScreen}
      options={{ title: 'Admin Panel' }}
    />
    <Stack.Screen 
      name="ManagerDashboard" 
      component={ManagerDashboardScreen}
      options={{ title: 'Manager Dashboard' }}
    />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  const { user } = useAuth();
  const { canAccessReports } = usePermissions();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Manager') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsStack}
        options={{ 
          tabBarLabel: 'Transactions',
          unmountOnBlur: true  // This will reset the stack when leaving the tab
        }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesStack}
        options={{ 
          tabBarLabel: 'Categories',
          unmountOnBlur: true  // This will reset the stack when leaving the tab
        }}
      />
      
      {/* Show Reports tab only if user has permission */}
      {canAccessReports() && (
        <Tab.Screen 
          name="Reports" 
          component={ReportsScreen}
          options={{ tabBarLabel: 'Reports' }}
        />
      )}
      
      {/* Show Admin tab for admin users */}
      {user?.role === 'admin' && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
      
      {/* Show Manager tab for manager users */}
      {user?.role === 'manager' && (
        <Tab.Screen 
          name="Manager" 
          component={ManagerDashboardScreen}
          options={{ tabBarLabel: 'Manager' }}
        />
      )}
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
