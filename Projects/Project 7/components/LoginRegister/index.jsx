import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";

function LoginRegister({ onLogin }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("/admin/login", {
        login_name: loginName,
        password,
      });
      onLogin(response.data);
    } catch {
      setError("Login failed");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("/user", {
        login_name: loginName,
        password,
        first_name: "John",
        last_name: "Doe", // Replace with dynamic values if needed
      });
      console.log(response.data);
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 300,
        margin: "auto",
      }}
    >
      <Typography variant="h5" align="center">
        Login or Register
      </Typography>
      <TextField
        label="Login Name"
        variant="outlined"
        fullWidth
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleRegister}>
        Register
      </Button>
      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default LoginRegister;
