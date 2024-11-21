import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PhotoUpload from '../PhotoUpload';

function TopBar({toggleAdvancedFeatures, user, onLogout}) {
  const location = useLocation();
  const userId = location.pathname.split("/")[2];
  const [selectedUserName, setSelectedUserName] = useState("");
  const [version, setVersion] = useState("");
  const [advancedFeatures, setAdvancedFeatures] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleAdvancedFeatures = () => {
    const newAdvancedFeaturesState = !advancedFeatures;
    setAdvancedFeatures(newAdvancedFeaturesState);
    toggleAdvancedFeatures(newAdvancedFeaturesState);
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
  };

  useEffect(() => {
    axios.get("/test/info")
      .then(response => setVersion(response.data.__v))
      .catch(error => console.error("Error fetching version info:", error));
  }, []);

  useEffect(() => {
    if (userId) {
      axios.get(`/user/${userId}`)
        .then(response => setSelectedUserName(`${response.data.first_name} ${response.data.last_name}`))
        .catch(error => {
          console.error("Error fetching user data:", error);
          setSelectedUserName("User not found");
        });
    } else {
      setSelectedUserName("");
    }
  }, [userId]);

  return (
    <AppBar position="absolute">
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Typography variant="h5">Nhat Truong {version && `(v${version})`}</Typography>
        <Typography variant="h6">
          {user ? (
            location.pathname.includes("/photos") 
              ? `Photos of ${selectedUserName}` 
              : `Welcome, ${user.first_name} ${user.last_name}`
          ) : (
            "Please Login"
          )}
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={advancedFeatures}
            onChange={handleAdvancedFeatures}
          />
          <span>Enable Advanced Features</span>
          {user && (
            <>
              <Button 
                color="inherit" 
                onClick={() => setUploadDialogOpen(true)}
              >
                Add Photo
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                style={{ marginLeft: '10px' }}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </Toolbar>
      {user && (
        <PhotoUpload 
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </AppBar>
  );
}

export default TopBar;

