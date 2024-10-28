import React from "react";
import { Typography } from "@mui/material";

import "./styles.css";

function UserDetail({userId}) {
  
  return (
    <Typography variant="body1">
      This should be the UserDetail view of the PhotoShare app. Since it is
      invoked from React Router the params from the route will be in the
      property match. So this should show details of user: {userId}. You can
      fetch the model for the user from window.models.userModel(userId).
    </Typography>
  );
}

export default UserDetail;
