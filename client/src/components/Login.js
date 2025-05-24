import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const { token, userId } = response.data;
      console.log('Login response:', response.data);

      // Store the token in localStorage or sessionStorage
       
      localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await axios.post(
            'http://localhost:5000/api/updateLocation',
            { latitude, longitude },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log('Location updated');
        } catch (locationError) {
          console.error('Failed to update location:', locationError);
        }

        // ✅ Navigate after location is updated
        navigate('/dashboard');
      },
      (geoErr) => {
        console.error('Geolocation error:', geoErr);
        navigate('/dashboard'); // Proceed even if location fails
      }
    ); // Redirect to a user dashboard or home page
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ p: 4, mt: 10, borderRadius: 5, boxShadow: 10 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
           Lendify
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Please login to continue your journey.
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                margin="normal"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                margin="normal"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                variant="outlined"
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="secondary" /> : 'Login'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don’t have an account?{' '}
            <Link href="/register" underline="hover" color="primary">
              Create Account
            </Link>
          </Typography>
        </Box>
       
      </Paper>
      <div style={ {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '30px',
    opacity: 0.8,
    fontFamily: "'Inter', sans-serif",
    position: 'center',
    bottom: '20px',
    width: '100%',
  }}>
        © 2025 Kamasani Pavan Kumar. All rights reserved.
      </div>
    </Container>
  );
};

export default Login;
