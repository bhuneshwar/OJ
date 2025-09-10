import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 40, 
  text = 'Loading...', 
  fullScreen = false,
  color = 'primary',
  variant = 'indeterminate'
}) => {
  const containerSx = fullScreen 
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        p: 3,
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={containerSx}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        >
          <CircularProgress 
            size={size} 
            color={color}
            variant={variant}
          />
        </motion.div>
        {text && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2 }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default LoadingSpinner;
