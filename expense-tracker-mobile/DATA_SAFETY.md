# Data Safety Information for Google Play Console

**App Name:** DailyCashBook  
**Package:** com.expensetracker.pro  
**Last Updated:** January 1, 2026

---

## Overview for Google Play Data Safety Section

This document contains the information needed to complete the "Data Safety" section in Google Play Console. Copy and paste the appropriate responses when submitting your app.

---

## Data Collection and Security

### Does your app collect or share any of the required user data types?
**Answer:** YES

---

## Data Types Collected

### 1. Personal Information

#### ✅ Name
- **Collected:** YES
- **Shared:** NO
- **Optional:** NO (Required for account creation)
- **Purpose:** App functionality, Account management
- **Encrypted in transit:** YES
- **Can users request data deletion:** YES

#### ✅ Email Address
- **Collected:** YES
- **Shared:** NO
- **Optional:** NO (Required for account creation)
- **Purpose:** App functionality, Account management, Communications
- **Encrypted in transit:** YES
- **Can users request data deletion:** YES

#### ✅ Phone Number
- **Collected:** YES
- **Shared:** NO
- **Optional:** NO (Required for OTP verification)
- **Purpose:** App functionality, Account management, Security
- **Encrypted in transit:** YES
- **Can users request data deletion:** YES

---

### 2. Financial Information

#### ✅ User Payment Info
- **Collected:** NO
- **Note:** We DO NOT collect actual bank account numbers or credit card information

#### ✅ Financial Transaction Info
- **Collected:** YES (Self-entered transaction records)
- **Shared:** NO (except with team members you explicitly grant access to)
- **Optional:** NO (Core feature of the app)
- **Purpose:** App functionality
- **Details:** Amount, category, date, notes, payment method (Cash/Bank label only)
- **Encrypted in transit:** YES
- **Can users request data deletion:** YES

---

### 3. Location

#### ❌ Approximate Location
- **Collected:** NO

#### ❌ Precise Location
- **Collected:** NO

---

### 4. Personal Messages

#### ❌ Emails, SMS, or Messages
- **Collected:** NO

---

### 5. Photos and Videos

#### ❌ Photos
- **Collected:** NO
- **Note:** Camera permission has been removed

#### ❌ Videos
- **Collected:** NO

---

### 6. Audio Files

#### ❌ Voice or Sound Recordings
- **Collected:** NO

#### ❌ Music Files
- **Collected:** NO

---

### 7. Files and Docs

#### ❌ Files and Docs
- **Collected:** NO

---

### 8. Calendar

#### ❌ Calendar Events
- **Collected:** NO

---

### 9. Contacts

#### ❌ Contacts
- **Collected:** NO

---

### 10. App Activity

#### ✅ App Interactions
- **Collected:** YES
- **Shared:** NO
- **Optional:** YES (for analytics)
- **Purpose:** Analytics, App functionality
- **Details:** Features used, screens viewed
- **Encrypted in transit:** YES
- **Can users request data deletion:** YES

#### ❌ In-app Search History
- **Collected:** NO

#### ❌ Installed Apps
- **Collected:** NO

#### ❌ Other User-Generated Content
- **Collected:** YES (Transaction notes)
- **Shared:** NO (except with team members you grant access)
- **Optional:** YES
- **Purpose:** App functionality
- **Encrypted in transit:** YES
- **Can users request data deletion:** YES

#### ❌ Other Actions
- **Collected:** NO

---

### 11. Web Browsing

#### ❌ Web Browsing History
- **Collected:** NO

---

### 12. App Info and Performance

#### ✅ Crash Logs
- **Collected:** YES
- **Shared:** NO
- **Optional:** YES (automatic)
- **Purpose:** App functionality, Analytics
- **Encrypted in transit:** YES
- **Can users request data deletion:** NO (deleted automatically after 90 days)

#### ✅ Diagnostics
- **Collected:** YES
- **Shared:** NO
- **Optional:** YES (automatic)
- **Purpose:** App functionality, Analytics
- **Encrypted in transit:** YES
- **Can users request data deletion:** NO (deleted automatically after 90 days)

#### ❌ Other App Performance Data
- **Collected:** NO

---

### 13. Device or Other IDs

#### ✅ Device or Other IDs
- **Collected:** YES
- **Shared:** NO
- **Optional:** YES (automatic)
- **Purpose:** App functionality, Analytics
- **Details:** Device model, OS version
- **Encrypted in transit:** YES
- **Can users request data deletion:** NO (anonymous identifiers)

---

## Data Sharing

### Do you share user data with third parties?
**Answer:** NO

**Explanation:** User data is stored on our secure backend servers and is not shared with any third parties for advertising, marketing, or any other purpose. Team members can only see data you explicitly grant them access to.

---

## Data Security

### Is all user data encrypted in transit?
**Answer:** YES

**Method:** HTTPS/TLS encryption for all API communications

### Can users request that data be deleted?
**Answer:** YES

**Method:** 
- Users can delete individual transactions within the app
- Users can request full account deletion by contacting: dailycashbook3@gmail.com
- Data is permanently deleted within 90 days of request

---

## Data Usage and Handling

### Data is used for:
- ✅ App functionality (providing financial tracking services)
- ✅ Analytics (improving app performance and user experience)
- ❌ Advertising or marketing
- ❌ Fraud prevention, security, and compliance
- ❌ Personalization

### Data is processed:
- ✅ Ephemerally (temporary processing for immediate functionality)

---

## Additional Information

### Independent Security Review
- **Answer:** NO
- **Note:** No independent security review has been conducted yet

### Security Compliance
- Industry-standard HTTPS/TLS encryption
- Password hashing with bcrypt
- Secure backend API on Render.com
- Regular security updates

### Data Retention
- Active account data: Retained as long as account is active
- Deleted account data: Permanently removed within 90 days
- Backup data: May persist in backups for up to 30 days
- Crash logs: Automatically deleted after 90 days

### User Controls
Users can:
- View all their data within the app
- Delete individual transactions
- Request data export (contact support)
- Request account deletion (contact support)
- Update personal information at any time

---

## Contact Information for Users

**Support Email:** dailycashbook3@gmail.com

**Privacy Policy:** [Link to your hosted privacy policy]

**Response Time:** 48 hours

---

## Summary Statement for Data Safety Section

**Copy this into Google Play Console Data Safety Summary:**

"DailyCashBook collects personal information (name, email, phone number) for account creation and authentication. The app stores financial transaction data you enter (amounts, categories, notes) to provide expense tracking services. We collect basic usage analytics and crash data to improve app performance. All data is encrypted in transit using HTTPS. We do not share your data with third parties. We do not collect location data, photos, or access device storage. Users can request data deletion at any time by contacting dailycashbook3@gmail.com. Data is permanently deleted within 90 days of request."

---

## Checklist for Google Play Console

When filling out the Data Safety form, you will need to:

- [ ] Select all applicable data types from sections above
- [ ] For each data type, specify if it's collected and/or shared
- [ ] Indicate if collection is optional or required
- [ ] Specify the purpose of collection (App functionality, Analytics, etc.)
- [ ] Confirm data is encrypted in transit
- [ ] Confirm users can request deletion
- [ ] Provide link to Privacy Policy (must be publicly accessible URL)
- [ ] Review and submit

---

## Notes for Future Updates

If you add these features in the future, update the Data Safety section:
- ❌ Push notifications → Update "Personal Messages"
- ❌ Location-based features → Update "Location"
- ❌ Receipt photo upload → Update "Photos"
- ❌ Cloud backup → Update "Files and Docs"
- ❌ Biometric authentication → Update "App Info"

---

**Important:** The Data Safety section must be accurate and complete. Misrepresentation can result in app removal from Google Play Store.
