import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";

import "./styles.css";

function TopBar() {
  const location = useLocation();
  const userId = location.pathname.split("/")[2];

  const user = userId ? window.models.userModel(userId) : null;
  let topBarText = "Thien Nguyen";
  // let topBarText = `Photos of ${user.first_name} ${user.last_name}`;

  if (location.pathname.startsWith("/users/") && user) {
    topBarText = `${user.first_name} ${user.last_name}`;
  } else if (location.pathname.startsWith("/photos/") && user) {
    topBarText = `Photos of ${user.first_name} ${user.last_name}`;
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
          Thien Nguyen
        </Typography>
        <Typography variant="h5" color="inherit">
          {topBarText}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
