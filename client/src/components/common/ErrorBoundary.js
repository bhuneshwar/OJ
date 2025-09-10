import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <ErrorOutlineIcon 
              color="error" 
              sx={{ fontSize: 64, mb: 2 }}
            />
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We encountered an unexpected error. Please try refreshing the page.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="h6" color="error" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'error.light', 
                    color: 'error.contrastText',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="body2" component="pre">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
