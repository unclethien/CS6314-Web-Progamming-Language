import React from "react";
import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./styles.css";

function UserDetail({ userId }) {
  const navigate = useNavigate();
  const user = window.models.userModel(userId);

  return (
    // <Typography variant="body1">
    //   This should be the UserDetail view of the PhotoShare app. Since it is
    //   invoked from React Router the params from the route will be in the
    //   property match. So this should show details of user: {userId}. You can
    //   fetch the model for the user from window.models.userModel(userId).
    // </Typography>
    <div>
      <Typography variant="h5">{`${user.first_name} ${user.last_name}`}</Typography>
      <Typography variant="body1">{`Location: ${user.location}`}</Typography>
      <Typography variant="body1">{`Description: ${user.description}`}</Typography>
      <Typography variant="body1">{`Occupation: ${user.occupation}`}</Typography>
      <Button variant="contained" onClick={() => navigate(`/photos/${userId}`)}>
        View Photos
      </Button>
    </div>
  );
}

export default UserDetail;
