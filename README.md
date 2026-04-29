# 🏥 SMART BARANGAY: Health Information System

SMART BARANGAY: Health Information System is a system that allows admins to manage medical health center data such as user data, patient records, appointments, immunizations and other programs, inventory, and view reports and analytics.

---

## 🎯 Latest Update: Database Integration Complete ✅

**NEW:** User Management system now connected to Supabase database!
- ✅ User authentication with password hashing
- ✅ User registration and management
- ✅ Role management (Admin, Nurse, Staff)
- ✅ Status management (Active, Inactive)
- ✅ Real-time search and filtering

👉 **Get Started:** Read `COMPLETE_SETUP_GUIDE.md` for setup instructions

---

## 🌐 System Overview

This system will be integrated with **SMART BARANGAY: E-Services** as a module so that users (people from the barangay) can directly request appointments at the medical center, and also avail other services from the barangay directly through online.

---

## 📋 What's Implemented

### ✅ User Management Module
- Database-driven user authentication
- User registration form with password hashing
- Real-time role assignment (Admin, Nurse, Staff)
- Real-time status management (Active, Inactive)
- User search and filtering
- User deletion with confirmation

### ✅ Security Features
- SHA-256 password hashing
- Session-based authentication
- Active/Inactive user status control
- Input validation and XSS protection

### ✅ Database Integration
- Supabase connection
- LoginTbl for user data
- Real-time database updates
- Last login tracking

---

## 🚀 Quick Start (5 Minutes)

### For Users:
1. Read: `COMPLETE_SETUP_GUIDE.md`
2. Create Supabase project
3. Update credentials in JavaScript files
4. Create LoginTbl table
5. Add admin account
6. Login with admin/12345

### For Developers:
1. See: `IMPLEMENTATION_SUMMARY.md` for code changes
2. See: `DATABASE_SETUP.md` for technical details
3. See: `CONFIG_TEMPLATE.md` for SQL scripts

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `COMPLETE_SETUP_GUIDE.md` | 👈 Start here - End-to-end setup |
| `QUICKSTART.md` | 5-minute quick setup |
| `DATABASE_SETUP.md` | Detailed technical docs |
| `IMPLEMENTATION_SUMMARY.md` | What changed and how |
| `CONFIG_TEMPLATE.md` | SQL scripts & config |
| `ADMIN_SETUP.md` | Add admin account |
| `COMPLETION_REPORT.md` | Implementation overview |

---

## 🚧 Project Status

- ✅ User authentication system
- ✅ User management dashboard
- ✅ Database integration
- 🔄 Additional modules (in progress)

---

## 👨‍💻 Project Setup Instructions (For Developers)

### 📥 1. Clone the Repository
```bash
git clone https://github.com/MEMORiAACHROMOS/Smart-Barangay.git
```

### 📂 2. Open in VS Code
```
Click: File → Open Folder
Select: Smart-Barangay folder
```

### 🔧 3. Configure Supabase
1. Copy your Supabase credentials
2. Update: `login/login-script.js` (lines 14-15)
3. Update: `main_interface/js/user-management.js` (lines 1-3)

### 🗄️ 4. Create Database
1. Go to Supabase SQL Editor
2. Run SQL from `CONFIG_TEMPLATE.md`
3. Create LoginTbl table

### 👤 5. Add Admin Account
1. Open login page in browser
2. Generate password hash (see `ADMIN_SETUP.md`)
3. Insert admin account in Supabase
4. Test login with admin/12345

### 🌐 6. Run the Project
**Recommended (Live Server):**
```
1. Install Live Server extension in VS Code
2. Right-click dashboard.html
3. Click: Open with Live Server
```

**Alternative:**
```
Open dashboard.html directly in browser (not recommended)
```

---

## 📁 Project Structure

```
Smart-Barangay/
│
├── login/
│   ├── login.html (Updated)
│   ├── login-script.js (Updated)
│   ├── login-styles.css
│   └── login-images/
│
├── main_interface/
│   ├── css/
│   │   ├── user_management-styles.css (Updated)
│   │   ├── global.css
│   │   └── ...
│   ├── js/
│   │   ├── user-management.js (Updated)
│   │   ├── sidebar-script.js
│   │   └── ...
│   ├── User_Management.html (Updated)
│   ├── dashboard.html
│   ├── Patient_Records.html
│   ├── Appointments.html
│   └── ...
│
├── utils/
│   ├── auth.js (New)
│   ├── userDb.js (New)
│   └── supabase/
│
├── node_modules/
├── package.json
│
├── COMPLETE_SETUP_GUIDE.md (New)
├── DATABASE_SETUP.md (New)
├── IMPLEMENTATION_SUMMARY.md (New)
├── CONFIG_TEMPLATE.md (New)
├── ADMIN_SETUP.md (New)
├── QUICKSTART.md (New)
└── README.md (This file)
```

---

## 🔑 Database Schema

### LoginTbl Table
```sql
User_ID        INT (Primary Key, Auto-increment)
Username       VARCHAR (Unique)
PasswordHash   TEXT (SHA-256)
Role_ID        INT (1=Admin, 2=Nurse, 3=Staff)
Status         VARCHAR (Active/Inactive)
Created_At     TIMESTAMP
Last_Login     TIMESTAMP
```

---

## 👥 Collaboration Rules

```bash
# Create feature branch
git checkout -b feature-name

# Make changes
git add .
git commit -m "your message"

# Push to feature branch
git push origin feature-name

# Do NOT push directly to main
# Always use feature branches
```

### Important Guidelines:
- Keep file structure inside main_interface consistent
- Always use Live Server for proper routing
- Do not rename core folders without team agreement
- Test database integration before committing
- Document any schema changes

---

## ⚠️ Important Notes

1. **Setup Required**: Follow `COMPLETE_SETUP_GUIDE.md` for database setup
2. **Credentials**: Never commit Supabase credentials to git
3. **Database**: LoginTbl must exist before using the system
4. **Admin Account**: Create admin account after database setup
5. **Password Hashing**: Use SHA-256 (provided in code)

---

## 🔗 Resources

- **Supabase**: https://supabase.com
- **Documentation**: See files in repository root
- **Live Server**: VS Code Extension

---

## 📞 Support

For setup help:
1. Read `COMPLETE_SETUP_GUIDE.md` (comprehensive guide)
2. Read `DATABASE_SETUP.md` (technical details)
3. Check browser console (F12) for errors
4. Verify Supabase credentials and table

---

## 🎉 Getting Started

**New to this project?**
1. Start here: `COMPLETE_SETUP_GUIDE.md`
2. Then: `ADMIN_SETUP.md`
3. Finally: Test the system

**Want details?**
1. Read: `IMPLEMENTATION_SUMMARY.md`
2. Check: `DATABASE_SETUP.md`
3. Reference: `CONFIG_TEMPLATE.md`

---

**Status**: ✅ Database Integration Complete - Ready for Deployment