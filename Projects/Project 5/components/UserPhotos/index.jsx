/* eslint-disable react/jsx-wrap-multilines */
import React from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./styles.css";

function UserPhotos({ userId }) {
  const navigate = useNavigate();
  const photos = window.models.photoOfUserModel(userId);

  return (
    // <Typography variant="body1">
    //   This should be the UserPhotos view of the PhotoShare app. Since it is
    //   invoked from React Router the params from the route will be in property
    //   match. So this should show details of user: {userId}. You can fetch the
    //   model for the user from window.models.photoOfUserModel(userId):
    //   <Typography variant="caption">
    //     {JSON.stringify(window.models.photoOfUserModel(userId))}
    //   </Typography>
    // </Typography>

    <div>
      {photos.map((photo) => (
        <Card key={photo._id} style={{ margin: "10px" }}>
          <CardMedia
            component="img"
            image={`/images/${photo.file_name}`}
            alt={photo.title}
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
