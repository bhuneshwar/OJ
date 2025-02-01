import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import Login from './components/Login';
import Register from './components/Register';
import ProblemsList from './components/ProblemsList';
import ProblemDetails from './components/ProblemDetails';
import Leaderboard from './components/Leaderboard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <Router>
          <div className="App">
            {/* Navigation bar or header component can be placed here */}
            <Routes>
              <Route exact path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/problems" element={<ProblemsList />} />
              <Route path="/problem/:id" element={<ProblemDetails />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              {/* Additional routes can be added here */}
            </Routes>
          </div>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
