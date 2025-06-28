import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios
 from 'axios';
import { useEffect } from 'react';
const Dashboard = () => {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState("");
     useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('https://my-server-api-eq9v.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserName(data.name);
      } catch (error) {
        console.error('Error fetching name for dashboard:', error);
      }
    };

    fetchUserName();
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleTransactions = () => {
    handleMenuClose();
    navigate('/transactions');
  };

  const handleSignOut = () => {
    localStorage.clear();
    handleMenuClose();
    navigate('/login');
  };

  const handleBorrowClick = () => {
    navigate('/borrow');
  };

  const handleLendClick = () => {
    navigate('/lend');
  };

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(45deg, #1976d2 30%, #0d47a1 90%)',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
             🪙Lendify
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ color: 'white', mr: 2 }}>
              Welcome, <strong>{userName}</strong>
            </Typography>
            <IconButton 
              size="large" 
              onClick={handleMenuOpen}
              sx={{ color: 'white' }}
            >
              <AccountCircle fontSize="large" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <MenuItem 
                onClick={handleTransactions}
                sx={{ '&:hover': { bgcolor: '#e3f2fd' } }}
              >
                📈 My Transactions
              </MenuItem>
              <MenuItem 
                onClick={handleProfile}
                sx={{ '&:hover': { bgcolor: '#e3f2fd' } }}
              >
               👤 Profile
              </MenuItem>
              <MenuItem 
                onClick={handleSignOut}
                sx={{ '&:hover': { bgcolor: '#e3f2fd' }, color: '#d32f2f' }}
              >
                 🚪 Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="md" 
        sx={{ 
          mt: 8,
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(145deg, #f8fbff 0%, #e3f2fd 100%)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-2px)',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'rgba(25, 118, 210, 0.1)'
            }}
          />
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: '#0d47a1',
              fontSize: '2.5rem',
              letterSpacing: '-0.5px'
            }}
          >
            Welcome, {userName} 👋
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              color: '#546e7a',
              fontSize: '1.1rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >

            Ready to manage your finances? Choose your action below
            <br></br>
            Note: As a part of our privacy-first approach, only borrower details will be shared with lenders when a request is made. Lending information will remain confidential and will not be publicly displayed. This ensures a secure and trusted communication channel between both parties, while protecting sensitive financial data
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 2.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)',
                    boxShadow: '0 5px 7px 2px rgba(25, 118, 210, .3)'
                  }
                }}
                onClick={handleBorrowClick}
              >
                🏦 Borrow Funds
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 2.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2 30%, #1565c0 90%)',
                    boxShadow: '0 5px 7px 2px rgba(33, 150, 243, .3)'
                  }
                }}
                onClick={handleLendClick}
              >
                💰 Lend Capital
              </Button>
            </Grid>
          </Grid>

          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              left: -80,
              width: 160,
              height: 160,
              borderRadius: '50%',
              bgcolor: 'rgba(33, 150, 243, 0.1)'
            }}
          />
        </Paper>
        <div style={ {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '30px',
    opacity: 0.8,
    fontFamily: "'Inter', sans-serif",
    position: 'absolute',
    bottom: '20px',
    width: '100%',
  }}>
        © 2025 Kamasani Pavan Kumar. All rights reserved.
      </div>
      </Container>
    </>
  );
};

export default Dashboard;
