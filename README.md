# 🏥 SMART BARANGAY: Health Information System

SMART BARANGAY: Health Information System is a system that allows admins to manage medical health center data such as user data, patient records, appointments, immunizations and other programs, inventory, and view reports and analytics.

---

## 🌐 System Overview

This system will be integrated with **SMART BARANGAY: E-Services** as a module so that users (people from the barangay) can directly request appointments at the medical center, and also avail other services from the barangay directly through online.

---

## 🚧 Project Status

This project is still in progress.

---

## 👨‍💻 Project Setup Instructions (For Developers)

### 📥 1. Clone the Repository
```bash
git clone https://github.com/MEMORiAACHROMOS/Smart-Barangay.git

📂 2. Open in VS Code
Open Visual Studio Code
Click: File → Open Folder
Select the project folder:
Smart-Barangay
🌐 3. Run the Project
✔ Recommended (Live Server)
Install Live Server extension in VS Code
Right-click Dashboard.html
Click Open with Live Server
✔ Alternative
Open Dashboard.html directly in browser (not recommended)
📁 Project Structure
Smart-Barangay/
│
├── login/
├── main_interface/
│   ├── css/
│   ├── js/
│   ├── Dashboard.html
│   ├── User_Management.html
│   ├── Patient_Records.html
│   ├── Appointments.html
│   ├── Immunization_and_Programs.html
│   ├── Inventory.html
│   ├── Analytics.html
│
└── README.md
👥 Collaboration Rules
git checkout -b feature-name
git add .
git commit -m "your message"
git push origin feature-name
Do NOT push directly to main
Always use feature branches
⚠️ Notes
Keep file structure inside main_interface consistent
Always use Live Server for proper routing
Do not rename core folders without team agreement