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
<<<<<<< HEAD
<<<<<<< HEAD
  IconButton,
} from "@mui/material";
import axios from "axios";
import { MentionsInput, Mention } from 'react-mentions';
import { Link } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
=======
  TextField
} from "@mui/material";
import axios from "axios";
>>>>>>> parent of 02367dc4 (update)
=======
  TextField
} from "@mui/material";
import axios from "axios";
>>>>>>> parent of 02367dc4 (update)
import PhotoUpload from '../PhotoUpload';

function UserPhotos({ userId, advancedFeaturesEnabled }) {
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [comments, setComments] = useState({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const refreshPhotos = () => {
    axios.get(`/photosOfUser/${userId}`)
      .then(response => {
        if (response.data && Array.isArray(response.data)) {
          setPhotos(response.data);
          const initialComments = {};
          const initialLikes = {};
          response.data.forEach(photo => {
            initialComments[photo._id] = ""; // Set initial comment to empty
            initialLikes[photo._id] = photo.likes; // Set initial likes
          });
          setComments(initialComments);
          setLikes(initialLikes);
        } else {
          setPhotos([]); // Set to empty array if response is not an array
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          console.error("No photos found for this user.");
          setPhotos([]); // Optionally set to empty array
        } else {
          console.error("Error fetching photos:", error);
          setPhotos([]); // Set to empty array on other errors
        }
      });
  };

  useEffect(() => {
    setPhotos([]); // Clear photos when userId changes
    setCurrentPhotoIndex(0); // Reset photo index
    setComments({}); // Reset comments
    setLikes({}); // Reset likes
    refreshPhotos(); // Fetch new photos
  }, [userId]);

  const handleAddComment = (photoId) => {
    const newComment = comments[photoId];
    if (!newComment.trim()) return;

    axios.post(`/commentsOfPhoto/${photoId}`, {
      comment: newComment
    })
      .then(() => {
        refreshPhotos(); // Refresh the photos to show the new comment
        setComments(prev => ({ ...prev, [photoId]: "" })); // Clear the input for that specific photo
      })
      .catch(error => {
        console.error("Error adding comment:", error);
      });
  };

  const handleCommentChange = (photoId, value) => {
    setComments(prev => ({ ...prev, [photoId]: value })); // Update the comment for the specific photo
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

  const handleDeletePhoto = (photoId) => {
    axios.delete(`/photos/${photoId}`)
      .then(() => {
        setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
      })
      .catch(error => {
        console.error("Error deleting photo:", error);
      });
  };

  const handleDeleteComment = (photoId, commentId) => {
    axios.delete(`/comments/${commentId}`)
      .then(() => {
        setPhotos(prevPhotos => prevPhotos.map(photo => {
          if (photo._id === photoId) {
            return {
              ...photo,
              comments: photo.comments.filter(comment => comment._id !== commentId)
            };
          }
          return photo;
        }));
      })
      .catch(error => {
        console.error("Error deleting comment:", error);
      });
  };

  if (photos.length === 0) {
    return <Typography variant="body1">No photos available.</Typography>;
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
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeleteComment(photos[currentPhotoIndex]._id, comment._id)}
                      >
                        Delete Comment
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
              <TextField
                fullWidth
                value={comments[photos[currentPhotoIndex]._id] || ""}
                onChange={(e) => handleCommentChange(photos[currentPhotoIndex]._id, e.target.value)}
                placeholder="Add a comment..."
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={() => handleAddComment(photos[currentPhotoIndex]._id)}
                disabled={!comments[photos[currentPhotoIndex]._id]?.trim()}
              >
                Add Comment
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeletePhoto(photos[currentPhotoIndex]._id)}
              >
                Delete Photo
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                {likes[photos[currentPhotoIndex]._id]?.includes(userId) ? (
                  <IconButton color="primary" onClick={() => handleUnlike(photos[currentPhotoIndex]._id)}>
                    <FavoriteIcon />
                  </IconButton>
                ) : (
                  <IconButton color="primary" onClick={() => handleLike(photos[currentPhotoIndex]._id)}>
                    <FavoriteBorderIcon />
                  </IconButton>
                )}
                <Typography variant="body2" style={{ marginLeft: '5px' }}>
                  {likes[photos[currentPhotoIndex]._id]?.length || 0} likes
                </Typography>
              </div>
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
              alt={photo.date_time}
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
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeleteComment(photo._id, comment._id)}
                      >
                        Delete Comment
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
              <TextField
                fullWidth
                value={comments[photo._id] || ""}
                onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                placeholder="Add a comment..."
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={() => handleAddComment(photo._id)}
                disabled={!comments[photo._id]?.trim()}
              >
                Add Comment
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeletePhoto(photo._id)}
              >
                Delete Photo
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                {likes[photo._id]?.includes(userId) ? (
                  <IconButton color="primary" onClick={() => handleUnlike(photo._id)}>
                    <FavoriteIcon />
                  </IconButton>
                ) : (
                  <IconButton color="primary" onClick={() => handleLike(photo._id)}>
                    <FavoriteBorderIcon />
                  </IconButton>
                )}
                <Typography variant="body2" style={{ marginLeft: '5px' }}>
                  {likes[photo._id]?.length || 0} likes
                </Typography>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <PhotoUpload 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)} 
        onUploadSuccess={refreshPhotos} // Pass the refresh function
      />
    </div>
  );
}

export default UserPhotos;
