import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

function UserPhotos({ userId, advancedFeatures }) {
  const navigate = useNavigate();
  const { photoId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    fetchModel(`http://localhost:3000/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
        if (photoId) {
          const index = response.data.findIndex(
            (photo) => photo._id === photoId
          );
          if (index !== -1) {
            setCurrentPhotoIndex(index);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user photos:", error);
      });
  }, [userId, photoId]);

  if (photos.length === 0) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  const currentPhoto = photos[currentPhotoIndex];

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      navigate(`/photos/${userId}/${photos[currentPhotoIndex + 1]._id}`);
    }
  };

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      navigate(`/photos/${userId}/${photos[currentPhotoIndex - 1]._id}`);
    }
  };

  if (advancedFeatures) {
    return (
      <div>
        <Card key={currentPhoto._id} style={{ margin: "10px" }}>
          <CardMedia
            component="img"
            height="500"
            image={`/images/${currentPhoto.file_name}`}
            alt={currentPhoto.title}
            style={{ objectFit: "contain" }}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {new Date(currentPhoto.date_time).toLocaleString()}
            </Typography>
            <List>
              {currentPhoto.comments &&
                currentPhoto.comments.map((comment) => (
                  <ListItem key={comment._id}>
                    <ListItemText
                      primary={comment.comment}
                      secondary={
                        <>
                          {new Date(comment.date_time).toLocaleString()} by{" "}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "blue",
                              textDecoration: "underline",
                              cursor: "pointer",
                              padding: 0,
                              font: "inherit",
                            }}
                            onClick={() =>
                              navigate(`/photos/${comment.user._id}`)
                            }
                          >
                            {comment.user.first_name} {comment.user.last_name}
                          </button>
                        </>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentPhotoIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentPhotoIndex === photos.length - 1}
        >
          Next
        </Button>
      </div>
    );
  }

  return (
    <div>
      {photos.map((photo) => (
        <Card key={photo._id} style={{ margin: "10px" }}>
          <CardMedia
            component="img"
            height="500"
            image={`/images/${photo.file_name}`}
            alt={photo.title}
            style={{ objectFit: "contain" }}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {new Date(photo.date_time).toLocaleString()}
            </Typography>
            <List>
              {photo.comments &&
                photo.comments.map((comment) => (
                  <ListItem key={comment._id}>
                    <ListItemText
                      primary={comment.comment}
                      secondary={
                        <>
                          {new Date(comment.date_time).toLocaleString()} by{" "}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "blue",
                              textDecoration: "underline",
                              cursor: "pointer",
                              padding: 0,
                              font: "inherit",
                            }}
                            onClick={() =>
                              navigate(`/photos/${comment.user._id}`)
                            }
                          >
                            {comment.user.first_name} {comment.user.last_name}
                          </button>
                        </>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UserPhotos;
