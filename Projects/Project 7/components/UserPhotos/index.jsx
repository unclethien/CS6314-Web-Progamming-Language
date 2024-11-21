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
  TextField
} from "@mui/material";
// import fetchModel from "../../lib/fetchModelData"; // Adjust the path as needed
import "./styles.css"; // Import the CSS file here
import axios from "axios";

function UserPhotos({ userId, advancedFeaturesEnabled}) {
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const refreshPhotos = () => {
    axios.get(`/photosOfUser/${userId}`)
      .then(response => {
        setPhotos(response.data);
      })
      .catch(error => {
        console.error("Error fetching photos:", error);
        setPhotos([]);
      });
  };

  useEffect(() => {
    refreshPhotos();
  }, [userId]);

  const handleAddComment = (photoId) => {
    if (!newComment.trim()) return;
    
    axios.post(`/commentsOfPhoto/${photoId}`, {
      comment: newComment
    })
      .then(() => {
        // Refresh the photos to show the new comment
        refreshPhotos();
        setNewComment(""); // Clear the input
      })
      .catch(error => {
        console.error("Error adding comment:", error);
      });
  };
  
  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prevIndex => prevIndex - 1);
    }
  };

  if (photos.length === 0) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  return (
    <div>
      {advancedFeaturesEnabled ? (
        <div style={{ textAlign: "center" }}>
          <Card style={{ margin: "10px" }}>
            <CardMedia
              component="img"
              height="500"
              image={`/images/${photos[currentPhotoIndex].file_name}`}
              alt={photos[currentPhotoIndex].date_time}
              style={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {new Date(photos[currentPhotoIndex].date_time).toLocaleString()}
              </Typography>
              {photos[currentPhotoIndex].comments && photos[currentPhotoIndex].comments.length > 0 && (
                <List>
                  {photos[currentPhotoIndex].comments.map((comment) => (
                    <ListItem key={comment._id}>
                      <ListItemText
                        primary={comment.comment}
                        secondary={(
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
                              onClick={() => {
                                const commenter = comment.user;
                                // eslint-disable-next-line no-alert
                                alert(`User: ${commenter.first_name} ${commenter.last_name}\nLocation: ${commenter.location}\nDescription: ${commenter.description}\nOccupation: ${commenter.occupation}`);
                              }}
                            >
                              {comment.user.first_name} {comment.user.last_name}
                            </button>
                          </>
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <TextField
                fullWidth
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={() => handleAddComment(photos[currentPhotoIndex]._id)}
                disabled={!newComment.trim()}
              >
                Add Comment
              </Button>
            </CardContent>
          </Card>
          <div>
            <Button
              onClick={handlePrevPhoto}
              disabled={currentPhotoIndex === 0}
            >
              Prev
            </Button>
            <Button
              onClick={handleNextPhoto}
              disabled={currentPhotoIndex === photos.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        photos.map((photo) => (
          <Card key={photo._id} style={{ margin: "10px" }}>
            <CardMedia
              component="img"
              height="500"
              image={`/images/${photo.file_name}`}
              alt={photo.date_time} // Alt text for accessibility
              style={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {new Date(photo.date_time).toLocaleString()}
              </Typography>
              {photo.comments && photo.comments.length > 0 && (
                <List>
                  {photo.comments.map((comment) => (
                    <ListItem key={comment._id}>
                      <ListItemText
                        primary={comment.comment}
                        secondary={(
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
                              onClick={() => {
                                const commenter = comment.user;
                                // eslint-disable-next-line no-alert
                                alert(`User: ${commenter.first_name} ${commenter.last_name}\nLocation: ${commenter.location}\nDescription: ${commenter.description}\nOccupation: ${commenter.occupation}`);
                              }}
                            >
                              {comment.user.first_name} {comment.user.last_name}
                            </button>
                          </>
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <TextField
                fullWidth
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={() => handleAddComment(photo._id)}
                disabled={!newComment.trim()}
              >
                Add Comment
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default UserPhotos;
