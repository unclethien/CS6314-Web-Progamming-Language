import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from "@mui/material";

function UserComments() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/user/${userId}/comments`);
        setComments(response.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, [userId]);

  const handleCommentClick = (photoId) => {
    navigate(`/photos/${userId}/${photoId}`);
  };

  return (
    <div>
      <Typography variant="h4">Comments by User</Typography>
      <List>
        {comments.map((comment) => (
          <ListItem
            key={comment._id}
            button
            onClick={() => handleCommentClick(comment.photo._id)}
          >
            <ListItemAvatar>
              <Avatar src={`/photos/${comment.photo.file_name}`} />
            </ListItemAvatar>
            <ListItemText
              primary={comment.comment}
              secondary={`Photo: ${comment.photo.file_name}`}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default UserComments;
