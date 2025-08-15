# 📱 MANUAL TESTING GUIDE FOR EXPENSE TRACKER MOBILE APP

## 🧪 **STEP-BY-STEP TESTING CHECKLIST**

### **Prerequisites**
- [ ] Backend server running on `http://192.168.29.205:5000`
- [ ] Mobile app running via Expo Go or simulator
- [ ] Test device/simulator connected to same network

---

## 🔐 **AUTHENTICATION FLOW TESTING**

### **Test 1: Onboarding Screen**
1. **Launch app** 
2. **Expected**: Onboarding screen with 4 slides appears
3. **Test Actions**:
   - [ ] Swipe through all 4 slides
   - [ ] Tap "Get Started" on final slide
   - [ ] Verify navigation to Login screen

**✅ PASS / ❌ FAIL**: ___________

---

### **Test 2: Registration Flow**
1. **From Login screen**, tap "Create Account"
2. **Fill Registration Form**:
   - Name: "Test User"
   - Email: "test@example.com" 
   - Mobile: "1234567890"
   - Password: "password123"
   - Confirm Password: "password123"
3. **Tap "Create Account"**
4. **Expected**: Success alert → OTP Verification screen
5. **On OTP Screen**:
   - [ ] Email displayed correctly
   - [ ] Enter any 6-digit OTP (123456)
   - [ ] Tap "Verify OTP"
   - [ ] Check backend logs for OTP (should fail with invalid OTP)
   - [ ] Test "Resend OTP" button after 30s countdown

**✅ PASS / ❌ FAIL**: ___________

---

### **Test 3: Login Flow**
1. **Use existing credentials or create account first**
   - Email: Valid registered email
   - Password: Correct password
2. **Tap "Sign In"**
3. **Expected**: Success → Dashboard screen loads
4. **Test Invalid Login**:
   - Email: "invalid@test.com"
   - Password: "wrongpassword"
   - **Expected**: Error message displayed

**✅ PASS / ❌ FAIL**: ___________

---

## 🏠 **DASHBOARD TESTING**

### **Test 4: Dashboard Loading**
1. **After successful login**
2. **Expected**:
   - [ ] Balance card displays (may be ₹0 for new user)
   - [ ] Income/Expense breakdown visible
   - [ ] 2x2 Quick Actions grid displays
   - [ ] Recent Transactions section (may be empty)
   - [ ] Smooth animations

**✅ PASS / ❌ FAIL**: ___________

### **Test 5: Quick Actions**
1. **Test each quick action button**:
   - [ ] "Add Expense" → AddExpenseScreen
   - [ ] "Add Income" → AddIncomeScreen  
   - [ ] "View Reports" → ReportsScreen
   - [ ] "Categories" → CategoriesScreen
2. **Verify navigation** back to dashboard

**✅ PASS / ❌ FAIL**: ___________

---

## 💰 **EXPENSE MANAGEMENT TESTING**

### **Test 6: Add Expense**
1. **From Dashboard** → "Add Expense"
2. **Fill Form**:
   - Amount: "100"
   - Category: Select any (e.g., "Food")
   - Note: "Test expense"
   - Date: Today's date
   - Method: "Bank"
3. **Tap "Add Expense"**
4. **Expected**: Success message → return to dashboard
5. **Verify**: Dashboard balance updated

**✅ PASS / ❌ FAIL**: ___________

### **Test 7: Add Income**
1. **From Dashboard** → "Add Income"
2. **Fill Form**:
   - Amount: "500"
   - Category: Select any (e.g., "Salary")
   - Note: "Test income"
   - Date: Today's date
   - Method: "Bank"
3. **Tap "Add Income"**
4. **Expected**: Success message → return to dashboard
5. **Verify**: Dashboard balance updated

**✅ PASS / ❌ FAIL**: ___________

---

## 📊 **NAVIGATION TESTING**

### **Test 8: Bottom Tab Navigation**
1. **Test each tab**:
   - [ ] Home (Dashboard)
   - [ ] Transactions
   - [ ] Categories  
   - [ ] Reports
   - [ ] Profile
2. **Verify**: Each screen loads without errors

**✅ PASS / ❌ FAIL**: ___________

### **Test 9: Transactions Screen**
1. **Navigate to Transactions tab**
2. **Expected**:
   - [ ] List of transactions (if any added)
   - [ ] Filter options work
   - [ ] Add expense/income buttons work
3. **Test**: Tap on transaction for details

**✅ PASS / ❌ FAIL**: ___________

---

## 👤 **PROFILE & SETTINGS TESTING**

### **Test 10: Profile Screen**
1. **Navigate to Profile tab**
2. **Expected**:
   - [ ] User information displayed
   - [ ] Settings options available
   - [ ] Logout button works

**✅ PASS / ❌ FAIL**: ___________

### **Test 11: Logout Flow**
1. **From Profile screen** → "Logout"
2. **Expected**: Return to Login screen
3. **Verify**: Previous session cleared

**✅ PASS / ❌ FAIL**: ___________

---

## 🌐 **NETWORK & ERROR TESTING**

### **Test 12: Network Error Handling**
1. **Disconnect from internet**
2. **Try to login/add expense**
3. **Expected**: Appropriate error messages
4. **Reconnect**: App should work normally

**✅ PASS / ❌ FAIL**: ___________

### **Test 13: Server Error Handling**
1. **Stop backend server**
2. **Try to use app features**
3. **Expected**: Error messages, no crashes
4. **Restart server**: App should recover

**✅ PASS / ❌ FAIL**: ___________

---

## 📱 **DEVICE TESTING**

### **Test 14: Different Screen Sizes**
- [ ] Test on small screen (iPhone SE)
- [ ] Test on large screen (iPad/large Android)
- [ ] Verify UI scales properly

**✅ PASS / ❌ FAIL**: ___________

### **Test 15: Orientation Testing**
- [ ] Portrait mode works
- [ ] Landscape mode (if supported)
- [ ] No UI breaking

**✅ PASS / ❌ FAIL**: ___________

---

## 🚨 **CRITICAL ISSUES TRACKING**

### **Found Issues**:
1. ________________________________
2. ________________________________
3. ________________________________
4. ________________________________
5. ________________________________

### **Fixed Issues**:
1. ✅ OTP Verification Screen - COMPLETED
2. ________________________________
3. ________________________________

---

## 🎯 **DEPLOYMENT READINESS SCORE**

**Total Tests**: 15
**Passed**: _____ / 15
**Failed**: _____ / 15

**Ready for Deployment**: 
- [ ] YES (13+ tests passed)
- [ ] NO (needs fixes)

---

## 📝 **TESTING NOTES**

**Date**: _________________
**Tester**: _______________
**Device**: _______________
**OS Version**: ___________

**Additional Notes**:
_________________________________
_________________________________
_________________________________
_________________________________

---

## 🚀 **NEXT STEPS**

If **READY FOR DEPLOYMENT**:
1. [ ] Prepare store assets (icons, screenshots)
2. [ ] Write store descriptions
3. [ ] Submit to app stores

If **NOT READY**:
1. [ ] Fix critical issues found
2. [ ] Re-run failed tests
3. [ ] Update this checklist

---

*Use this checklist systematically to ensure app quality before store submission*
