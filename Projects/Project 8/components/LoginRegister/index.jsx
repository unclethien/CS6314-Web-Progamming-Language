import React, { useState } from "react";
import { TextField, Button, Typography, Box} from "@mui/material";
import axios from "axios";

function LoginRegister({onLogin}) {
  const [loginName, setLoginName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and registration
  const [error, setError] = useState("");


  const handleLogin = async () => {
    try {
      const response = await axios.post("/admin/login", {login_name: loginName, password});
      onLogin(response.data); // Assuming the server sends userId in the response

    } catch {
      setError("Login failed");
    }
  };

  
  const handleRegister = async () => {
    try {
      const response = await axios.post("/user", {
        login_name: loginName,
        password,
        first_name: firstName,
        last_name: lastName,
        location,
        description,
        occupation
      });
      
      onLogin(response.data);
    // eslint-disable-next-line no-shadow
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
<Box>
  <Typography variant="h4" gutterBottom>
    {isLogin ? "Login" : "Register"}
  </Typography>
  <form onSubmit={handleSubmit}>
    <TextField
      label="Login Name"
      value={loginName}
      onChange={(e) => setLoginName(e.target.value)}
      fullWidth
      margin="normal"
    />
    <TextField
      label="Password"
      type="password" // Mask the input for password
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      fullWidth
      margin="normal"
    />
    {!isLogin && (
      <>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          fullWidth
          margin="normal"
        />
      </>
    )}
    <Button type="submit" variant="contained" color="primary" fullWidth>
      {isLogin ? "Login" : "Register"}
    </Button>
    <Button
      onClick={() => setIsLogin(!isLogin)}
      variant="text"
      fullWidth
      sx={{ marginTop: "10px" }}
    >
      {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
    </Button>
  </form>
  {error && (
    <Typography color="error" variant="body2" sx={{ marginTop: "10px" }}>
      {error}
    </Typography>
  )}
</Box>
);
}

export default LoginRegister;
