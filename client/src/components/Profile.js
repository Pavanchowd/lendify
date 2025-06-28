import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Profile = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    name: "",
    phoneNumber: "",
    profilePic: "",
    profilePicPreview: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "https://my-server-api-eq9v.onrender.com/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUserDetails({
          name: data.name || "",
          phoneNumber: data.phoneNumber || "",
          profilePic: data.profilePic
            ? `https://my-server-api-eq9v.onrender.com/${data.profilePic}`
            : "",
          profilePicPreview: "",
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserDetails((prev) => ({
        ...prev,
        profilePic: file,
        profilePicPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", userDetails.name);
      formData.append("phoneNumber", userDetails.phoneNumber);

      if (userDetails.profilePic instanceof File) {
        formData.append("profilePic", userDetails.profilePic);
      }

      const { data } = await axios.put(
        "https://my-server-api-eq9v.onrender.com/api/auth/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserDetails((prev) => ({
        ...prev,
        ...data,
        profilePic: data.profilePic
          ? `https://my-server-api-eq9v.onrender.com/${data.profilePic}`
          : prev.profilePic,
        profilePicPreview: "",
      }));

      toast.success("Profile saved successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving profile. Please try again.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 4,
          background: "linear-gradient(145deg, #f8fbff 0%, #e3f2fd 100%)",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(25, 118, 210, 0.1)",
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: "#0d47a1",
            fontSize: "2.2rem",
            letterSpacing: "-0.5px",
          }}
        >
          {isEditing ? "Edit Profile" : "Your Profile"}
        </Typography>

        <Avatar
          alt="Profile Picture"
          src={
            userDetails.profilePicPreview ||
            (typeof userDetails.profilePic === "string"
              ? userDetails.profilePic
              : "") ||
            "/default-avatar.png"
          }
          sx={{
            width: 120,
            height: 120,
            mx: "auto",
            mb: 3,
            border: "3px solid #1976d2",
            boxShadow: "0 4px 20px rgba(25, 118, 210, 0.2)",
          }}
        />

        {isEditing ? (
          <Box sx={{ maxWidth: 400, mx: "auto" }}>
            <TextField
              label="Full Name"
              name="name"
              value={userDetails.name}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#1976d2" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2 !important",
                  },
                },
              }}
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={userDetails.phoneNumber}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#1976d2" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2 !important",
                  },
                },
              }}
            />

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                mb: 2,
                borderRadius: 2,
                textTransform: "none",
                py: 1,
                px: 3,
                background: "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
                boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .2)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)",
                  boxShadow: "0 5px 7px 2px rgba(25, 118, 210, .3)",
                },
              }}
            >
              Upload Photo
              <input type="file" hidden onChange={handleProfilePicChange} />
            </Button>
          </Box>
        ) : (
          <Box sx={{ maxWidth: 400, mx: "auto" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#1a237e",
                mb: 1.5,
              }}
            >
              {userDetails.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#546e7a",
                fontSize: "1.1rem",
                mb: 3,
              }}
            >
              📱 {userDetails.phoneNumber || "No phone number provided"}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
                px: 4,
                fontSize: "1rem",
                background: "linear-gradient(45deg, #2196f3 30%, #1976d2 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .2)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
                  boxShadow: "0 5px 7px 2px rgba(33, 150, 243, .3)",
                },
              }}
            >
              Edit Profile
            </Button>
          </Box>
        )}

        {isEditing && (
          <Box
            mt={4}
            sx={{ display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsEditing(false)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 4,
                color: "#1976d2",
                borderColor: "#1976d2",
                "&:hover": {
                  borderColor: "#1565c0",
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 4,
                background: "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
                boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .2)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)",
                  boxShadow: "0 5px 7px 2px rgba(25, 118, 210, .3)",
                },
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(33, 150, 243, 0.1)",
          }}
        />
      </Paper>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div
        style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.9rem",
          marginTop: "30px",
          opacity: 0.8,
          fontFamily: "'Inter', sans-serif",
          position: "absolute",
          bottom: "20px",
          width: "100%",
        }}
      >
        © 2025 Kamasani Pavan Kumar. All rights reserved.
      </div>
    </Container>
  );
};

export default Profile;
