# 🧠 MindLink

**MindLink** is a full-stack web application designed to bridge the gap between **patients and doctors** through a unified digital mental-health support platform. It enables secure communication, session management, journaling, insights tracking, and AI-assisted mental-health support within a role-based system.

---

## 🚀 What MindLink Does

MindLink focuses on **connection, insight, and continuity of mental-health care**.

---

## 👤 Patient Features

- Browse and explore available doctors
- Manage personal profile
- Book, view, and track therapy sessions
- Maintain a personal mental-health journal
- Chat with an **AI-powered chatbot** for guidance and reflection
- Access session summaries and generated reports
- Sentiment analysis on patient journals
- Secure real-time video therapy sessions

---

## 🩺 Doctor Features

- Role-based doctor dashboard
- View and manage patient session requests
- Conduct and track therapy sessions
- Access patient insights, reports, and summaries
- Manage professional profile
- View curated mental-health articles
- Advanced analytics dashboards for doctors
- ML-based mental-health insight prediction

---

## 🧠 Core Capabilities

- Role-based access control (Doctor / Patient)
- Modular and scalable frontend architecture
- Secure backend API
- Context-based authentication and state handling
- Structured session, report, and insight workflows
- AI-assisted chatbot integration

---

## 🧩 Project Structure
```

│MindLink/
├── backend/
│ ├── app.py # Flask backend entry point
│ ├── endpoints.txt # API endpoint documentation
│ └── requirements.txt # Backend dependencies
│
├── frontend/
│ ├── pages/
│ │ ├── doctor/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── DoctorProfile.jsx
│ │ │ ├── DoctorRequests.jsx
│ │ │ ├── DoctorSessions.jsx
│ │ │ └── PatientsInsights.jsx
│ │ │
│ │ └── patient/
│ │ ├── Dashboard.jsx
│ │ ├── AllDoctors.jsx
│ │ ├── Chatbot.jsx
│ │ ├── ChatPage.jsx
│ │ ├── Journal.jsx
│ │ ├── Profile.jsx
│ │ └── Sessions.jsx
│ │
│ ├── components/
│ │ ├── AuthPage.jsx
│ │ ├── Navbar.jsx
│ │ ├── Sidebar.jsx
│ │ ├── Report.jsx
│ │ └── Summary.jsx
│ │
│ ├── context/
│ │ └── UserContext.jsx
│ │
│ ├── assets/
│ ├── App.jsx
│ ├── main.jsx
│ ├── App.css
│ └── index.css
│
└── public/
```

---

## ⚙️ Technology Stack

### 🌐 Frontend

- **React (Vite)**
- **Tailwind CSS** for modern, responsive UI
- JSX-based modular components
- Context API for global authentication and role handling

---

### 🖥 Backend

- **Flask (Python)**
- RESTful API architecture
- Modular endpoint design
- Secure session and role handling

---

### 🗄 Database

- **MongoDB Atlas (Cloud)**
- Secure, scalable NoSQL data storage
- Stores users, sessions, journals, and reports

---

## 🔐 Environment Variables & Secrets

MindLink integrates multiple third-party and cloud services.  
All sensitive credentials are managed using environment variables.

Create a `.env` file inside the **backend** directory:

```env
# MongoDB Atlas
MONGO_URI=your_mongodb_atlas_connection_string

# News API (Doctor dashboard articles)
NEWS_API_KEY=your_newsapi_key

# Gemini LLM (AI chatbot & summaries)
GEMINI_API_KEY=your_gemini_api_key

# Zoom API (Video therapy sessions)
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id

# Flask Security
SECRET_KEY=your_flask_secret_key
```
These environment variables enable:
- Secure database connectivity
- AI chatbot responses and summarization
- Doctor-side mental-health article recommendations
- Authenticated Zoom meeting creation

---
##▶️ How to Run the Project
#1️⃣ Backend Setup (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend runs on:
```
http://localhost:5000
```
#2️⃣ Frontend Setup (React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```
---
### 🔐 Authentication Flow
- Users authenticate via AuthPage
- Role (doctor / patient) is stored in UserContext
- Routes and UI components dynamically adapt based on role
- Secure access to dashboards and features
---
## 📌 Disclaimer

MindLink is an academic and applied project created to demonstrate full-stack development, system design, and AI-assisted healthcare workflows.
It is not a replacement for professional medical diagnosis or treatment.

---

📢 License This project is licensed under the MIT License.

📬 Contact

Built with ❤️ by Palak Rana

Email: palakranag99@gmail.com
