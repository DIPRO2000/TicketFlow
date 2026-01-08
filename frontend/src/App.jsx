import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Route,Router, Routes } from 'react-router-dom'
import './App.css'

import Landing from './pages/Landing.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Layout from './Layout'

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App

  
