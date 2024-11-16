/* eslint-disable react/jsx-wrap-multilines */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import {
  HashRouter,
  Route,
  Routes,
  useParams,
  Navigate,
} from "react-router-dom";
import axios from "axios";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";
import PhotoUpload from "./components/PhotoUpload";

function UserDetailRoute() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/user/${userId}`)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="body1">Error: {error.message}</Typography>;
  }

  if (!user) {
    return <Typography variant="body1">User not found.</Typography>;
  }

  return <UserDetail user={user} />;
}

function UserPhotosRoute({ advancedFeatures, setAdvancedFeatures }) {
  const { userId, photoId } = useParams();
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="body1">Error: {error.message}</Typography>;
  }

  if (photos.length === 0) {
    return <Typography variant="body1">No photos found.</Typography>;
  }
  return (
    <UserPhotos
      userId={userId}
      photoId={photoId}
      photos={photos}
      advancedFeatures={advancedFeatures}
      setAdvancedFeatures={setAdvancedFeatures}
    />
  );
}

function PhotoShare() {
  const [advancedFeatures, setAdvancedFeatures] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    axios.post("/admin/logout").then(() => {
      setUser(null);
    });
  };

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              advancedFeatures={advancedFeatures}
              setAdvancedFeatures={setAdvancedFeatures}
              onLogout={handleLogout}
              user={user}
            />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {user ? (
                <UserList advancedFeatures={advancedFeatures} />
              ) : (
                <LoginRegister onLogin={handleLogin} />
              )}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to={`/users/${user._id}`} />
                  ) : (
                    <Typography variant="body1">
                      Welcome to your photosharing app! This{" "}
                      <a href="https://mui.com/components/paper/">Paper</a>{" "}
                      component displays the main content of the application.
                      The
                      {"sm={9}"} prop in the{" "}
                      <a href="https://mui.com/components/grid/">Grid</a> item
                      component makes it responsively display 9/12 of the
                      window. The Routes component enables us to conditionally
                      render different components to this part of the screen.
                      You don&apos;t need to display anything here on the
                      homepage, so you should delete this Route component once
                      you get started.
                    </Typography>
                  )
                }
              />
              <Route path="/users/:userId" element={<UserDetailRoute />} />
              <Route
                path="/photos/:userId/:photoId?"
                element={
                  <UserPhotosRoute
                    advancedFeatures={advancedFeatures}
                    setAdvancedFeatures={setAdvancedFeatures}
                  />
                }
              />
              <Route
                path="/users/:userId/comments"
                element={<UserComments />}
              />
              <Route
                path="/users"
                element={<UserList advancedFeatures={advancedFeatures} />}
              />
              <Route
                path="/upload"
                element={user ? <PhotoUpload /> : <Navigate to="/" />}
              />
            </Routes>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
