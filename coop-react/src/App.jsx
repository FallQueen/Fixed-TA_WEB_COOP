import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard'; // <-- Import Dashboard-nya
import AdminDashboard from './components/AdminDashboard'; // <-- Import Dashboard Admin-nya
import SupervisorForm from './components/SupervisorForm';
import GlobalNetworkIndicator from './components/GlobalNetworkIndicator';

function App() {
  return (
    <BrowserRouter>
      <GlobalNetworkIndicator />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rute ke Dashboard Sungguhan */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/evaluasi/:id" element={<SupervisorForm />} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
