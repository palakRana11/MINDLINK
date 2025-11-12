import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { UserProvider, UserContext } from "./context/UserContext";
import AuthPage from "./components/AuthPage.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";

// Pages
import DoctorDashboard from "../pages/doctor/Dashboard.jsx";
import DoctorProfile from "../pages/doctor/DoctorProfile.jsx";
import DoctorRequests from "../pages/doctor/DoctorRequests.jsx";
import PatientsInsights from "../pages/doctor/PatientsInsights.jsx";
import DoctorSessions from "../pages/doctor/DoctorSessions.jsx";

import PatientDashboard from "../pages/patient/Dashboard.jsx";
import PatientJournal from "../pages/patient/Journal.jsx";
import PatientSessions from "../pages/patient/Sessions.jsx";
import PatientChatbot from "../pages/patient/Chatbot.jsx";
import PatientProfile from "../pages/patient/Profile.jsx";
import AllDoctors from "../pages/patient/AllDoctors.jsx";

import ChatPage from "../pages/ChatPage.jsx"



// 404 Page
const NotFound = () => (
  <div className="flex h-screen items-center justify-center text-xl text-gray-600">
    404 - Page Not Found
  </div>
);

// ✅ Layout wrapper with non-overlapping Navbar + Sidebar
function Layout({ children }) {
  const location = useLocation();
  const { loggedUser } = useContext(UserContext);

  // Get user role safely
  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  const effectiveUser = loggedUser || savedUser;
  const role = effectiveUser?.role;

  // Hide layout on login/register
  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (hideLayout) return <>{children}</>;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar (fixed left) */}
      <aside className="w-64 fixed top-0 left-0 h-full bg-white shadow-md border-r border-gray-200 z-20">
        <Sidebar role={role} />
      </aside>

      {/* Main Section */}
      <div className="flex flex-col flex-1 ml-64">
        {/* Navbar (fixed top) */}
        <header className="fixed top-0 left-64 right-0 z-10">
          <Navbar role={role} />
        </header>

        {/* Main content area (has padding for Navbar + Sidebar) */}
        <main className="pt-20 px-6 pb-10 bg-gray-50 min-h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ✅ AppRoutes: controls all navigation
function AppRoutes() {
  const { loggedUser } = useContext(UserContext);
  const savedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  const effectiveUser = loggedUser || savedUser;
  const isAuthenticated = !!effectiveUser;

  return (
    <Routes>
      {/* AUTH ROUTE */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={`/${effectiveUser.role}/dashboard`} />
          ) : (
            <AuthPage />
          )
        }
      />

      {/* PATIENT ROUTES */}
      <Route
        path="/patient/dashboard"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <PatientDashboard />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/patient/journal"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <PatientJournal />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/patient/sessions"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <PatientSessions />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/patient/chatbot"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <PatientChatbot />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/patient/buddy"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <PatientChatbot />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/patient/profile"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <PatientProfile />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/patient/doctors"
        element={
          isAuthenticated && effectiveUser.role === "patient" ? (
            <Layout>
              <AllDoctors />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
  path="/patient/chat"
  element={
    isAuthenticated && effectiveUser.role === "patient" ? (
      <Layout>
        <ChatPage role="patient" />
      </Layout>
    ) : (
      <Navigate to="/" />
    )
  }
/>





      {/* DOCTOR ROUTES */}
      <Route
        path="/doctor/dashboard"
        element={
          isAuthenticated && effectiveUser.role === "doctor" ? (
            <Layout>
              <DoctorDashboard />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/doctor/profile"
        element={
          isAuthenticated && effectiveUser.role === "doctor" ? (
            <Layout>
              <DoctorProfile />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/doctor/sessions"
        element={
          isAuthenticated && effectiveUser.role === "doctor" ? (
            <Layout>
              <DoctorSessions />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/doctor/requests"
        element={
          isAuthenticated && effectiveUser.role === "doctor" ? (
            <Layout>
              <DoctorRequests />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/doctor/chat"
        element={
          isAuthenticated && effectiveUser.role === "doctor" ? (
            <Layout>
              <ChatPage role="doctor" />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/doctor/insights"
        element={
          isAuthenticated && effectiveUser.role === "doctor" ? (
            <Layout>
              <PatientsInsights />
            </Layout>
          ) : (
            <Navigate to="/" />
          )
        }
      />



      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Root App
export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}
