# ⚛︎ Chemical Equipment Parameter Visualizer

A hybrid Web and Desktop application for analyzing chemical equipment data using CSV files.  
This system provides secure authentication, interactive analytics, data visualization, and automated report generation.

Developed as part of the IIT Bombay / FOSSEE Internship Screening Task.

---

## Features

### ✦ Web Application (React + Material UI)
- Secure Login & Registration (JWT Authentication)
- CSV Upload & Validation
- Automatic Data Analytics using Pandas
- Interactive Charts (Chart.js)
- Searchable & Scrollable Data Table
- Upload History (Last 5 Datasets)
- PDF Report Generation
- Dark / Light Mode
- Smart Data Insights

### ✦ Desktop Application (PyQt5 + Matplotlib)
- Secure Login
- CSV Upload
- Analytics Dashboard
- Interactive Charts
- PDF Report Download
- User-Friendly Interface

### ✦ Backend (Django + DRF)
- RESTful APIs
- JWT Authentication
- Data Processing with Pandas
- SQLite Database
- Secure File Handling
- PDF Generation using ReportLab

---

## ✦ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend (Web) | React.js, Material UI, Chart.js |
| Frontend (Desktop) | PyQt5, Matplotlib |
| Backend | Django, Django REST Framework |
| Data Processing | Pandas |
| Database | SQLite |
| Authentication | JWT |
| Reporting | ReportLab |
| Version Control | Git, GitHub |

---

## ✦ Project Structure

hybrid-equipment-visualizer/
│
├── backend/ # Django Backend
├── web/ # React Frontend
├── desktop/ # PyQt Desktop App
├── requirements.txt
|── sample_data
└── README.md


---

## ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```
# Backend will start at:
http://127.0.0.1:8000/

---

## ✦ Web Application Setup
```bash
cd web/dashboard
npm install
npm start
```
# Web App runs at:
http://localhost:3000/

---

## ✦ Desktop Application Setup
```bash
cd desktop
pip install pyqt5 matplotlib requests
python app.py
```
---

## ✦ Authentication Flow
◆ Users can register through the Web UI
◆ JWT tokens are used for secure authentication
◆ All protected APIs require Authorization headers

## ✦ PDF Report
The system generates automated PDF reports containing:
➣ User Details
➣ Upload Date
➣ Summary Statistics
➣ Equipment Distribution
➣ Insights

# Sample Data
sample_data/sample_equipment_data.csv

---

## ✦ Deployment

Live demo





