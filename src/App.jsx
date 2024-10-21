// src/App.js
import React from 'react';
import Attendance from './attendence'; // Import the Attendance component
import TemperatureGraph from './temperature';
import './App.css'; // Import your CSS file (if you have one)

function App() {
  return (
    <div className="App">
      <Attendance />
    </div>
  );
}

export default App;
