import React, { useEffect, useState } from "react";
import { Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import { useLocation } from 'react-router-dom';

import "./styles.css";

function UserDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [user, setUser] = useState(null);

  const userId = state.userId;

  useEffect(() => {
    fetchModel(`http://localhost:3000/user/${userId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [userId]);

  if (!user) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  return (
    <Paper className="main-grid-item">
      <Typography variant="h5">{`${user.first_name} ${user.last_name}`}</Typography>
      <Typography variant="body1">{`Location: ${user.location}`}</Typography>
      <Typography variant="body1">{`Description: ${user.description}`}</Typography>
      <Typography variant="body1">{`Occupation: ${user.occupation}`}</Typography>
      <Button variant="contained" onClick={() => navigate(`/photos/${userId}`)}>
        View Photos
      </Button>
    </Paper>
    
  );
}

export default UserDetail;
