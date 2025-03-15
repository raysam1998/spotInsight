import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/styles/App.css';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Callback from './pages/Callback';
import { AuthProvider } from 'contexts/AuthContext';
import PlaylistDetail from 'pages/playlistDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
      </Routes>
    </Router>
    </AuthProvider>
    
  );
}

export default App;
