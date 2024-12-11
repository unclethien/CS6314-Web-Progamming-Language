import React, { useEffect, useState } from "react";
import { Typography, Button, Paper, Card, CardContent, CardMedia, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

function UserDetail({ userId }) {
  const [userDetails, setUserDetails] = useState(null);
  const [recentPhoto, setRecentPhoto] = useState(null);
  const [mostCommentedPhoto, setMostCommentedPhoto] = useState(null);
  const [mentionedPhotos, setMentionedPhotos] = useState([]);

  useEffect(() => {
    // Reset photos when userId changes
    setRecentPhoto(null);
    setMostCommentedPhoto(null);
    setUserDetails(null); // Reset user details to avoid showing stale data

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/user/${userId}`);
        const userData = response.data;
        const minimalUserData = {
          _id: userData._id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          location: userData.location,
          description: userData.description,
          occupation: userData.occupation,
        };
        setUserDetails(minimalUserData);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails(null);
      }
    };

    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`/photosOfUser/${userId}`);
        const photos = response.data;
        if (photos.length > 0) {
          setRecentPhoto(photos[photos.length - 1]); // Most recent photo
          const mostCommented = photos.reduce((prev, current) => {
            return (prev.comments.length > current.comments.length) ? prev : current;
          });
          setMostCommentedPhoto(mostCommented); // Most commented photo
        } else {
          setRecentPhoto(null);
          setMostCommentedPhoto(null);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
        setRecentPhoto(null);
        setMostCommentedPhoto(null);
      }
    };

    const fetchMentionedPhotos = async () => {
      try {
        const response = await axios.get(`/photosWithMentions/${userId}`);
        const photos = response.data;
        if (photos.length > 0) {
          setMentionedPhotos(photos);
        } else {
          setMentionedPhotos([]);
        }
      } catch (error) {
        console.error("Error fetching mentioned photos:", error);
        setMentionedPhotos([]);
      }
    };

    fetchUserDetails();
    fetchPhotos();
    fetchMentionedPhotos();
  }, [userId]);

  if (!userDetails) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  return (
    <Paper elevation={3} className="user-detail">
      <Typography variant="h4">{`${userDetails.first_name} ${userDetails.last_name}`}</Typography>
      <Typography variant="body1">Location: {userDetails.location}</Typography>
      <Typography variant="body1">Description: {userDetails.description}</Typography>
      <Typography variant="body1">Occupation: {userDetails.occupation}</Typography>

      {recentPhoto ? (
        <div className="photo-container">
          <Typography variant="h6">Most Recent Photo:</Typography>
          <Link to={`/photos/${userId}`}>
            <Card className="photo-card">
              <CardMedia
                component="img"
                className="photo-image"
                image={`/images/${recentPhoto.file_name}`}
                alt={recentPhoto.date_time}
              />
              <CardContent>
                <Typography variant="body2">Uploaded on: {new Date(recentPhoto.date_time).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Typography variant="body1">No most recent photo available.</Typography>
      )}

      {mostCommentedPhoto ? (
        <div className="photo-container">
          <Typography variant="h6">Most Commented Photo:</Typography>
          <Link to={`/photos/${userId}`}>
            <Card className="photo-card">
              <CardMedia
                component="img"
                className="photo-image"
                image={`/images/${mostCommentedPhoto.file_name}`}
                alt={mostCommentedPhoto.date_time}
              />
              <CardContent>
                <Typography variant="body2">Comments: {mostCommentedPhoto.comments.length}</Typography>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Typography variant="body1">No most commented photo available.</Typography>
      )}

      <Typography variant="h6" style={{ marginTop: '20px' }}>Photos Mentioning This User:</Typography>
      {mentionedPhotos.length > 0 ? (
        mentionedPhotos.map(photo => (
          <div key={photo._id} className="photo-container">
            <Card className="photo-card">
              <CardMedia
                component="img"
                className="photo-image"
                image={`/images/${photo.file_name}`}
                alt={photo.date_time}
              />
              <CardContent>
                <Typography variant="body2">
                  Uploaded by:{" "}
                  <MuiLink component={Link} to={`/user/${photo.user_id}`} color="primary" underline="hover">
                    {photo.user_id}
                  </MuiLink>
                </Typography>
                <Typography variant="body2">Uploaded on: {new Date(photo.date_time).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </div>
        ))
      ) : (
        <Typography variant="body1">No photos mention this user.</Typography>
      )}

      <Link to={`/photos/${userId}`}>
        <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
          View All Photos
        </Button>
      </Link>
    </Paper>
  );
}

export default UserDetail;