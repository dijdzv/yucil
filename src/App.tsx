import { useState } from 'react';
// import reactLogo from "./assets/react.svg";
import { invoke } from '@tauri-apps/api/tauri';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  return (
    <Dashboard />
  );
}

export default App;
