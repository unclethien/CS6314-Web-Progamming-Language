import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button } from "@mui/material";

function LoginRegister({ onLogin }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

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
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("/user", {
        login_name: loginName,
        password,
        first_name: firstName,
        last_name: lastName,
        location,
        description,
        occupation,
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
        {isRegisterMode ? "Register" : "Login or Register"}
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
      {isRegisterMode && (
        <>
          <TextField
            label="Repeat Password"
            type="password"
            variant="outlined"
            fullWidth
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Location"
            variant="outlined"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Occupation"
            variant="outlined"
            fullWidth
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={isRegisterMode ? handleRegister : handleLogin}
      >
        {isRegisterMode ? "Register" : "Login"}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setIsRegisterMode(!isRegisterMode)}
      >
        {isRegisterMode ? "Switch to Login" : "Switch to Register"}
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
