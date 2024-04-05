import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProblemsList from './components/ProblemsList';
import ProblemDetails from './components/ProblemDetails';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation bar or header component can be placed here */}
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/problems" element={<ProblemsList />} />
          <Route path="/problem/:id" element={<ProblemDetails />} />
          {/* Additional routes can be added here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
