import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ThemeProvider } from './theme';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef(null);
  const hasJoinedRef = useRef(false);

  // RESTORE USER SESSION FROM LOCALSTORAGE
  // Check if user was previously logged in by retrieving stored credentials
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // INITIALIZE SOCKET.IO CONNECTION
  // Establish real-time WebSocket connection when user is authenticated
  // Set up connection handlers and store socket reference globally for use across components
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!socketRef.current) {
        socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          forceNew: false,
        });

        socketRef.current.on('connect', () => {
          if (!hasJoinedRef.current) {
            socketRef.current.emit('join', user.id);
            hasJoinedRef.current = true;
          }
        });

        socketRef.current.on('disconnect', () => {
          hasJoinedRef.current = false;
        });

        socketRef.current.on('reconnect', () => {
          hasJoinedRef.current = false;
          socketRef.current.emit('join', user.id);
          hasJoinedRef.current = true;
        });

        window.globalSocket = socketRef.current;
      }

      return () => {
      };
    }
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  };

  // HANDLE USER LOGOUT
  // Clear authentication state and remove stored credentials
  // Disconnect socket connection to prevent reconnection after logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      hasJoinedRef.current = false;
      window.globalSocket = null;
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Navbar 
            isAuthenticated={isAuthenticated} 
            user={user}
            onLogout={handleLogout}
          />
          <AppRouter 
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onLogout={handleLogout}
            user={user}
          />
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
