    // src/App.jsx
    import React from 'react';
// import { Navbar } from 'react-bootstrap';
    import Button from 'react-bootstrap/Button'; // Import a React-Bootstrap component
import Login from './pages/Login';
import Register from './pages/Register';
import { Outlet } from 'react-router-dom';

    function App() {
      return (
        <>
        <Login/>
        <Outlet/>
        </>
      );
    }

    export default App;