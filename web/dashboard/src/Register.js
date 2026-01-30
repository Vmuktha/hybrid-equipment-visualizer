import React, { useState } from "react";
import axios from "axios";

import {
  TextField,
  Button,
  Paper,
  Typography,
  Box
} from "@mui/material";

function Register({ setMode }) {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setMsg("Enter a valid email address");
    return;
  }

  if (password.length < 6) {
    setMsg("Password must be at least 6 characters");
    return;
  }

  try {

    await axios.post(
      "${https://chem-analyzer-backend.onrender.com}/register/",
      {
        username,
        email,
        password
      }
    );

    setMsg("Account created! Please login.");

    setTimeout(() => setMode("login"), 1500);

  } catch (err) {

    if (err.response?.data?.error) {
      setMsg(err.response.data.error);
    } else {
      setMsg("Registration failed");
    }

  }
};


  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >

      <Paper sx={{ p: 4, width: 320 }}>

        <Typography variant="h6" mb={2}>
          Register
        </Typography>

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleRegister}
          sx={{ mt: 2 }}
        >
          Register
        </Button>

        <Typography mt={1} color="primary">
          {msg}
        </Typography>

        <Button
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => setMode("login")}
        >
          Back to Login
        </Button>

      </Paper>

    </Box>
  );
}

export default Register;
