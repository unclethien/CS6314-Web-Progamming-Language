import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate } from "react-router-dom";
import axios from "axios";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

const handleUserDeleted = () => {
  console.log("User account has been deleted.");
};

function UserDetailRoute({user}) {
  const {userId} = useParams();
  if (!user) {
    return <Navigate to="/" />;
  }
  return <UserDetail userId={userId} onUserDeleted={handleUserDeleted} />;
}

function UserPhotosRoute({user, advancedFeaturesEnabled}) {
  const { userId, photoId} = useParams();
  if (!user) {
    return <Navigate to="/" />;
  }
  return <UserPhotos userId={userId} photoId={photoId} advancedFeaturesEnabled={advancedFeaturesEnabled}/>;
}

function PhotoShare() {
  const[advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    axios.post("/admin/logout").then(() => {
      setUser(null);
    });
  };
  
  const handleToggleAdvancedFeatures = () => {
    setAdvancedFeaturesEnabled(!advancedFeaturesEnabled);
  };



  useEffect(() => {
    // Check for existing session when app loads
    axios.get('/api/session/check')
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        // Invalid or no session - user stays logged out
        setUser(null);
      });
  }, []); // Empty dependency array means this runs once on mount

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar 
              toggleAdvancedFeatures={handleToggleAdvancedFeatures}
              advancedFeatures={advancedFeaturesEnabled}
              setAdvancedFeatures={setAdvancedFeaturesEnabled}
              onLogout={handleLogout}
              user={user}
            />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {user ? (
                <UserList advancedFeatures={advancedFeaturesEnabled}/> 
              ) : (
                <LoginRegister onLogin={handleLogin}/>
              )}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route
                  path="/"
                  element={
                    user ? (
                      <Navigate to={`/users/${user._id}`} />
                    ) : (
                      <Typography variant="body1">
                        Please login to view content
                      </Typography>
                    )
                  }
                />
                <Route 
                  path="/users/:userId" 
                  element={<UserDetailRoute user={user} />} 
                />
                <Route 
                  path="/photos/:userId" 
                  element={<UserPhotosRoute user={user} advancedFeaturesEnabled={advancedFeaturesEnabled}/>} 
                />
                <Route 
                  path="/users" 
                  element={user ? <UserList /> : <Navigate to="/" />}
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);