import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Signup from "./components/SignUp";
import Login from "./components/Login";
import OTPPage from "./components/OtpPage";
import StudentDashboard from "./components/StudentDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/verify-otp" element={<OTPPage/>}/>
        <Route path="/student-dashboard" element={<StudentDashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
