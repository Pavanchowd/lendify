import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "@mui/material";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://my-server-api-eq9v.onrender.com/api/auth/register",
        formData
      );
      setSuccess(true);
      // Navigate to login page or dashboard after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={6}
        sx={{ p: 4, mt: 10, borderRadius: 5, boxShadow: 10 }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Create Account
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          sx={{ mb: 3 }}
        >
          Fill in the details below to register.
        </Typography>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! Redirecting to login page...
          </Alert>
        )}

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
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
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
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                type="tel"
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
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
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
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
                  "& .MuiInputBase-root": {
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
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type="password"
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 3,
                textTransform: "none",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="secondary" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link href="/login" underline="hover" color="primary">
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
      <div
        style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.9rem",
          marginTop: "30px",
          opacity: 0.8,
          fontFamily: "'Inter', sans-serif",
          position: "center",
          bottom: "20px",
          width: "100%",
        }}
      >
        © 2025 Kamasani Pavan Kumar. All rights reserved.
      </div>
    </Container>
  );
};

export default Register;
