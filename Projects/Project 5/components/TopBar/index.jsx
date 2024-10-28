/* eslint-disable react/jsx-wrap-multilines */
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

function TopBar({ advancedFeatures, setAdvancedFeatures }) {
  const location = useLocation();
  const userId = location.pathname.split("/")[2];
  const [version, setVersion] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchModel("http://localhost:3000/test/info")
      .then((response) => {
        setVersion(response.data.__v);
      })
      .catch((error) => {
        console.error("Error fetching version info:", error);
      });

    if (userId) {
      fetchModel(`http://localhost:3000/user/${userId}`)
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
        });
    }
  }, [userId]);

  let topBarText = "Thien Nguyen";

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
        <Typography variant="h5" color="inherit" paddingRight="10px">
          {topBarText} - Version: {version}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={advancedFeatures}
              onChange={() => setAdvancedFeatures(!advancedFeatures)}
              inputProps={{ "aria-label": "Enable Advanced Features" }}
              color="secondary"
            />
          }
          label="Enable Advanced Features"
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
