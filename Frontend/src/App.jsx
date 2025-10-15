import './App.css'
import React from 'react';
import AuthForm from './pages/Auth/Auth';
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from './pages/Dashboard/dashboard';
import Leaderboard from './pages/Leaderboard/leaderboard';

import Game1 from './pages/Game/game1';
import Game2 from './pages/Game/game2';
import Navbar from './components/Navbar';
import Rules from './pages/Rules/rules';
function App() {
  return (
    <>
  <Router>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Dashboard/>} />
      <Route path="/login" element={<AuthForm />} />
      <Route path="/rules" element={<Rules/>}/>
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/game1" element={<Game1/>} />
      <Route path="/game2" element={<Game2/>} />
   </Routes>

    </Router>
    </>
  )
}

export default App