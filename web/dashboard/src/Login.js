import React, { useState } from "react";
import axios from "axios";
import Register from "./Register";
import BASE_URL from "./api";


import {
  TextField,
  Button,
  Paper,
  Typography,
  Box
} from "@mui/material";

import { useNavigate } from "react-router-dom";

function Login({ setAuth }) {

  const [mode, setMode] = useState("login");
  const navigate = useNavigate();


  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {

    try {

      const res = await axios.post(
        `${BASE_URL}/token/`,
        {
          username,
          password
        }
      );

      localStorage.setItem("token", res.data.access);

      setAuth(true);
      navigate("/")


    } catch {
      setError("Invalid credentials");
    }
  };
    if (mode === "register") {
      return <Register setMode={setMode} />;
}

    return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >

      <Paper sx={{ p: 4, width: 300 }}>

        <Typography variant="h6" mb={2}>
          Login
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
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Login
        </Button>

        <Typography color="error" mt={1}>
          {error}
        </Typography>
        
        <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setMode("register")}
>
            Create Account
        </Button>

      </Paper>

    </Box>
  );
}

export default Login;
